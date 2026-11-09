import { parseWhatsAppChat } from "../lib/parser";
import { analyzeChatMessages } from "../lib/analyzer";

export interface WorkerRequest {
  rawText: string;
  preferredYouName?: string;
}

export interface WorkerResponse {
  status: "success" | "error";
  analysis?: ReturnType<typeof analyzeChatMessages>;
  error?: string;
}

const ctx: Worker = self as unknown as Worker;

ctx.onmessage = (event: MessageEvent<WorkerRequest>) => {
  try {
    const { rawText, preferredYouName } = event.data;
    const parsed = parseWhatsAppChat(rawText);
    if (parsed.length < 2) {
      const response: WorkerResponse = {
        status: "error",
        error:
          "Could not detect enough valid WhatsApp messages. Make sure you exported a .txt chat log without media.",
      };
      ctx.postMessage(response);
      return;
    }

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
