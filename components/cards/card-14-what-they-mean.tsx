"use client";

import React from "react";
import { ChatWrappedAnalysis } from "@/lib/types";
import { Languages, Mic } from "lucide-react";

export function Card14WhatTheyMean({ data }: { data: ChatWrappedAnalysis }) {
  const [, them] = data.participants;
  const items = data.translations.slice(0, 3);

  return (
    <div className="flex flex-col justify-between h-full gap-3">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orchid text-ink text-xs font-semibold">
            <Languages className="w-3.5 h-3.5" /> Subtext Decoder · Card 14
          </span>
          <span className="text-xs font-semibold text-ink-secondary">
            AI Lingua Franca
          </span>
        </div>
        <h2 className="font-display text-[25px] leading-[1.15] font-bold text-ink">
          What {them.name} *really* means
        </h2>
        <p className="text-xs text-ink-secondary mt-1 font-medium">
          We ran {them.name}’s most frequent short replies through our ruthless subtext translator.
        </p>
      </div>

      {/* Styled after the "Yes or No Quiz / Write an answer" card on Reference Screen 3 */}
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
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-white text-ink text-xs font-bold shadow-pill">
                  Says {item.original}
                </span>
                <span className="text-[11px] font-semibold text-ink/70">
                  Sent {item.count}×
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full border border-ink/15 text-[10px] font-bold text-ink">
                {item.vibeTag}
              </span>
            </div>

            <div className="bg-white/90 rounded-2xl px-3.5 py-2.5 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-ink leading-snug">
                {item.meaning}
              </p>
              <div className="w-7 h-7 rounded-full bg-ink text-white flex items-center justify-center shrink-0">
                <Mic className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
