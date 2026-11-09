"use client";

import React from "react";
import { ChatWrappedAnalysis } from "@/lib/types";
import { Compass } from "lucide-react";

const QUADRANTS = [
  {
    name: "Secure",
    pillBg: "bg-mint",
    hint: "Warm & Consistent",
  },
  {
    name: "Anxious-Preoccupied",
    pillBg: "bg-orchid",
    hint: "High Burst Energy",
  },
  {
    name: "Dismissive-Avoidant",
    pillBg: "bg-sky",
    hint: "Low-Key Lone Wolf",
  },
  {
    name: "Fearful-Avoidant",
    pillBg: "bg-lavender",
    hint: "Hot & Cold Enigma",
  },
] as const;

export function Card11AttachmentStyle({ data }: { data: ChatWrappedAnalysis }) {
  const [you, them] = data.participants;

  return (
    <div className="flex flex-col justify-between h-full gap-3">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-lavender text-ink text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" /> Attachment Matrix · Card 11
          </span>
          <span className="text-xs font-semibold text-ink-secondary">
            Behavioral Grid
          </span>
        </div>
        <h2 className="font-display text-[24px] leading-[1.15] font-bold text-ink">
          Your Texting Attachment Styles
        </h2>
        <p className="text-xs text-ink-secondary mt-1 font-medium">
          Mapped from message bursts, late-night volume (11 PM–4 AM), and reply latency variance.
        </p>
      </div>

      {/* 4-Quadrant Matrix Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {QUADRANTS.map((q) => {
          const isYou = you.attachmentStyle.type === q.name;
          const isThem = them.attachmentStyle.type === q.name;
          const active = isYou || isThem;

          return (
            <div
              key={q.name}
              className={`rounded-[22px] p-3 border transition-all ${
                active
                  ? `${q.pillBg} border-ink/20 shadow-card`
                  : "bg-white/75 border-ink/[0.05] opacity-75"
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold text-ink leading-tight">
                  {q.name}
                </span>
              </div>
              <p className="text-[11px] text-ink/70 font-medium mt-0.5">{q.hint}</p>
              <div className="flex flex-wrap gap-1 mt-2 min-h-[22px]">
                {isYou && (
                  <span className="px-2 py-0.5 rounded-full bg-ink text-white text-[10px] font-bold">
                    {you.name}
                  </span>
                )}
                {isThem && (
                  <span className="px-2 py-0.5 rounded-full bg-petrol text-white text-[10px] font-bold">
                    {them.name}
                  </span>
                )}
                {!active && (
                  <span className="text-[10px] text-ink-muted font-medium">
                    Unclaimed
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Profiles */}
      <div className="space-y-2">
        <div className="bg-white rounded-card p-3.5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink">
              {you.name}: {you.attachmentStyle.type}
            </span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-orchid text-ink font-semibold">
              {you.lateNightPercentage}% Late-Night
            </span>
          </div>
          <p className="text-xs text-ink-secondary font-medium mt-1 leading-snug">
            {you.attachmentStyle.description}
          </p>
        </div>

        <div className="bg-white rounded-card p-3.5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink">
              {them.name}: {them.attachmentStyle.type}
            </span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-sky text-ink font-semibold">
              {them.lateNightPercentage}% Late-Night
            </span>
          </div>
          <p className="text-xs text-ink-secondary font-medium mt-1 leading-snug">
            {them.attachmentStyle.description}
          </p>
        </div>
      </div>
    </div>
  );
}
