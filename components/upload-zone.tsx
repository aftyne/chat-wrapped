"use client";

import React, { useRef, useState } from "react";
import { ExtractionState } from "@/lib/types";
import {
  CandleDoodle,
  LotusBowlDoodle,
  MoodFaceBadge,
  QuirkyFaceHangout,
  QuirkyFaceLaugh,
  ZenStonesDoodle,
} from "@/components/ui/doodles";
import {
  ArrowRight,
  Bell,
  Lock,
  Sparkles,
  Upload,
} from "lucide-react";

interface UploadZoneProps {
  onFileUpload: (file: File) => void;
  onLoadSample: () => void;
  extractionState: ExtractionState;
  error: string | null;
}

export function UploadZone({
  onFileUpload,
  onLoadSample,
  extractionState,
  error,
}: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [guideTab, setGuideTab] = useState<"ios" | "android" | "privacy">("ios");

  const isBusy =
    extractionState === "unzipping" || extractionState === "parsing";

  const handleFile = (file: File) => {
    if (!file || isBusy) return;
    onFileUpload(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div
      className="w-full h-full flex flex-col justify-between bg-canvas px-4 overflow-y-auto no-scrollbar"
      style={{
        paddingTop: "max(16px, env(safe-area-inset-top))",
        paddingBottom: "max(16px, env(safe-area-inset-bottom))",
      }}
    >
      {/* Top Header mirroring "Good Morning, Frede 👋" + Notification Circle on Reference Screen 1 */}
      <div className="flex items-start justify-between pt-1">
        <div>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orchid text-ink text-[11px] font-bold mb-1.5">
            <Sparkles className="w-3 h-3" /> WhatsApp Wrapped · 16 Cards
          </span>
          <h1 className="font-display text-[26px] leading-[1.15] font-bold text-ink tracking-tight">
            Unpack your chat,
            <br />
            unfiltered 👋🏼
          </h1>
        </div>

        <button
          type="button"
          onClick={onLoadSample}
          disabled={isBusy}
          title="Load instant demo chat"
          aria-label="Load instant demo chat"
          className="w-11 h-11 rounded-full bg-white shadow-pill flex items-center justify-center relative hover:bg-orchid/40 disabled:opacity-50 disabled:pointer-events-none transition-colors shrink-0"
        >
          <Bell className="w-4 h-4 text-ink" />
          <span className="w-2.5 h-2.5 rounded-full bg-orchid-vivid absolute top-1.5 right-1.5 border-2 border-white" />
        </button>
      </div>

      {/* Subtitle */}
      <p className="text-sm text-ink-secondary font-medium leading-snug my-1.5">
        Select how you want to decode your messages right now
      </p>

      {/* Two Hero Action Cards (Directly mirroring "Hang out" #F2D2EC & "Laugh" #084756 on Reference Screen 1) */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isBusy}
          className="bg-orchid rounded-card p-4 flex flex-col justify-between min-h-[146px] text-left hover:brightness-[0.98] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all shadow-card group"
        >
          <QuirkyFaceHangout className="w-14 h-14 -ml-1" />
          <div className="flex items-end justify-between w-full mt-2">
            <div>
              <p className="text-sm font-bold text-ink leading-tight">
                Upload Chat
              </p>
              <p className="text-[11px] text-ink/75 font-medium mt-0.5">
                Supports .zip &amp; .txt
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-white/85 flex items-center justify-center group-hover:translate-x-0.5 transition-transform shrink-0">
              <ArrowRight className="w-4 h-4 text-ink" />
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={onLoadSample}
          disabled={isBusy}
          className="bg-petrol rounded-card p-4 flex flex-col justify-between min-h-[146px] text-left text-white hover:bg-petrol-deep active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all shadow-card group"
        >
          <QuirkyFaceLaugh className="w-14 h-14 -ml-1" />
          <div className="flex items-end justify-between w-full mt-2">
            <div>
              <p className="text-sm font-bold text-white leading-tight">
                Try Sample
              </p>
              <p className="text-[11px] text-white/75 font-medium mt-0.5">
                Instant 16-card demo
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-petrol-soft flex items-center justify-center group-hover:translate-x-0.5 transition-transform shrink-0">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </div>
        </button>
      </div>

      {/* Drag & Drop Card (Mirrors the central white card on Reference Screen 1) */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (isBusy) return;
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (isBusy) return;
          const file = e.dataTransfer.files?.[0];
          if (file) {
            handleFile(file);
          }
        }}
        onClick={() => {
          if (!isBusy) fileInputRef.current?.click();
        }}
        className={`bg-white rounded-card p-4 shadow-card border-2 transition-all my-2 ${
          isBusy ? "opacity-75 cursor-not-allowed" : "cursor-pointer"
        } ${
          isDragging
            ? "border-petrol bg-orchid/20 scale-[0.99]"
            : "border-transparent hover:border-orchid"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          disabled={isBusy}
          accept=".txt,.zip,application/zip,application/x-zip-compressed"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />

        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <MoodFaceBadge
              mood="happy"
              bg="#F2D2EC"
              className="w-8 h-8 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-ink truncate">
                Drop WhatsApp .zip or .txt file here
              </p>
              <p className="text-[11px] text-ink-secondary font-medium truncate">
                Supports iOS &amp; Android .zip / .txt (100k+ lines)
              </p>
            </div>
          </div>
        </div>

        {/* Decorative mini bars + CTA strip */}
        <div className="bg-canvas rounded-2xl p-3 flex items-center justify-between gap-3 mt-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink min-w-0">
            <Upload className="w-4 h-4 text-petrol shrink-0" />
            <span className="truncate">
              Tap to browse your device (.zip or .txt)
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-lime text-ink text-[11px] font-bold shrink-0">
            Free
          </span>
        </div>
      </div>

      {/* Bottom Tabbed Onboarding Section (Mirrors "My relax plan / Explore plans / Popular plans" + 3 Pastel Cards on Reference Screen 1) */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <button
            type="button"
            disabled={isBusy}
            onClick={() => setGuideTab("ios")}
            className={`text-xs font-bold transition-colors min-h-[36px] px-2 disabled:opacity-50 disabled:pointer-events-none ${
              guideTab === "ios"
                ? "text-ink underline decoration-2 underline-offset-4"
                : "text-ink-secondary hover:text-ink"
            }`}
          >
            iOS Export Guide
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => setGuideTab("android")}
            className={`text-xs font-bold transition-colors min-h-[36px] px-2 disabled:opacity-50 disabled:pointer-events-none ${
              guideTab === "android"
                ? "text-ink underline decoration-2 underline-offset-4"
                : "text-ink-secondary hover:text-ink"
            }`}
          >
            Android Guide
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => setGuideTab("privacy")}
            className={`text-xs font-bold transition-colors min-h-[36px] px-2 disabled:opacity-50 disabled:pointer-events-none ${
              guideTab === "privacy"
                ? "text-ink underline decoration-2 underline-offset-4"
                : "text-ink-secondary hover:text-ink"
            }`}
          >
            100% Private
          </button>
        </div>

        {guideTab === "ios" && (
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-orchid rounded-[24px] p-3 flex flex-col justify-between min-h-[126px]">
              <div>
                <p className="text-xs font-bold text-ink">1. Open Chat</p>
                <p className="text-[10px] text-ink/75 font-medium mt-0.5">
                  Tap their name at top of WhatsApp
                </p>
              </div>
              <div className="flex justify-end -mb-1">
                <CandleDoodle className="w-12 h-12" />
              </div>
            </div>

            <div className="bg-lavender rounded-[24px] p-3 flex flex-col justify-between min-h-[126px]">
              <div>
                <p className="text-xs font-bold text-ink">2. Export</p>
                <p className="text-[10px] text-ink/75 font-medium mt-0.5">
                  Scroll down &amp; tap “Export Chat”
                </p>
              </div>
              <div className="flex justify-end -mb-1">
                <ZenStonesDoodle className="w-12 h-12" />
              </div>
            </div>

            <div className="bg-sky rounded-[24px] p-3 flex flex-col justify-between min-h-[126px]">
              <div>
                <p className="text-xs font-bold text-ink">3. No Media</p>
                <p className="text-[10px] text-ink/75 font-medium mt-0.5">
                  Pick “Without Media” &amp; upload .zip or .txt
                </p>
              </div>
              <div className="flex justify-end -mb-1">
                <LotusBowlDoodle className="w-12 h-12" />
              </div>
            </div>
          </div>
        )}

        {guideTab === "android" && (
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-orchid rounded-[24px] p-3 flex flex-col justify-between min-h-[126px]">
              <div>
                <p className="text-xs font-bold text-ink">1. Tap ⋮ Menu</p>
                <p className="text-[10px] text-ink/75 font-medium mt-0.5">
                  Top-right corner inside the chat
                </p>
              </div>
              <div className="flex justify-end -mb-1">
                <CandleDoodle className="w-12 h-12" />
              </div>
            </div>

            <div className="bg-lavender rounded-[24px] p-3 flex flex-col justify-between min-h-[126px]">
              <div>
                <p className="text-xs font-bold text-ink">2. More → Export</p>
                <p className="text-[10px] text-ink/75 font-medium mt-0.5">
                  Choose “Without Media” for speed
                </p>
              </div>
              <div className="flex justify-end -mb-1">
                <ZenStonesDoodle className="w-12 h-12" />
              </div>
            </div>

            <div className="bg-sky rounded-[24px] p-3 flex flex-col justify-between min-h-[126px]">
              <div>
                <p className="text-xs font-bold text-ink">3. No Media</p>
                <p className="text-[10px] text-ink/75 font-medium mt-0.5">
                  Pick “Without Media” &amp; upload .zip or .txt
                </p>
              </div>
              <div className="flex justify-end -mb-1">
                <LotusBowlDoodle className="w-12 h-12" />
              </div>
            </div>
          </div>
        )}

        {guideTab === "privacy" && (
          <div className="bg-white rounded-[24px] p-3.5 shadow-card min-h-[126px] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-mint text-ink text-xs font-bold">
                Zero Server Uploads
              </span>
              <span className="text-[11px] font-semibold text-ink-secondary">
                Web Worker Sandbox
              </span>
            </div>
            <p className="text-xs text-ink font-medium leading-relaxed mt-2">
              Your chat log never leaves your browser tab. All ZIP decompression, regex parsing, N-gram lore detection, and scoring run 100% locally on your device.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
