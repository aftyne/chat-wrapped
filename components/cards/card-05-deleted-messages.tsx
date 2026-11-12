"use client";

import React from "react";
import { ChatWrappedAnalysis } from "@/lib/types";
import { MoodFaceBadge } from "@/components/ui/doodles";
import { EyeOff, RotateCcw, Trash2 } from "lucide-react";

export function Card05DeletedMessages({
  data,
  isExport = false,
}: {
  data: ChatWrappedAnalysis;
  isExport?: boolean;
}) {
  const [you, them] = data.participants;
  const totalDeleted = you.deletedCount + them.deletedCount;
  const topDeleter = you.deletedCount >= them.deletedCount ? you : them;

  return (
    <div
      className={`flex flex-col ${
        isExport ? "justify-center gap-4" : "justify-between min-h-full gap-3.5"
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orchid text-[#083A44] text-xs font-semibold">
            <Trash2 className="w-3.5 h-3.5" /> Second Thoughts
          </span>
          <span className="text-xs font-semibold text-ink-secondary">
            Revoked Logs
          </span>
        </div>
        <h2 className="font-display text-[26px] leading-[1.15] font-extrabold tracking-tight text-[#083A44]">
          “🚫 This message was{" "}
          <span className="inline-block px-2 py-0.5 rounded-lg bg-[#F6D5F7]/85">
            deleted.
          </span>
          ”
        </h2>
        <p className="text-xs text-ink-secondary mt-1.5 font-medium leading-relaxed">
          {totalDeleted > 0
            ? `Happened ${totalDeleted} ${
                totalDeleted === 1 ? "time" : "times"
              }—because some thoughts were too bold for the permanent record.`
            : `Zero deleted messages detected! Both of you stand ten toes down on every single typo.`}
        </p>
      </div>

      {/* Main White Card */}
      <div className="bg-white rounded-card p-5 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-[#083A44]">
            Chief Evidence Destroyer
          </span>
          <span className="w-8 h-8 rounded-full bg-orchid flex items-center justify-center shrink-0">
            <RotateCcw className="w-4 h-4 text-[#083A44]" />
          </span>
        </div>

        <div className="bg-canvas rounded-2xl p-4 flex items-center gap-4">
          <div className="text-center pr-4 border-r border-ink/10 shrink-0">
            <p className="text-3xl font-bold text-[#083A44] leading-none">
              {topDeleter.deletedCount}
            </p>
            <p className="text-[11px] font-semibold text-ink-secondary mt-1">
              Revoked
            </p>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[#083A44] leading-snug break-words">
              {topDeleter.name} had the most second thoughts
            </p>
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lavender text-[#083A44] text-xs font-semibold">
              <EyeOff className="w-3.5 h-3.5 shrink-0" />
              <span>“Wait nvm forget I said that”</span>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-card p-4 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#083A44] break-words leading-snug">
              {you.name}
            </span>
            <MoodFaceBadge mood="shock" bg="#F2D2EC" className="w-7 h-7 shrink-0" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-[#083A44]">{you.deletedCount}</p>
            <p className="text-[11px] text-ink-secondary font-medium">
              deleted {you.deletedCount === 1 ? "message" : "messages"}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-card p-4 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#083A44] break-words leading-snug">
              {them.name}
            </span>
            <MoodFaceBadge mood="wink" bg="#CBE4EE" className="w-7 h-7 shrink-0" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-[#083A44]">{them.deletedCount}</p>
            <p className="text-[11px] text-ink-secondary font-medium">
              deleted {them.deletedCount === 1 ? "message" : "messages"}
            </p>
          </div>
        </div>
      </div>

      {/* Playful Subtext Banner */}
      <div className="bg-petrol rounded-card p-4 text-white flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-white/75 uppercase tracking-wider">
            Psychological Diagnosis
          </p>
          <p className="text-xs font-medium text-white mt-0.5 leading-snug">
            92% chance a deleted message at night was either a risky compliment or an accidental voice note.
          </p>
        </div>
      </div>
    </div>
  );
}
