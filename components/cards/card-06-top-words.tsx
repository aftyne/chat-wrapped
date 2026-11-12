"use client";

import React from "react";
import { ChatWrappedAnalysis } from "@/lib/types";
import { Search, Sparkles } from "lucide-react";

const PILL_COLORS = [
  "bg-lime text-[#083A44]",
  "bg-mint text-[#083A44]",
  "bg-lavender text-[#083A44]",
  "bg-sky text-[#083A44]",
  "bg-orchid text-[#083A44]",
  "bg-white text-[#083A44] border border-ink/10",
];

export function Card06TopWords({
  data,
  isExport = false,
}: {
  data: ChatWrappedAnalysis;
  isExport?: boolean;
}) {
  const [you, them] = data.participants;

  return (
    <div
      className={`flex flex-col ${
        isExport ? "justify-center gap-4" : "justify-between min-h-full gap-3.5"
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-mint text-[#083A44] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Vocabulary Split
          </span>
          <span className="text-xs font-semibold text-ink-secondary">
            Stop-words filtered
          </span>
        </div>
        <h2 className="font-display text-[26px] leading-[1.15] font-extrabold tracking-tight text-[#083A44]">
          Your most{" "}
          <span className="inline-block px-2 py-0.5 rounded-lg bg-[#EAFA91]/85">
            overused words
          </span>
        </h2>
        <p className="text-xs text-ink-secondary mt-1.5 font-medium leading-relaxed">
          Strip away the filler words and these are the terms that define your lexicon.
        </p>
      </div>

      {/* Person 1 Word Cloud Card */}
      <div className="bg-white rounded-card p-4 shadow-card">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-secondary break-words">
            {you.name}’s Signature Dictionary
          </span>
          <span className="text-xs font-bold text-[#083A44] shrink-0">
            #{you.topWords[0]?.word || "vibes"}
          </span>
        </div>

        <div className="bg-canvas rounded-full px-3.5 py-2 flex items-center gap-2 mb-3">
          <Search className="w-4 h-4 text-ink-secondary shrink-0" />
          <span className="text-xs font-semibold text-[#083A44] break-words">
            Most typed: “{you.topWords[0]?.word || "matcha"}” (
            {you.topWords[0]?.count || 12}×)
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {you.topWords.slice(0, 7).map((item, idx) => (
            <span
              key={item.word}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                PILL_COLORS[idx % PILL_COLORS.length]
              }`}
            >
              <span>{item.word}</span>
              <span className="text-[10px] opacity-70 font-bold">
                ×{item.count}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Partner's Word Cloud Card */}
      <div className="bg-orchid rounded-card p-4 shadow-card">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#083A44]/75 break-words">
            {them.name}’s Signature Dictionary
          </span>
          <span className="text-xs font-bold text-[#083A44] shrink-0">
            #{them.topWords[0]?.word || "chaos"}
          </span>
        </div>

        <div className="bg-white rounded-full px-3.5 py-2 flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold text-[#083A44] break-words">
            Top fixation: “{them.topWords[0]?.word || "protocol"}”
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#083A44] text-white text-[10px] font-bold shrink-0">
            {them.topWords[0]?.count || 10}×
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {them.topWords.slice(0, 7).map((item) => (
            <span
              key={item.word}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/80 text-[#083A44] border border-ink/10"
            >
              <span>{item.word}</span>
              <span className="text-[10px] text-ink-secondary font-bold">
                ×{item.count}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
