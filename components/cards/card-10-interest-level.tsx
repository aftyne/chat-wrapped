"use client";

import React from "react";
import { ChatWrappedAnalysis } from "@/lib/types";
import { Flame } from "lucide-react";

export function Card10InterestLevel({
  data,
  isExport = false,
}: {
  data: ChatWrappedAnalysis;
  isExport?: boolean;
}) {
  const [you, them] = data.participants;
  const mutual = data.mutualInterestScore;

  // Semi-circle gauge arc calculation
  const radius = 72;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (mutual / 100) * circumference;

  return (
    <div
      className={`flex flex-col ${
        isExport ? "justify-center gap-4" : "justify-between min-h-full gap-3.5"
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orchid text-[#083A44] text-xs font-semibold">
            <Flame className="w-3.5 h-3.5" /> Algorithmic Score
          </span>
          <span className="text-xs font-semibold text-ink-secondary">
            Weighted Index
          </span>
        </div>
        <h2 className="font-display text-[26px] leading-[1.15] font-extrabold tracking-tight text-[#083A44]">
          The{" "}
          <span className="inline-block px-2 py-0.5 rounded-lg bg-[#F6D5F7]/85">
            Interest Meter
          </span>
        </h2>
        <p className="text-xs text-ink-secondary mt-1.5 font-medium leading-relaxed">
          Computed from initiation ratio, reply latency, word effort, and double-text enthusiasm.
        </p>
      </div>

      {/* Animated Gauge Meter Card */}
      <div className="bg-white rounded-card p-4 shadow-card flex flex-col items-center">
        <div className="relative w-48 h-28 flex items-end justify-center overflow-hidden">
          <svg viewBox="0 0 180 100" className="w-full h-full overflow-visible">
            {/* Background track */}
            <path
              d="M 18 90 A 72 72 0 0 1 162 90"
              fill="none"
              stroke="#EEF4F5"
              strokeWidth="16"
              strokeLinecap="round"
            />
            {/* Foreground progress arc */}
            <path
              d="M 18 90 A 72 72 0 0 1 162 90"
              fill="none"
              stroke="#084756"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute bottom-1 text-center">
            <p className="text-3xl font-bold text-[#083A44] leading-none">
              {mutual}%
            </p>
            <p className="text-[11px] font-semibold text-ink-secondary mt-0.5">
              Mutual Chemistry
            </p>
          </div>
        </div>

        {/* Pill Tags under Gauge */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
          <span className="px-3 py-1 rounded-full bg-lime text-[#083A44] text-[11px] font-bold">
            ⚡ Velocity:{" "}
            {Math.round(
              (you.interestBreakdown.velocityScore +
                them.interestBreakdown.velocityScore) /
                2
            )}
            %
          </span>
          <span className="px-3 py-1 rounded-full bg-mint text-[#083A44] text-[11px] font-bold">
            💬 Effort:{" "}
            {Math.round(
              (you.interestBreakdown.effortScore +
                them.interestBreakdown.effortScore) /
                2
            )}
            %
          </span>
          <span className="px-3 py-1 rounded-full bg-lavender text-[#083A44] text-[11px] font-bold">
            🔥 Double-Text:{" "}
            {Math.round(
              (you.interestBreakdown.doubleTextScore +
                them.interestBreakdown.doubleTextScore) /
                2
            )}
            %
          </span>
        </div>
      </div>

      {/* Individual Interest Comparison Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-orchid rounded-card p-4 flex flex-col justify-between">
          <span className="text-xs font-bold text-[#083A44] break-words leading-snug">
            {you.name}’s Score
          </span>
          <div className="mt-2">
            <p className="text-3xl font-bold text-[#083A44]">
              {you.interestScore}%
            </p>
            <p className="text-[11px] font-semibold text-[#083A44]/75 mt-1">
              {you.avgWordsPerMessage}{" "}
              {you.avgWordsPerMessage === 1 ? "word" : "words"}/msg avg
            </p>
          </div>
        </div>

        <div className="bg-petrol rounded-card p-4 text-white flex flex-col justify-between">
          <span className="text-xs font-bold text-white/90 break-words leading-snug">
            {them.name}’s Score
          </span>
          <div className="mt-2">
            <p className="text-3xl font-bold text-white">
              {them.interestScore}%
            </p>
            <p className="text-[11px] font-medium text-white/75 mt-1">
              {them.avgWordsPerMessage}{" "}
              {them.avgWordsPerMessage === 1 ? "word" : "words"}/msg avg
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
