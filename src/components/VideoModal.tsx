"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface VideoModalProps {
  videoUrl: string;
  title?: string;
  onClose: () => void;
}

export default function VideoModal({ videoUrl, title, onClose }: VideoModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title ? `Video: ${title}` : "Video Lesson"}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-3xl z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 px-1">
          {title && (
            <h2 className="text-white font-bold text-lg truncate pr-4">{title}</h2>
          )}
          <button
            onClick={onClose}
            className="ml-auto flex items-center justify-center w-9 h-9 rounded-full bg-slate-800/80 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Close video"
          >
            <X size={18} />
          </button>
        </div>

        {/* Video Frame */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-700/40 shadow-2xl shadow-black/60 bg-black">
          <iframe
            src={`${videoUrl}?autoplay=1&rel=0`}
            className="w-full h-[220px] sm:h-[360px] md:h-[500px]"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title || "Video Lesson"}
          />
        </div>

        {/* Hint */}
        <p className="text-center text-slate-500 text-xs mt-3">
          Press <kbd className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-700">Esc</kbd> or click outside to close
        </p>
      </div>
    </div>
  );
}
