"use client";

import React from "react";
import { ChatWrappedAnalysis } from "@/lib/types";
import { LotusBowlDoodle, MoodFaceBadge } from "@/components/ui/doodles";
import { ArrowRight, Calendar, Clock, Sparkles } from "lucide-react";

export function Card01FirstMessage({ data }: { data: ChatWrappedAnalysis }) {
  const { firstMessage, participants } = data;
  const [you, them] = participants;
  const isYouFirst = firstMessage.sender === you.name;

  return (
    <div className="flex flex-col justify-between min-h-full gap-3">
      {/* Top Pill & Editorial Quote Header (mirrors middle screen of reference image) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-orchid text-ink text-xs font-semibold tracking-tight">
            Origin story
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-ink-secondary text-xs font-medium shadow-pill">
            <Calendar className="w-3.5 h-3.5" />
            {firstMessage.daysAgo}d ago
          </span>
        </div>

        <div className="flex items-start justify-between gap-2">
          <h2 className="font-display text-[26px] leading-[1.15] font-bold text-ink tracking-tight">
            “Every chaotic archive starts with one brave text.”
          </h2>
          <LotusBowlDoodle className="w-20 h-20 shrink-0 -mt-1" />
        </div>
        <p className="text-xs text-ink-secondary mt-1.5 font-medium">
          — {firstMessage.formattedDate} at {firstMessage.formattedTime}
        </p>
      </div>

      {/* Main First Message Bubble Card */}
      <div className="bg-white rounded-card p-5 shadow-card border border-ink/[0.04] relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <MoodFaceBadge
              mood="wink"
              bg={isYouFirst ? "#F2D2EC" : "#D5CDF6"}
              className="w-9 h-9"
            />
            <div>
              <p className="text-[11px] font-semibold text-ink-secondary uppercase tracking-wider">
                Broke the ice first
              </p>
              <p className="text-base font-bold text-ink">{firstMessage.sender}</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-lime text-ink text-xs font-semibold">
            First Move
          </span>
        </div>

        <div className="bg-canvas rounded-2xl p-4 border border-ink/[0.05]">
          <p className="text-[15px] leading-relaxed font-semibold text-ink break-words">
            “{firstMessage.text}”
          </p>
          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-ink/[0.06] text-[11px] text-ink-secondary font-medium">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" /> {firstMessage.formattedTime}
            </span>
            <span>Message #0001</span>
          </div>
        </div>

        {firstMessage.secondMessage && (
          <div className="mt-3 pl-4 border-l-2 border-orchid">
            <p className="text-[11px] font-semibold text-ink-secondary">
              {firstMessage.secondMessage.sender} replied at{" "}
              {firstMessage.secondMessage.formattedTime}:
            </p>
            <p className="text-xs text-ink font-medium line-clamp-2 mt-0.5">
              “{firstMessage.secondMessage.text}”
            </p>
          </div>
        )}
      </div>

      {/* Bottom Dual Mini Cards (mirrors "Hang out" & "Laugh" cards from reference) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-orchid rounded-card p-4 flex flex-col justify-between min-h-[108px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink/80">Icebreaker</span>
            <Sparkles className="w-4 h-4 text-ink" />
          </div>
          <div className="flex items-end justify-between mt-2">
            <div>
              <p className="text-lg font-bold text-ink leading-tight truncate max-w-[105px]">
                {firstMessage.sender}
              </p>
              <p className="text-[11px] text-ink/75 font-medium">Zero hesitation</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shrink-0">
              <ArrowRight className="w-4 h-4 text-ink" />
            </div>
          </div>
        </div>

        <div className="bg-petrol rounded-card p-4 flex flex-col justify-between min-h-[108px] text-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/80">Active Span</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-petrol-soft/40 text-white font-semibold">
              Live
            </span>
          </div>
          <div className="flex items-end justify-between mt-2">
            <div>
              <p className="text-xl font-bold leading-tight">
                {data.totalDaysSpan} <span className="text-xs font-normal">days</span>
              </p>
              <p className="text-[11px] text-white/75 font-medium">
                {data.activeDays} active days
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-petrol-soft flex items-center justify-center shrink-0">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
