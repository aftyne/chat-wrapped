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
  isExport = false,
}: {
  data: ChatWrappedAnalysis;
  onShareCard: () => void;
  isExporting: boolean;
  isExport?: boolean;
}) {
  const { verdict } = data;

  return (
    <div
      className={`flex flex-col ${
        isExport ? "justify-center gap-4" : "justify-between min-h-full gap-3"
      }`}
    >
      {/* Top Verdict Quote & Grade */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orchid text-[#083A44] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Final Verdict
          </span>
          <span className="px-3 py-1 rounded-full bg-petrol text-white text-xs font-bold">
            Grade: {verdict.grade} ({verdict.compatibilityScore}%)
          </span>
        </div>

        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="font-display text-[26px] leading-[1.15] font-extrabold tracking-tight text-[#083A44]">
              <span className="inline-block px-2 py-0.5 rounded-lg bg-[#EAFA91]/85">
                “{verdict.archetype}”
              </span>
            </h2>
            <p className="text-xs text-ink-secondary mt-1.5 font-medium leading-relaxed">
              {verdict.summaryQuote}
            </p>
          </div>
          <LotusBowlDoodle className="w-16 h-16 shrink-0" />
        </div>
      </div>

      {/* "Things you can do" Actionable Advice Cards */}
      <div className="space-y-2.5">
        <p className="text-xs font-bold text-[#083A44]">
          Things you should do next (The Move)
        </p>
        {verdict.actionItems.map((item, idx) => (
          <div
            key={item.title}
            className="bg-white rounded-[22px] p-3.5 shadow-card flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-11 h-11 rounded-2xl ${BG_MAP[item.color]} flex flex-col items-center justify-center shrink-0`}
              >
                <span className="text-[10px] font-bold text-[#083A44] uppercase">
                  0{idx + 1}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#083A44] break-words leading-snug">
                  {item.title}
                </p>
                <p className="text-[11px] text-ink-secondary font-medium break-words mt-0.5 leading-snug">
                  {item.subtitle}
                </p>
              </div>
            </div>
            <PlayCircleIcon className="w-6 h-6 shrink-0" />
          </div>
        ))}
      </div>

      {/* Sticky Share Story Button (hidden in exported poster PNG) */}
      {!isExport && (
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
            <span>
              {isExporting ? "Rendering Story PNG..." : "Share Story Card"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
