"use client";

import React from "react";
import { ChatWrappedAnalysis } from "@/lib/types";
import { AlertTriangle, Check, Flag } from "lucide-react";

export function Card12RedFlags({
  data,
  isExport = false,
}: {
  data: ChatWrappedAnalysis;
  isExport?: boolean;
}) {
  const flags = data.redFlags;
  const triggeredCount = flags.filter((f) => f.triggered).length;

  return (
    <div
      className={`flex flex-col ${
        isExport ? "justify-center gap-3.5" : "justify-between min-h-full gap-2.5"
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orchid text-[#083A44] text-xs font-semibold">
            <Flag className="w-3.5 h-3.5" /> Red Flags Audit
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#083A44] text-white text-xs font-bold">
            {triggeredCount}/{flags.length} Triggered
          </span>
        </div>
        <h2 className="font-display text-[26px] leading-[1.15] font-extrabold tracking-tight text-[#083A44]">
          The{" "}
          <span className="inline-block px-2 py-0.5 rounded-lg bg-[#F6D5F7]/85">
            Behavioral Receipts
          </span>
        </h2>
        <p className="text-xs text-ink-secondary mt-1.5 font-medium leading-relaxed">
          We scanned every timestamp for suspiciously chaotic texting habits.
        </p>
      </div>

      {/* Checklist Items */}
      <div className="space-y-2 flex-1 flex flex-col justify-center">
        {flags.map((flag) => (
          <div
            key={flag.id}
            className={`rounded-[22px] p-3 transition-all flex items-start gap-3 ${
              flag.triggered
                ? "bg-white shadow-card border border-orchid"
                : "bg-white/60 border border-ink/[0.04] opacity-70"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                flag.triggered
                  ? "bg-orchid text-[#083A44]"
                  : "bg-canvas text-ink-muted"
              }`}
            >
              {flag.triggered ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-[#083A44] leading-snug break-words">
                  {flag.title}
                </p>
                <span className="px-2 py-0.5 rounded-full bg-lavender text-[#083A44] text-[10px] font-bold shrink-0">
                  {flag.culprit}
                </span>
              </div>
              <p className="text-[11px] text-ink-secondary font-medium mt-0.5 leading-snug break-words">
                {flag.evidence}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
