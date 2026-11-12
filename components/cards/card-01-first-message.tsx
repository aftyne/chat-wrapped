"use client";

import React from "react";
import { ChatWrappedAnalysis } from "@/lib/types";
import { LotusBowlDoodle, MoodFaceBadge } from "@/components/ui/doodles";
import { Calendar, Clock, Sparkles } from "lucide-react";

export function Card01FirstMessage({
  data,
  isExport = false,
}: {
  data: ChatWrappedAnalysis;
  isExport?: boolean;
}) {
  const { firstMessage, participants } = data;
  const [you] = participants;
  const isYouFirst = firstMessage.sender === you.name;

  return (
    <div
      className={`flex flex-col ${
        isExport ? "justify-center gap-4" : "justify-between min-h-full gap-3.5"
      }`}
    >
      {/* Top Pill & Editorial Quote Header */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orchid text-[#083A44] text-xs font-semibold tracking-tight">
            ✨ Origin Story
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-ink-secondary text-xs font-semibold shadow-pill">
            <Calendar className="w-3.5 h-3.5" />
            {firstMessage.daysAgo === 0
              ? "Today"
              : `${firstMessage.daysAgo}d ago`}
          </span>
        </div>

        <div className="flex items-start justify-between gap-2">
          <h2 className="font-display text-[26px] leading-[1.15] font-extrabold tracking-tight text-[#083A44]">
            “Every chaotic archive starts with{" "}
            <span className="inline-block px-2 py-0.5 rounded-lg bg-[#EAFA91]/85 text-[#083A44]">
              one brave text.
            </span>
            ”
          </h2>
          <LotusBowlDoodle className="w-16 h-16 shrink-0 -mt-1" />
        </div>
        <p className="text-xs text-ink-secondary mt-1.5 font-medium">
          — {firstMessage.formattedDate} at {firstMessage.formattedTime}
        </p>
      </div>

      {/* Main First Message Bubble Card */}
      <div className="bg-white rounded-card p-5 shadow-card border border-ink/[0.04] relative overflow-hidden">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <MoodFaceBadge
              mood="wink"
              bg={isYouFirst ? "#F2D2EC" : "#D5CDF6"}
              className="w-9 h-9 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-ink-secondary uppercase tracking-wider">
                Broke the ice first
              </p>
              <p className="text-base font-bold text-[#083A44] break-words leading-snug">
                {firstMessage.sender}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-lime text-[#083A44] text-xs font-semibold shrink-0">
            First Move
          </span>
        </div>

        <div className="bg-canvas rounded-2xl p-4 border border-ink/[0.05]">
          <p className="text-[15px] leading-relaxed font-semibold text-[#083A44] break-words">
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
            <p className="text-[11px] font-semibold text-ink-secondary break-words">
              {firstMessage.secondMessage.sender} replied at{" "}
              {firstMessage.secondMessage.formattedTime}:
            </p>
            <p className="text-xs text-[#083A44] font-medium break-words mt-0.5 leading-snug">
              “{firstMessage.secondMessage.text}”
            </p>
          </div>
        )}
      </div>

      {/* Bottom Dual Mini Cards (Clean & Static — No False Affordance Arrows) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-orchid rounded-card p-4 flex flex-col justify-between min-h-[104px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#083A44]/80">
              Icebreaker
            </span>
            <Sparkles className="w-4 h-4 text-[#083A44]" />
          </div>
          <div className="mt-2">
            <p className="text-base font-bold text-[#083A44] leading-snug break-words">
              {firstMessage.sender}
            </p>
            <p className="text-[11px] text-[#083A44]/75 font-medium mt-0.5">
              Zero hesitation
            </p>
          </div>
        </div>

        <div className="bg-petrol rounded-card p-4 flex flex-col justify-between min-h-[104px] text-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/80">
              Active Span
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-petrol-soft/40 text-white font-semibold">
              Live
            </span>
          </div>
          <div className="mt-2">
            <p className="text-xl font-bold leading-tight">
              {data.totalDaysSpan}{" "}
              <span className="text-xs font-normal">
                {data.totalDaysSpan === 1 ? "day" : "days"}
              </span>
            </p>
            <p className="text-[11px] text-white/75 font-medium mt-0.5">
              {data.activeDays} active{" "}
              {data.activeDays === 1 ? "day" : "days"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
