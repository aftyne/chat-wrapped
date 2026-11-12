"use client";

import React, { useState } from "react";
import { ChatWrappedAnalysis } from "@/lib/types";
import { LotusBowlDoodle } from "@/components/ui/doodles";
import { Award, ChevronDown, ChevronUp } from "lucide-react";

export function Card08LongestMessage({
  data,
  isExport = false,
}: {
  data: ChatWrappedAnalysis;
  isExport?: boolean;
}) {
  const { longestMessage } = data;
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`flex flex-col ${
        isExport ? "justify-center gap-4" : "justify-between min-h-full gap-3.5"
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-lime text-[#083A44] text-xs font-semibold">
            <Award className="w-3.5 h-3.5" /> The Yap Award
          </span>
          <span className="text-xs font-semibold text-ink-secondary">
            {longestMessage.formattedDate}
          </span>
        </div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="font-display text-[26px] leading-[1.15] font-extrabold tracking-tight text-[#083A44]">
              Certified{" "}
              <span className="inline-block px-2 py-0.5 rounded-lg bg-[#EAFA91]/85">
                Yap Medal
              </span>{" "}
              goes to {longestMessage.sender}
            </h2>
            <p className="text-xs text-ink-secondary mt-1.5 font-medium leading-relaxed">
              Dropped a single message containing {longestMessage.wordCount}{" "}
              {longestMessage.wordCount === 1 ? "word" : "words"} (
              {longestMessage.charCount}{" "}
              {longestMessage.charCount === 1 ? "character" : "characters"}).
            </p>
          </div>
          <LotusBowlDoodle className="w-16 h-16 shrink-0" />
        </div>
      </div>

      {/* Expandable Longest Message Card */}
      <div className="bg-white rounded-card p-4 shadow-card flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <span className="px-3 py-1 rounded-full bg-orchid text-[#083A44] text-xs font-bold break-words">
              {longestMessage.sender}
            </span>
            <span className="text-xs text-ink-secondary font-medium">
              at {longestMessage.formattedTime}
            </span>
          </div>
          <span className="text-xs font-bold text-[#083A44] shrink-0">
            {longestMessage.wordCount}{" "}
            {longestMessage.wordCount === 1 ? "word" : "words"}
          </span>
        </div>

        <div
          className={`bg-canvas rounded-2xl p-3.5 border border-ink/[0.05] transition-all ${
            expanded || isExport ? "" : "max-h-[120px] overflow-hidden"
          }`}
        >
          <p className="text-xs leading-relaxed text-[#083A44] font-medium break-words">
            “
            {isExport && longestMessage.text.length > 360
              ? `${longestMessage.text.slice(0, 360).trim()}…`
              : longestMessage.text}
            ”
          </p>
        </div>

        {!isExport && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((prev) => !prev);
            }}
            className="mt-2.5 w-full py-2 rounded-full bg-lavender/60 hover:bg-lavender text-[#083A44] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors min-h-[40px]"
          >
            {expanded ? (
              <>
                <span>Collapse Monologue</span>
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Read Full Monologue</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Runner-Up & Stats Footer */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-orchid rounded-card p-3.5">
          <p className="text-[11px] font-semibold text-[#083A44]/75">
            Winning Essay
          </p>
          <p className="text-xl font-bold text-[#083A44] mt-0.5">
            {longestMessage.charCount}{" "}
            <span className="text-xs font-medium">
              {longestMessage.charCount === 1 ? "char" : "chars"}
            </span>
          </p>
          <p className="text-[11px] font-semibold text-[#083A44]/85 mt-0.5 break-words leading-snug">
            By {longestMessage.sender}
          </p>
        </div>

        <div className="bg-sky rounded-card p-3.5">
          <p className="text-[11px] font-semibold text-[#083A44]/75">
            Runner-Up Longest
          </p>
          <p className="text-xl font-bold text-[#083A44] mt-0.5">
            {longestMessage.runnerUpWordCount}{" "}
            <span className="text-xs font-medium">
              {longestMessage.runnerUpWordCount === 1 ? "word" : "words"}
            </span>
          </p>
          <p className="text-[11px] font-semibold text-[#083A44]/85 mt-0.5 break-words leading-snug">
            By {longestMessage.runnerUpSender}
          </p>
        </div>
      </div>
    </div>
  );
}
