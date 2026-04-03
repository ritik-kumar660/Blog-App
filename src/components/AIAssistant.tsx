"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Wand2, Sparkles, FileText, ArrowUpRight, Pencil, X, 
  ChevronDown, ChevronUp, Loader2, Copy, Check, Info,
  AlertCircle, type LucideIcon 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AIAssistantProps {
  content: string;
  onApplyTitle: (title: string) => void;
  onApplyTags: (tags: string) => void;
  onApplyContent: (html: string) => void;
}

type AIMode = "generate" | "summarize" | "improve" | "expand" | "draft";

const MODES: { id: AIMode; icon: LucideIcon; label: string; description: string; needsContent: boolean; color: string }[] = [
  {
    id: "generate",
    icon: Sparkles,
    label: "Generate Title & Tags",
    description: "Auto-generate an SEO-optimized title, summary, and tags.",
    needsContent: true,
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: "improve",
    icon: Wand2,
    label: "Magic-Improve Writing",
    description: "Polish grammar & flow while keeping your voice.",
    needsContent: true,
    color: "from-purple-500 to-pink-600",
  },
  {
    id: "expand",
    icon: ArrowUpRight,
    label: "Expand Content",
    description: "Turn short notes into a full, detailed blog post.",
    needsContent: true,
    color: "from-emerald-500 to-teal-700",
  },
  {
    id: "summarize",
    icon: FileText,
    label: "Quick Summary",
    description: "Create a 2-3 sentence summary as your post excerpt.",
    needsContent: true,
    color: "from-orange-500 to-amber-600",
  },
  {
    id: "draft",
    icon: Pencil,
    label: "Write from Topic",
    description: "AI writes a complete structured draft for you.",
    needsContent: false,
    color: "from-blue-600 to-cyan-500",
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
  const [applied, setApplied] = useState<string | null>(null);

  const rawContent = content.replace(/<[^>]+>/g, "").trim();

  // Handle success state timer
  useEffect(() => {
    if (applied) {
      const timer = setTimeout(() => setApplied(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [applied]);

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

  const handleApply = (type: 'title' | 'tags' | 'content', value: string) => {
    if (type === 'title') onApplyTitle(value);
    if (type === 'tags') onApplyTags(value);
    if (type === 'content') onApplyContent(value);
    setApplied(type);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-4 max-w-[calc(100vw-2rem)]">
      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-full sm:w-[400px] max-h-[85vh] overflow-hidden rounded-[24px] border border-white/10 bg-black/80 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center">
                  <Sparkles size={16} className="text-white" />
                </div>
                <span className="font-bold text-lg tracking-tight text-white">AI Assistant</span>
              </div>
              <button 
                onClick={() => setOpen(false)} 
                className="text-white/40 hover:text-white transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar">
              {!result && !loading && (
                <div className="space-y-6">
                  {/* Creation Tool: Write from Topic */}
                  <div className="space-y-3">
                    <p className="text-[10px] text-white/30 uppercase tracking-[2px] ml-1">Creation Tools</p>
                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-1 transition-all hover:border-primary/40">
                      {MODES.filter(m => m.id === "draft").map((m) => (
                        <div key={m.id} className="space-y-3 p-3">
                          <button
                            onClick={() => run(m.id)}
                            className="group w-full flex items-center gap-4 p-3 text-left rounded-xl hover:bg-white/5 transition-all text-white"
                          >
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center shrink-0 shadow-lg`}>
                              <m.icon size={20} />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-sm tracking-tight">{m.label}</p>
                              <p className="text-[11px] text-white/50 mt-0.5 leading-snug">{m.description}</p>
                            </div>
                            <div className="p-2 rounded-full build:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Sparkles size={14} className="text-primary" />
                            </div>
                          </button>
                          
                          <div className="px-1 pb-1">
                            <label className="text-[9px] text-white/20 uppercase tracking-widest mb-1.5 block ml-1 font-bold">Topic Description</label>
                            <input
                              className="w-full text-sm bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 text-white placeholder:text-white/20 transition-all focus:ring-4 focus:ring-primary/10"
                              placeholder="e.g. Benefits of AI in Education..."
                              value={topic}
                              onChange={(e) => setTopic(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && run('draft')}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Editing Tools (Need Content) */}
                  <div className="space-y-3">
                    <p className="text-[10px] text-white/30 uppercase tracking-[2px] ml-1">Editing Tools</p>
                    <div className="grid grid-cols-2 gap-3">
                       {MODES.filter(m => m.id !== "draft").map((m) => (
                        <motion.button
                          key={m.id}
                          whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => run(m.id)}
                          className="group flex flex-col items-center gap-3 p-4 text-center rounded-2xl border border-white/5 bg-white/[0.02] transition-all relative overflow-hidden"
                        >
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center shrink-0 opacity-80 group-hover:opacity-100 shadow-md`}>
                            <m.icon size={20} className="text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-[11px] text-white/90 leading-tight">{m.label}</p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="py-20 flex flex-col items-center justify-center text-center gap-6">
                  <div className="relative">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="w-20 h-20 rounded-full border-t-2 border-r-2 border-primary" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="text-primary animate-pulse" size={32} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-white text-lg tracking-tight">Writing magic...</h3>
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                    </div>
                    <p className="text-[10px] text-white/30 uppercase tracking-[2px] mt-4 font-black">Gemini 2.5 Flash Engine</p>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2">
                  <AlertCircle size={18} className="shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {/* Results View */}
              {result && !loading && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-5"
                >
                  <div className="flex items-center justify-between px-1">
                    <button 
                      onClick={() => setResult(null)} 
                      className="text-[10px] font-black uppercase tracking-[2px] text-white/40 hover:text-primary transition-colors flex items-center gap-2"
                    >
                      ← Back to tools
                    </button>
                    <span className="text-[10px] bg-primary/20 text-primary px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
                      {result.mode}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4 overflow-x-hidden relative">
                    {/* JSON Mode (Title/Tags) */}
                    {result.mode === "generate" && (
                      <div className="space-y-6">
                        {result.title && (
                          <div className="space-y-3">
                            <p className="text-[10px] text-white/30 uppercase tracking-widest font-black">Suggested Title</p>
                            <p className="text-base font-bold text-white leading-snug tracking-tight">{result.title}</p>
                            <Button 
                              size="sm" 
                              className="w-full py-6 rounded-xl text-sm font-bold shadow-xl bg-gradient-to-r from-primary to-blue-600 border-none"
                              onClick={() => handleApply('title', result.title!)}
                            >
                              {applied === 'title' ? <Check className="mr-2" size={18} /> : <Wand2 className="mr-2" size={18} />}
                              {applied === 'title' ? 'Title Applied!' : 'Apply This Title'}
                            </Button>
                          </div>
                        )}
                        
                        {result.tags && (
                          <div className="space-y-3">
                            <p className="text-[10px] text-white/30 uppercase tracking-widest font-black">Relevant Tags</p>
                            <div className="flex flex-wrap gap-2 py-1">
                              {result.tags.split(',').map(tag => (
                                <span key={tag} className="px-3 py-1 rounded-lg bg-white/5 text-[11px] font-medium text-white/80 border border-white/5">{tag.trim()}</span>
                              ))}
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full bg-transparent border-white/10 hover:bg-white/5 transition-all text-sm h-11 rounded-xl font-bold"
                              onClick={() => handleApply('tags', result.tags!)}
                            >
                              {applied === 'tags' ? <Check className="mr-2" size={18} /> : <FileText className="mr-2" size={18} />}
                              {applied === 'tags' ? 'Tags Added!' : 'Set These Tags'}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Summarize Mode */}
                    {result.mode === "summarize" && result.result && (
                      <div className="space-y-4">
                        <p className="text-[10px] text-white/30 uppercase tracking-widest font-black">Article Excerpt</p>
                        <p className="text-sm leading-relaxed text-white/80 italic border-l-2 border-primary/50 pl-5 py-1">
                          "{result.result}"
                        </p>
                        <Button 
                          onClick={() => handleCopy(result.result!)}
                          variant="secondary"
                          className="w-full h-12 rounded-xl text-xs font-black uppercase tracking-[2px] bg-white/5 hover:bg-white/10 border-white/5 text-white/70 hover:text-white"
                        >
                          {copied ? <Check size={16} className="mr-2 text-green-400" /> : <Copy size={16} className="mr-2" />}
                          {copied ? "Copied!" : "Copy Excerpt"}
                        </Button>
                      </div>
                    )}

                    {/* Large Content Modes */}
                    {(result.mode === "improve" || result.mode === "expand" || result.mode === "draft") && result.result && (
                      <div className="space-y-5">
                        <p className="text-[10px] text-white/30 uppercase tracking-widest font-black">AI Draft Generation</p>
                        <div
                          className="max-h-[300px] overflow-y-auto pr-3 custom-scrollbar text-sm leading-relaxed text-white/70 prose prose-invert prose-p:my-3 prose-h2:text-white prose-h2:text-lg prose-h2:font-black prose-h2:mt-6 prose-h2:mb-3 prose-strong:text-white prose-li:my-1"
                          dangerouslySetInnerHTML={{ __html: result.result }}
                        />
                        <div className="pt-2">
                          <Button
                            size="lg"
                            className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-[2px] bg-gradient-to-r from-primary to-purple-600 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(var(--primary),0.3)] border-none"
                            onClick={() => handleApply('content', result.result!)}
                          >
                            {applied === 'content' ? <Check className="mr-2" size={20} /> : <Sparkles className="mr-2" size={20} />}
                            {applied === 'content' ? 'Applied Successfully!' : 
                             result.mode === 'draft' ? 'Use This Draft' : 'Replace with AI Version'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Context Footer */}
            <div className="px-6 py-4 border-t border-white/5 bg-black/40 text-[9px] uppercase tracking-[3px] text-white/20 text-center font-black">
              Blog AI Engine v3.2 • Multi-Modal
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((o) => !o)}
        className="group flex items-center gap-3 pl-4 pr-6 py-4 rounded-full bg-gradient-to-tr from-primary to-purple-600 text-white font-bold shadow-[0_8px_30px_rgba(var(--primary),0.3)] hover:shadow-primary/50 transition-all duration-300 relative overflow-hidden ring-1 ring-white/10"
      >
        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[45deg]" />
        
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
          <Sparkles size={20} className="text-white" />
        </div>
        
        <div className="flex flex-col items-start leading-tight">
          <span className="text-[10px] uppercase tracking-[3px] opacity-60 font-black">Blog AI</span>
          <span className="text-sm font-black tracking-tight">AI ASSIST</span>
        </div>
        
        <div className="ml-1 opacity-40">
          {open ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </div>
      </motion.button>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
