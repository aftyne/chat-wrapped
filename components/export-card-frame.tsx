"use client";

import React from "react";
import { ChatWrappedAnalysis } from "@/lib/types";

interface ExportCardFrameProps {
  data: ChatWrappedAnalysis;
  currentIndex: number;
  slideTitle?: string;
  children: React.ReactNode;
}

export function ExportCardFrame({
  data,
  currentIndex,
  children,
}: ExportCardFrameProps) {
  const [viewer, other] = data.participants;
  const currentCardNum = String(currentIndex + 1).padStart(2, "0");

  // Resolve clean "You & [Partner Name]" label for the header pill
  const isViewerYou =
    viewer.name.toLowerCase() === "you" || viewer.name.toLowerCase() === "anda";
  const isOtherYou =
    other.name.toLowerCase() === "you" || other.name.toLowerCase() === "anda";

  let matchupLabel = `You & ${other.name}`;
  if (data.partnerName && data.partnerName.toLowerCase() !== "you" && data.partnerName.toLowerCase() !== "anda") {
    matchupLabel = `You & ${data.partnerName}`;
  } else if (isOtherYou && !isViewerYou) {
    matchupLabel = `You & ${viewer.name}`;
  } else if (!isViewerYou && !isOtherYou) {
    matchupLabel = `${viewer.name} & ${other.name}`;
  }

  return (
    <div
      className="relative w-[420px] min-h-[746px] h-auto bg-[#F4F8F8] text-[#083A44] flex flex-col justify-between gap-5 px-7 py-8 overflow-hidden select-none"
      style={{
        boxSizing: "border-box",
        fontFamily:
          "var(--font-plus-jakarta), -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* 1. Soft Pastel Gradient Glows */}
      <div
        className="pointer-events-none absolute rounded-full blur-3xl opacity-55 bg-[#F6D5F7] w-56 h-56 -top-12 -right-12"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute rounded-full blur-3xl opacity-55 bg-[#E8F9A2] w-60 h-60 -bottom-16 -left-16"
        aria-hidden="true"
      />

      {/* 2. Subtle Dot-Grid Texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage: "radial-gradient(#083A44 1.25px, transparent 1.25px)",
          backgroundSize: "16px 16px",
        }}
        aria-hidden="true"
      />

      {/* 3. Minimal Corner Sparkle Accents & Delicate Thin Curved Accent Rings */}
      <svg
        className="pointer-events-none absolute top-4 right-5 w-16 h-16"
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="46"
          cy="18"
          r="14"
          stroke="#083A44"
          strokeOpacity="0.12"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <path
          d="M46 8L48.1 15.9L56 18L48.1 20.1L46 28L43.9 20.1L36 18L43.9 15.9L46 8Z"
          fill="#F6D5F7"
          stroke="#083A44"
          strokeOpacity="0.15"
          strokeWidth="1"
        />
        <path
          d="M26 12L27.1 15.9L31 17L27.1 18.1L26 22L24.9 18.1L21 17L24.9 15.9L26 12Z"
          fill="#083A44"
          fillOpacity="0.15"
        />
      </svg>

      <svg
        className="pointer-events-none absolute bottom-12 left-4 w-16 h-16"
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M8 44C14 30 28 24 44 28"
          stroke="#083A44"
          strokeOpacity="0.12"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M18 32L19.6 37.9L25.5 39.5L19.6 41.1L18 47L16.4 41.1L10.5 39.5L16.4 37.9L18 32Z"
          fill="#E8F9A2"
          stroke="#083A44"
          strokeOpacity="0.15"
          strokeWidth="1"
        />
      </svg>

      {/* TOP STORY HEADER BAR */}
      <div className="relative z-10 flex items-center justify-between gap-2 shrink-0">
        {/* Left: Crisp Pill Badge */}
        <div className="bg-[#083A44] text-white text-xs font-semibold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 shrink-0 shadow-sm">
          <span className="text-[#EAFA91]">✦</span>
          <span>CHAT WRAPPED</span>
        </div>

        {/* Right: Participant Matchup Pill + Card Number */}
        <div className="bg-white border border-slate-200/80 text-[#083A44] text-xs font-medium px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-sm min-w-0">
          <span className="font-semibold text-[#083A44] break-words">
            {matchupLabel}
          </span>
          <span className="text-[#083A44]/35">·</span>
          <span className="font-bold text-[#083A44]/75 shrink-0">
            {currentCardNum} / 16
          </span>
        </div>
      </div>

      {/* CENTERED MAIN CONTENT GROUP */}
      <div className="relative z-10 flex-1 flex flex-col justify-center gap-4">
        {children}
      </div>

      {/* BOTTOM BRANDED FOOTER */}
      <div className="relative z-10 pt-3 border-t border-[#083A44]/10 flex items-center justify-between text-[11px] font-medium text-[#083A44]/60 shrink-0">
        <span>✦ Chat Wrapped · Decoded Locally</span>
        <span>16-Card Edition</span>
      </div>
    </div>
  );
}
