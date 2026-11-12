"use client";

import React from "react";
import { ChatWrappedAnalysis } from "@/lib/types";
import { CandleDoodle, ZenStonesDoodle } from "@/components/ui/doodles";
import { MessageCircleHeart } from "lucide-react";

export function Card04ConversationStarter({
  data,
  isExport = false,
}: {
  data: ChatWrappedAnalysis;
  isExport?: boolean;
}) {
  const [you, them] = data.participants;
  const topStarter =
    you.initiationPercentage >= them.initiationPercentage ? you : them;

  return (
    <div
      className={`flex flex-col ${
        isExport ? "justify-center gap-4" : "justify-between min-h-full gap-3.5"
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orchid text-[#083A44] text-xs font-semibold">
            <MessageCircleHeart className="w-3.5 h-3.5" /> Who Cares More?
          </span>
          <span className="text-xs font-semibold text-ink-secondary">
            5h+ Silence Rule
          </span>
        </div>
        <h2 className="font-display text-[26px] leading-[1.15] font-extrabold tracking-tight text-[#083A44]">
          {topStarter.name} starts{" "}
          <span className="inline-block px-2 py-0.5 rounded-lg bg-[#F6D5F7]/85">
            {topStarter.initiationPercentage}%
          </span>{" "}
          of your conversations
        </h2>
        <p className="text-xs text-ink-secondary mt-1.5 font-medium leading-relaxed">
          Every time the chat goes quiet for 5+ hours, here’s who reaches out first.
        </p>
      </div>

      {/* Two tall pastel cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-orchid rounded-card p-4 flex flex-col justify-between min-h-[176px]">
          <div>
            <p className="text-sm font-bold text-[#083A44] break-words leading-snug">
              {you.name}
            </p>
            <p className="text-xs text-[#083A44]/75 font-medium mt-0.5">
              {you.initiationsCount}{" "}
              {you.initiationsCount === 1 ? "check-in" : "check-ins"}
            </p>
          </div>
          <div className="flex items-end justify-between mt-3">
            <span className="text-3xl font-bold text-[#083A44] tracking-tight">
              {you.initiationPercentage}%
            </span>
            <CandleDoodle className="w-16 h-16 -mr-1 -mb-1 shrink-0" />
          </div>
        </div>

        <div className="bg-lavender rounded-card p-4 flex flex-col justify-between min-h-[176px]">
          <div>
            <p className="text-sm font-bold text-[#083A44] break-words leading-snug">
              {them.name}
            </p>
            <p className="text-xs text-[#083A44]/75 font-medium mt-0.5">
              {them.initiationsCount}{" "}
              {them.initiationsCount === 1 ? "check-in" : "check-ins"}
            </p>
          </div>
          <div className="flex items-end justify-between mt-3">
            <span className="text-3xl font-bold text-[#083A44] tracking-tight">
              {them.initiationPercentage}%
            </span>
            <ZenStonesDoodle className="w-16 h-16 -mr-1 -mb-1 shrink-0" />
          </div>
        </div>
      </div>

      {/* Verdict Summary Box */}
      <div className="bg-white rounded-card p-4 shadow-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-secondary">
            Initiation Verdict
          </span>
          <span className="px-3 py-0.5 rounded-full bg-mint text-[#083A44] text-xs font-semibold">
            {Math.abs(you.initiationPercentage - them.initiationPercentage) <= 14
              ? "Mutual Pursuit"
              : "Certified Chaser"}
          </span>
        </div>
        <p className="text-sm font-semibold text-[#083A44] leading-snug">
          {Math.abs(you.initiationPercentage - them.initiationPercentage) <= 14
            ? `Neither of you plays hard to get—both ${you.name} and ${them.name} revive the chat equally.`
            : `${topStarter.name} refuses to let the streak die, double-checking on ${
                topStarter.name === you.name ? them.name : you.name
              } whenever the room gets quiet.`}
        </p>
      </div>
    </div>
  );
}
