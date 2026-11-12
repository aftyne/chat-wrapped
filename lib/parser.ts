import { ParsedMessage } from "./types";

// Hoisted invisible directional character regexes
const INVISIBLE_CHARS_TEST_REGEX =
  /[\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]/;
const INVISIBLE_CHARS_REPLACE_REGEX =
  /[\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]/g;

// Hoisted combined regexes for fast-exit classification
const DELETED_COMBINED_REGEX =
  /^<?(?:this message was deleted|you deleted this message|pesan ini telah dihapus|anda menghapus pesan ini|este mensaje fue eliminado|eliminaste este mensaje|ce message a été supprimé|diese nachricht wurde gelöscht)\.?>?$/i;

const MEDIA_COMBINED_REGEX =
  /^(?:<?(?:media|image|video|audio|sticker|gif|document|contact card)\s+omitted>?|<?media tidak disertakan>?|<attached:\s*.+>|.*\(file attached\))$/i;

const SYSTEM_COMBINED_REGEX =
  /messages and calls are end-to-end encrypted|pesan dan panggilan terenkripsi secara end-to-end|your security code with .+ changed|missed (?:voice|video) call|created group|changed the subject|changed this group's icon|^null$/i;

const INLINE_OMISSION_TEST_REGEX =
  /omitted|disertakan|this message was deleted|you deleted this message|missed (?:voice|video) call/i;

const INLINE_OMISSION_REPLACE_REGEX =
  /<?\b(?:image|sticker|video|audio|gif|document|contact card|media)\s+omitted\b>?|<?\bmedia tidak disertakan\b>?|<?\b(?:this message was deleted|you deleted this message|missed voice call|missed video call)\b>?/gi;

// Fast pre-screen regex: only messages matching this keyword pattern can be media, deleted, or system notices
const SPECIAL_MSG_PRETEST_REGEX =
  /omitted|deleted|dihapus|disertakan|attached|encrypted|terenkripsi|missed |security code|created group|changed |eliminad|supprim|gelöscht|^null$/i;

const DATE_SEP_REGEX = /[\/\.\-]/;

export function cleanInvisibleChars(input: string): string {
  const trimmed = input.trim();
  if (!trimmed || !INVISIBLE_CHARS_TEST_REGEX.test(trimmed)) {
    return trimmed;
  }
  return trimmed.replace(INVISIBLE_CHARS_REPLACE_REGEX, "").trim();
}

export function stripOmissionPlaceholders(input: string): string {
  const cleaned = cleanInvisibleChars(input);
  if (!cleaned || !INLINE_OMISSION_TEST_REGEX.test(cleaned)) {
    return cleaned;
  }
  return cleaned.replace(INLINE_OMISSION_REPLACE_REGEX, " ").trim();
}

export function isDeletedMessage(text: string): boolean {
  if (!text || text.length > 56) return false;
  const cleaned = cleanInvisibleChars(text);
  return cleaned.length <= 48 && DELETED_COMBINED_REGEX.test(cleaned);
}

export function isMediaMessage(text: string): boolean {
  if (!text || text.length > 96) return false;
  const cleaned = cleanInvisibleChars(text);
  return cleaned.length <= 88 && MEDIA_COMBINED_REGEX.test(cleaned);
}

export function isSystemMessageContent(text: string): boolean {
  if (!text || text.length > 180) return false;
  const cleaned = cleanInvisibleChars(text);
  return SYSTEM_COMBINED_REGEX.test(cleaned);
}

export function isOmittedOrSystemPlaceholder(text: string): boolean {
  if (!text) return true;
  if (text.length > 180) return false;
  const cleaned = cleanInvisibleChars(text);
  if (!cleaned) return true;
  if (!SPECIAL_MSG_PRETEST_REGEX.test(cleaned)) return false;
  if (
    DELETED_COMBINED_REGEX.test(cleaned) ||
    MEDIA_COMBINED_REGEX.test(cleaned) ||
    SYSTEM_COMBINED_REGEX.test(cleaned)
  ) {
    return true;
  }
  if (!INLINE_OMISSION_TEST_REGEX.test(cleaned)) return false;
  return cleaned.replace(INLINE_OMISSION_REPLACE_REGEX, " ").trim().length === 0;
}

function detectDateFormat(rawDates: string[]): "DMY" | "MDY" | "YMD" {
  for (let i = 0; i < rawDates.length; i++) {
    const parts = rawDates[i].split(DATE_SEP_REGEX);
    if (parts.length !== 3) continue;
    const p0 = parseInt(parts[0], 10);
    const p1 = parseInt(parts[1], 10);
    if (p0 > 1900) return "YMD";
    if (p0 > 12) return "DMY";
    if (p1 > 12) return "MDY";
  }
  return "DMY";
}

interface ParsedDateCache {
  raw: string;
  year: number;
  month: number;
  day: number;
  dateStr: string;
  dayOfWeek: number;
  midnightTs: number;
}

function parseDateOnly(
  dateRaw: string,
  format: "DMY" | "MDY" | "YMD"
): ParsedDateCache {
  const dateParts = dateRaw.split(DATE_SEP_REGEX);
  const p0 = parseInt(dateParts[0], 10) || 1;
  const p1 = parseInt(dateParts[1], 10) || 1;
  const p2 = parseInt(dateParts[2], 10) || 2025;

  let day = 1;
  let month = 1;
  let year = 2025;

  if (format === "YMD") {
    year = p0;
    month = p1;
    day = p2;
  } else if (format === "MDY") {
    month = p0;
    day = p1;
    year = p2;
  } else {
    day = p0;
    month = p1;
    year = p2;
  }

  if (year < 100) {
    year += year >= 70 ? 1900 : 2000;
  }

  const midnightDate = new Date(year, month - 1, day, 0, 0, 0, 0);
  const midnightTs = isNaN(midnightDate.getTime())
    ? Date.now()
    : midnightDate.getTime();

  const yyyy = String(year).padStart(4, "0");
  const mm = month < 10 ? `0${month}` : String(month);
  const dd = day < 10 ? `0${day}` : String(day);

  return {
    raw: dateRaw,
    year,
    month,
    day,
    dateStr: `${yyyy}-${mm}-${dd}`,
    dayOfWeek: midnightDate.getDay(),
    midnightTs,
  };
}

function parseTimeOnly(timeRaw: string): {
  hour: number;
  minute: number;
  second: number;
  timeStr: string;
} {
  const len = timeRaw.length;
  const lastChar = timeRaw.charCodeAt(len - 1);
  let amPm = 0; // 0 = none, 1 = AM, 2 = PM
  let timeEnd = len;

  if (lastChar === 77 || lastChar === 109) {
    const prevChar = timeRaw.charCodeAt(len - 2);
    if (prevChar === 80 || prevChar === 112) {
      amPm = 2; // PM
      timeEnd = len - 2;
    } else if (prevChar === 65 || prevChar === 97) {
      amPm = 1; // AM
      timeEnd = len - 2;
    }
  }

  let hour = 0;
  let minute = 0;
  let second = 0;
  let part = 0;
  let currentVal = 0;

  for (let i = 0; i < timeEnd; i++) {
    const code = timeRaw.charCodeAt(i);
    if (code >= 48 && code <= 57) {
      currentVal = currentVal * 10 + (code - 48);
    } else if (code === 58 || code === 46) {
      if (part === 0) hour = currentVal;
      else if (part === 1) minute = currentVal;
      currentVal = 0;
      part++;
    }
  }
  if (part === 1) minute = currentVal;
  else if (part >= 2) second = currentVal;

  if (amPm === 2 && hour < 12) hour += 12;
  else if (amPm === 1 && hour === 12) hour = 0;

  const hh = hour < 10 ? `0${hour}` : String(hour);
  const min = minute < 10 ? `0${minute}` : String(minute);

  return { hour, minute, second, timeStr: `${hh}:${min}` };
}

function countWordsFast(text: string): number {
  const len = text.length;
  if (len === 0) return 0;
  let count = 0;
  let inWord = false;
  for (let i = 0; i < len; i++) {
    const code = text.charCodeAt(i);
    const isSpace =
      code === 32 || code === 9 || code === 10 || code === 13 || code === 160;
    if (!isSpace) {
      if (!inWord) {
        count++;
        inWord = true;
      }
    } else {
      inWord = false;
    }
  }
  return count;
}

// Fast structural check for WhatsApp date prefix: digits + sep + digits + sep + digits
function extractDateAndTime(
  tsChunk: string
): { dateRaw: string; timeRaw: string } | null {
  const len = tsChunk.length;
  if (len < 10 || len > 28) return null;

  let sepCount = 0;
  let splitPos = -1;

  for (let i = 0; i < len; i++) {
    const c = tsChunk.charCodeAt(i);
    if (c === 47 || c === 46 || c === 45) {
      sepCount++;
    } else if (c === 44 || c === 32) {
      if (sepCount >= 2) {
        splitPos = i;
        break;
      }
    } else if (c < 48 || c > 57) {
      return null;
    }
  }

  if (splitPos === -1 || sepCount < 2) return null;
  const dateRaw = tsChunk.slice(0, splitPos);
  let timeStart = splitPos + 1;
  while (
    timeStart < len &&
    (tsChunk.charCodeAt(timeStart) === 32 ||
      tsChunk.charCodeAt(timeStart) === 44)
  ) {
    timeStart++;
  }
  if (timeStart >= len) return null;
  const timeRaw = tsChunk.slice(timeStart);
  const firstTimeChar = timeRaw.charCodeAt(0);
  if (firstTimeChar < 48 || firstTimeChar > 57) return null;

  return { dateRaw, timeRaw };
}

export function parseWhatsAppChat(rawText: string): ParsedMessage[] {
  const lines = rawText.split("\n");
  const numLines = lines.length;

  // Quick pre-scan of up to 200 lines to detect date format (DMY / MDY / YMD)
  const sampleDates: string[] = [];
  for (let i = 0; i < numLines && sampleDates.length < 200; i++) {
    let l = lines[i].trim();
    if (!l) continue;
    let c0 = l.charCodeAt(0);
    if (c0 > 127) {
      l = cleanInvisibleChars(l);
      if (!l) continue;
      c0 = l.charCodeAt(0);
    }
    if (c0 === 91) {
      const closeIdx = l.indexOf("]");
      if (closeIdx > 10 && closeIdx < 30) {
        const dt = extractDateAndTime(l.slice(1, closeIdx));
        if (dt) sampleDates.push(dt.dateRaw);
      }
    } else if (c0 >= 48 && c0 <= 57) {
      const dashIdx = l.indexOf(" - ");
      if (dashIdx > 9 && dashIdx < 28) {
        const dt = extractDateAndTime(l.slice(0, dashIdx));
        if (dt) sampleDates.push(dt.dateRaw);
      }
    }
  }

  const dateFormat = detectDateFormat(sampleDates);
  const parsedMessages: ParsedMessage[] = [];
  let dateCache: ParsedDateCache | null = null;

  // Pending current record (so multi-line messages can append before finalizing)
  let curDateRaw = "";
  let curTimeRaw = "";
  let curSender = "";
  let curText = "";
  let hasCur = false;

  const finalizeCurrentRecord = () => {
    if (!hasCur || !curText) return;

    // Strip leading invisible directional mark (\u200e/\u200f) if present at start of message
    if (curText.charCodeAt(0) > 127) {
      curText = cleanInvisibleChars(curText);
      if (!curText) return;
    }

    let isDeleted = false;
    let isMedia = false;
    let cleanedText = curText;
    const textLen = curText.length;

    // Fast path: messages shorter than 12 chars cannot be media/deleted/system placeholders except "null"
    if (textLen < 12) {
      if (
        (textLen === 4 || textLen === 6) &&
        (curText === "null" ||
          curText === "NULL" ||
          curText === "<null>" ||
          curText === "<NULL>")
      ) {
        return;
      }
    } else if (textLen <= 180 && SPECIAL_MSG_PRETEST_REGEX.test(curText)) {
      const normText = INVISIBLE_CHARS_TEST_REGEX.test(curText)
        ? cleanInvisibleChars(curText)
        : curText;
      if (normText.length <= 48 && DELETED_COMBINED_REGEX.test(normText)) {
        isDeleted = true;
      } else if (normText.length <= 88 && MEDIA_COMBINED_REGEX.test(normText)) {
        isMedia = true;
      } else if (SYSTEM_COMBINED_REGEX.test(normText)) {
        return;
      } else if (INLINE_OMISSION_TEST_REGEX.test(normText)) {
        cleanedText = normText.replace(INLINE_OMISSION_REPLACE_REGEX, " ").trim();
        if (!cleanedText) return;
      }
    } else if (textLen > 180 && INLINE_OMISSION_TEST_REGEX.test(curText)) {
      cleanedText = cleanInvisibleChars(curText)
        .replace(INLINE_OMISSION_REPLACE_REGEX, " ")
        .trim();
      if (!cleanedText) return;
    }

    if (!dateCache || dateCache.raw !== curDateRaw) {
      dateCache = parseDateOnly(curDateRaw, dateFormat);
    }

    const tm = parseTimeOnly(curTimeRaw);
    const timestamp =
      dateCache.midnightTs +
      (tm.hour * 3600 + tm.minute * 60 + tm.second) * 1000;

    const wordCount = isDeleted || isMedia ? 0 : countWordsFast(cleanedText);

    parsedMessages.push({
      id: parsedMessages.length + 1,
      timestamp,
      dateStr: dateCache.dateStr,
      timeStr: tm.timeStr,
      hour: tm.hour,
      dayOfWeek: dateCache.dayOfWeek,
      sender: curSender,
      text: cleanedText,
      wordCount,
      charCount: isDeleted || isMedia ? 0 : cleanedText.length,
      isDeleted,
      isMedia,
      isSystem: false,
    });
  };

  for (let i = 0; i < numLines; i++) {
    let line = lines[i].trim();
    if (!line) continue;

    let firstCode = line.charCodeAt(0);
    if (firstCode > 127) {
      line = cleanInvisibleChars(line);
      if (!line) continue;
      firstCode = line.charCodeAt(0);
    }

    // 1. iOS format: [date, time] Sender: Text
    if (firstCode === 91) {
      const closeIdx = line.indexOf("]");
      if (closeIdx > 10 && closeIdx < 32) {
        const dt = extractDateAndTime(line.slice(1, closeIdx));
        if (dt) {
          finalizeCurrentRecord();
          const colonIdx = line.indexOf(":", closeIdx + 1);
          if (colonIdx === -1) {
            hasCur = false;
            continue;
          }
          curDateRaw = dt.dateRaw;
          curTimeRaw = dt.timeRaw;
          curSender = line.slice(closeIdx + 1, colonIdx).trim();
          curText = line.slice(colonIdx + 1).trim();
          hasCur = true;
          continue;
        }
      }
    }

    // 2. Android format: date, time - Sender: Text
    if (firstCode >= 48 && firstCode <= 57) {
      const dashIdx = line.indexOf(" - ");
      if (dashIdx > 9 && dashIdx < 28) {
        const dt = extractDateAndTime(line.slice(0, dashIdx));
        if (dt) {
          finalizeCurrentRecord();
          const colonIdx = line.indexOf(":", dashIdx + 3);
          if (colonIdx === -1) {
            hasCur = false;
            continue;
          }
          curDateRaw = dt.dateRaw;
          curTimeRaw = dt.timeRaw;
          curSender = line.slice(dashIdx + 3, colonIdx).trim();
          curText = line.slice(colonIdx + 1).trim();
          hasCur = true;
          continue;
        }
      }
    }

    // 3. Multi-line continuation
    if (hasCur) {
      curText += "\n" + line;
    }
  }

  finalizeCurrentRecord();

  return parsedMessages;
}
