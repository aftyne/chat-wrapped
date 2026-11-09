"use client";

import React from "react";
import { ChatWrappedAnalysis } from "@/lib/types";
import { AlertTriangle, Check, Flag } from "lucide-react";

export function Card12RedFlags({ data }: { data: ChatWrappedAnalysis }) {
  const flags = data.redFlags;
  const triggeredCount = flags.filter((f) => f.triggered).length;

  return (
    <div className="flex flex-col justify-between h-full gap-2.5">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orchid text-ink text-xs font-semibold">
            <Flag className="w-3.5 h-3.5" /> Red Flags Audit · Card 12
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-ink text-white text-xs font-bold">
            {triggeredCount}/{flags.length} Triggered
          </span>
        </div>
        <h2 className="font-display text-[24px] leading-[1.15] font-bold text-ink">
          The Behavioral Receipts
        </h2>
        <p className="text-xs text-ink-secondary mt-0.5 font-medium">
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
                flag.triggered ? "bg-orchid text-ink" : "bg-canvas text-ink-muted"
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
                <p className="text-xs font-bold text-ink leading-snug">
                  {flag.title}
                </p>
                <span className="px-2 py-0.5 rounded-full bg-lavender text-ink text-[10px] font-bold shrink-0">
                  {flag.culprit}
                </span>
              </div>
              <p className="text-[11px] text-ink-secondary font-medium mt-0.5 leading-tight">
                {flag.evidence}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
