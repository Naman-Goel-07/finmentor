"use client";

import { X, Play } from "lucide-react";
import { useEffect } from "react";

interface ContentModalProps {
  url: string;
  title?: string;
  onClose: () => void;
}

export default function ContentModal({ url, title, onClose }: ContentModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const embedUrl = `${url}?autoplay=1&rel=0`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label={title ? `Video: ${title}` : "Video Lesson"}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl z-10 animate-in fade-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="flex items-center gap-3 mb-3 px-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
            <Play size={11} fill="currentColor" />
            Video
          </span>

          {title && (
            <h2 className="text-white font-bold text-sm sm:text-base truncate flex-1">{title}</h2>
          )}

          <button
            onClick={onClose}
            className="ml-auto flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-slate-800/80 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Close video"
          >
            <X size={17} />
          </button>
        </div>

        {/* 16:9 Video Frame */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-700/40 shadow-2xl shadow-black/60 bg-black">
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title || "Video Lesson"}
          />
        </div>

        {/* Footer hint */}
        <p className="text-center text-slate-500 text-xs mt-3">
          Press{" "}
          <kbd className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-700">
            Esc
          </kbd>{" "}
          or click outside to close
        </p>
      </div>
    </div>
  );
}
