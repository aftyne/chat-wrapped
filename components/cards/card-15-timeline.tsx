"use client";

import React from "react";
import { ChatWrappedAnalysis } from "@/lib/types";
import { MoodFaceBadge } from "@/components/ui/doodles";

// Gradient colors matching the exact "Stress indicator" bar progression in Reference Screen 1
const BAR_PALETTE = [
  "#9B6B9E",
  "#9B6B9E",
  "#A373A8",
  "#AC84B8",
  "#B498CC",
  "#B9ADE0",
  "#BDCAF0",
  "#C1D7F2",
  "#C5E0F0",
  "#C7E4EE",
  "#CBE4EE",
  "#CBE4EE",
];

export function Card15Timeline({ data }: { data: ChatWrappedAnalysis }) {
  const { timeline, timelineStats } = data;
  const maxVal = Math.max(1, ...timeline.map((t) => t.count));

  // Build SVG wave path above the bars (like the Stress indicator wave in Reference Screen 1)
  const points = timeline.map((b, idx) => {
    const x =
      timeline.length === 1
        ? 50
        : 6 + (idx / (timeline.length - 1)) * 88;
    const ratio = b.count / maxVal;
    const y = Math.max(10, 72 - ratio * 56);
    return { x, y };
  });

  let svgPath = "";
  if (points.length > 0) {
    svgPath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const midX = (curr.x + next.x) / 2;
      svgPath += ` C ${midX} ${curr.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
    }
  }

  return (
    <div className="flex flex-col justify-between min-h-full gap-3">
      <div>
        {/* Day / Week / Month Segmented Pill Header (Reference Screen 3) */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="py-1.5 rounded-full border border-ink/10 text-center text-xs font-semibold text-ink-secondary bg-white/60">
            Honeymoon
          </div>
          <div className="py-1.5 rounded-full bg-orchid text-center text-xs font-bold text-ink">
            Full Lifecycle
          </div>
          <div className="py-1.5 rounded-full border border-ink/10 text-center text-xs font-semibold text-ink-secondary bg-white/60">
            {timelineStats.currentTrend}
          </div>
        </div>

        <h2 className="font-display text-[25px] leading-[1.15] font-bold text-ink">
          How It Went (The Wave)
        </h2>
        <p className="text-xs text-ink-secondary mt-1 font-medium">
          Your month-by-month momentum from {timelineStats.honeymoonLabel} to right now.
        </p>
      </div>

      {/* Signature Chart Card mirroring "Stress indicator" on Reference Screen 1 */}
      <div className="bg-white rounded-card p-4 shadow-card">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MoodFaceBadge mood="happy" bg="#F2D2EC" className="w-8 h-8" />
            <span className="text-sm font-bold text-ink">Momentum Indicator</span>
          </div>
          <span className="px-3 py-1 rounded-full border border-ink/10 text-xs font-bold text-ink">
            {timelineStats.currentTrend}
          </span>
        </div>

        {/* Floating Wave + Rounded Pill Bars */}
        <div className="relative pt-6 pb-2 px-1">
          <svg
            viewBox="0 0 100 80"
            preserveAspectRatio="none"
            className="w-full h-16 absolute top-1 left-0 pointer-events-none"
          >
            <path
              d={svgPath}
              fill="none"
              stroke="#8A979C"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>

          <div className="flex items-end justify-between gap-1.5 h-28 pt-6">
            {timeline.map((bucket, idx) => {
              const heightPct = Math.max(18, Math.round((bucket.count / maxVal) * 100));
              const barColor = BAR_PALETTE[idx % BAR_PALETTE.length];

              return (
                <div
                  key={`${bucket.label}-${idx}`}
                  className="flex-1 flex flex-col items-center h-full justify-end group"
                >
                  <div
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: barColor,
                    }}
                    className="w-full max-w-[16px] rounded-full transition-all duration-500"
                    title={`${bucket.label}: ${bucket.count} messages`}
                  />
                </div>
              );
            })}
          </div>

          {/* Bottom Tick Axis */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-lavender/60 text-[10px] font-semibold text-ink-secondary">
            <span>{timeline[0]?.shortLabel}</span>
            <span>{timeline[Math.floor(timeline.length / 2)]?.shortLabel}</span>
            <span>{timeline[timeline.length - 1]?.shortLabel}</span>
          </div>
        </div>
      </div>

      {/* 3 Lifecycle Milestones (mirrors "My relax plan" 3-card row on Reference Screen 1) */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-orchid rounded-[22px] p-3">
          <p className="text-[10px] font-bold text-ink/70 uppercase">Honeymoon</p>
          <p className="text-xs font-bold text-ink mt-1 truncate">
            {timelineStats.honeymoonLabel}
          </p>
          <p className="text-[10px] text-ink/75 font-medium mt-0.5">Day 1 spark</p>
        </div>

        <div className="bg-lavender rounded-[22px] p-3">
          <p className="text-[10px] font-bold text-ink/70 uppercase">The Peak</p>
          <p className="text-xs font-bold text-ink mt-1 truncate">
            {timelineStats.peakLabel}
          </p>
          <p className="text-[10px] text-ink/75 font-medium mt-0.5">
            {timelineStats.peakCount} texts
          </p>
        </div>

        <div className="bg-sky rounded-[22px] p-3">
          <p className="text-[10px] font-bold text-ink/70 uppercase">Dry Spell</p>
          <p className="text-xs font-bold text-ink mt-1 truncate">
            {timelineStats.drySpellLabel}
          </p>
          <p className="text-[10px] text-ink/75 font-medium mt-0.5">Quiet era</p>
        </div>
      </div>
    </div>
  );
}
