import { ParsedMessage } from "./types";

// Regex patterns for iOS and Android WhatsApp exports
// iOS: [14/02/24, 21:15:03] Alex: Hey! or [2/14/24, 9:15:03 PM] Alex: Hey!
const IOS_LINE_REGEX =
  /^[\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]*\[(\d{1,4}[\/\.\-]\d{1,2}[\/\.\-]\d{1,4}),?\s+(\d{1,2}[:\.]\d{2}(?:[:\.]\d{2})?(?:[\s\u202F\u00A0]*[APap][Mm])?)\][\s\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]*([^:]+?):\s*([\s\S]*)$/;

// Android: 14/02/2024, 21:15 - Alex: Hey! or 2/14/24, 9:15 PM - Alex: Hey! or 14/02/24 21.15 - Alex: Hey!
const ANDROID_LINE_REGEX =
  /^[\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]*(\d{1,4}[\/\.\-]\d{1,2}[\/\.\-]\d{1,4}),?\s+(\d{1,2}[:\.]\d{2}(?:[:\.]\d{2})?(?:[\s\u202F\u00A0]*[APap][Mm])?)\s*-\s*([^:]+?):\s*([\s\S]*)$/;

// System line without sender (e.g. encryption notices)
const SYSTEM_LINE_REGEX =
  /^[\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]*(?:\[?\d{1,4}[\/\.\-]\d{1,2}[\/\.\-]\d{1,4},?\s+\d{1,2}[:\.]\d{2}(?:[:\.]\d{2})?(?:[\s\u202F\u00A0]*[APap][Mm])?\]?(?:\s*-\s*)?)\s*([\s\S]*)$/;

const DELETED_PATTERNS = [
  /^<?this message was deleted\.?>?$/i,
  /^<?you deleted this message\.?>?$/i,
  /^<?pesan ini telah dihapus\.?>?$/i,
  /^<?anda menghapus pesan ini\.?>?$/i,
  /^<?este mensaje fue eliminado\.?>?$/i,
  /^<?eliminaste este mensaje\.?>?$/i,
  /^<?ce message a été supprimé\.?>?$/i,
  /^<?diese nachricht wurde gelöscht\.?>?$/i,
];

const MEDIA_PATTERNS = [
  /^<?media omitted>?$/i,
  /^<?image omitted>?$/i,
  /^<?video omitted>?$/i,
  /^<?audio omitted>?$/i,
  /^<?sticker omitted>?$/i,
  /^<?gif omitted>?$/i,
  /^<?document omitted>?$/i,
  /^<?contact card omitted>?$/i,
  /^<?media tidak disertakan>?$/i,
  /\(file attached\)$/i,
  /^<attached:\s*.+>$/i,
];

const SYSTEM_CONTENT_PATTERNS = [
  /messages and calls are end-to-end encrypted/i,
  /pesan dan panggilan terenkripsi secara end-to-end/i,
  /your security code with .+ changed/i,
  /^<?missed voice call\.?>?$/i,
  /^<?missed video call\.?>?$/i,
  /missed voice call/i,
  /missed video call/i,
  /created group/i,
  /changed the subject/i,
  /changed this group's icon/i,
  /^null$/i,
];

const INLINE_OMISSION_REGEX =
  /<?\b(?:image|sticker|video|audio|gif|document|contact card|media)\s+omitted\b>?|<?\bmedia tidak disertakan\b>?|<?\b(?:this message was deleted|you deleted this message|missed voice call|missed video call)\b>?/gi;

export function cleanInvisibleChars(input: string): string {
  return input
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]/g, "")
    .trim();
}

export function stripOmissionPlaceholders(input: string): string {
  return cleanInvisibleChars(input).replace(INLINE_OMISSION_REGEX, " ").trim();
}

export function isDeletedMessage(text: string): boolean {
  const cleaned = cleanInvisibleChars(text);
  return DELETED_PATTERNS.some((re) => re.test(cleaned));
}

export function isMediaMessage(text: string): boolean {
  const cleaned = cleanInvisibleChars(text);
  return MEDIA_PATTERNS.some((re) => re.test(cleaned));
}

export function isSystemMessageContent(text: string): boolean {
  const cleaned = cleanInvisibleChars(text);
  return SYSTEM_CONTENT_PATTERNS.some((re) => re.test(cleaned));
}

export function isOmittedOrSystemPlaceholder(text: string): boolean {
  const cleaned = cleanInvisibleChars(text);
  if (!cleaned || /^null$/i.test(cleaned)) return true;
  if (
    isDeletedMessage(cleaned) ||
    isMediaMessage(cleaned) ||
    isSystemMessageContent(cleaned)
  ) {
    return true;
  }
  const stripped = stripOmissionPlaceholders(cleaned);
  return stripped.length === 0;
}

function detectDateFormat(rawDates: string[]): "DMY" | "MDY" | "YMD" {
  for (const d of rawDates) {
    const parts = d.split(/[\/\.\-]/).map((n) => parseInt(n, 10));
    if (parts.length !== 3) continue;
    if (parts[0] > 1900) return "YMD";
    if (parts[0] > 12) return "DMY";
    if (parts[1] > 12) return "MDY";
  }
  return "DMY";
}

function parseDateTime(
  dateRaw: string,
  timeRaw: string,
  format: "DMY" | "MDY" | "YMD"
): { timestamp: number; dateStr: string; timeStr: string; hour: number; dayOfWeek: number } {
  const dateParts = dateRaw.split(/[\/\.\-]/).map((p) => parseInt(p, 10));
  let day = 1;
  let month = 1;
  let year = 2025;

  if (format === "YMD") {
    year = dateParts[0];
    month = dateParts[1];
    day = dateParts[2];
  } else if (format === "MDY") {
    month = dateParts[0];
    day = dateParts[1];
    year = dateParts[2];
  } else {
    day = dateParts[0];
    month = dateParts[1];
    year = dateParts[2];
  }

  if (year < 100) {
    year += year >= 70 ? 1900 : 2000;
  }

  // Parse time
  const normalizedTime = timeRaw.replace(/[\u202F\u00A0]/g, " ").trim();
  const amPmMatch = normalizedTime.match(/([APap][Mm])$/);
  const timeCore = normalizedTime.replace(/\s*[APap][Mm]$/, "").trim();
  const timeParts = timeCore.split(/[:\.]/).map((p) => parseInt(p, 10));

  let hour = timeParts[0] || 0;
  const minute = timeParts[1] || 0;
  const second = timeParts[2] || 0;

  if (amPmMatch) {
    const isPm = amPmMatch[1].toLowerCase() === "pm";
    if (isPm && hour < 12) hour += 12;
    if (!isPm && hour === 12) hour = 0;
  }

  const dateObj = new Date(year, month - 1, day, hour, minute, second);
  const timestamp = isNaN(dateObj.getTime()) ? Date.now() : dateObj.getTime();

  const yyyy = String(year).padStart(4, "0");
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  const hh = String(hour).padStart(2, "0");
  const min = String(minute).padStart(2, "0");

  return {
    timestamp,
    dateStr: `${yyyy}-${mm}-${dd}`,
    timeStr: `${hh}:${min}`,
    hour,
    dayOfWeek: dateObj.getDay(),
  };
}

function countWords(text: string): number {
  const cleaned = text.trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).length;
}

export function parseWhatsAppChat(rawText: string): ParsedMessage[] {
  const lines = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");

  interface RawRecord {
    dateRaw: string;
    timeRaw: string;
    sender: string;
    text: string;
  }

  const rawRecords: RawRecord[] = [];
  const sampleDates: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const iosMatch = line.match(IOS_LINE_REGEX);
    if (iosMatch) {
      const [, dateRaw, timeRaw, senderRaw, textRaw] = iosMatch;
      if (sampleDates.length < 250) sampleDates.push(dateRaw);
      rawRecords.push({
        dateRaw,
        timeRaw,
        sender: cleanInvisibleChars(senderRaw),
        text: cleanInvisibleChars(textRaw),
      });
      continue;
    }

    const androidMatch = line.match(ANDROID_LINE_REGEX);
    if (androidMatch) {
      const [, dateRaw, timeRaw, senderRaw, textRaw] = androidMatch;
      if (sampleDates.length < 250) sampleDates.push(dateRaw);
      rawRecords.push({
        dateRaw,
        timeRaw,
        sender: cleanInvisibleChars(senderRaw),
        text: cleanInvisibleChars(textRaw),
      });
      continue;
    }

    // Check if it's a system line with a timestamp (do not append to previous message)
    if (SYSTEM_LINE_REGEX.test(line)) {
      continue;
    }

    // Continuation of multi-line message
    if (rawRecords.length > 0) {
      rawRecords[rawRecords.length - 1].text +=
        "\n" + cleanInvisibleChars(line);
    }
  }

  const dateFormat = detectDateFormat(sampleDates);
  const parsedMessages: ParsedMessage[] = [];

  for (let i = 0; i < rawRecords.length; i++) {
    const rec = rawRecords[i];
    const isSystem = isSystemMessageContent(rec.text);
    if (isSystem) continue;

    const isDeleted = isDeletedMessage(rec.text);
    const isMedia = isMediaMessage(rec.text);
    const dt = parseDateTime(rec.dateRaw, rec.timeRaw, dateFormat);

    const cleanedText = isDeleted || isMedia
      ? cleanInvisibleChars(rec.text)
      : stripOmissionPlaceholders(rec.text);
    if (!isDeleted && !isMedia && !cleanedText) continue;

    const wordCount = isDeleted || isMedia ? 0 : countWords(cleanedText);

    parsedMessages.push({
      id: parsedMessages.length + 1,
      timestamp: dt.timestamp,
      dateStr: dt.dateStr,
      timeStr: dt.timeStr,
      hour: dt.hour,
      dayOfWeek: dt.dayOfWeek,
      sender: rec.sender,
      text: cleanedText,
      wordCount,
      charCount: isDeleted || isMedia ? 0 : cleanedText.length,
      isDeleted,
      isMedia,
      isSystem: false,
    });
  }

  return parsedMessages;
}
