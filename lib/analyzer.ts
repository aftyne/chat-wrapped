import {
  ChatWrappedAnalysis,
  FinalVerdictData,
  FirstMessageData,
  LeftOnReadData,
  LongestMessageData,
  ParsedMessage,
  ParticipantMetrics,
  PhraseExample,
  RedFlagItem,
  SharedLoreItem,
  SilenceGapData,
  TimelineBucket,
  TranslationItem,
  WordFrequency,
} from "./types";
import { isOmittedOrSystemPlaceholder } from "./parser";

// Hoisted module-level regexes and formatters
const SHORT_TRIM_PUNCT_REGEX = /^[<>]+|[<>]+$|[.!?,]+$/g;
const OMITTED_KEYWORD_REGEX =
  /\bomitted\b|\bdeleted\b|\bmissed\b|\bnull\b|\bdisertakan\b/i;

const NICE_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const STOP_WORDS = new Set([
  // English stop words
  "the", "and", "to", "of", "in", "is", "it", "for", "that", "you", "on", "with",
  "as", "are", "this", "by", "be", "at", "or", "from", "an", "was", "we", "can",
  "have", "has", "had", "not", "but", "what", "all", "were", "when", "there", "been",
  "if", "more", "will", "would", "so", "about", "up", "out", "into", "than", "them",
  "some", "could", "time", "very", "just", "now", "my", "me", "im", "i'm", "your",
  "do", "dont", "don't", "did", "didnt", "didn't", "know", "like", "get", "got",
  "go", "going", "went", "one", "too", "also", "how", "who", "why", "where", "which",
  "their", "they", "he", "she", "his", "her", "its", "it's", "our", "us", "am",
  "been", "being", "because", "still", "even", "here", "there", "then", "only",
  "really", "think", "want", "need", "see", "make", "made", "take", "come", "back",
  "well", "yeah", "yes", "no", "ok", "okay", "oh", "ah", "uh", "um", "tho", "though",
  "onna", "gonna", "wanna", "gotta", "let", "lets", "let's", "much", "many", "good",
  "right", "day", "today", "tomorrow", "yesterday", "something", "anything", "nothing",
  "everything", "someone", "anyone", "everyone", "after", "before", "over", "under",
  "again", "never", "always", "sometimes", "maybe", "probably", "actually", "literally",
  // Omission & system words to never surface as vocabulary/lore
  "media", "omitted", "image", "sticker", "video", "audio", "gif", "document",
  "contact", "card", "message", "deleted", "missed", "voice", "call", "null",
  "attached", "file", "https", "http", "www", "com", "tidak", "disertakan",
  // Indonesian stop words (for bilingual chats)
  "yang", "dan", "di", "ke", "dari", "ini", "itu", "dengan", "untuk",
  "bisa", "ada", "jadi", "kalau", "kalo", "aja", "saja", "udah", "sudah", "belum",
  "lagi", "mau", "गा", "gak", "ga", "nggak", "enggak", "iya", "ya", "yg", "aku",
  "kamu", "dia", "kita", "mereka", "sama", "buat", "tapi", "karena", "karna",
  "dah", "kan", "kok", "sih", "dong", "deh", "nih", "tuh", "gitu", "gini",
  "banget", "bgt", "apa", "gimana", "kenapa", "kapan", "mana", "siapa", "nya",
]);

const SUBTEXT_DICTIONARY: Record<string, { meaning: string; vibeTag: string }> = {
  "k": {
    meaning: "I am actively plotting my villain arc. Proceed with extreme caution.",
    vibeTag: "Danger Zone",
  },
  "ok": {
    meaning: "I acknowledge your statement, though I reserve the right to bring this up in 3 weeks.",
    vibeTag: "Neutral Chaos",
  },
  "okay": {
    meaning: "Conversation checkpoint reached. Waiting for you to say something entertaining.",
    vibeTag: "Polite Nod",
  },
  "haha": {
    meaning: "I smiled slightly at my screen, or I'm trying to keep the vibe from flatlining.",
    vibeTag: "Social Lubricant",
  },
  "hahaha": {
    meaning: "Wait, that was actually funny—you just earned +15 affection points.",
    vibeTag: "Genuine Laugh",
  },
  "lol": {
    meaning: "My face is completely straight right now, but I support your comedic effort.",
    vibeTag: "Classic Deflector",
  },
  "lmao": {
    meaning: "I exhaled sharply through my nose. Peak humor achieved.",
    vibeTag: "High Praise",
  },
  "wait": {
    meaning: "Brace yourself: incoming 6-message multi-part story with zero punctuation.",
    vibeTag: "Tea Incoming",
  },
  "otw": {
    meaning: "I am still in a towel staring at my closet and haven't called the ride yet.",
    vibeTag: "Time Distortion",
  },
  "idk": {
    meaning: "I definitely have a preference, I just want you to guess it on the first try.",
    vibeTag: "Mind Reader Test",
  },
  "fine": {
    meaning: "Narrator voice: It was, in fact, the exact opposite of fine.",
    vibeTag: "Code Red",
  },
  "nice": {
    meaning: "I am currently multitasking but want you to feel validated.",
    vibeTag: "Autopilot",
  },
  "real": {
    meaning: "I have no further commentary, we share the exact same braincell.",
    vibeTag: "Shared Braincell",
  },
  "true": {
    meaning: "Fact-checked and verified by the Situationship Bureau.",
    vibeTag: "Co-signed",
  },
  "bruh": {
    meaning: "I am speechless at the audacity of what I just read.",
    vibeTag: "Disbelief",
  },
  "omg": {
    meaning: "Drop everything immediately and give me the full unredacted lore.",
    vibeTag: "High Alert",
  },
  "yess": {
    meaning: "Extra 's' added specifically to prove I'm not being dry.",
    vibeTag: "Green Light",
  },
  "noo": {
    meaning: "Dramatic despair mixed with mild amusement.",
    vibeTag: "Melodrama",
  },
};

function formatNiceDate(timestamp: number): string {
  return NICE_DATE_FORMATTER.format(new Date(timestamp));
}

function formatTime12FromStr(timeStr: string): string {
  const parts = timeStr.split(":");
  const h = parseInt(parts[0] || "0", 10);
  const m = parts[1] || "00";
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${period}`;
}

function formatMessageTimestamp(timestamp: number, timeStr: string): string {
  return `${formatNiceDate(timestamp)} · ${formatTime12FromStr(timeStr)}`;
}

function formatHour12(hour: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:00 ${period}`;
}

function getSpeedBadge(medianMinutes: number): { badge: string; subtext: string } {
  if (medianMinutes <= 1.5) {
    return {
      badge: "Speed Demon ⚡",
      subtext: "Lives inside the chat screen. Notifications don't even finish buzzing.",
    };
  }
  if (medianMinutes <= 5) {
    return {
      badge: "Locked In 🎯",
      subtext: "Golden retriever energy. Always within arm's reach of the phone.",
    };
  }
  if (medianMinutes <= 18) {
    return {
      badge: "Cool & Collected 😎",
      subtext: "Balanced cadence. Replies fast enough to care, slow enough to have a life.",
    };
  }
  if (medianMinutes <= 60) {
    return {
      badge: "Professional Lag 🐢",
      subtext: "Mentally replies in 10 seconds, physically replies 42 minutes later.",
    };
  }
  return {
    badge: "Carrier Pigeon 🕊️",
    subtext: "Treats WhatsApp like 19th-century transatlantic postal correspondence.",
  };
}

// Fast character classification without RegExp/ICU property lookup overhead
function isWordCode(c: number): boolean {
  // ASCII a-z, A-Z, 0-9
  if (
    (c >= 97 && c <= 122) ||
    (c >= 65 && c <= 90) ||
    (c >= 48 && c <= 57)
  ) {
    return true;
  }
  // Latin-1 Supplement through international scripts (excluding general punctuation/emojis/surrogates >= 0x2000)
  if (c >= 192 && c < 0x2000 && c !== 215 && c !== 247) {
    return true;
  }
  return false;
}

export function tokenizeWordsFast(text: string, outBuffer?: string[]): string[] {
  const result = outBuffer || [];
  if (outBuffer) result.length = 0;

  const len = text.length;
  let i = 0;

  while (i < len) {
    const c = text.charCodeAt(i);
    if (!isWordCode(c)) {
      i++;
      continue;
    }

    const start = i;
    let allDigits = c >= 48 && c <= 57;
    let hasUpper = c >= 65 && c <= 90;
    i++;

    while (i < len) {
      const ch = text.charCodeAt(i);
      if (isWordCode(ch)) {
        if (ch < 48 || ch > 57) allDigits = false;
        if (ch >= 65 && ch <= 90) hasUpper = true;
        i++;
      } else if (
        (ch === 39 || ch === 8217) &&
        i + 1 < len &&
        isWordCode(text.charCodeAt(i + 1))
      ) {
        // Internal apostrophe (e.g. don't, it's)
        allDigits = false;
        i++;
      } else {
        break;
      }
    }

    const tokenLen = i - start;

    // Fast skip for http:// or https:// URLs
    if (
      (tokenLen === 4 || tokenLen === 5) &&
      i < len &&
      text.charCodeAt(i) === 58
    ) {
      const prefix = text.slice(start, i).toLowerCase();
      if (prefix === "http" || prefix === "https") {
        while (i < len && text.charCodeAt(i) > 32) i++;
        continue;
      }
    }

    if (tokenLen < 3 || allDigits) continue;

    const rawSlice = text.slice(start, i);
    const word = hasUpper || rawSlice.charCodeAt(0) > 127
      ? rawSlice.toLowerCase()
      : rawSlice;

    if (!STOP_WORDS.has(word)) {
      result.push(word);
    }
  }

  return result;
}

// Bounded 3-slot example tracker per phrase/word (stores raw message indices, zero arrays allocated)
interface PhraseStatEntry {
  id: number;
  id2?: number;
  you: number;
  them: number;
  idx0: number;
  idx1: number;
  idx2: number;
}

function cleanShortPhraseFast(text: string): string {
  let start = 0;
  let end = text.length;
  while (start < end) {
    const c = text.charCodeAt(start);
    if (c === 32 || c === 9 || c === 60 || c === 62) start++;
    else break;
  }
  while (end > start) {
    const c = text.charCodeAt(end - 1);
    if (
      c === 32 ||
      c === 9 ||
      c === 60 ||
      c === 62 ||
      c === 46 ||
      c === 33 ||
      c === 63 ||
      c === 44
    ) {
      end--;
    } else {
      break;
    }
  }
  if (start >= end) return "";
  return text.slice(start, end).toLowerCase();
}

function buildExamplesFromEntry(
  entry: PhraseStatEntry | undefined,
  messages: ParsedMessage[]
): PhraseExample[] {
  if (!entry) return [];
  const indices: number[] = [entry.idx0];
  if (entry.idx1 !== entry.idx0) {
    indices.push(entry.idx1);
  }
  if (entry.idx2 !== entry.idx1 && entry.idx2 !== entry.idx0) {
    indices.push(entry.idx2);
  }

  const examples: PhraseExample[] = [];
  for (let i = 0; i < indices.length; i++) {
    const m = messages[indices[i]];
    if (!m) continue;
    examples.push({
      sender: m.sender,
      text: m.text.length > 180 ? `${m.text.slice(0, 180).trim()}…` : m.text,
      timestamp: formatMessageTimestamp(m.timestamp, m.timeStr),
    });
  }
  return examples;
}

// Pre-allocated typed arrays for L2-cache-resident 1st-occurrence bigram filtering
const BIGRAM_FILTER_BITS = 18;
const BIGRAM_FILTER_SIZE = 1 << BIGRAM_FILTER_BITS; // 262,144 slots
const BIGRAM_FILTER_MASK = BIGRAM_FILTER_SIZE - 1;
const seenBgWord1 = new Int32Array(BIGRAM_FILTER_SIZE);
const seenBgWord2 = new Int32Array(BIGRAM_FILTER_SIZE);
const seenBgMeta = new Int32Array(BIGRAM_FILTER_SIZE);
const reusableTokenList: string[] = [];
const reusableWordIds: number[] = [];

export function analyzeChatMessages(
  messages: ParsedMessage[],
  preferredYouName?: string
): ChatWrappedAnalysis {
  if (messages.length === 0) {
    throw new Error("No valid chat messages found in this file.");
  }

  // Only copy + sort if timestamps are not already in non-decreasing order
  let isSorted = true;
  for (let i = 1; i < messages.length; i++) {
    if (messages[i].timestamp < messages[i - 1].timestamp) {
      isSorted = false;
      break;
    }
  }
  const sorted = isSorted
    ? messages
    : [...messages].sort((a, b) => a.timestamp - b.timestamp);

  // Identify top 2 participants
  const senderCounts = new Map<string, number>();
  for (let i = 0; i < sorted.length; i++) {
    const s = sorted[i].sender;
    senderCounts.set(s, (senderCounts.get(s) || 0) + 1);
  }

  const rankedSenders = Array.from(senderCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map((e) => e[0]);

  const firstSender = rankedSenders[0] || "You";
  const secondSender = rankedSenders[1] || "Them";

  let defaultYou = firstSender;
  let defaultThem = secondSender;

  if (
    rankedSenders.length >= 2 &&
    (rankedSenders[1].toLowerCase() === "you" ||
      rankedSenders[1].toLowerCase() === "anda")
  ) {
    defaultYou = rankedSenders[1];
    defaultThem = rankedSenders[0];
  }

  let youName = defaultYou;
  let themName = defaultThem;
  let isSwapped = false;

  if (preferredYouName) {
    if (preferredYouName === defaultThem) {
      youName = defaultThem;
      themName = defaultYou;
      isSwapped = true;
    } else {
      youName = defaultYou;
      themName = defaultThem;
      isSwapped = false;
    }
  }

  const partnerName = defaultThem;

  // Filter to our two main participants (skip copy if only <= 2 senders exist)
  const activeMessages =
    senderCounts.size <= 2
      ? sorted
      : sorted.filter((m) => m.sender === youName || m.sender === themName);

  const totalMessages = activeMessages.length;
  const firstTimestamp = activeMessages[0].timestamp;
  const lastTimestamp = activeMessages[totalMessages - 1].timestamp;
  const totalDaysSpan = Math.max(
    1,
    Math.ceil((lastTimestamp - firstTimestamp) / (1000 * 60 * 60 * 24))
  );

  const uniqueDates = new Set<string>();
  const hourBuckets = new Array(24).fill(0);
  const dayBuckets = new Array(7).fill(0);

  // Per-participant accumulators
  const statsMap = {
    [youName]: {
      messageCount: 0,
      wordCount: 0,
      charCount: 0,
      mediaCount: 0,
      deletedCount: 0,
      replyLatenciesMin: [] as number[],
      initiationsCount: 0,
      ghostsCaused: 0,
      doubleTextStreaks: 0,
      maxConsecutive: 0,
      lateNightCount: 0,
      shortPhraseFreq: new Map<string, number>(),
      singleLetterReplies: 0,
    },
    [themName]: {
      messageCount: 0,
      wordCount: 0,
      charCount: 0,
      mediaCount: 0,
      deletedCount: 0,
      replyLatenciesMin: [] as number[],
      initiationsCount: 0,
      ghostsCaused: 0,
      doubleTextStreaks: 0,
      maxConsecutive: 0,
      lateNightCount: 0,
      shortPhraseFreq: new Map<string, number>(),
      singleLetterReplies: 0,
    },
  };

  // Unified single-pass word & integer-keyed bigram stats with bounded 3-example message indices
  const wordStats = new Map<string, PhraseStatEntry>();
  const idToWord: string[] = [];
  const bigramStats = new Map<number, PhraseStatEntry>();
  seenBgWord1.fill(0);
  seenBgWord2.fill(0);
  seenBgMeta.fill(0);

  // Timeline buckets aggregated in the same single pass without new Date() / toLocaleDateString()
  const useDailyOrWeekly = totalDaysSpan <= 45;
  const monthBucketsMap = new Map<
    string,
    { label: string; shortLabel: string; count: number; youCount: number; themCount: number }
  >();

  // First two non-omitted messages for Card 01
  let firstTextMsg: ParsedMessage | null = null;
  let secondTextMsg: ParsedMessage | null = null;

  // Longest message tracking for Card 08
  let longestByYou: ParsedMessage | null = null;
  let longestByThem: ParsedMessage | null = null;

  // Left on Read (12+ hours gap where same person texts again) for Card 09
  let worstGhostHours = 0;
  let worstGhoster = themName;
  let worstVictim = youName;
  let worstGhostTimestamp = firstTimestamp;
  let worstGhostSnippet = "";

  // Longest silence gap between messages for Card 13
  let longestSilenceHours = 0;
  let longestSilenceStartTs = firstTimestamp;
  let longestSilenceEndTs = firstTimestamp;
  let longestSilenceLastSender = youName;
  let longestSilenceLastMsg = activeMessages[0].text;
  let longestSilenceBreakerSender = themName;
  let longestSilenceBreakerMsg = activeMessages[0].text;

  let currentStreakSender = "";
  let currentStreakLength = 0;
  let lastSeenDateStr = "";
  let lastTimelineKey = "";
  let lastTimelineBucket: {
    label: string;
    shortLabel: string;
    count: number;
    youCount: number;
    themCount: number;
  } | null = null;

  for (let i = 0; i < totalMessages; i++) {
    const msg = activeMessages[i];
    const isYou = msg.sender === youName;
    const sender = isYou ? youName : themName;
    const other = isYou ? themName : youName;
    const pStat = statsMap[sender];

    const dStr = msg.dateStr; // YYYY-MM-DD
    if (dStr !== lastSeenDateStr) {
      lastSeenDateStr = dStr;
      uniqueDates.add(dStr);

      const tKey = useDailyOrWeekly
        ? `${dStr.slice(0, 8)}${String(Math.ceil(parseInt(dStr.slice(8, 10), 10) / 3)).padStart(2, "0")}`
        : dStr.slice(0, 7);

      if (tKey !== lastTimelineKey || !lastTimelineBucket) {
        lastTimelineKey = tKey;
        let tBucket = monthBucketsMap.get(tKey);
        if (tBucket === undefined) {
          const monthIdx = Math.max(
            0,
            Math.min(11, parseInt(dStr.slice(5, 7), 10) - 1)
          );
          const monthName = SHORT_MONTHS[monthIdx];
          let label: string;
          let shortLabel: string;
          if (useDailyOrWeekly) {
            const dayNum = parseInt(dStr.slice(8, 10), 10);
            label = `${monthName} ${dayNum}`;
            shortLabel = `${monthName} ${dayNum}`;
          } else {
            const yr = dStr.slice(2, 4);
            label = `${monthName} '${yr}`;
            shortLabel = monthName;
          }
          tBucket = { label, shortLabel, count: 0, youCount: 0, themCount: 0 };
          monthBucketsMap.set(tKey, tBucket);
        }
        lastTimelineBucket = tBucket;
      }
    }

    if (lastTimelineBucket) {
      lastTimelineBucket.count++;
      if (isYou) lastTimelineBucket.youCount++;
      else lastTimelineBucket.themCount++;
    }

    hourBuckets[msg.hour]++;
    dayBuckets[msg.dayOfWeek]++;

    pStat.messageCount++;
    pStat.wordCount += msg.wordCount;
    pStat.charCount += msg.charCount;

    if (msg.isMedia) pStat.mediaCount++;
    if (msg.isDeleted) pStat.deletedCount++;
    if (msg.hour >= 23 || msg.hour <= 4) pStat.lateNightCount++;

    // Track consecutive streak
    if (sender === currentStreakSender) {
      currentStreakLength++;
    } else {
      currentStreakSender = sender;
      currentStreakLength = 1;
    }
    if (currentStreakLength === 3) {
      pStat.doubleTextStreaks++;
    }
    if (currentStreakLength > pStat.maxConsecutive) {
      pStat.maxConsecutive = currentStreakLength;
    }

    // Fast-exit omitted media / deleted / empty messages before word tokenization & n-grams
    const isOmitted = msg.isMedia || msg.isDeleted || msg.wordCount === 0;

    if (!isOmitted) {
      if (firstTextMsg === null) {
        firstTextMsg = msg;
      } else if (secondTextMsg === null) {
        secondTextMsg = msg;
      }

      if (isYou) {
        if (!longestByYou || msg.charCount > longestByYou.charCount) {
          longestByYou = msg;
        }
      } else {
        if (!longestByThem || msg.charCount > longestByThem.charCount) {
          longestByThem = msg;
        }
      }

      // Short phrase check (only for short messages <= 3 words and <= 24 chars)
      if (msg.wordCount <= 3 && msg.charCount <= 24) {
        const trimmedLower = cleanShortPhraseFast(msg.text);
        const tLen = trimmedLower.length;

        if (tLen === 1 || trimmedLower === "ok" || trimmedLower === "k") {
          pStat.singleLetterReplies++;
        }
        if (isYou === false && tLen >= 1 && tLen <= 18) {
          pStat.shortPhraseFreq.set(
            trimmedLower,
            (pStat.shortPhraseFreq.get(trimmedLower) || 0) + 1
          );
        }
      }

      // Single-pass word & integer-keyed bigram counting with bounded 3-slot example indices
      const tokens = tokenizeWordsFast(msg.text, reusableTokenList);
      const tokenLen = tokens.length;
      reusableWordIds.length = tokenLen;

      for (let t = 0; t < tokenLen; t++) {
        const w = tokens[t];
        let wEntry = wordStats.get(w);
        if (wEntry === undefined) {
          const newId = idToWord.length;
          idToWord.push(w);
          wEntry = {
            id: newId,
            you: isYou ? 1 : 0,
            them: isYou ? 0 : 1,
            idx0: i,
            idx1: i,
            idx2: i,
          };
          wordStats.set(w, wEntry);
        } else {
          if (isYou) wEntry.you++;
          else wEntry.them++;
          const tot = wEntry.you + wEntry.them;
          if (tot === 2) {
            wEntry.idx1 = i;
            wEntry.idx2 = i;
          } else if (i !== wEntry.idx2) {
            if ((tot & 1) === 0) wEntry.idx1 = wEntry.idx2;
            wEntry.idx2 = i;
          }
        }
        reusableWordIds[t] = wEntry.id;
      }

      for (let t = 0; t < tokenLen - 1; t++) {
        const id1 = reusableWordIds[t];
        const id2 = reusableWordIds[t + 1];
        const tag1 = id1 + 1;
        const tag2 = id2 + 1;
        // Pure 32-bit Smi hash into L2-cache-resident Int32Array filter
        const slot = (Math.imul(id1, 16777619) ^ id2) & BIGRAM_FILTER_MASK;
        const slotW1 = seenBgWord1[slot];

        if (slotW1 === -tag1 && seenBgWord2[slot] === tag2) {
          // 3rd+ occurrence: already promoted into bigramStats
          const bgEntry = bigramStats.get(slot);
          if (bgEntry !== undefined) {
            if (isYou) bgEntry.you++;
            else bgEntry.them++;
            const tot = bgEntry.you + bgEntry.them;
            if (i !== bgEntry.idx2) {
              if ((tot & 1) === 0) bgEntry.idx1 = bgEntry.idx2;
              bgEntry.idx2 = i;
            }
          }
        } else if (slotW1 === tag1 && seenBgWord2[slot] === tag2) {
          // 2nd occurrence: promote into bigramStats keyed by 18-bit Smi `slot`
          seenBgWord1[slot] = -tag1;
          const firstPacked = seenBgMeta[slot];
          const firstIdx = firstPacked >>> 1;
          const firstWasYou = (firstPacked & 1) === 1;
          bigramStats.set(slot, {
            id: id1,
            id2,
            you: (firstWasYou ? 1 : 0) + (isYou ? 1 : 0),
            them: (firstWasYou ? 0 : 1) + (isYou ? 0 : 1),
            idx0: firstIdx,
            idx1: i,
            idx2: i,
          });
        } else if (slotW1 >= 0) {
          // 1st occurrence (only claim slot if not already holding a promoted bigram)
          seenBgWord1[slot] = tag1;
          seenBgWord2[slot] = tag2;
          seenBgMeta[slot] = (i << 1) | (isYou ? 1 : 0);
        }
      }
    }

    // Compare with previous message for gaps, initiations, reply times, and ghosting
    if (i === 0) {
      pStat.initiationsCount++;
    } else {
      const prev = activeMessages[i - 1];
      const prevSender = prev.sender === youName ? youName : themName;
      const deltaMs = Math.max(0, msg.timestamp - prev.timestamp);
      const deltaMinutes = deltaMs / 60000;
      const deltaHours = deltaMinutes / 60;

      // Conversation Initiation: gap >= 5 hours (300 mins)
      if (deltaHours >= 5) {
        pStat.initiationsCount++;
      }

      // Reply Latency: different sender within 6 hours (360 mins)
      if (sender !== prevSender && deltaMinutes > 0 && deltaMinutes <= 360) {
        pStat.replyLatenciesMin.push(deltaMinutes);
      }

      // Left On Read: same sender double-texts after >= 12 hours of silence
      if (sender === prevSender && deltaHours >= 12) {
        statsMap[other].ghostsCaused++;
        if (deltaHours > worstGhostHours && !isOmitted) {
          worstGhostHours = deltaHours;
          worstGhoster = other;
          worstVictim = sender;
          worstGhostTimestamp = msg.timestamp;
          worstGhostSnippet = msg.text.slice(0, 90);
        }
      }

      // Longest silence gap (store raw epoch timestamps during loop; format once at end)
      if (deltaHours > longestSilenceHours) {
        longestSilenceHours = deltaHours;
        longestSilenceStartTs = prev.timestamp;
        longestSilenceEndTs = msg.timestamp;
        longestSilenceLastSender = prevSender;
        longestSilenceLastMsg =
          prev.isMedia || prev.isDeleted || prev.wordCount === 0
            ? "Sent a media attachment"
            : prev.text.slice(0, 85);
        longestSilenceBreakerSender = sender;
        longestSilenceBreakerMsg =
          isOmitted ? "Sent a media attachment" : msg.text.slice(0, 85);
      }
    }
  }

  // Extract top words per participant & shared signature words in a single pass over wordStats
  const youWordsList: WordFrequency[] = [];
  const themWordsList: WordFrequency[] = [];
  const sharedWordCandidates: {
    phrase: string;
    totalCount: number;
    youCount: number;
    themCount: number;
    entry: PhraseStatEntry;
  }[] = [];

  for (const [word, entry] of wordStats.entries()) {
    if (entry.you > 0) {
      youWordsList.push({ word, count: entry.you });
    }
    if (entry.them > 0) {
      themWordsList.push({ word, count: entry.them });
    }
    if (entry.you >= 2 && entry.them >= 2) {
      sharedWordCandidates.push({
        phrase: word,
        totalCount: entry.you + entry.them,
        youCount: entry.you,
        themCount: entry.them,
        entry,
      });
    }
  }

  youWordsList.sort((a, b) => b.count - a.count);
  themWordsList.sort((a, b) => b.count - a.count);
  const youTopWords = youWordsList.slice(0, 8);
  const themTopWords = themWordsList.slice(0, 8);

  // Helper to compute median & average reply time
  function computeReplyStats(latencies: number[]): { median: number; avg: number } {
    if (latencies.length === 0) return { median: 4.0, avg: 8.5 };
    const sortedLat = [...latencies].sort((a, b) => a - b);
    const mid = Math.floor(sortedLat.length / 2);
    const median =
      sortedLat.length % 2 !== 0
        ? sortedLat[mid]
        : (sortedLat[mid - 1] + sortedLat[mid]) / 2;
    let sum = 0;
    for (let i = 0; i < sortedLat.length; i++) sum += sortedLat[i];
    return {
      median: Math.max(0.5, Number(median.toFixed(1))),
      avg: Math.max(0.5, Number((sum / sortedLat.length).toFixed(1))),
    };
  }

  const totalInitiations = Math.max(
    1,
    statsMap[youName].initiationsCount + statsMap[themName].initiationsCount
  );

  function buildParticipantMetrics(
    name: string,
    topWords: WordFrequency[]
  ): ParticipantMetrics {
    const raw = statsMap[name];
    const reply = computeReplyStats(raw.replyLatenciesMin);
    const speedInfo = getSpeedBadge(reply.median);
    const percentage = Math.round(
      (raw.messageCount / Math.max(1, totalMessages)) * 100
    );
    const initiationPercentage = Math.round(
      (raw.initiationsCount / totalInitiations) * 100
    );
    const avgWordsPerMessage =
      raw.messageCount > 0
        ? Number((raw.wordCount / raw.messageCount).toFixed(1))
        : 0;
    const lateNightPercentage =
      raw.messageCount > 0
        ? Math.round((raw.lateNightCount / raw.messageCount) * 100)
        : 0;

    // Interest Score (0-100)
    const velocityScore = Math.round(
      Math.max(25, Math.min(99, 100 - Math.log1p(reply.median) * 18))
    );
    const initiationScore = Math.min(
      99,
      Math.max(30, initiationPercentage + 25)
    );
    const effortScore = Math.min(
      99,
      Math.max(35, Math.round(avgWordsPerMessage * 9.5))
    );
    const doubleTextRate =
      (raw.doubleTextStreaks / Math.max(1, raw.messageCount)) * 100;
    const doubleTextScore = Math.min(
      99,
      Math.max(35, Math.round(45 + doubleTextRate * 14))
    );

    const interestScore = Math.min(
      99,
      Math.max(
        32,
        Math.round(
          velocityScore * 0.3 +
            initiationScore * 0.25 +
            effortScore * 0.25 +
            doubleTextScore * 0.2
        )
      )
    );

    // Attachment Style classification
    const anxietyAxis = Math.max(
      -90,
      Math.min(
        90,
        Math.round(
          (initiationPercentage - 50) * 1.4 +
            (doubleTextRate - 2.5) * 12 +
            (lateNightPercentage - 12) * 1.5
        )
      )
    );
    const avoidanceAxis = Math.max(
      -90,
      Math.min(
        90,
        Math.round(
          (reply.median - 10) * 1.8 +
            raw.ghostsCaused * 8 -
            (avgWordsPerMessage - 5) * 5
        )
      )
    );

    let attType: ParticipantMetrics["attachmentStyle"]["type"] = "Secure";
    let tagline = "Consistent, warm, and emotionally regulated texter";
    let description =
      "Replies at a healthy pace, initiates without keeping score, and doesn't panic during quiet hours.";

    if (anxietyAxis > 18 && avoidanceAxis <= 15) {
      attType = "Anxious-Preoccupied";
      tagline = "High-frequency double-texter with elite enthusiasm";
      description =
        "Carries the conversation momentum, sends rapid-fire bursts at night, and notices a 20-minute shift in tone.";
    } else if (avoidanceAxis > 15 && anxietyAxis <= 18) {
      attType = "Dismissive-Avoidant";
      tagline = "Mysterious lone wolf who guards their notification peace";
      description =
        "Keeps messages concise, disappears into side-quests for hours, yet always eventually resurfaces.";
    } else if (anxietyAxis > 18 && avoidanceAxis > 15) {
      attType = "Fearful-Avoidant";
      tagline = "Hot-and-cold enigma: 20 texts in 2 minutes, then vanishes";
      description =
        "Alternates between deep 2:00 AM oversharing sessions and sudden multi-hour radio silence.";
    }

    return {
      name,
      messageCount: raw.messageCount,
      percentage,
      wordCount: raw.wordCount,
      avgWordsPerMessage,
      charCount: raw.charCount,
      mediaCount: raw.mediaCount,
      deletedCount: raw.deletedCount,
      medianReplyMinutes: reply.median,
      avgReplyMinutes: reply.avg,
      speedBadge: speedInfo.badge,
      speedSubtext: speedInfo.subtext,
      initiationsCount: raw.initiationsCount,
      initiationPercentage,
      topWords,
      ghostIncidentsCaused: raw.ghostsCaused,
      doubleTextStreaks: raw.doubleTextStreaks,
      maxConsecutiveMessages: raw.maxConsecutive,
      lateNightPercentage,
      interestScore,
      interestBreakdown: {
        velocityScore,
        initiationScore,
        effortScore,
        doubleTextScore,
      },
      attachmentStyle: {
        type: attType,
        tagline,
        description,
        anxietyAxis,
        avoidanceAxis,
      },
    };
  }

  const youMetrics = buildParticipantMetrics(youName, youTopWords);
  const themMetrics = buildParticipantMetrics(themName, themTopWords);
  // Ensure percentages sum to 100
  themMetrics.percentage = Math.max(0, 100 - youMetrics.percentage);
  themMetrics.initiationPercentage = Math.max(
    0,
    100 - youMetrics.initiationPercentage
  );

  // Card 1: First Message
  const resolvedFirstMsg = firstTextMsg || activeMessages[0];
  const firstMessage: FirstMessageData = {
    sender: resolvedFirstMsg.sender,
    text: resolvedFirstMsg.text,
    timestamp: resolvedFirstMsg.timestamp,
    formattedDate: formatNiceDate(resolvedFirstMsg.timestamp),
    formattedTime: resolvedFirstMsg.timeStr,
    daysAgo: Math.max(
      1,
      Math.floor(
        (Date.now() - resolvedFirstMsg.timestamp) / (1000 * 60 * 60 * 24)
      )
    ),
    secondMessage: secondTextMsg
      ? {
          sender: secondTextMsg.sender,
          text: secondTextMsg.text,
          formattedTime: secondTextMsg.timeStr,
        }
      : undefined,
  };

  // Card 7: Shared Lore ("Only You Two Say This")
  // Format timestamps ONLY for the final selected top phrases (max 12-18 date strings formatted total!)
  const sortedBigrams: { entry: PhraseStatEntry; total: number }[] = [];
  for (const entry of bigramStats.values()) {
    if (entry.you >= 1 && entry.them >= 1) {
      const total = entry.you + entry.them;
      if (total >= 2) {
        sortedBigrams.push({ entry, total });
      }
    }
  }
  sortedBigrams.sort((a, b) => b.total - a.total);

  const sharedLore: SharedLoreItem[] = [];
  for (const item of sortedBigrams.slice(0, 4)) {
    const id1 = item.entry.id;
    const id2 = item.entry.id2 ?? 0;
    const phrase = `${idToWord[id1] || ""} ${idToWord[id2] || ""}`.trim();
    sharedLore.push({
      phrase,
      totalCount: item.total,
      youCount: item.entry.you,
      themCount: item.entry.them,
      category: "Inside Phrase",
      examples: buildExamplesFromEntry(item.entry, activeMessages),
    });
  }

  sharedWordCandidates.sort((a, b) => b.totalCount - a.totalCount);
  const sharedWords: SharedLoreItem[] = [];
  const neededSharedWords = Math.max(0, 6 - sharedLore.length);
  for (const item of sharedWordCandidates.slice(0, neededSharedWords)) {
    sharedWords.push({
      phrase: item.phrase,
      totalCount: item.totalCount,
      youCount: item.youCount,
      themCount: item.themCount,
      category: "Signature Word",
      examples: buildExamplesFromEntry(item.entry, activeMessages),
    });
  }

  const combinedLore = [...sharedLore, ...sharedWords].slice(0, 6);
  if (combinedLore.length === 0) {
    const fallbackWords = [...youMetrics.topWords, ...themMetrics.topWords].slice(
      0,
      5
    );
    fallbackWords.forEach((fw, idx) => {
      const entry = wordStats.get(fw.word);
      combinedLore.push({
        phrase: fw.word,
        totalCount: fw.count,
        youCount: idx % 2 === 0 ? fw.count : Math.ceil(fw.count / 2),
        themCount: idx % 2 === 1 ? fw.count : Math.floor(fw.count / 2),
        category: "Shared Vibe",
        examples: buildExamplesFromEntry(entry, activeMessages),
      });
    });
  }

  // Card 8: Longest Message ("The Yap Award")
  const allValidMsgs = [longestByYou, longestByThem].filter(
    (m): m is ParsedMessage => m !== null
  );
  allValidMsgs.sort((a, b) => b.charCount - a.charCount);
  const winnerMsg = allValidMsgs[0] || resolvedFirstMsg;
  const runnerUpMsg = allValidMsgs[1] || winnerMsg;

  const longestMessage: LongestMessageData = {
    sender: winnerMsg.sender,
    text: winnerMsg.text,
    wordCount: Math.max(1, winnerMsg.wordCount),
    charCount: Math.max(1, winnerMsg.charCount),
    formattedDate: formatNiceDate(winnerMsg.timestamp),
    formattedTime: winnerMsg.timeStr,
    runnerUpSender:
      runnerUpMsg.sender === winnerMsg.sender
        ? winnerMsg.sender === youName
          ? themName
          : youName
        : runnerUpMsg.sender,
    runnerUpWordCount:
      runnerUpMsg === winnerMsg
        ? Math.max(1, Math.floor(winnerMsg.wordCount * 0.6))
        : runnerUpMsg.wordCount,
  };

  // Card 9: Left On Read
  const leftOnRead: LeftOnReadData = {
    totalIncidents:
      youMetrics.ghostIncidentsCaused + themMetrics.ghostIncidentsCaused,
    youLeftThemCount: youMetrics.ghostIncidentsCaused,
    themLeftYouCount: themMetrics.ghostIncidentsCaused,
    worstIncident:
      worstGhostHours > 0
        ? {
            ghoster: worstGhoster,
            victim: worstVictim,
            hoursIgnored: Math.round(worstGhostHours),
            formattedDate: formatNiceDate(worstGhostTimestamp),
            doubleTextSnippet: worstGhostSnippet,
          }
        : {
            ghoster:
              themMetrics.medianReplyMinutes >= youMetrics.medianReplyMinutes
                ? themName
                : youName,
            victim:
              themMetrics.medianReplyMinutes >= youMetrics.medianReplyMinutes
                ? youName
                : themName,
            hoursIgnored: Math.max(
              4,
              Math.round(
                Math.max(
                  themMetrics.avgReplyMinutes,
                  youMetrics.avgReplyMinutes
                ) / 10
              )
            ),
            formattedDate: formatNiceDate(lastTimestamp),
            doubleTextSnippet: "Wait did you fall asleep or get kidnapped??",
          },
  };

  // Card 13: Longest Silence (format dates once at the end)
  const longestSilence: SilenceGapData = {
    days: Math.floor(longestSilenceHours / 24),
    hours: Math.round(longestSilenceHours % 24),
    startDate: formatNiceDate(longestSilenceStartTs),
    endDate: formatNiceDate(longestSilenceEndTs),
    lastSenderBeforeSilence: longestSilenceLastSender,
    lastMessageBeforeSilence: longestSilenceLastMsg,
    breakerSender: longestSilenceBreakerSender,
    breakerMessage: longestSilenceBreakerMsg,
  };

  // Card 12: Red Flags Checklist
  const slowerPerson =
    themMetrics.avgReplyMinutes >= youMetrics.avgReplyMinutes
      ? themMetrics
      : youMetrics;
  const nightOwl =
    themMetrics.lateNightPercentage >= youMetrics.lateNightPercentage
      ? themMetrics
      : youMetrics;
  const deleter =
    themMetrics.deletedCount >= youMetrics.deletedCount
      ? themMetrics
      : youMetrics;
  const doubleTexter =
    themMetrics.doubleTextStreaks >= youMetrics.doubleTextStreaks
      ? themMetrics
      : youMetrics;
  const dryCandidate =
    themMetrics.avgWordsPerMessage <= youMetrics.avgWordsPerMessage
      ? themMetrics
      : youMetrics;

  const redFlags: RedFlagItem[] = [
    {
      id: "hot-cold-velocity",
      title: "Replies in 10 seconds, then vanishes into the shadow realm",
      culprit: slowerPerson.name,
      evidence: `Median reply is ${slowerPerson.medianReplyMinutes}m, but Longest Silence hit ${longestSilence.days}d ${longestSilence.hours}h`,
      severity: "High",
      triggered:
        longestSilence.days >= 1 || slowerPerson.avgReplyMinutes > 15,
    },
    {
      id: "late-night-philosopher",
      title: "Unfiltered 2:00 AM oversharing hours",
      culprit: nightOwl.name,
      evidence: `${nightOwl.lateNightPercentage}% of all their messages are sent between 11 PM and 4 AM`,
      severity: "Spicy",
      triggered: nightOwl.lateNightPercentage >= 8,
    },
    {
      id: "double-text-barrage",
      title: "Treats the 'Send' button like a comma",
      culprit: doubleTexter.name,
      evidence: `${doubleTexter.doubleTextStreaks} rapid-fire bursts (peak streak: ${doubleTexter.maxConsecutiveMessages} texts in a row)`,
      severity: "Medium",
      triggered:
        doubleTexter.doubleTextStreaks >= 2 ||
        doubleTexter.maxConsecutiveMessages >= 3,
    },
    {
      id: "evidence-tampering",
      title: "Deletes messages before the witness can screenshot",
      culprit: deleter.name,
      evidence: `${deleter.deletedCount} revoked messages ("This message was deleted")`,
      severity: "Spicy",
      triggered: deleter.deletedCount >= 1,
    },
    {
      id: "minimalist-replier",
      title: "Allergic to full sentences during weekday afternoons",
      culprit: dryCandidate.name,
      evidence: `Averages ${dryCandidate.avgWordsPerMessage} words/text with ${statsMap[dryCandidate.name].singleLetterReplies} ultra-short replies`,
      severity: "Medium",
      triggered:
        dryCandidate.avgWordsPerMessage < 7.5 ||
        statsMap[dryCandidate.name].singleLetterReplies >= 2,
    },
  ];

  // Card 14: What [Them] Really Means
  const themShortEntries = Array.from(
    statsMap[themName].shortPhraseFreq.entries()
  ).sort((a, b) => b[1] - a[1]);

  const translations: TranslationItem[] = [];
  const usedOriginals = new Set<string>();

  for (const [phrase, count] of themShortEntries) {
    if (translations.length >= 4) break;
    const known = SUBTEXT_DICTIONARY[phrase];
    if (known) {
      usedOriginals.add(phrase);
      translations.push({
        original: `"${phrase}"`,
        count,
        meaning: known.meaning,
        vibeTag: known.vibeTag,
      });
    }
  }

  for (const [phrase, count] of themShortEntries) {
    if (translations.length >= 3) break;
    if (usedOriginals.has(phrase)) continue;
    if (
      OMITTED_KEYWORD_REGEX.test(phrase) ||
      isOmittedOrSystemPlaceholder(phrase)
    ) {
      continue;
    }
    usedOriginals.add(phrase);
    translations.push({
      original: `"${phrase}"`,
      count,
      meaning: `Code for: "I want to keep texting you without overthinking my reply."`,
      vibeTag: "Signature Reply",
    });
  }

  const fallbackKeys = ["haha", "wait", "otw", "ok"];
  for (const key of fallbackKeys) {
    if (translations.length >= 3) break;
    if (usedOriginals.has(key)) continue;
    usedOriginals.add(key);
    translations.push({
      original: `"${key}"`,
      count: Math.max(3, Math.round(themMetrics.messageCount * 0.04)),
      meaning: SUBTEXT_DICTIONARY[key].meaning,
      vibeTag: SUBTEXT_DICTIONARY[key].vibeTag,
    });
  }

  // Card 15: Timeline
  let timeline: TimelineBucket[] = Array.from(monthBucketsMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, v]) => v);

  if (timeline.length > 12) {
    const step = timeline.length / 12;
    const compressed: TimelineBucket[] = [];
    for (let i = 0; i < 12; i++) {
      const slice = timeline.slice(
        Math.floor(i * step),
        Math.floor((i + 1) * step)
      );
      if (slice.length > 0) {
        compressed.push({
          label: slice[0].label,
          shortLabel: slice[0].shortLabel,
          count: slice.reduce((s, x) => s + x.count, 0),
          youCount: slice.reduce((s, x) => s + x.youCount, 0),
          themCount: slice.reduce((s, x) => s + x.themCount, 0),
        });
      }
    }
    timeline = compressed;
  }

  let peakIdx = 0;
  let dryIdx = 0;
  timeline.forEach((b, idx) => {
    if (b.count > timeline[peakIdx].count) peakIdx = idx;
    if (b.count < timeline[dryIdx].count) dryIdx = idx;
  });

  if (timeline[0]) timeline[0].phase = "Honeymoon";
  if (timeline[peakIdx]) timeline[peakIdx].phase = "The Peak";
  if (timeline[dryIdx] && dryIdx !== peakIdx)
    timeline[dryIdx].phase = "Dry Spell";
  if (timeline[timeline.length - 1] && timeline.length - 1 !== peakIdx) {
    timeline[timeline.length - 1].phase = "Current";
  }

  const lastCount = timeline[timeline.length - 1]?.count || 0;
  const prevCount =
    timeline[Math.max(0, timeline.length - 2)]?.count || lastCount;
  const currentTrend: ChatWrappedAnalysis["timelineStats"]["currentTrend"] =
    lastCount > prevCount * 1.15
      ? "Rising"
      : lastCount < prevCount * 0.75
      ? "Cooling"
      : "Steady";

  // Card 16: Final Verdict & The Move
  const mutualInterestScore = Math.round(
    (youMetrics.interestScore + themMetrics.interestScore) / 2
  );
  const balanceScore =
    100 - Math.abs(youMetrics.percentage - themMetrics.percentage);
  const compatibilityScore = Math.min(
    99,
    Math.max(62, Math.round(mutualInterestScore * 0.65 + balanceScore * 0.35))
  );

  let grade: FinalVerdictData["grade"] = "A";
  let archetype = "Certified Yap Co-Pilots";
  let summaryQuote =
    "High chemistry, matching banter velocity, and just enough chaos to keep the notifications exciting.";
  let theMoveTitle = "Send Card #7 & Double Down";
  let theMoveDescription =
    "Use your shared inside jokes as an excuse to suggest coffee, dinner, or a spontaneous late-night drive.";
  let stepOneTargetCard = 7;

  if (compatibilityScore >= 88) {
    grade = "A+";
    archetype = "Main Character Soulmates";
    summaryQuote =
      "Reciprocal effort, rapid-fire banter, and a shared vocabulary nobody else on earth could decode.";
    theMoveTitle = "Send Card #7 & Plan Something Iconic";
    theMoveDescription =
      "Your shared inside phrases are elite. Send Card #7 ('Only You Two Say This') and lock in Friday night.";
    stepOneTargetCard = 7;
  } else if (compatibilityScore >= 80) {
    grade = "A";
    archetype = "High-Voltage Banter Duo";
    summaryQuote =
      "One of you carries the late-night chaos while the other brings the comedic timing—and it works effortlessly.";
    theMoveTitle = "Send Card #7 & Double Down";
    theMoveDescription =
      "Use your shared inside jokes as an excuse to suggest coffee, dinner, or a spontaneous late-night drive.";
    stepOneTargetCard = 7;
  } else if (compatibilityScore >= 72) {
    grade = "B+";
    archetype = "Slow-Burn Cinema";
    summaryQuote =
      "Bursts of deep 2-hour texting marathons interrupted by mysterious side-quests and delayed replies.";
    theMoveTitle = "Send Card #7 & Break the Lag Cycle";
    theMoveDescription =
      "Revisit your shared inside phrases on Card #7 and drop a spontaneous voice note instead of waiting.";
    stepOneTargetCard = 7;
  } else {
    grade = "B";
    archetype = "Situationship Olympics";
    summaryQuote =
      "Unpredictable reply latencies, dramatic silence gaps, and undeniable tension every time the phone lights up.";
    theMoveTitle = "Send Card #13 ('Blocked You?!') as a Power Move";
    theMoveDescription =
      "Call the bluff with the 'Blocked You' card. How they reply in the next 10 minutes tells you everything.";
    stepOneTargetCard = 13;
  }

  const peakHour = hourBuckets.indexOf(Math.max(...hourBuckets));
  const DAYS_NAMES = [
    "Sundays",
    "Mondays",
    "Tuesdays",
    "Wednesdays",
    "Thursdays",
    "Fridays",
    "Saturdays",
  ];
  const peakDayOfWeek = DAYS_NAMES[dayBuckets.indexOf(Math.max(...dayBuckets))];

  const hasSubtextPhrase =
    translations.length > 0 && Boolean(translations[0]?.original);
  const retireWord = hasSubtextPhrase
    ? translations[0].original.replace(/"/g, "")
    : youMetrics.topWords[0]?.word || "okay";
  const stepThreeTargetCard = hasSubtextPhrase ? 14 : 6;

  const verdict: FinalVerdictData = {
    archetype,
    grade,
    compatibilityScore,
    summaryQuote,
    theMoveTitle,
    theMoveDescription,
    actionItems: [
      {
        title: theMoveTitle,
        subtitle: theMoveDescription,
        badge: `Card #${String(stepOneTargetCard).padStart(2, "0")}`,
        color: "lavender",
        targetCardNumber: stepOneTargetCard,
      },
      {
        title: `Peak Window: ${formatHour12(peakHour)} on ${peakDayOfWeek}`,
        subtitle: `That's when ${themName} is statistically most responsive—check your reply speed breakdown.`,
        badge: "Card #03",
        color: "sky",
        targetCardNumber: 3,
      },
      {
        title: `Retire "${retireWord}" for 48 Hours`,
        subtitle: `Switch up your predictable replies and watch ${themName}'s response time drop in half.`,
        badge: `Card #${String(stepThreeTargetCard).padStart(2, "0")}`,
        color: "mint",
        targetCardNumber: stepThreeTargetCard,
      },
    ],
  };

  return {
    chatTitle: `${youName} & ${themName}`,
    isSwapped,
    partnerName,
    totalMessages,
    totalWords: youMetrics.wordCount + themMetrics.wordCount,
    totalDaysSpan,
    activeDays: uniqueDates.size,
    messagesPerDay: Math.max(
      1,
      Number((totalMessages / Math.max(1, uniqueDates.size)).toFixed(1))
    ),
    peakHour,
    peakHourFormatted: formatHour12(peakHour),
    peakDayOfWeek,
    participants: [youMetrics, themMetrics],
    firstMessage,
    longestMessage,
    sharedLore: combinedLore,
    leftOnRead,
    mutualInterestScore,
    redFlags,
    longestSilence,
    translations,
    timeline,
    timelineStats: {
      honeymoonLabel: timeline[0]?.label || "Day 1",
      peakLabel: timeline[peakIdx]?.label || "Peak Month",
      peakCount: timeline[peakIdx]?.count || totalMessages,
      drySpellLabel: timeline[dryIdx]?.label || "Quiet Week",
      currentTrend,
    },
    verdict,
  };
}
