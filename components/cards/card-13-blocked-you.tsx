"use client";

import React from "react";
import { ChatWrappedAnalysis } from "@/lib/types";
import { MoodFaceBadge } from "@/components/ui/doodles";
import { ShieldAlert, Unlock } from "lucide-react";

export function Card13BlockedYou({
  data,
  isExport = false,
}: {
  data: ChatWrappedAnalysis;
  isExport?: boolean;
}) {
  const [viewer, other] = data.participants;
  const { longestSilence } = data;

  const isOtherYou =
    other.name.toLowerCase() === "you" || other.name.toLowerCase() === "anda";
  const isViewerYou =
    viewer.name.toLowerCase() === "you" || viewer.name.toLowerCase() === "anda";

  // Perspective state: true when viewing from partner's POV
  const isSwapped = Boolean(
    data.isSwapped !== undefined ? data.isSwapped : isOtherYou
  );

  // Dynamic partner name resolution (guaranteed never to be literal "You" or "Anda")
  let partnerName = data.partnerName;
  if (
    !partnerName ||
    partnerName.toLowerCase() === "you" ||
    partnerName.toLowerCase() === "anda"
  ) {
    if (isOtherYou) {
      partnerName = viewer.name;
    } else if (isViewerYou) {
      partnerName = other.name;
    } else {
      partnerName = isSwapped ? viewer.name : other.name;
    }
  }

  // 1. Headline Perspective Logic:
  // - Default Perspective (Viewing from Your POV): Did ${partnerName} block you?!
  // - Swapped Perspective (Viewing from Partner's POV): Did you block ${partnerName}?!
  const headline = isSwapped
    ? `Did you block ${partnerName}?!`
    : `Did ${partnerName} block you?!`;

  // 2. Drought Metadata & Attribution Labels:
  // Attribute quotes to the partner name or to "YOU" consistently across perspectives
  const isLastSenderPartner =
    longestSilence.lastSenderBeforeSilence.trim().toLowerCase() ===
    partnerName.trim().toLowerCase();

  const lastWordsSenderTag = isLastSenderPartner
    ? partnerName.toUpperCase()
    : "YOU";

  const isBreakerPartner =
    longestSilence.breakerSender.trim().toLowerCase() ===
    partnerName.trim().toLowerCase();

  const silenceBreakerLabel = isBreakerPartner
    ? `${partnerName} finally broke the silence`
    : "You finally broke the silence";

  return (
    <div
      className={`flex flex-col ${
        isExport ? "justify-center gap-4" : "justify-between min-h-full gap-3.5"
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orchid text-[#083A44] text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" /> High Tension
          </span>
          <span className="text-xs font-semibold text-ink-secondary">
            The Drought
          </span>
        </div>
        <h2 className="font-display text-[26px] leading-[1.15] font-extrabold tracking-tight text-[#083A44]">
          <span className="decoration-[#F6D5F7] underline decoration-4 underline-offset-4">
            {headline}
          </span>
        </h2>
        <p className="text-xs text-ink-secondary mt-1.5 font-medium leading-relaxed">
          Just kidding—but you two went completely radio silent for a record-breaking streak.
        </p>
      </div>

      {/* Dramatic Petrol Teal "Block Simulator" Card */}
      <div className="bg-petrol rounded-card p-5 text-white shadow-card relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold">
            Longest Radio Silence
          </span>
          <MoodFaceBadge mood="shock" bg="#F2D2EC" className="w-8 h-8 shrink-0" />
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
          <p className="text-[11px] uppercase tracking-wider text-white/60 font-semibold break-words">
            LAST WORDS BEFORE THE DROUGHT ({lastWordsSenderTag}):
          </p>
          <p className="italic font-medium mt-0.5 break-words leading-snug">
            “{longestSilence.lastMessageBeforeSilence}”
          </p>
        </div>
      </div>

      {/* How the silence broke */}
      <div className="bg-white rounded-card p-4 shadow-card">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-7 h-7 rounded-full bg-mint flex items-center justify-center shrink-0">
              <Unlock className="w-3.5 h-3.5 text-[#083A44]" />
            </span>
            <span className="text-xs font-bold text-[#083A44] break-words leading-snug">
              {silenceBreakerLabel}
            </span>
          </div>
          <span className="text-[11px] font-semibold text-ink-secondary shrink-0">
            {longestSilence.endDate}
          </span>
        </div>

        <div className="bg-canvas rounded-2xl p-3 border border-ink/[0.05]">
          <p className="text-xs font-semibold text-[#083A44] break-words leading-snug">
            “{longestSilence.breakerMessage}”
          </p>
        </div>
      </div>
    </div>
  );
}
