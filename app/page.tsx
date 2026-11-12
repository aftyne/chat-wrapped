"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ChatWrappedAnalysis, ExtractionState } from "@/lib/types";
import { extractChatTextFromFile, isZipFile } from "@/lib/file-extractor";
import { parseWhatsAppChat } from "@/lib/parser";
import { analyzeChatMessages } from "@/lib/analyzer";
import { generateSampleWhatsAppChat } from "@/lib/sample-chat";
import { UploadZone } from "@/components/upload-zone";
import { StoryContainer } from "@/components/story-container";
import { ProcessingModal } from "@/components/processing-modal";
import { ErrorModal } from "@/components/error-modal";
import type { WorkerRequest, WorkerResponse } from "@/workers/analyzer.worker";

export default function HomePage() {
  const [analysis, setAnalysis] = useState<ChatWrappedAnalysis | null>(null);
  const [extractionState, setExtractionState] =
    useState<ExtractionState>("idle");
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);

  const handleFinishSuccess = useCallback((result: ChatWrappedAnalysis) => {
    setIsReady(true);
    setTimeout(() => {
      setAnalysis(result);
      setExtractionState("ready");
      setIsReady(false);
    }, 280);
  }, []);

  const getOrCreateWorker = useCallback((): Worker | null => {
    if (typeof window === "undefined" || typeof Worker === "undefined") {
      return null;
    }
    if (workerRef.current) {
      return workerRef.current;
    }
    try {
      const worker = new Worker(
        new URL("../workers/analyzer.worker.ts", import.meta.url)
      );
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const res = event.data;
        if (res.status === "parsing") {
          setExtractionState("parsing");
          return;
        }
        if (res.status === "swapped" && res.analysis) {
          setAnalysis(res.analysis);
          return;
        }
        if (res.status === "success" && res.analysis) {
          handleFinishSuccess(res.analysis);
        } else {
          setError(res.error || "Could not analyze this chat file.");
          setExtractionState("error");
          setIsReady(false);
        }
      };
      workerRef.current = worker;
      return worker;
    } catch {
      return null;
    }
  }, [handleFinishSuccess]);

  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const runWorkerRequest = useCallback(
    async (request: WorkerRequest) => {
      const worker = getOrCreateWorker();
      if (worker) {
        worker.onerror = async () => {
          // Fallback if worker fails
          try {
            const rawText =
              request.rawText ||
              (request.file ? await extractChatTextFromFile(request.file) : "");
            const parsed = parseWhatsAppChat(rawText);
            const result = analyzeChatMessages(
              parsed,
              request.preferredYouName
            );
            handleFinishSuccess(result);
          } catch (err) {
            setError(
              err instanceof Error ? err.message : "Failed to parse chat."
            );
            setExtractionState("error");
            setIsReady(false);
          }
        };
        worker.postMessage(request);
        return;
      }

      // Non-worker fallback
      try {
        const rawText =
          request.rawText ||
          (request.file ? await extractChatTextFromFile(request.file) : "");
        const parsed = parseWhatsAppChat(rawText);
        const result = analyzeChatMessages(parsed, request.preferredYouName);
        handleFinishSuccess(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse chat.");
        setExtractionState("error");
        setIsReady(false);
      }
    },
    [getOrCreateWorker, handleFinishSuccess]
  );

  const handleFileUpload = useCallback(
    (file: File) => {
      setError(null);
      setIsReady(false);

      // Offload 100% of unzip, UTF-8 decode, parsing, and analysis to the Web Worker
      if (isZipFile(file)) {
        setExtractionState("unzipping");
      } else {
        setExtractionState("parsing");
      }

      void runWorkerRequest({ action: "analyze", file });
    },
    [runWorkerRequest]
  );

  const handleLoadSample = useCallback(() => {
    setError(null);
    setIsReady(false);
    setExtractionState("parsing");
    const sampleTxt = generateSampleWhatsAppChat();
    void runWorkerRequest({ action: "analyze", rawText: sampleTxt });
  }, [runWorkerRequest]);

  const handleSwapPerspective = useCallback(() => {
    if (!analysis) return;
    const currentOther = analysis.participants[1].name;
    const worker = getOrCreateWorker();
    if (worker) {
      worker.postMessage({
        action: "swap",
        preferredYouName: currentOther,
      } satisfies WorkerRequest);
    }
  }, [analysis, getOrCreateWorker]);

  const handleRetry = useCallback(() => {
    setError(null);
    setExtractionState("idle");
    setIsReady(false);
  }, []);

  const isProcessing =
    extractionState === "unzipping" ||
    extractionState === "parsing" ||
    isReady;

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
              setIsReady(false);
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

      {/* Full-Screen Blocking Loading Modal Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <ProcessingModal state={extractionState} isReady={isReady} />
        )}
      </AnimatePresence>

      {/* Full-Screen Error Modal Alert */}
      <AnimatePresence>
        {extractionState === "error" && error && (
          <ErrorModal error={error} onRetry={handleRetry} />
        )}
      </AnimatePresence>
    </main>
  );
}
