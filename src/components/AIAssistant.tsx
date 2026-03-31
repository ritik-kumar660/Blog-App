"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Wand2, Sparkles, FileText, ArrowUpRight, Pencil, X, ChevronDown, ChevronUp, Loader2, Copy, Check, type LucideIcon
} from "lucide-react";

interface AIAssistantProps {
  content: string;
  onApplyTitle: (title: string) => void;
  onApplyTags: (tags: string) => void;
  onApplyContent: (html: string) => void;
}

type AIMode = "generate" | "summarize" | "improve" | "expand" | "draft";

const MODES: { id: AIMode; icon: LucideIcon; label: string; description: string; needsContent: boolean }[] = [
  {
    id: "generate",
    icon: Sparkles,
    label: "Generate Title & Tags",
    description: "Auto-generate an SEO-optimized title, summary, and tags from your content.",
    needsContent: true,
  },
  {
    id: "summarize",
    icon: FileText,
    label: "Summarize Post",
    description: "Create a concise 2-3 sentence summary to use as your post excerpt.",
    needsContent: true,
  },
  {
    id: "improve",
    icon: ArrowUpRight,
    label: "Improve Writing",
    description: "Polish grammar, tone, and structure while keeping your original voice.",
    needsContent: true,
  },
  {
    id: "expand",
    icon: ArrowUpRight,
    label: "Expand Content",
    description: "Turn your short notes or draft into a full, detailed blog post.",
    needsContent: true,
  },
  {
    id: "draft",
    icon: Pencil,
    label: "Write from Topic",
    description: "Give a topic, and AI writes a complete structured draft for you.",
    needsContent: false,
  },
];

export default function AIAssistant({ content, onApplyTitle, onApplyTags, onApplyContent }: AIAssistantProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    mode: AIMode;
    title?: string;
    tags?: string;
    summary?: string;
    result?: string;
    error?: string;
  } | null>(null);
  const [activeMode, setActiveMode] = useState<AIMode | null>(null);
  const [topic, setTopic] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const rawContent = content.replace(/<[^>]+>/g, "").trim();

  const run = async (mode: AIMode) => {
    if (mode !== "draft" && rawContent.length < 20) {
      setError("Please write some content first (at least a few sentences).");
      return;
    }
    if (mode === "draft" && topic.trim().length < 3) {
      setError("Please enter a topic for your draft.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setActiveMode(mode);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, mode, extra: topic }),
      });
      const data = await res.json();
      if (res.status === 429) {
        setError("⏳ Rate limit hit. Wait a few seconds and try again.");
      } else if (!res.ok) {
        setError(data.error || "AI request failed.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Panel */}
      {open && (
        <div className="w-[380px] max-h-[80vh] overflow-y-auto rounded-2xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl shadow-primary/10 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur-xl z-10">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-primary" />
              <span className="font-bold text-base">AI Writing Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="p-4 space-y-3">
            {/* Action Buttons */}
            {MODES.map((m) => (
              <div key={m.id} className="rounded-xl border border-border/50 bg-muted/30 overflow-hidden">
                <button
                  className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-foreground/5 transition-colors"
                  onClick={() => run(m.id)}
                  disabled={loading}
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <m.icon size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{m.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{m.description}</p>
                  </div>
                  {loading && activeMode === m.id && (
                    <Loader2 size={16} className="animate-spin text-primary shrink-0" />
                  )}
                </button>

                {/* Topic input for draft mode */}
                {m.id === "draft" && (
                  <div className="px-3.5 pb-3.5 pt-0">
                    <input
                      className="w-full text-sm bg-background border border-border/50 rounded-lg px-3 py-2 focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/60 transition-colors"
                      placeholder="e.g. The future of AI in healthcare"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>
                )}
              </div>
            ))}

            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Results */}
            {result && !loading && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-primary/60">AI Result</p>

                {/* generate mode */}
                {result.mode === "generate" && (
                  <div className="space-y-3">
                    {result.title && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Title</p>
                        <p className="font-semibold text-sm">{result.title}</p>
                        <Button size="sm" className="w-full mt-1 rounded-lg h-8 text-xs" onClick={() => onApplyTitle(result.title!)}>
                          Apply Title
                        </Button>
                      </div>
                    )}
                    {result.tags && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Tags</p>
                        <p className="text-sm text-primary">{result.tags}</p>
                        <Button size="sm" variant="outline" className="w-full mt-1 rounded-lg h-8 text-xs border-border/50" onClick={() => onApplyTags(result.tags!)}>
                          Apply Tags
                        </Button>
                      </div>
                    )}
                    {result.summary && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Summary</p>
                        <p className="text-sm text-muted-foreground italic">{result.summary}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* summarize mode */}
                {result.mode === "summarize" && result.result && (
                  <div className="space-y-2">
                    <p className="text-sm leading-relaxed">{result.result}</p>
                    <button
                      onClick={() => handleCopy(result.result!)}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                      {copied ? "Copied!" : "Copy to clipboard"}
                    </button>
                  </div>
                )}

                {/* improve / expand / draft modes */}
                {(result.mode === "improve" || result.mode === "expand" || result.mode === "draft") && result.result && (
                  <div className="space-y-3">
                    <div
                      className="text-sm leading-relaxed text-muted-foreground max-h-48 overflow-y-auto prose dark:prose-invert prose-sm"
                      dangerouslySetInnerHTML={{ __html: result.result }}
                    />
                    <Button
                      size="sm"
                      className="w-full rounded-lg h-8 text-xs"
                      onClick={() => onApplyContent(result.result!)}
                    >
                      {result.mode === "improve" ? "Replace with Improved Version" : result.mode === "draft" ? "Use This Draft" : "Replace with Expanded Version"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all duration-200"
      >
        <Sparkles size={18} />
        <span className="text-sm">AI Assist</span>
        {open ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>
    </div>
  );
}
