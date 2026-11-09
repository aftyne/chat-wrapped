import { unzip, UnzipFileInfo } from "fflate";

const ZIP_MIME_TYPES = new Set([
  "application/zip",
  "application/x-zip-compressed",
  "multipart/x-zip",
]);

function isMacOSMetadataFile(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, "/");
  if (normalized.includes("__MACOSX/")) return true;
  const parts = normalized.split("/");
  const baseName = parts[parts.length - 1] || "";
  return baseName.startsWith("._");
}

function isTxtEntry(filePath: string): boolean {
  if (isMacOSMetadataFile(filePath)) return false;
  return filePath.toLowerCase().endsWith(".txt");
}

function scoreTxtCandidate(filePath: string): number {
  const normalized = filePath.replace(/\\/g, "/");
  const parts = normalized.split("/");
  const baseName = parts[parts.length - 1] || "";
  const lowerBase = baseName.toLowerCase();

  // Priority 1: Standard iOS WhatsApp export (_chat.txt)
  if (lowerBase === "_chat.txt") {
    return 100;
  }

  // Priority 2: Standard Android WhatsApp export ("WhatsApp Chat with *.txt")
  if (lowerBase.startsWith("whatsapp chat with ") && lowerBase.endsWith(".txt")) {
    return 90;
  }

  // Priority 3: Any other .txt file containing "chat" or "whatsapp"
  if (lowerBase.includes("whatsapp") || lowerBase.includes("chat")) {
    return 75;
  }

  // Priority 4: Fallback to any non-metadata .txt file
  return 50;
}

export function isZipFile(file: File): boolean {
  const lowerName = file.name.toLowerCase();
  return lowerName.endsWith(".zip") || ZIP_MIME_TYPES.has(file.type);
}

export async function extractChatTextFromFile(file: File): Promise<string> {
  const lowerName = file.name.toLowerCase();

  if (isZipFile(file)) {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Data = new Uint8Array(arrayBuffer);

    const unzippedEntries = await new Promise<Record<string, Uint8Array>>(
      (resolve, reject) => {
        unzip(
          uint8Data,
          {
            // Filter out macOS metadata and bundled media (.opus, .mp4, .jpg, etc.) before decompression
            filter(fileInfo: UnzipFileInfo) {
              return isTxtEntry(fileInfo.name);
            },
          },
          (err, unzipped) => {
            if (err) {
              reject(
                new Error("No valid WhatsApp chat log found inside this .zip")
              );
              return;
            }
            resolve(unzipped);
          }
        );
      }
    );

    const candidatePaths = Object.keys(unzippedEntries).filter(
      (path) => isTxtEntry(path) && unzippedEntries[path]?.byteLength > 0
    );

    if (candidatePaths.length === 0) {
      throw new Error("No valid WhatsApp chat log found inside this .zip");
    }

    // Sort candidates so _chat.txt and "WhatsApp Chat with ..." come first
    candidatePaths.sort((a, b) => scoreTxtCandidate(b) - scoreTxtCandidate(a));

    const bestPath = candidatePaths[0];
    const chatBytes = unzippedEntries[bestPath];

    // Explicitly discard any other extracted entries to free memory immediately
    for (const key of Object.keys(unzippedEntries)) {
      if (key !== bestPath) {
        delete unzippedEntries[key];
      }
    }

    const decodedText = new TextDecoder("utf-8").decode(chatBytes);
    delete unzippedEntries[bestPath];

    if (!decodedText || !decodedText.trim()) {
      throw new Error("No valid WhatsApp chat log found inside this .zip");
    }

    return decodedText;
  }

  if (lowerName.endsWith(".txt") || file.type === "text/plain" || !file.type) {
    const text = await file.text();
    if (!text || !text.trim()) {
      throw new Error("The selected .txt file is empty.");
    }
    return text;
  }

  throw new Error("Please upload a valid WhatsApp .zip or .txt export file.");
}
