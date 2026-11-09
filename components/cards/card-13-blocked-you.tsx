"use client";

import React from "react";
import { ChatWrappedAnalysis } from "@/lib/types";
import { MoodFaceBadge } from "@/components/ui/doodles";
import { ShieldAlert, Unlock } from "lucide-react";

export function Card13BlockedYou({ data }: { data: ChatWrappedAnalysis }) {
  const [, them] = data.participants;
  const { longestSilence } = data;

  return (
    <div className="flex flex-col justify-between h-full gap-3">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orchid text-ink text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" /> High Tension · Card 13
          </span>
          <span className="text-xs font-semibold text-ink-secondary">
            The Drought
          </span>
        </div>
        <h2 className="font-display text-[25px] leading-[1.15] font-bold text-ink">
          Did {them.name} block you?!
        </h2>
        <p className="text-xs text-ink-secondary mt-1 font-medium">
          Just kidding—but you two went completely radio silent for a record-breaking streak.
        </p>
      </div>

      {/* Dramatic Petrol Teal "Block Simulator" Card */}
      <div className="bg-petrol rounded-card p-5 text-white shadow-card relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold">
            Longest Radio Silence
          </span>
          <MoodFaceBadge mood="shock" bg="#F2D2EC" className="w-8 h-8" />
        </div>

        <div className="my-2">
          <p className="font-display text-4xl font-bold tracking-tight text-lime">
            {longestSilence.days}d {longestSilence.hours}h
          </p>
          <p className="text-xs text-white/80 font-medium mt-1">
            From {longestSilence.startDate} → {longestSilence.endDate}
          </p>
        </div>

        <div className="mt-3 pt-3 border-t border-white/15 text-xs text-white/90">
          <p className="text-[11px] uppercase tracking-wider text-white/60 font-semibold">
            Last words before the drought ({longestSilence.lastSenderBeforeSilence}):
          </p>
          <p className="italic font-medium mt-0.5 line-clamp-2">
            “{longestSilence.lastMessageBeforeSilence}”
          </p>
        </div>
      </div>

      {/* How the silence broke */}
      <div className="bg-white rounded-card p-4 shadow-card">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-mint flex items-center justify-center">
              <Unlock className="w-3.5 h-3.5 text-ink" />
            </span>
            <span className="text-xs font-bold text-ink">
              {longestSilence.breakerSender} finally broke the silence
            </span>
          </div>
          <span className="text-[11px] font-semibold text-ink-secondary">
            {longestSilence.endDate}
          </span>
        </div>

        <div className="bg-canvas rounded-2xl p-3 border border-ink/[0.05]">
          <p className="text-xs font-semibold text-ink line-clamp-2">
            “{longestSilence.breakerMessage}”
          </p>
        </div>
      </div>
    </div>
  );
}
