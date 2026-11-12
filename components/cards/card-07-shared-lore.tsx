"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChatWrappedAnalysis, SharedLoreItem } from "@/lib/types";
import { MessageCircle, Sparkles, X } from "lucide-react";

const ICON_BG_LIST = ["bg-lavender", "bg-sky", "bg-mint", "bg-orchid"];

function renderHighlightedText(text: string, phrase: string): React.ReactNode {
  if (!phrase.trim()) return text;
  const escaped = phrase
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("[^\\p{L}\\p{N}]+");
  const regex = new RegExp(`(${escaped})`, "giu");
  const parts = text.split(regex);

  if (parts.length === 1) return text;

  return parts.map((part, idx) =>
    regex.test(part) ? (
      <mark
        key={idx}
        className="bg-[#E8F9A2] text-[#083A44] px-1 rounded font-bold"
      >
        {part}
      </mark>
    ) : (
      <React.Fragment key={idx}>{part}</React.Fragment>
    )
  );
}

export function Card07SharedLore({
  data,
  isExport = false,
}: {
  data: ChatWrappedAnalysis;
  isExport?: boolean;
}) {
  const [you, them] = data.participants;
  const loreItems = data.sharedLore.slice(0, 4);
  const [selectedLore, setSelectedLore] = useState<SharedLoreItem | null>(null);

  // Close drawer on Escape key
  useEffect(() => {
    if (!selectedLore) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setSelectedLore(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [selectedLore]);

  return (
    <div
      className={`flex flex-col ${
        isExport ? "justify-center gap-4" : "justify-between min-h-full gap-3.5"
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orchid text-[#083A44] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Shared Lore
          </span>
          <span className="text-xs font-semibold text-ink-secondary">
            {isExport ? "N-Gram Analysis" : "Tap phrase to view texts"}
          </span>
        </div>
        <h2 className="font-display text-[26px] leading-[1.15] font-extrabold tracking-tight text-[#083A44]">
          “Only{" "}
          <span className="inline-block px-2 py-0.5 rounded-lg bg-[#F6D5F7]/85">
            you two
          </span>{" "}
          say this”
        </h2>
        <p className="text-xs text-ink-secondary mt-1.5 font-medium leading-relaxed">
          Inside jokes, recurring code-words, and phrases that appear way above normal human baselines.
        </p>
      </div>

      {/* Interactive Stacked Phrase Rows */}
      <div className="space-y-2.5 flex-1 flex flex-col justify-center">
        {loreItems.map((item, idx) => (
          <div
            key={item.phrase}
            role={isExport ? undefined : "button"}
            tabIndex={isExport ? undefined : 0}
            onClick={() => {
              if (!isExport) setSelectedLore(item);
            }}
            onKeyDown={(e) => {
              if (!isExport && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                setSelectedLore(item);
              }
            }}
            className={`bg-white rounded-[24px] p-3.5 shadow-card flex items-center justify-between gap-3 border border-transparent ${
              isExport
                ? ""
                : "cursor-pointer group hover:border-[#083A44]/25 active:scale-[0.99] transition-all"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-12 h-12 rounded-2xl ${
                  ICON_BG_LIST[idx % ICON_BG_LIST.length]
                } flex flex-col items-center justify-center shrink-0`}
              >
                <span className="text-xs font-bold text-[#083A44]">
                  #{idx + 1}
                </span>
                <span className="text-[10px] font-semibold text-[#083A44]/70">
                  {item.totalCount}×
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="text-sm font-bold text-[#083A44] break-words leading-snug">
                    “{item.phrase}”
                  </p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-canvas text-ink-secondary font-semibold shrink-0">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-ink-secondary mt-0.5 font-medium break-words leading-snug">
                  {you.name}: {item.youCount}× · {them.name}: {item.themCount}×
                </p>
              </div>
            </div>

            {!isExport && (
              <div
                className="w-9 h-9 rounded-full border border-[#083A44]/20 flex items-center justify-center text-[#083A44] group-hover:bg-[#083A44] group-hover:text-white transition-colors shrink-0"
                aria-label={`View messages containing ${item.phrase}`}
              >
                <MessageCircle className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Pill Strip */}
      <div className="bg-petrol rounded-card px-4 py-3 text-white flex items-center justify-between">
        <span className="text-xs font-medium text-white/85">
          Shared Braincell Synchronization
        </span>
        <span className="px-3 py-1 rounded-full bg-lime text-[#083A44] text-xs font-bold shrink-0">
          98.4% Match
        </span>
      </div>

      {/* Message Snippets Pop-up Modal */}
      {!isExport && (
        <AnimatePresence>
          {selectedLore && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setSelectedLore(null)}
              role="dialog"
              aria-modal="true"
              aria-label={`Messages with phrase ${selectedLore.phrase}`}
              className="fixed inset-0 z-50 flex items-center justify-center bg-[#083A44]/40 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-[360px] rounded-3xl bg-white p-5 shadow-2xl border border-slate-100 text-left"
              >
                {/* Modal Header */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-orchid text-[#083A44] text-[11px] font-bold">
                        {selectedLore.totalCount}× total
                      </span>
                      <span className="text-[11px] font-semibold text-ink-secondary">
                        {selectedLore.category}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-extrabold text-[#083A44] mt-1 break-words leading-snug">
                      “{selectedLore.phrase}”
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedLore(null)}
                    aria-label="Close message preview"
                    className="w-8 h-8 rounded-full bg-canvas hover:bg-orchid/50 text-[#083A44] flex items-center justify-center transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Real Message Bubbles */}
                <div className="mt-3.5 space-y-2.5 max-h-[52vh] overflow-y-auto pr-0.5">
                  {selectedLore.examples && selectedLore.examples.length > 0 ? (
                    selectedLore.examples.map((ex, i) => {
                      const isSentByYou = ex.sender === you.name;
                      const senderDisplay = isSentByYou ? you.name : them.name;
                      return (
                        <div
                          key={`${ex.timestamp}-${i}`}
                          className={`rounded-2xl p-3.5 border ${
                            isSentByYou
                              ? "bg-[#F4F8F8] border-[#083A44]/10"
                              : "bg-orchid/35 border-orchid"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                isSentByYou
                                  ? "bg-[#083A44] text-white"
                                  : "bg-white text-[#083A44]"
                              }`}
                            >
                              {senderDisplay}
                            </span>
                            <span className="text-[10px] font-medium text-ink-secondary">
                              {ex.timestamp}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-[#083A44] leading-relaxed break-words mt-1">
                            “{renderHighlightedText(ex.text, selectedLore.phrase)}”
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-2xl p-4 bg-canvas text-center">
                      <p className="text-xs font-medium text-ink-secondary">
                        Used {selectedLore.youCount}× by {you.name} and{" "}
                        {selectedLore.themCount}× by {them.name} across the chat.
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer count breakdown */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-ink-secondary">
                  <span>
                    {you.name}: {selectedLore.youCount}×
                  </span>
                  <span>
                    {them.name}: {selectedLore.themCount}×
                  </span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
