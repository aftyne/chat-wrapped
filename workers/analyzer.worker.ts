import { extractChatTextFromFile, isZipFile } from "../lib/file-extractor";
import { parseWhatsAppChat } from "../lib/parser";
import { analyzeChatMessages } from "../lib/analyzer";
import type { ParsedMessage } from "../lib/types";

export interface WorkerRequest {
  action?: "analyze" | "swap";
  file?: File;
  rawText?: string;
  preferredYouName?: string;
}

export interface WorkerResponse {
  status: "parsing" | "success" | "swapped" | "error";
  analysis?: ReturnType<typeof analyzeChatMessages>;
  error?: string;
}

const ctx: Worker = self as unknown as Worker;

// Keep parsed messages inside worker memory so perspective swaps never block the UI thread
let cachedMessages: ParsedMessage[] | null = null;

ctx.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  try {
    const { action = "analyze", file, rawText, preferredYouName } = event.data;

    if (action === "swap" && cachedMessages && cachedMessages.length >= 2) {
      const analysis = analyzeChatMessages(cachedMessages, preferredYouName);
      const response: WorkerResponse = {
        status: "swapped",
        analysis,
      };
      ctx.postMessage(response);
      return;
    }

    let textToParse = rawText || "";
    if (file) {
      const wasZip = isZipFile(file);
      textToParse = await extractChatTextFromFile(file);
      if (wasZip) {
        ctx.postMessage({ status: "parsing" } satisfies WorkerResponse);
      }
    }

    const parsed = parseWhatsAppChat(textToParse);
    // Allow raw text string to be garbage-collected immediately inside the worker
    textToParse = "";

    if (parsed.length < 2) {
      const response: WorkerResponse = {
        status: "error",
        error:
          "Could not detect enough valid WhatsApp messages. Make sure you exported a .txt chat log without media.",
      };
      ctx.postMessage(response);
      return;
    }

    cachedMessages = parsed;
    const analysis = analyzeChatMessages(parsed, preferredYouName);
    const response: WorkerResponse = {
      status: "success",
      analysis,
    };
    ctx.postMessage(response);
  } catch (err) {
    const response: WorkerResponse = {
      status: "error",
      error: err instanceof Error ? err.message : "Failed to analyze chat file.",
    };
    ctx.postMessage(response);
  }
};
