"use client";

import React from "react";
import { ChatWrappedAnalysis } from "@/lib/types";
import { PlayCircleIcon } from "@/components/ui/doodles";
import { Sparkles } from "lucide-react";

const ICON_BG_LIST = ["bg-lavender", "bg-sky", "bg-mint", "bg-orchid"];

export function Card07SharedLore({ data }: { data: ChatWrappedAnalysis }) {
  const [you, them] = data.participants;
  const loreItems = data.sharedLore.slice(0, 4);

  return (
    <div className="flex flex-col justify-between h-full gap-3">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orchid text-ink text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Shared Lore · Card 07
          </span>
          <span className="text-xs font-semibold text-ink-secondary">
            N-Gram Analysis
          </span>
        </div>
        <h2 className="font-display text-[25px] leading-[1.15] font-bold text-ink">
          “Only you two say this”
        </h2>
        <p className="text-xs text-ink-secondary mt-1 font-medium">
          Inside jokes, recurring code-words, and phrases that appear way above normal human baselines.
        </p>
      </div>

      {/* Stacked List Cards matching "Things you can do: Mind Detox / Gratitude Notes" in Reference Screen 2 */}
      <div className="space-y-2.5 flex-1 flex flex-col justify-center">
        {loreItems.map((item, idx) => (
          <div
            key={item.phrase}
            className="bg-white rounded-[24px] p-3.5 shadow-card flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-12 h-12 rounded-2xl ${
                  ICON_BG_LIST[idx % ICON_BG_LIST.length]
                } flex flex-col items-center justify-center shrink-0`}
              >
                <span className="text-xs font-bold text-ink">#{idx + 1}</span>
                <span className="text-[10px] font-semibold text-ink/70">
                  {item.totalCount}×
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-ink truncate">
                    “{item.phrase}”
                  </p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-canvas text-ink-secondary font-semibold shrink-0">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-ink-secondary mt-0.5 font-medium truncate">
                  {you.name}: {item.youCount}× · {them.name}: {item.themCount}×
                </p>
              </div>
            </div>
            <PlayCircleIcon className="w-7 h-7 shrink-0" />
          </div>
        ))}
      </div>

      {/* Bottom Pill Strip */}
      <div className="bg-petrol rounded-card px-4 py-3 text-white flex items-center justify-between">
        <span className="text-xs font-medium text-white/85">
          Shared Braincell Synchronization
        </span>
        <span className="px-3 py-1 rounded-full bg-lime text-ink text-xs font-bold">
          98.4% Match
        </span>
      </div>
    </div>
  );
}
