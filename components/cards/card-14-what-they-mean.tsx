"use client";

import React from "react";
import { ChatWrappedAnalysis } from "@/lib/types";
import { Languages } from "lucide-react";

export function Card14WhatTheyMean({
  data,
  isExport = false,
}: {
  data: ChatWrappedAnalysis;
  isExport?: boolean;
}) {
  const [, them] = data.participants;
  const items = data.translations.slice(0, 3);

  return (
    <div
      className={`flex flex-col ${
        isExport ? "justify-center gap-4" : "justify-between min-h-full gap-3.5"
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orchid text-[#083A44] text-xs font-semibold">
            <Languages className="w-3.5 h-3.5" /> Subtext Decoder
          </span>
          <span className="text-xs font-semibold text-ink-secondary">
            AI Lingua Franca
          </span>
        </div>
        <h2 className="font-display text-[26px] leading-[1.15] font-extrabold tracking-tight text-[#083A44]">
          What {them.name}{" "}
          <span className="inline-block px-2 py-0.5 rounded-lg bg-[#EAFA91]/85">
            really
          </span>{" "}
          means
        </h2>
        <p className="text-xs text-ink-secondary mt-1.5 font-medium leading-relaxed">
          We ran {them.name}’s most frequent short replies through our ruthless subtext translator.
        </p>
      </div>

      {/* Subtext Cards (Clean Full-Width Translation Boxes — No Microphone Icon) */}
      <div className="space-y-2.5 flex-1 flex flex-col justify-center">
        {items.map((item, idx) => (
          <div
            key={item.original}
            className={`rounded-card p-4 shadow-card ${
              idx === 0
                ? "bg-orchid"
                : idx === 1
                ? "bg-white"
                : "bg-lavender"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                <span className="px-3 py-1 rounded-full bg-white text-[#083A44] text-xs font-bold shadow-pill break-words">
                  Says {item.original}
                </span>
                <span className="text-[11px] font-semibold text-[#083A44]/70">
                  Sent {item.count}×
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full border border-ink/15 text-[10px] font-bold text-[#083A44] shrink-0">
                {item.vibeTag}
              </span>
            </div>

            <div className="bg-white/90 rounded-2xl px-4 py-3">
              <p className="text-xs font-semibold text-[#083A44] leading-snug break-words">
                {item.meaning}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
