"use client";

import React from "react";
import { ChatWrappedAnalysis } from "@/lib/types";
import {
  MoodFaceBadge,
  QuirkyFaceHangout,
  QuirkyFaceLaugh,
} from "@/components/ui/doodles";
import { ArrowRight } from "lucide-react";

export function Card02TotalMessages({ data }: { data: ChatWrappedAnalysis }) {
  const [you, them] = data.participants;

  return (
    <div className="flex flex-col justify-between min-h-full gap-3">
      {/* Header matching "Good Morning, Frede / Select what you want more for now" */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-lavender text-ink text-xs font-semibold">
            Volume & Split
          </span>
          <span className="text-xs font-semibold text-ink-secondary">
            {data.messagesPerDay} msgs / day
          </span>
        </div>
        <h2 className="font-display text-[26px] leading-[1.15] font-bold text-ink">
          {data.totalMessages.toLocaleString()} messages exchanged
        </h2>
        <p className="text-xs text-ink-secondary mt-1 font-medium">
          That’s {data.totalWords.toLocaleString()} total words—roughly{" "}
          {Math.max(1, Math.round(data.totalWords / 250))} novel pages of pure lore.
        </p>
      </div>

      {/* Two signature side-by-side cards (Orchid & Deep Petrol Teal from reference screen 1) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-orchid rounded-card p-4 flex flex-col justify-between min-h-[158px] relative overflow-hidden">
          <QuirkyFaceHangout className="w-14 h-14 -ml-1" />
          <div className="mt-3">
            <p className="text-xs font-semibold text-ink/75 truncate">{you.name}</p>
            <div className="flex items-end justify-between mt-1">
              <div>
                <p className="text-2xl font-bold text-ink leading-none">
                  {you.percentage}%
                </p>
                <p className="text-[11px] font-medium text-ink/75 mt-1">
                  {you.messageCount.toLocaleString()} texts
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-ink" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-petrol rounded-card p-4 flex flex-col justify-between min-h-[158px] text-white relative overflow-hidden">
          <QuirkyFaceLaugh className="w-14 h-14 -ml-1" />
          <div className="mt-3">
            <p className="text-xs font-medium text-white/80 truncate">{them.name}</p>
            <div className="flex items-end justify-between mt-1">
              <div>
                <p className="text-2xl font-bold text-white leading-none">
                  {them.percentage}%
                </p>
                <p className="text-[11px] font-medium text-white/75 mt-1">
                  {them.messageCount.toLocaleString()} texts
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-petrol-soft flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* White Balance Indicator Card (mirrors "Stress indicator" card on reference screen 1) */}
      <div className="bg-white rounded-card p-4 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <MoodFaceBadge mood="happy" bg="#F2D2EC" className="w-8 h-8" />
            <span className="text-sm font-bold text-ink">Texting Balance</span>
          </div>
          <span className="px-3 py-1 rounded-full border border-ink/10 text-xs font-semibold text-ink">
            {Math.abs(you.percentage - them.percentage) <= 12
              ? "50/50 Equilibrium"
              : you.percentage > them.percentage
              ? `${you.name} Leads`
              : `${them.name} Leads`}
          </span>
        </div>

        {/* Segmented pill bar */}
        <div className="h-5 w-full rounded-full bg-canvas p-1 flex items-center gap-1 overflow-hidden">
          <div
            style={{ width: `${Math.max(15, Math.min(85, you.percentage))}%` }}
            className="h-full rounded-full bg-orchid-deep transition-all duration-500"
          />
          <div className="flex-1 h-full rounded-full bg-sky" />
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-ink/[0.06] text-center">
          <div className="bg-canvas rounded-2xl py-2 px-2">
            <p className="text-[11px] text-ink-secondary font-medium">Avg / Day</p>
            <p className="text-sm font-bold text-ink">{data.messagesPerDay}</p>
          </div>
          <div className="bg-canvas rounded-2xl py-2 px-2">
            <p className="text-[11px] text-ink-secondary font-medium">Peak Hour</p>
            <p className="text-sm font-bold text-ink">{data.peakHourFormatted}</p>
          </div>
          <div className="bg-canvas rounded-2xl py-2 px-2">
            <p className="text-[11px] text-ink-secondary font-medium">Peak Day</p>
            <p className="text-sm font-bold text-ink">{data.peakDayOfWeek}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
