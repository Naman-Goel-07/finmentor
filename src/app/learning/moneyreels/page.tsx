"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clapperboard, ChevronUp, ChevronDown } from "lucide-react";

const shorts = [
  "https://www.youtube.com/embed/6EPTegsTCtQ",
  "https://www.youtube.com/embed/OS2cThUP5MQ",
  "https://www.youtube.com/embed/4TBT2_3GN2M",
  "https://www.youtube.com/embed/Xr0VS24ZSmM",
  "https://www.youtube.com/embed/6axJ1WXHSCc",
  "https://www.youtube.com/embed/K1D7wFaST7c",
  "https://www.youtube.com/embed/Oj-i1TeYA94",
  "https://www.youtube.com/embed/K6bBUmtXDqw",
  "https://www.youtube.com/embed/3plAhmAwOsM",
  "https://www.youtube.com/embed/cZQ224DIqGk",
  "https://www.youtube.com/embed/zYHCPZgus7U",
  "https://www.youtube.com/embed/RSCfFaqkZtU",
  "https://www.youtube.com/embed/jQpccAQWE40",
];

// Fisher-Yates shuffle at module scope — outside component,
// so it runs once per page load and never during React render.
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const shuffledShorts = shuffle(shorts);

export default function MoneyReelsPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Tracks whether the user has interacted — unlocks sound after first click
  const [hasInteracted, setHasInteracted] = useState(false);

  const goNext = () => {
    setHasInteracted(true);
    setCurrentIndex((prev) =>
      prev === shuffledShorts.length - 1 ? 0 : prev + 1
    );
  };

  const goPrev = () => {
    setHasInteracted(true);
    setCurrentIndex((prev) =>
      prev === 0 ? shuffledShorts.length - 1 : prev - 1
    );
  };

  const currentVideo = shuffledShorts[currentIndex];

  // Muted on first load (browser autoplay policy requires it).
  // After any interaction the mute param is dropped so sound plays.
  const videoUrl = hasInteracted
    ? `${currentVideo}?autoplay=1&controls=1&modestbranding=1&rel=0&playsinline=1`
    : `${currentVideo}?autoplay=1&mute=1&controls=1&modestbranding=1&rel=0&playsinline=1`;

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-40">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 bg-gradient-to-b from-black to-transparent">
        <Link
          href="/learning"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/70 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all duration-200 text-sm font-semibold backdrop-blur-sm"
        >
          <ArrowLeft size={16} />
          Back
        </Link>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/70 border border-slate-700/40 backdrop-blur-sm">
          <Clapperboard size={16} className="text-indigo-400" />
          <span className="font-extrabold text-white text-sm tracking-tight">
            Money<span className="text-indigo-400">Reels</span>
          </span>
        </div>

        {/* Invisible spacer to keep title centred */}
        <div className="w-[72px]" />
      </div>

      {/* ── Video + Side Arrows (desktop) ── */}
      <div className="flex-1 flex items-center justify-center gap-6 px-4 min-h-0">

        {/* Prev — desktop */}
        <button
          onClick={goPrev}
          className="hidden md:flex items-center justify-center w-11 h-11 rounded-full bg-slate-900/80 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200 backdrop-blur-sm flex-shrink-0"
          aria-label="Previous video"
        >
          <ChevronUp size={22} />
        </button>

        {/* Video frame */}
        <div className="relative w-full max-w-[360px] aspect-[9/16] rounded-2xl overflow-hidden border border-slate-800/50 shadow-2xl shadow-black/80">
          {/* Ambient glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/20 via-transparent to-purple-950/20 pointer-events-none z-10" />

          {/*
            key={currentIndex} forces React to unmount + remount the iframe on
            every navigation — this is what stops the previous video cold.
          */}
          <iframe
            key={currentIndex}
            src={videoUrl}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={`MoneyReel ${currentIndex + 1}`}
          />
        </div>

        {/* Next — desktop */}
        <button
          onClick={goNext}
          className="hidden md:flex items-center justify-center w-11 h-11 rounded-full bg-slate-900/80 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200 backdrop-blur-sm flex-shrink-0"
          aria-label="Next video"
        >
          <ChevronDown size={22} />
        </button>
      </div>

      {/* ── Prev / Next buttons — mobile ── */}
      <div className="md:hidden flex justify-center gap-4 py-5 flex-shrink-0">
        <button
          onClick={goPrev}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900/80 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-200 font-bold text-sm backdrop-blur-sm min-h-[44px]"
          aria-label="Previous video"
        >
          <ChevronUp size={18} />
          Prev
        </button>
        <button
          onClick={goNext}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600/80 border border-indigo-500/40 text-white hover:bg-indigo-500 transition-all duration-200 font-bold text-sm backdrop-blur-sm min-h-[44px]"
          aria-label="Next video"
        >
          Next
          <ChevronDown size={18} />
        </button>
      </div>

    </div>
  );
}
