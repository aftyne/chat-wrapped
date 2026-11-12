"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

interface ErrorModalProps {
  error: string;
  onRetry: () => void;
}

export function ErrorModal({ error, onRetry }: ErrorModalProps) {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onRetry();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onRetry]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      role="dialog"
      aria-modal="true"
      aria-label="Chat extraction error"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#083A44]/35 backdrop-blur-sm p-4 select-none"
      onClick={(e) => {
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
        {/* Warning Icon Badge */}
        <div className="w-14 h-14 rounded-2xl bg-[#FEE4E2] mx-auto mb-3.5 flex items-center justify-center text-[#D92D20]">
          <AlertCircle className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-bold text-ink leading-tight">
          Couldn&apos;t read chat file
        </h3>

        <p className="text-xs text-ink-secondary font-medium leading-relaxed mt-2 px-1">
          {error}
        </p>

        {/* Helpful Tips Box */}
        <div className="bg-[#F8FAFB] border border-slate-100 rounded-2xl p-3 text-left mt-3.5 text-[11px] text-ink/80 leading-normal">
          <p className="font-semibold text-ink mb-1">Quick check:</p>
          <ul className="list-disc list-inside space-y-0.5 text-ink-secondary">
            <li>Ensure the file is an exported WhatsApp chat (.zip or .txt).</li>
            <li>Make sure you selected &quot;Without Media&quot; when exporting.</li>
          </ul>
        </div>

        {/* Try Again Button */}
        <button
          type="button"
          onClick={onRetry}
          className="w-full mt-4 py-3 px-4 rounded-2xl bg-petrol text-white text-sm font-bold shadow-card hover:bg-petrol-deep active:scale-[0.99] transition-all"
        >
          Try Again
        </button>
      </motion.div>
    </motion.div>
  );
}
