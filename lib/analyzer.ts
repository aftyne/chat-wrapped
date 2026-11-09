import {
  ChatWrappedAnalysis,
  FinalVerdictData,
  FirstMessageData,
  LeftOnReadData,
  LongestMessageData,
  ParsedMessage,
  ParticipantMetrics,
  RedFlagItem,
  SharedLoreItem,
  SilenceGapData,
  TimelineBucket,
  TranslationItem,
  WordFrequency,
} from "./types";

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
  "media", "omitted", "message", "deleted", "https", "http", "www", "com",
  // Indonesian stop words (for bilingual chats)
  "yang", "dan", "di", "ke", "dari", "ini", "itu", "dengan", "untuk", "tidak",
  "bisa", "ada", "jadi", "kalau", "kalo", "aja", "saja", "udah", "sudah", "belum",
  "lagi", "mau", "गा", "gak", "ga", "nggak", "enggak", "iya", "ya", "yg", "aku",
  "kamu", "dia", "kita", "mereka", "sama", "buat", "tapi", "karena", "karna",
  "udah", "dah", "kan", "kok", "sih", "dong", "deh", "nih", "tuh", "gitu", "gini",
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
  const d = new Date(timestamp);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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

function tokenizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^\p{L}\p{N}'’]+/gu, " ")
    .split(/\s+/)
    .map((w) => w.replace(/^['’]+|['’]+$/g, ""))
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w) && !/^\d+$/.test(w));
}

export function analyzeChatMessages(
  messages: ParsedMessage[],
  preferredYouName?: string
): ChatWrappedAnalysis {
  if (messages.length === 0) {
    throw new Error("No valid chat messages found in this file.");
  }

  // Sort chronologically
  const sorted = [...messages].sort((a, b) => a.timestamp - b.timestamp);

  // Identify top 2 participants
  const senderCounts = new Map<string, number>();
  for (const m of sorted) {
    senderCounts.set(m.sender, (senderCounts.get(m.sender) || 0) + 1);
  }

  const rankedSenders = Array.from(senderCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map((e) => e[0]);

  const firstSender = rankedSenders[0] || "You";
  const secondSender = rankedSenders[1] || "Them";

  let youName = firstSender;
  let themName = secondSender;

  if (preferredYouName && preferredYouName === secondSender) {
    youName = secondSender;
    themName = firstSender;
  }

  // Filter to our two main participants
  const duoMessages = sorted.filter(
    (m) => m.sender === youName || m.sender === themName
  );
  const activeMessages = duoMessages.length > 0 ? duoMessages : sorted;

  const totalMessages = activeMessages.length;
  const firstTimestamp = activeMessages[0].timestamp;
  const lastTimestamp = activeMessages[activeMessages.length - 1].timestamp;
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
      wordFreq: new Map<string, number>(),
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
      wordFreq: new Map<string, number>(),
      ghostsCaused: 0,
      doubleTextStreaks: 0,
      maxConsecutive: 0,
      lateNightCount: 0,
      shortPhraseFreq: new Map<string, number>(),
      singleLetterReplies: 0,
    },
  };

  // Bigram frequency for Shared Lore
  const bigramStats = new Map<string, { total: number; you: number; them: number }>();

  // Longest message tracking
  let longestByYou: ParsedMessage | null = null;
  let longestByThem: ParsedMessage | null = null;

  // Left on Read (12+ hours gap where same person texts again)
  let worstGhostIncident = {
    ghoster: themName,
    victim: youName,
    hoursIgnored: 0,
    formattedDate: formatNiceDate(firstTimestamp),
    doubleTextSnippet: "",
  };

  // Longest silence gap between messages
  let longestSilence: SilenceGapData = {
    days: 0,
    hours: 0,
    startDate: formatNiceDate(firstTimestamp),
    endDate: formatNiceDate(firstTimestamp),
    lastSenderBeforeSilence: youName,
    lastMessageBeforeSilence: activeMessages[0].text,
    breakerSender: themName,
    breakerMessage: activeMessages[0].text,
  };

  let currentStreakSender = "";
  let currentStreakLength = 0;

  for (let i = 0; i < activeMessages.length; i++) {
    const msg = activeMessages[i];
    const sender = msg.sender === youName ? youName : themName;
    const other = sender === youName ? themName : youName;
    const pStat = statsMap[sender];

    uniqueDates.add(msg.dateStr);
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

    // Track longest message
    if (!msg.isMedia && !msg.isDeleted) {
      if (sender === youName) {
        if (!longestByYou || msg.charCount > longestByYou.charCount) {
          longestByYou = msg;
        }
      } else {
        if (!longestByThem || msg.charCount > longestByThem.charCount) {
          longestByThem = msg;
        }
      }

      const trimmedLower = msg.text.trim().toLowerCase().replace(/[.!?,]+$/g, "");
      if (trimmedLower.length === 1 || trimmedLower === "ok" || trimmedLower === "k") {
        pStat.singleLetterReplies++;
      }
      if (trimmedLower.length >= 1 && trimmedLower.length <= 18 && msg.wordCount <= 3) {
        pStat.shortPhraseFreq.set(
          trimmedLower,
          (pStat.shortPhraseFreq.get(trimmedLower) || 0) + 1
        );
      }

      // Tokenize for top words & shared lore
      const tokens = tokenizeWords(msg.text);
      for (let t = 0; t < tokens.length; t++) {
        const w = tokens[t];
        pStat.wordFreq.set(w, (pStat.wordFreq.get(w) || 0) + 1);

        if (t < tokens.length - 1) {
          const bg = `${tokens[t]} ${tokens[t + 1]}`;
          const existing = bigramStats.get(bg) || { total: 0, you: 0, them: 0 };
          existing.total++;
          if (sender === youName) existing.you++;
          else existing.them++;
          bigramStats.set(bg, existing);
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
      const deltaMinutes = deltaMs / (1000 * 60);
      const deltaHours = deltaMinutes / 60;

      // Conversation Initiation: gap >= 5 hours (300 mins)
      if (deltaHours >= 5) {
        pStat.initiationsCount++;
      }

      // Reply Latency: different sender within 6 hours (360 mins)
      if (sender !== prevSender && deltaMinutes > 0 && deltaMinutes <= 360) {
        pStat.replyLatenciesMin.push(deltaMinutes);
      }

      // Left On Read: same sender double-texts after >= 12 hours of silence!
      if (sender === prevSender && deltaHours >= 12) {
        // The OTHER person left this sender on read!
        statsMap[other].ghostsCaused++;
        if (deltaHours > worstGhostIncident.hoursIgnored && !msg.isMedia && !msg.isDeleted) {
          worstGhostIncident = {
            ghoster: other,
            victim: sender,
            hoursIgnored: Math.round(deltaHours),
            formattedDate: formatNiceDate(msg.timestamp),
            doubleTextSnippet: msg.text.slice(0, 90),
          };
        }
      }

      // Longest silence gap (Card 13: Blocked You Gag Card)
      const longestGapTotalHours = longestSilence.days * 24 + longestSilence.hours;
      if (deltaHours > longestGapTotalHours) {
        const days = Math.floor(deltaHours / 24);
        const remHours = Math.round(deltaHours % 24);
        longestSilence = {
          days,
          hours: remHours,
          startDate: formatNiceDate(prev.timestamp),
          endDate: formatNiceDate(msg.timestamp),
          lastSenderBeforeSilence: prevSender,
          lastMessageBeforeSilence:
            prev.isMedia ? "Sent a media attachment" : prev.text.slice(0, 85),
          breakerSender: sender,
          breakerMessage:
            msg.isMedia ? "Sent a media attachment" : msg.text.slice(0, 85),
        };
      }
    }
  }

  // Helper to compute median & average reply time
  function computeReplyStats(latencies: number[]): { median: number; avg: number } {
    if (latencies.length === 0) return { median: 4.0, avg: 8.5 };
    const sortedLat = [...latencies].sort((a, b) => a - b);
    const mid = Math.floor(sortedLat.length / 2);
    const median =
      sortedLat.length % 2 !== 0
        ? sortedLat[mid]
        : (sortedLat[mid - 1] + sortedLat[mid]) / 2;
    const sum = sortedLat.reduce((acc, v) => acc + v, 0);
    return {
      median: Math.max(0.5, Number(median.toFixed(1))),
      avg: Math.max(0.5, Number((sum / sortedLat.length).toFixed(1))),
    };
  }

  const totalInitiations = Math.max(
    1,
    statsMap[youName].initiationsCount + statsMap[themName].initiationsCount
  );

  function buildParticipantMetrics(name: string): ParticipantMetrics {
    const raw = statsMap[name];
    const reply = computeReplyStats(raw.replyLatenciesMin);
    const speedInfo = getSpeedBadge(reply.median);
    const percentage = Math.round((raw.messageCount / Math.max(1, totalMessages)) * 100);
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

    // Top words
    const topWords: WordFrequency[] = Array.from(raw.wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([word, count]) => ({ word, count }));

    // Interest Score (0-100)
    const velocityScore = Math.round(
      Math.max(25, Math.min(99, 100 - Math.log1p(reply.median) * 18))
    );
    const initiationScore = Math.min(99, Math.max(30, initiationPercentage + 25));
    const effortScore = Math.min(99, Math.max(35, Math.round(avgWordsPerMessage * 9.5)));
    const doubleTextRate = (raw.doubleTextStreaks / Math.max(1, raw.messageCount)) * 100;
    const doubleTextScore = Math.min(99, Math.max(35, Math.round(45 + doubleTextRate * 14)));

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
    // Anxiety Axis: driven by double texting, initiation > 52%, late night volume
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
    // Avoidance Axis: driven by slow reply time, ghost incidents caused, short messages
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

  const youMetrics = buildParticipantMetrics(youName);
  const themMetrics = buildParticipantMetrics(themName);
  // Ensure percentages sum to 100
  themMetrics.percentage = Math.max(0, 100 - youMetrics.percentage);
  themMetrics.initiationPercentage = Math.max(0, 100 - youMetrics.initiationPercentage);

  // Card 1: First Message
  const firstTextMsg =
    activeMessages.find((m) => !m.isMedia && !m.isDeleted) || activeMessages[0];
  const secondTextMsg = activeMessages.find(
    (m) => m.id > firstTextMsg.id && !m.isMedia && !m.isDeleted
  );
  const firstMessage: FirstMessageData = {
    sender: firstTextMsg.sender,
    text: firstTextMsg.text,
    timestamp: firstTextMsg.timestamp,
    formattedDate: formatNiceDate(firstTextMsg.timestamp),
    formattedTime: firstTextMsg.timeStr,
    daysAgo: Math.max(
      1,
      Math.floor((Date.now() - firstTextMsg.timestamp) / (1000 * 60 * 60 * 24))
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
  const sharedLore: SharedLoreItem[] = [];
  const sortedBigrams = Array.from(bigramStats.entries())
    .filter(([, v]) => v.you >= 1 && v.them >= 1 && v.total >= 2)
    .sort((a, b) => b[1].total - a[1].total);

  for (const [phrase, counts] of sortedBigrams.slice(0, 4)) {
    sharedLore.push({
      phrase,
      totalCount: counts.total,
      youCount: counts.you,
      themCount: counts.them,
      category: "Inside Phrase",
    });
  }

  // Also include shared signature single words used by both
  const sharedWords: SharedLoreItem[] = [];
  for (const [word, youCount] of statsMap[youName].wordFreq.entries()) {
    const themCount = statsMap[themName].wordFreq.get(word) || 0;
    if (youCount >= 2 && themCount >= 2) {
      sharedWords.push({
        phrase: word,
        totalCount: youCount + themCount,
        youCount,
        themCount,
        category: "Signature Word",
      });
    }
  }
  sharedWords.sort((a, b) => b.totalCount - a.totalCount);

  const combinedLore = [...sharedLore, ...sharedWords].slice(0, 6);
  if (combinedLore.length === 0) {
    // Fallback to top words if chat is tiny
    const fallbackWords = [...youMetrics.topWords, ...themMetrics.topWords].slice(0, 5);
    fallbackWords.forEach((fw, idx) => {
      combinedLore.push({
        phrase: fw.word,
        totalCount: fw.count,
        youCount: idx % 2 === 0 ? fw.count : Math.ceil(fw.count / 2),
        themCount: idx % 2 === 1 ? fw.count : Math.floor(fw.count / 2),
        category: "Shared Vibe",
      });
    });
  }

  // Card 8: Longest Message ("The Yap Award")
  const allValidMsgs = [longestByYou, longestByThem].filter(
    (m): m is ParsedMessage => m !== null
  );
  allValidMsgs.sort((a, b) => b.charCount - a.charCount);
  const winnerMsg = allValidMsgs[0] || activeMessages[0];
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
    runnerUpWordCount: runnerUpMsg === winnerMsg ? Math.max(1, Math.floor(winnerMsg.wordCount * 0.6)) : runnerUpMsg.wordCount,
  };

  // Card 9: Left On Read
  const leftOnRead: LeftOnReadData = {
    totalIncidents: youMetrics.ghostIncidentsCaused + themMetrics.ghostIncidentsCaused,
    youLeftThemCount: youMetrics.ghostIncidentsCaused,
    themLeftYouCount: themMetrics.ghostIncidentsCaused,
    worstIncident:
      worstGhostIncident.hoursIgnored > 0
        ? worstGhostIncident
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
                Math.max(themMetrics.avgReplyMinutes, youMetrics.avgReplyMinutes) / 10
              )
            ),
            formattedDate: formatNiceDate(lastTimestamp),
            doubleTextSnippet: "Wait did you fall asleep or get kidnapped??",
          },
  };

  // Card 12: Red Flags Checklist
  const slowerPerson =
    themMetrics.avgReplyMinutes >= youMetrics.avgReplyMinutes ? themMetrics : youMetrics;
  const nightOwl =
    themMetrics.lateNightPercentage >= youMetrics.lateNightPercentage
      ? themMetrics
      : youMetrics;
  const deleter =
    themMetrics.deletedCount >= youMetrics.deletedCount ? themMetrics : youMetrics;
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
      triggered: longestSilence.days >= 1 || slowerPerson.avgReplyMinutes > 15,
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
      triggered: doubleTexter.doubleTextStreaks >= 2 || doubleTexter.maxConsecutiveMessages >= 3,
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
  const themShortEntries = Array.from(statsMap[themName].shortPhraseFreq.entries()).sort(
    (a, b) => b[1] - a[1]
  );

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

  // Fill remaining slots up to 3-4 using their top short phrases or top words
  for (const [phrase, count] of themShortEntries) {
    if (translations.length >= 3) break;
    if (usedOriginals.has(phrase)) continue;
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

  // Card 15: Timeline (Month-by-month or Week-by-week depending on span)
  const monthBucketsMap = new Map<
    string,
    { label: string; shortLabel: string; count: number; youCount: number; themCount: number }
  >();

  const useDailyOrWeekly = totalDaysSpan <= 45;

  for (const m of activeMessages) {
    const d = new Date(m.timestamp);
    let key: string;
    let label: string;
    let shortLabel: string;

    if (useDailyOrWeekly) {
      // Group by 3-day or weekly window
      const monthName = d.toLocaleDateString("en-US", { month: "short" });
      const dayNum = d.getDate();
      key = `${m.dateStr.slice(0, 8)}${String(Math.ceil(dayNum / 3)).padStart(2, "0")}`;
      label = `${monthName} ${dayNum}`;
      shortLabel = `${monthName.slice(0, 3)} ${dayNum}`;
    } else {
      const monthName = d.toLocaleDateString("en-US", { month: "short" });
      const yr = String(d.getFullYear()).slice(-2);
      key = m.dateStr.slice(0, 7); // YYYY-MM
      label = `${monthName} '${yr}`;
      shortLabel = monthName;
    }

    const entry = monthBucketsMap.get(key) || {
      label,
      shortLabel,
      count: 0,
      youCount: 0,
      themCount: 0,
    };
    entry.count++;
    if (m.sender === youName) entry.youCount++;
    else entry.themCount++;
    monthBucketsMap.set(key, entry);
  }

  let timeline: TimelineBucket[] = Array.from(monthBucketsMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, v]) => v);

  // Compress to max 12 bars if very long history so mobile chart looks crisp
  if (timeline.length > 12) {
    const step = timeline.length / 12;
    const compressed: TimelineBucket[] = [];
    for (let i = 0; i < 12; i++) {
      const slice = timeline.slice(Math.floor(i * step), Math.floor((i + 1) * step));
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
  if (timeline[dryIdx] && dryIdx !== peakIdx) timeline[dryIdx].phase = "Dry Spell";
  if (timeline[timeline.length - 1] && timeline.length - 1 !== peakIdx) {
    timeline[timeline.length - 1].phase = "Current";
  }

  const lastCount = timeline[timeline.length - 1]?.count || 0;
  const prevCount = timeline[Math.max(0, timeline.length - 2)]?.count || lastCount;
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
  const balanceScore = 100 - Math.abs(youMetrics.percentage - themMetrics.percentage);
  const compatibilityScore = Math.min(
    99,
    Math.max(62, Math.round(mutualInterestScore * 0.65 + balanceScore * 0.35))
  );

  let grade: FinalVerdictData["grade"] = "A";
  let archetype = "Certified Yap Co-Pilots";
  let summaryQuote =
    "High chemistry, matching banter velocity, and just enough chaos to keep the notifications exciting.";
  let theMoveTitle = "Lock In The In-Person Hangout";
  let theMoveDescription =
    "Stop letting your best jokes live solely inside WhatsApp bubbles. Pitch a specific plan for this week.";

  if (compatibilityScore >= 88) {
    grade = "A+";
    archetype = "Main Character Soulmates";
    summaryQuote =
      "Reciprocal effort, rapid-fire banter, and a shared vocabulary nobody else on earth could decode.";
    theMoveTitle = "Skip the Small Talk — Plan Something Iconic";
    theMoveDescription =
      "The algorithm rarely sees message balance this healthy. Send this Wrapped deck and lock in Friday night.";
  } else if (compatibilityScore >= 80) {
    grade = "A";
    archetype = "High-Voltage Banter Duo";
    summaryQuote =
      "One of you carries the late-night chaos while the other brings the comedic timing—and it works effortlessly.";
    theMoveTitle = "Send Card #7 & Double Down";
    theMoveDescription =
      "Use your shared inside jokes as an excuse to suggest coffee, dinner, or a spontaneous late-night drive.";
  } else if (compatibilityScore >= 72) {
    grade = "B+";
    archetype = "Slow-Burn Cinema";
    summaryQuote =
      "Bursts of deep 2-hour texting marathons interrupted by mysterious side-quests and delayed replies.";
    theMoveTitle = "Break the Lag Cycle";
    theMoveDescription =
      "Match their pace, stop over-analyzing the timestamps, and drop a voice note instead of a wall of text.";
  } else {
    grade = "B";
    archetype = "Situationship Olympics";
    summaryQuote =
      "Unpredictable reply latencies, dramatic silence gaps, and undeniable tension every time the phone lights up.";
    theMoveTitle = "Call the Bluff or Touch Grass";
    theMoveDescription =
      "Send the 'Blocked You' card as a power move. How they reply in the next 10 minutes tells you everything.";
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
        badge: "Step 01",
        color: "lavender",
      },
      {
        title: `Peak Window: ${formatHour12(peakHour)} on ${peakDayOfWeek}`,
        subtitle: `That's when ${themName} is statistically most responsive—time your next text accordingly.`,
        badge: "Timing",
        color: "sky",
      },
      {
        title: `Retire "${translations[0]?.original.replace(/"/g, "") || "ok"}" for 48 Hours`,
        subtitle: `Switch up your predictable openers and watch ${themName}'s response time drop in half.`,
        badge: "Pro Tip",
        color: "mint",
      },
    ],
  };

  return {
    chatTitle: `${youName} & ${themName}`,
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
