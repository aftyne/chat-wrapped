"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Lock } from "lucide-react";
import { ExtractionState } from "@/lib/types";

interface ProcessingModalProps {
  state: ExtractionState;
  isReady?: boolean;
}

export function ProcessingModal({ state, isReady = false }: ProcessingModalProps) {
  // Staged progress: unzipping (15% -> 35%), parsing (40% -> 92%), ready (100%)
  const [progress, setProgress] = useState(state === "unzipping" ? 20 : 45);

  useEffect(() => {
    if (isReady) {
      setProgress(100);
      return;
    }

    if (state === "unzipping") {
      setProgress(25);
      const timer = setInterval(() => {
        setProgress((prev) => (prev < 38 ? prev + 3 : prev));
      }, 150);
      return () => clearInterval(timer);
    }

    if (state === "parsing") {
      // Advance smoothly from current towards 92%
      setProgress((prev) => Math.max(prev, 45));
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 92) return prev;
          const step = prev < 70 ? 4 : 2;
          return Math.min(prev + step, 92);
        });
      }, 200);
      return () => clearInterval(timer);
    }
  }, [state, isReady]);

  // Prevent background interaction: body scroll lock and keydown trap
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      // Trap keys like Space, Enter, Tab, Arrow keys from triggering background elements
      if (
        [
          "Space",
          "Enter",
          "Tab",
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
        ].includes(e.code)
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, []);

  const isUnzipping = state === "unzipping";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      role="dialog"
      aria-modal="true"
      aria-live="polite"
      aria-label="Processing WhatsApp chat export"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#083A44]/35 backdrop-blur-sm p-4 select-none"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: -6 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className="w-full max-w-[340px] rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 text-center pointer-events-auto"
      >
        {/* Top Privacy Pill Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F8F8] text-[#083A44] text-xs font-semibold">
          <Lock className="w-3.5 h-3.5 text-[#083A44]" />
          <span>100% Local · Never leaves your device</span>
        </div>

        {/* Animated Visual Indicator */}
        <div className="w-16 h-16 rounded-2xl bg-[#F6D5F7] mx-auto my-4 flex items-center justify-center shadow-sm">
          <Loader2 className="w-8 h-8 text-[#083A44] animate-spin" />
        </div>

        {/* Multi-Stage Copy */}
        <div className="min-h-[58px] flex flex-col items-center justify-center">
          <h3 className="text-lg font-bold text-ink leading-tight">
            {isUnzipping ? "Unpacking .zip archive..." : "Decoding your chat..."}
          </h3>
          <p className="text-xs text-ink-secondary mt-1.5 font-medium leading-relaxed max-w-[270px]">
            {isUnzipping
              ? "Extracting your WhatsApp chat log locally in memory."
              : "Crunching response times, ghost gaps, vocabulary & red flags."}
          </p>
        </div>

        {/* Progress Track and Bar */}
        <div className="mt-5 w-full">
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden relative">
            <motion.div
              className="h-full rounded-full bg-[#083A44]"
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-ink-secondary font-medium mt-2 px-0.5">
            <span>{isUnzipping ? "Decompressing" : "Analyzing metrics"}</span>
            <span>{progress}%</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
