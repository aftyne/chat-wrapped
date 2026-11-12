"use client";

import React from "react";
import { ChatWrappedAnalysis } from "@/lib/types";
import { MoodFaceBadge } from "@/components/ui/doodles";
import { CheckCheck, Ghost } from "lucide-react";

export function Card09LeftOnRead({
  data,
  isExport = false,
}: {
  data: ChatWrappedAnalysis;
  isExport?: boolean;
}) {
  const [you, them] = data.participants;
  const { leftOnRead } = data;

  return (
    <div
      className={`flex flex-col ${
        isExport ? "justify-center gap-4" : "justify-between min-h-full gap-3.5"
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-lavender text-[#083A44] text-xs font-semibold">
            <Ghost className="w-3.5 h-3.5" /> Left On Read
          </span>
          <span className="text-xs font-semibold text-ink-secondary">
            12h+ Ghost Threshold
          </span>
        </div>
        <h2 className="font-display text-[26px] leading-[1.15] font-extrabold tracking-tight text-[#083A44]">
          <span className="inline-block px-2 py-0.5 rounded-lg bg-[#D5CDF6]/85">
            {leftOnRead.totalIncidents} Ghost{" "}
            {leftOnRead.totalIncidents === 1 ? "Incident" : "Incidents"}
          </span>{" "}
          Detected
        </h2>
        <p className="text-xs text-ink-secondary mt-1.5 font-medium leading-relaxed">
          Times someone was left unanswered for 12+ hours until they had to double-text to revive the chat.
        </p>
      </div>

      {/* Side-by-Side Ghost Scoreboard */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-card p-4 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1.5">
            <MoodFaceBadge mood="sad" bg="#F2D2EC" className="w-8 h-8 shrink-0" />
            <span className="px-2.5 py-0.5 rounded-full bg-orchid text-[#083A44] text-[11px] font-bold break-words text-right">
              {you.name}
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-[#083A44]">
              {leftOnRead.youLeftThemCount}{" "}
              <span className="text-xs font-medium text-ink-secondary">
                {leftOnRead.youLeftThemCount === 1 ? "time" : "times"}
              </span>
            </p>
            <p className="text-[11px] text-ink-secondary font-medium mt-0.5 leading-snug break-words">
              Left {them.name} hanging 12h+
            </p>
          </div>
        </div>

        <div className="bg-white rounded-card p-4 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1.5">
            <MoodFaceBadge mood="shock" bg="#CBE4EE" className="w-8 h-8 shrink-0" />
            <span className="px-2.5 py-0.5 rounded-full bg-sky text-[#083A44] text-[11px] font-bold break-words text-right">
              {them.name}
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-[#083A44]">
              {leftOnRead.themLeftYouCount}{" "}
              <span className="text-xs font-medium text-ink-secondary">
                {leftOnRead.themLeftYouCount === 1 ? "time" : "times"}
              </span>
            </p>
            <p className="text-[11px] text-ink-secondary font-medium mt-0.5 leading-snug break-words">
              Left {you.name} hanging 12h+
            </p>
          </div>
        </div>
      </div>

      {/* Worst Ghost Incident Exhibit */}
      <div className="bg-orchid rounded-card p-4 shadow-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#083A44]/75">
            Coldest Read Receipt
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#083A44] text-white text-[11px] font-bold">
            {leftOnRead.worstIncident.hoursIgnored}h ignored
          </span>
        </div>
        <p className="text-xs text-[#083A44] font-medium mb-2.5 leading-relaxed">
          On <strong>{leftOnRead.worstIncident.formattedDate}</strong>,{" "}
          <strong>{leftOnRead.worstIncident.ghoster}</strong> vanished for{" "}
          {leftOnRead.worstIncident.hoursIgnored}{" "}
          {leftOnRead.worstIncident.hoursIgnored === 1 ? "hour" : "hours"} until{" "}
          <strong>{leftOnRead.worstIncident.victim}</strong> double-texted:
        </p>
        <div className="bg-white rounded-2xl p-3 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-[#083A44] break-words leading-snug">
            “{leftOnRead.worstIncident.doubleTextSnippet}”
          </p>
          <CheckCheck className="w-4 h-4 text-sky-deep shrink-0" />
        </div>
      </div>

      {/* Double-Text Streak Footer */}
      <div className="bg-white rounded-card px-4 py-3 shadow-card flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold text-ink-secondary">
          Triple-Text+ Barrages Sent
        </span>
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#083A44]">
          <span className="px-2.5 py-0.5 rounded-full bg-lavender">
            {you.name}: {you.doubleTextStreaks}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-mint">
            {them.name}: {them.doubleTextStreaks}
          </span>
        </div>
      </div>
    </div>
  );
}
