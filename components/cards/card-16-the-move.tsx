"use client";

import React from "react";
import { ChatWrappedAnalysis } from "@/lib/types";
import { LotusBowlDoodle, PlayCircleIcon } from "@/components/ui/doodles";
import { Download, Share2, Sparkles } from "lucide-react";

const BG_MAP = {
  lavender: "bg-lavender",
  sky: "bg-sky",
  mint: "bg-mint",
  orchid: "bg-orchid",
};

export function Card16TheMove({
  data,
  onShareCard,
  isExporting,
}: {
  data: ChatWrappedAnalysis;
  onShareCard: () => void;
  isExporting: boolean;
}) {
  const { verdict } = data;

  return (
    <div className="flex flex-col justify-between h-full gap-2.5">
      {/* Top Verdict Quote & Grade */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orchid text-ink text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Final Verdict · Card 16
          </span>
          <span className="px-3 py-1 rounded-full bg-petrol text-white text-xs font-bold">
            Grade: {verdict.grade} ({verdict.compatibilityScore}%)
          </span>
        </div>

        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="font-display text-[24px] leading-[1.12] font-bold text-ink">
              “{verdict.archetype}”
            </h2>
            <p className="text-xs text-ink-secondary mt-1 font-medium leading-snug">
              {verdict.summaryQuote}
            </p>
          </div>
          <LotusBowlDoodle className="w-16 h-16 shrink-0" />
        </div>
      </div>

      {/* "Things you can do" Actionable Advice Cards (Directly mirroring Reference Screen 2) */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-ink">
          Things you should do next (The Move)
        </p>
        {verdict.actionItems.map((item, idx) => (
          <div
            key={item.title}
            className="bg-white rounded-[22px] p-3 shadow-card flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-11 h-11 rounded-2xl ${BG_MAP[item.color]} flex flex-col items-center justify-center shrink-0`}
              >
                <span className="text-[10px] font-bold text-ink uppercase">
                  0{idx + 1}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-ink truncate">
                  {item.title}
                </p>
                <p className="text-[11px] text-ink-secondary font-medium line-clamp-2 mt-0.5 leading-tight">
                  {item.subtitle}
                </p>
              </div>
            </div>
            <PlayCircleIcon className="w-6 h-6 shrink-0" />
          </div>
        ))}
      </div>

      {/* Sticky Share Story Button */}
      <div className="pt-1 flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onShareCard();
          }}
          disabled={isExporting}
          className="flex-1 min-h-[46px] rounded-full bg-petrol hover:bg-petrol-deep text-white font-bold text-xs flex items-center justify-center gap-2 shadow-card transition-all active:scale-[0.99] disabled:opacity-60"
        >
          <Share2 className="w-4 h-4" />
          <span>{isExporting ? "Rendering Story PNG..." : "Share Story Card"}</span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onShareCard();
          }}
          disabled={isExporting}
          aria-label="Download PNG"
          className="w-[46px] h-[46px] rounded-full bg-orchid hover:bg-orchid/80 text-ink flex items-center justify-center shadow-card transition-all active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
