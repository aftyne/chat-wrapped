"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toPng } from "html-to-image";
import { ChatWrappedAnalysis } from "@/lib/types";
import {
  ArrowLeft,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
} from "lucide-react";

import { Card01FirstMessage } from "./cards/card-01-first-message";
import { Card02TotalMessages } from "./cards/card-02-total-messages";
import { Card03ResponseTime } from "./cards/card-03-response-time";
import { Card04ConversationStarter } from "./cards/card-04-conversation-starter";
import { Card05DeletedMessages } from "./cards/card-05-deleted-messages";
import { Card06TopWords } from "./cards/card-06-top-words";
import { Card07SharedLore } from "./cards/card-07-shared-lore";
import { Card08LongestMessage } from "./cards/card-08-longest-message";
import { Card09LeftOnRead } from "./cards/card-09-left-on-read";
import { Card10InterestLevel } from "./cards/card-10-interest-level";
import { Card11AttachmentStyle } from "./cards/card-11-attachment-style";
import { Card12RedFlags } from "./cards/card-12-red-flags";
import { Card13BlockedYou } from "./cards/card-13-blocked-you";
import { Card14WhatTheyMean } from "./cards/card-14-what-they-mean";
import { Card15Timeline } from "./cards/card-15-timeline";
import { Card16TheMove } from "./cards/card-16-the-move";

const SLIDE_TITLES = [
  "Origin Story",
  "Total Volume",
  "Reply Speed",
  "Who Cares More?",
  "Deleted Texts",
  "Top Words",
  "Shared Lore",
  "The Yap Award",
  "Left On Read",
  "Interest Score",
  "Attachment Style",
  "Red Flags",
  "Blocked You?!",
  "Subtext Decoder",
  "The Timeline",
  "The Move",
];

interface StoryContainerProps {
  data: ChatWrappedAnalysis;
  onExit: () => void;
  onSwapPerspective: () => void;
}

export function StoryContainer({
  data,
  onExit,
  onSwapPerspective,
}: StoryContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<HTMLDivElement>(null);

  const totalSlides = 16;

  const goToNext = useCallback(() => {
    if (currentIndex < totalSlides - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, totalSlides]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const jumpToSlide = useCallback(
    (idx: number) => {
      if (idx === currentIndex) return;
      setDirection(idx > currentIndex ? 1 : -1);
      setCurrentIndex(idx);
    },
    [currentIndex]
  );

  // Reset vertical scroll position to top when switching cards
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "ArrowLeft") {
        goToPrev();
      } else if (e.key === "Escape") {
        onExit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev, onExit]);

  // Export / Share current story card as high-res PNG
  const handleShareCurrentCard = useCallback(async () => {
    if (!captureRef.current || isExporting) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(captureRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "#EEF4F5",
      });

      const fileName = `chat-wrapped-${String(currentIndex + 1).padStart(
        2,
        "0"
      )}-${SLIDE_TITLES[currentIndex].toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;

      // Try native Web Share API with file support on mobile
      if (navigator.share && navigator.canShare) {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], fileName, { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Chat Wrapped · ${data.chatTitle}`,
            text: `Check out our Chat Wrapped (${SLIDE_TITLES[currentIndex]})!`,
            files: [file],
          });
          setIsExporting(false);
          return;
        }
      }

      // Fallback: direct PNG download
      const link = document.createElement("a");
      link.download = fileName;
      link.href = dataUrl;
      link.click();

      setToastMessage("Saved high-res Story PNG!");
      setTimeout(() => setToastMessage(null), 2600);
    } catch {
      setToastMessage("Could not export PNG—try again.");
      setTimeout(() => setToastMessage(null), 2600);
    } finally {
      setIsExporting(false);
    }
  }, [currentIndex, data.chatTitle, isExporting]);

  // Calculate visible window of 7 slide numbers (like 21..27 in Reference Screen 3)
  const windowSize = 7;
  const halfWindow = Math.floor(windowSize / 2);
  let startSlide = Math.max(0, currentIndex - halfWindow);
  const endSlide = Math.min(totalSlides - 1, startSlide + windowSize - 1);
  if (endSlide - startSlide + 1 < windowSize) {
    startSlide = Math.max(0, endSlide - windowSize + 1);
  }
  const visibleSlideIndices = Array.from(
    { length: endSlide - startSlide + 1 },
    (_, i) => startSlide + i
  );

  const renderActiveCard = () => {
    switch (currentIndex) {
      case 0:
        return <Card01FirstMessage data={data} />;
      case 1:
        return <Card02TotalMessages data={data} />;
      case 2:
        return <Card03ResponseTime data={data} />;
      case 3:
        return <Card04ConversationStarter data={data} />;
      case 4:
        return <Card05DeletedMessages data={data} />;
      case 5:
        return <Card06TopWords data={data} />;
      case 6:
        return <Card07SharedLore data={data} />;
      case 7:
        return <Card08LongestMessage data={data} />;
      case 8:
        return <Card09LeftOnRead data={data} />;
      case 9:
        return <Card10InterestLevel data={data} />;
      case 10:
        return <Card11AttachmentStyle data={data} />;
      case 11:
        return <Card12RedFlags data={data} />;
      case 12:
        return <Card13BlockedYou data={data} />;
      case 13:
        return <Card14WhatTheyMean data={data} />;
      case 14:
        return <Card15Timeline data={data} />;
      case 15:
        return (
          <Card16TheMove
            data={data}
            onShareCard={handleShareCurrentCard}
            isExporting={isExporting}
          />
        );
      default:
        return <Card01FirstMessage data={data} />;
    }
  };

  return (
    <div
      className="relative w-full h-full flex flex-col justify-between bg-canvas overflow-hidden"
      style={{
        paddingTop: "max(12px, env(safe-area-inset-top))",
        paddingBottom: "max(12px, env(safe-area-inset-bottom))",
      }}
    >
      {/* Top Header & Numbered Pagination Strip */}
      <div className="px-4 pt-1 shrink-0 z-20">
        {/* Top Header Bar (White Circle Back Button + Centered Title + Perspective Swap Button) */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onExit}
            aria-label="Back to upload screen"
            className="w-11 h-11 rounded-full bg-white shadow-pill flex items-center justify-center text-ink hover:bg-white/80 active:scale-95 transition-transform shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="text-center min-w-0 px-2">
            <p className="text-xs font-bold text-ink truncate">
              {data.chatTitle}
            </p>
            <p className="text-[11px] font-medium text-ink-secondary">
              {String(currentIndex + 1).padStart(2, "0")} / 16 ·{" "}
              {SLIDE_TITLES[currentIndex]}
            </p>
          </div>

          <button
            type="button"
            onClick={onSwapPerspective}
            title="Swap You & Them perspective"
            aria-label="Swap You and Them perspective"
            className="w-11 h-11 rounded-full bg-white shadow-pill flex items-center justify-center text-ink hover:bg-orchid/50 active:scale-95 transition-all shrink-0"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        {/* Circular Numbered Pill Strip (Directly inspired by "21 22 23 24 25 26 27" on Reference Screen 3) */}
        <div className="flex items-center justify-between gap-1 mt-2.5">
          {visibleSlideIndices.map((idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => jumpToSlide(idx)}
                className={`w-9 h-9 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                  isActive
                    ? "bg-petrol text-white shadow-pill scale-105"
                    : "bg-white text-ink hover:bg-orchid/40"
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Story Card Viewport */}
      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain no-scrollbar px-4 py-3"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`${currentIndex}-${data.participants[0].name}`}
            ref={captureRef}
            custom={direction}
            initial={{ opacity: 0, x: direction * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -24 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="w-full min-h-full flex flex-col justify-between bg-canvas"
          >
            {renderActiveCard()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls Bar (Prev / Next + Export Card) */}
      <div className="px-4 pt-1 shrink-0 z-20 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={goToPrev}
            disabled={currentIndex === 0}
            aria-label="Previous slide"
            className="w-11 h-11 rounded-full bg-white shadow-pill flex items-center justify-center text-ink disabled:opacity-35 active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            disabled={currentIndex === totalSlides - 1}
            aria-label="Next slide"
            className="w-11 h-11 rounded-full bg-white shadow-pill flex items-center justify-center text-ink disabled:opacity-35 active:scale-95 transition-transform"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleShareCurrentCard}
          disabled={isExporting}
          className="h-11 px-4 rounded-full bg-white shadow-pill flex items-center gap-1.5 text-xs font-bold text-ink hover:bg-orchid/50 active:scale-95 transition-all"
        >
          {isExporting ? (
            <span>Saving...</span>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>Export Card</span>
              <Download className="w-3 h-3 opacity-60" />
            </>
          )}
        </button>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-ink text-white text-xs font-bold shadow-card z-50 whitespace-nowrap"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
