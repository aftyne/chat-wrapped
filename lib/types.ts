export type ExtractionState =
  | "idle"
  | "unzipping"
  | "parsing"
  | "ready"
  | "error";

export interface ParsedMessage {
  id: number;
  timestamp: number; // Unix ms
  dateStr: string; // YYYY-MM-DD
  timeStr: string; // HH:mm
  hour: number; // 0-23
  dayOfWeek: number; // 0-6
  sender: string;
  text: string;
  wordCount: number;
  charCount: number;
  isDeleted: boolean;
  isMedia: boolean;
  isSystem: boolean;
}

export interface WordFrequency {
  word: string;
  count: number;
}

export interface SharedLoreItem {
  phrase: string;
  totalCount: number;
  youCount: number;
  themCount: number;
  category: "Inside Phrase" | "Signature Word" | "Shared Vibe";
}

export interface ParticipantMetrics {
  name: string;
  messageCount: number;
  percentage: number;
  wordCount: number;
  avgWordsPerMessage: number;
  charCount: number;
  mediaCount: number;
  deletedCount: number;
  medianReplyMinutes: number;
  avgReplyMinutes: number;
  speedBadge: string;
  speedSubtext: string;
  initiationsCount: number;
  initiationPercentage: number;
  topWords: WordFrequency[];
  ghostIncidentsCaused: number; // times this person left the other on read 12h+ forcing double text
  doubleTextStreaks: number; // 3+ messages in a row
  maxConsecutiveMessages: number;
  lateNightPercentage: number; // 23:00 - 04:59
  interestScore: number; // 0-100
  interestBreakdown: {
    velocityScore: number;
    initiationScore: number;
    effortScore: number;
    doubleTextScore: number;
  };
  attachmentStyle: {
    type: "Secure" | "Anxious-Preoccupied" | "Dismissive-Avoidant" | "Fearful-Avoidant";
    tagline: string;
    description: string;
    anxietyAxis: number; // -100 to 100
    avoidanceAxis: number; // -100 to 100
  };
}

export interface FirstMessageData {
  sender: string;
  text: string;
  timestamp: number;
  formattedDate: string;
  formattedTime: string;
  daysAgo: number;
  secondMessage?: {
    sender: string;
    text: string;
    formattedTime: string;
  };
}

export interface LongestMessageData {
  sender: string;
  text: string;
  wordCount: number;
  charCount: number;
  formattedDate: string;
  formattedTime: string;
  runnerUpSender: string;
  runnerUpWordCount: number;
}

export interface LeftOnReadData {
  totalIncidents: number;
  youLeftThemCount: number;
  themLeftYouCount: number;
  worstIncident: {
    ghoster: string;
    victim: string;
    hoursIgnored: number;
    formattedDate: string;
    doubleTextSnippet: string;
  };
}

export interface RedFlagItem {
  id: string;
  title: string;
  culprit: string;
  evidence: string;
  severity: "High" | "Medium" | "Spicy";
  triggered: boolean;
}

export interface SilenceGapData {
  days: number;
  hours: number;
  startDate: string;
  endDate: string;
  lastSenderBeforeSilence: string;
  lastMessageBeforeSilence: string;
  breakerSender: string;
  breakerMessage: string;
}

export interface TranslationItem {
  original: string;
  count: number;
  meaning: string;
  vibeTag: string;
}

export interface TimelineBucket {
  label: string; // e.g. "Jan '25" or "Wk 3"
  shortLabel: string;
  count: number;
  youCount: number;
  themCount: number;
  phase?: "Honeymoon" | "The Peak" | "Dry Spell" | "Current";
}

export interface FinalVerdictData {
  archetype: string;
  grade: "A+" | "A" | "A-" | "B+" | "B" | "C+";
  compatibilityScore: number;
  summaryQuote: string;
  theMoveTitle: string;
  theMoveDescription: string;
  actionItems: {
    title: string;
    subtitle: string;
    badge: string;
    color: "lavender" | "sky" | "mint" | "orchid";
  }[];
}

export interface ChatWrappedAnalysis {
  chatTitle: string;
  totalMessages: number;
  totalWords: number;
  totalDaysSpan: number;
  activeDays: number;
  messagesPerDay: number;
  peakHour: number;
  peakHourFormatted: string;
  peakDayOfWeek: string;
  participants: [ParticipantMetrics, ParticipantMetrics]; // [you, them]
  firstMessage: FirstMessageData;
  longestMessage: LongestMessageData;
  sharedLore: SharedLoreItem[];
  leftOnRead: LeftOnReadData;
  mutualInterestScore: number;
  redFlags: RedFlagItem[];
  longestSilence: SilenceGapData;
  translations: TranslationItem[];
  timeline: TimelineBucket[];
   timelineStats: {
    honeymoonLabel: string;
    peakLabel: string;
    peakCount: number;
    drySpellLabel: string;
    currentTrend: "Rising" | "Steady" | "Cooling" | "Chaotic";
  };
  verdict: FinalVerdictData;
}
