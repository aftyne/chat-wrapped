"use client";

import React, { useCallback, useRef, useState } from "react";
import { ChatWrappedAnalysis, ExtractionState } from "@/lib/types";
import { extractChatTextFromFile, isZipFile } from "@/lib/file-extractor";
import { parseWhatsAppChat } from "@/lib/parser";
import { analyzeChatMessages } from "@/lib/analyzer";
import { generateSampleWhatsAppChat } from "@/lib/sample-chat";
import { UploadZone } from "@/components/upload-zone";
import { StoryContainer } from "@/components/story-container";
import type { WorkerResponse } from "@/workers/analyzer.worker";

export default function HomePage() {
  const [analysis, setAnalysis] = useState<ChatWrappedAnalysis | null>(null);
  const [extractionState, setExtractionState] =
    useState<ExtractionState>("idle");
  const [error, setError] = useState<string | null>(null);
  const rawTextRef = useRef<string>("");

  const runAnalysis = useCallback(
    (rawText: string, preferredYouName?: string) => {
      setExtractionState("parsing");
      setError(null);
      rawTextRef.current = rawText;

      // Offload to Web Worker when available
      if (typeof window !== "undefined" && typeof Worker !== "undefined") {
        try {
          const worker = new Worker(
            new URL("../workers/analyzer.worker.ts", import.meta.url)
          );

          worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
            const res = event.data;
            if (res.status === "success" && res.analysis) {
              setAnalysis(res.analysis);
              setExtractionState("ready");
            } else {
              setError(res.error || "Could not analyze this chat file.");
              setExtractionState("error");
            }
            worker.terminate();
          };

          worker.onerror = () => {
            // Fallback to main thread if bundler worker URL fails
            try {
              const parsed = parseWhatsAppChat(rawText);
              const result = analyzeChatMessages(parsed, preferredYouName);
              setAnalysis(result);
              setExtractionState("ready");
            } catch (err) {
              setError(
                err instanceof Error ? err.message : "Failed to parse chat."
              );
              setExtractionState("error");
            } finally {
              worker.terminate();
            }
          };

          worker.postMessage({ rawText, preferredYouName });
          return;
        } catch {
          // Fallback below
        }
      }

      // Direct fallback
      try {
        const parsed = parseWhatsAppChat(rawText);
        const result = analyzeChatMessages(parsed, preferredYouName);
        setAnalysis(result);
        setExtractionState("ready");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse chat.");
        setExtractionState("error");
      }
    },
    []
  );

  const handleFileUpload = useCallback(
    async (file: File) => {
      setError(null);
      let unzipTimer: ReturnType<typeof setTimeout> | null = null;

      try {
        if (isZipFile(file)) {
          // Show 'unzipping' indicator if unpacking takes >200ms
          unzipTimer = setTimeout(() => {
            setExtractionState("unzipping");
          }, 200);
        } else {
          setExtractionState("parsing");
        }

        const extractedText = await extractChatTextFromFile(file);

        if (unzipTimer) {
          clearTimeout(unzipTimer);
          unzipTimer = null;
        }

        runAnalysis(extractedText);
      } catch (err) {
        if (unzipTimer) {
          clearTimeout(unzipTimer);
          unzipTimer = null;
        }
        setError(
          err instanceof Error
            ? err.message
            : "No valid WhatsApp chat log found inside this .zip"
        );
        setExtractionState("error");
      }
    },
    [runAnalysis]
  );

  const handleLoadSample = useCallback(() => {
    const sampleTxt = generateSampleWhatsAppChat();
    runAnalysis(sampleTxt);
  }, [runAnalysis]);

  const handleSwapPerspective = useCallback(() => {
    if (!analysis || !rawTextRef.current) return;
    const currentOther = analysis.participants[1].name;
    runAnalysis(rawTextRef.current, currentOther);
  }, [analysis, runAnalysis]);

  return (
    <main className="relative w-full h-[100dvh] flex items-center justify-center overflow-hidden bg-[#B5C1CB]">
      <div
        aria-hidden="true"
        className="hidden sm:block pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-24 -left-24 w-[480px] h-[480px] rounded-full bg-[#DCE6EC] blur-3xl opacity-75" />
        <div className="absolute top-1/3 -right-20 w-[440px] h-[440px] rounded-full bg-[#E5D4EC] blur-3xl opacity-65" />
        <div className="absolute -bottom-24 left-1/4 w-[520px] h-[420px] rounded-full bg-[#C7DCE4] blur-3xl opacity-70" />
      </div>

      <div className="relative z-10 w-full h-[100dvh] sm:w-[430px] bg-canvas overflow-hidden flex flex-col">
        {analysis ? (
          <StoryContainer
            data={analysis}
            onExit={() => {
              setAnalysis(null);
              setExtractionState("idle");
            }}
            onSwapPerspective={handleSwapPerspective}
          />
        ) : (
          <UploadZone
            onFileUpload={handleFileUpload}
            onLoadSample={handleLoadSample}
            extractionState={extractionState}
            error={error}
          />
        )}
      </div>
    </main>
  );
}
