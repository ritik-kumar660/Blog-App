"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, FileText, ListTodo, BrainCircuit, X, 
  ChevronDown, ChevronUp, Loader2, Copy, Check, Info,
  Menu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ReaderAssistantProps {
  content: string;
}

type ReaderMode = "summarize" | "takeaways" | "simplify";

const READING_TOOLS: { id: ReaderMode; icon: any; label: string; description: string; color: string }[] = [
  {
    id: "summarize",
    icon: FileText,
    label: "Quick Summary",
    description: "What is this article about? Get the gist in 2 sentences.",
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: "takeaways",
    icon: ListTodo,
    label: "Key Takeaways",
    description: "The most important points extracted for you.",
    color: "from-emerald-500 to-teal-700",
  },
  {
    id: "simplify",
    icon: BrainCircuit,
    label: "Explain it Simply",
    description: "Rewritten for total clarity using simple analogies.",
    color: "from-amber-500 to-orange-600",
  },
];

export default function ReaderAssistant({ content }: ReaderAssistantProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ mode: ReaderMode; result: string } | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const run = async (mode: ReaderMode) => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, mode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "AI request failed.");
      } else {
        setResult({ mode, result: data.result });
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.result.replace(/<[^>]+>/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-4 max-w-[calc(100vw-2rem)]">
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-full sm:w-[380px] max-h-[80vh] overflow-hidden rounded-[24px] border border-white/10 bg-black/80 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
              <div className="flex items-center gap-3 text-white">
                <Sparkles size={18} className="text-primary" />
                <span className="font-bold tracking-tight">Reader AI Assist</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar">
              {!result && !loading && (
                <div className="space-y-4">
                  <p className="text-[11px] text-white/40 uppercase tracking-[2px] font-black text-center mb-2">Reading Tools</p>
                  <div className="grid gap-3">
                    {READING_TOOLS.map((tool) => (
                      <motion.button
                        key={tool.id}
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => run(tool.id)}
                        className="group w-full flex items-center gap-4 p-4 text-left rounded-2xl border border-white/5 bg-white/[0.02] transition-all"
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center shrink-0 shadow-lg text-white`}>
                          <tool.icon size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-sm text-white tracking-tight">{tool.label}</p>
                          <p className="text-[11px] text-white/50 mt-0.5 leading-snug line-clamp-2">{tool.description}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {loading && (
                <div className="py-16 flex flex-col items-center justify-center text-center gap-6">
                  <div className="relative">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 rounded-full border-t-2 border-primary"
                    />
                    <Sparkles className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" size={24} />
                  </div>
                  <p className="text-sm font-bold text-white tracking-tight">Processing article insights...</p>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-medium">
                  {error}
                </div>
              )}

              {result && !loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                  <div className="flex items-center justify-between px-1">
                    <button onClick={() => setResult(null)} className="text-[10px] font-black uppercase tracking-[2px] text-white/30 hover:text-white transition-colors">
                      ← Tools
                    </button>
                    <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-black uppercase">
                      {result.mode}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
                     <div 
                        className="text-sm leading-relaxed text-white/80 prose prose-invert prose-sm max-w-none prose-p:my-2 prose-li:my-1"
                        dangerouslySetInnerHTML={{ __html: result.result }}
                     />
                     <Button 
                        onClick={handleCopy}
                        variant="secondary"
                        className="w-full h-11 rounded-xl text-xs font-black uppercase tracking-[2px] bg-white/5 hover:bg-white/10 border-white/5 text-white/70"
                     >
                       {copied ? <Check size={14} className="mr-2 text-green-400" /> : <Copy size={14} className="mr-2" />}
                       {copied ? "Copied insight" : "Copy to clipboard"}
                     </Button>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-white/5 bg-black/40 text-[9px] uppercase tracking-[3px] text-white/20 text-center font-black">
              Blog AI Global Insights Engine
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 pl-4 pr-6 py-4 rounded-full bg-black/80 backdrop-blur-xl border border-white/10 text-white font-bold shadow-2xl hover:bg-black transition-all group"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center shrink-0">
          <Sparkles size={20} className="text-white" />
        </div>
        <div className="flex flex-col items-start leading-tight">
          <span className="text-[10px] uppercase tracking-[3px] text-primary font-black">AI TOOLS</span>
          <span className="text-sm font-black tracking-tight">Post Insights</span>
        </div>
      </motion.button>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
