"use client";

import React from "react";
import { ChatWrappedAnalysis } from "@/lib/types";
import { MoodFaceBadge } from "@/components/ui/doodles";
import { Timer, Zap } from "lucide-react";

function formatReplyTime(minutes: number): { main: string; unit: string } {
  if (minutes < 1) {
    return { main: `${Math.max(12, Math.round(minutes * 60))}`, unit: "sec" };
  }
  if (minutes >= 60) {
    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return { main: `${hrs}h ${mins}m`, unit: "median" };
  }
  return { main: `${minutes}`, unit: "min" };
}

export function Card03ResponseTime({ data }: { data: ChatWrappedAnalysis }) {
  const [you, them] = data.participants;
  const youFmt = formatReplyTime(you.medianReplyMinutes);
  const themFmt = formatReplyTime(them.medianReplyMinutes);
  const fasterPerson =
    you.medianReplyMinutes <= them.medianReplyMinutes ? you : them;

  return (
    <div className="flex flex-col justify-between h-full gap-3">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-lime text-ink text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" /> Reply Velocity · Card 03
          </span>
          <span className="text-xs font-semibold text-ink-secondary">
            Latency Audit
          </span>
        </div>
        <h2 className="font-display text-[25px] leading-[1.15] font-bold text-ink">
          Who lives on their lockscreen?
        </h2>
        <p className="text-xs text-ink-secondary mt-1 font-medium">
          {fasterPerson.name} takes the crown for fastest fingers in the chat.
        </p>
      </div>

      {/* Two side-by-side Sleep-Duration style metric cards from Reference Screen 3 */}
      <div className="grid grid-cols-2 gap-3">
        {/* Person 1 Card */}
        <div className="bg-white rounded-card p-4 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <MoodFaceBadge mood="happy" bg="#D5CDF6" className="w-7 h-7" />
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-lavender text-ink">
                {you.name}
              </span>
            </div>
            {/* Stepped wave visualization inspired by "Sleep Duration 7h 32m" */}
            <div className="my-3 flex items-end gap-1 h-8">
              <div className="flex-1 h-5 rounded-sm bg-lavender" />
              <div className="flex-1 h-3 rounded-sm bg-mint self-start" />
              <div className="flex-1 h-6 rounded-sm bg-lavender" />
              <div className="flex-1 h-3.5 rounded-sm bg-mint self-start" />
              <div className="flex-1 h-5 rounded-sm bg-lavender" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-ink tracking-tight">
              {youFmt.main}{" "}
              <span className="text-xs font-medium text-ink-secondary">
                {youFmt.unit}
              </span>
            </p>
            <p className="text-[11px] font-semibold text-ink-secondary mt-0.5">
              Avg: {you.avgReplyMinutes}m
            </p>
          </div>
        </div>

        {/* Person 2 Card */}
        <div className="bg-white rounded-card p-4 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <MoodFaceBadge mood="wink" bg="#F2D2EC" className="w-7 h-7" />
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-orchid text-ink">
                {them.name}
              </span>
            </div>
            {/* Mini vertical pill bars inspired by "Stress Indicator Low" */}
            <div className="my-3 flex items-end justify-between gap-1.5 h-8 px-1">
              <div className="w-2.5 h-4 rounded-full bg-lavender" />
              <div className="w-2.5 h-7 rounded-full bg-lavender" />
              <div className="w-2.5 h-5 rounded-full bg-lavender" />
              <div className="w-2.5 h-8 rounded-full bg-orchid-deep" />
              <div className="w-2.5 h-4 rounded-full bg-lavender" />
              <div className="w-2.5 h-6 rounded-full bg-lavender" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-ink tracking-tight">
              {themFmt.main}{" "}
              <span className="text-xs font-medium text-ink-secondary">
                {themFmt.unit}
              </span>
            </p>
            <p className="text-[11px] font-semibold text-ink-secondary mt-0.5">
              Avg: {them.avgReplyMinutes}m
            </p>
          </div>
        </div>
      </div>

      {/* Speed Badges Stack */}
      <div className="space-y-2.5">
        <div className="bg-orchid rounded-card p-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-ink/70">
                {you.name}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white text-ink text-xs font-bold">
                {you.speedBadge}
              </span>
            </div>
            <p className="text-xs text-ink/85 font-medium mt-1.5 leading-snug">
              {you.speedSubtext}
            </p>
          </div>
          <Timer className="w-6 h-6 text-ink shrink-0" />
        </div>

        <div className="bg-sky rounded-card p-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-ink/70">
                {them.name}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white text-ink text-xs font-bold">
                {them.speedBadge}
              </span>
            </div>
            <p className="text-xs text-ink/85 font-medium mt-1.5 leading-snug">
              {them.speedSubtext}
            </p>
          </div>
          <Timer className="w-6 h-6 text-ink shrink-0" />
        </div>
      </div>
    </div>
  );
}
