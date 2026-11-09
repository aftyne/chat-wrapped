export function generateSampleWhatsAppChat(): string {
  const lines: string[] = [
    "[14/02/26, 21:14:08] Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.",
    "[14/02/26, 21:14:22] Maya: Wait is this Frede from the rooftop Vinyl night?? 👀",
    "[14/02/26, 21:15:04] Frede: The one who accidentally spilled oat matcha on the DJ booth? Guilty as charged hahaha",
    "[14/02/26, 21:15:40] Maya: Hahaha iconic entrance honestly. Thanks for saving my tote bag from the rain!",
    "[14/02/26, 21:16:12] Frede: Anytime! We need to initiate the matcha protocol properly this week without any casualties",
    "[14/02/26, 21:17:02] Maya: Matcha protocol is officially in the calendar. Thursday after 5?",
    "[14/02/26, 21:17:45] Frede: Locked in. Don't ghost me before Thursday tho",
    "[14/02/26, 21:18:10] Maya: I would never!!",
    "[14/02/26, 21:18:35] Maya: This message was deleted.",
    "[14/02/26, 21:19:01] Frede: Hold on I saw that deleted message notification 👀 second thoughts already?",
    "[14/02/26, 21:19:40] Maya: Wait no my cat walked across my keyboard I swear",
  ];

  const months = [
    { month: "02", year: "26", days: [16, 18, 20, 22, 25, 27], volume: 16 },
    { month: "03", year: "26", days: [2, 5, 8, 11, 14, 17, 21, 24, 28, 30], volume: 26 },
    { month: "04", year: "26", days: [1, 4, 7, 10, 13, 16, 19, 22, 25, 28], volume: 34 },
    { month: "05", year: "26", days: [3, 6, 9, 12, 15, 19, 23, 27, 30], volume: 42 },
    { month: "06", year: "26", days: [2, 5, 9, 14, 18, 22, 26], volume: 24 },
    { month: "07", year: "26", days: [4, 19, 24, 29], volume: 12 }, // Includes a 15-day dramatic silence gap!
    { month: "08", year: "26", days: [2, 6, 10, 14, 18, 22, 26, 30], volume: 28 },
    { month: "09", year: "26", days: [3, 7, 11, 15, 19, 22, 25, 29], volume: 36 },
    { month: "10", year: "26", days: [2, 5, 8, 12, 16, 20, 24, 28], volume: 38 },
  ];

  const fredePhrases = [
    "Are we activating matcha protocol today or chaos mode?",
    "Wait tell me why I just saw someone walking a miniature pony downtown",
    "hahaha",
    "real",
    "Wait",
    "Are you awake or did you pass out watching true crime documentaries again?",
    "We need golden hour tacos on the balcony this Friday",
    "I just had an epiphany about our vinyl playlist",
    "You deleted this message.",
    "<Media omitted>",
    "Honestly that's peak cinema right there",
    "Let's grab ramen at that hidden spot in main street",
    "Wait did you see the moon tonight? Golden hour was insane",
    "Bro the barista remembered our exact matcha protocol order",
  ];

  const mayaPhrases = [
    "otw",
    "wait",
    "haha",
    "k",
    "ok",
    "idk",
    "omg",
    "Wait hold on I have major tea from the studio today",
    "This message was deleted.",
    "Matcha protocol is the only thing keeping my braincells alive right now",
    "Chaos mode activated, grab your jacket",
    "<Media omitted>",
    "Why are we always texting at 1:30 AM on a weekday",
    "Golden hour tacos sound elite right now",
    "Wait let me double check my schedule before I commit to chaos mode",
  ];

  let pIdx = 0;

  for (const m of months) {
    for (let dIdx = 0; dIdx < m.days.length; dIdx++) {
      const dayStr = String(m.days[dIdx]).padStart(2, "0");
      const baseDate = `${dayStr}/${m.month}/${m.year}`;

      // Add a conversation starter
      const starterIsFrede = (dIdx + parseInt(m.month, 10)) % 3 !== 0; // Frede initiates ~66%
      const startHour = dIdx % 3 === 0 ? 23 : dIdx % 2 === 0 ? 13 : 19;

      if (m.month === "07" && m.days[dIdx] === 4) {
        lines.push(
          `[${baseDate}, 18:40:12] Frede: Wait are you still packing for the Kyoto trip or already at the airport?`
        );
        continue;
      }

      if (m.month === "07" && m.days[dIdx] === 19) {
        lines.push(
          `[${baseDate}, 11:15:44] Maya: I AM BACK ON SOLID GROUND!! Dropped my phone in a koi pond in Kyoto and lived like a 14th century monk for two weeks 😭`
        );
        lines.push(
          `[${baseDate}, 11:16:02] Frede: THOUGHT YOU BLOCKED ME AND JOINED THE SECRET SERVICE`
        );
        continue;
      }

      const countForDay = Math.max(4, Math.round(m.volume / m.days.length) * 3);
      let currentMin = 10;

      for (let c = 0; c < countForDay; c++) {
        currentMin = (currentMin + 3) % 58;
        const hh = String((startHour + Math.floor(c / 8)) % 24).padStart(2, "0");
        const mm = String(currentMin).padStart(2, "0");
        const ss = String((c * 13) % 59).padStart(2, "0");

        // Inject a double-text streak + 14-hour Left on Read incident
        if (c === 0 && dIdx === 2) {
          lines.push(`[${baseDate}, 09:12:00] Frede: Hey did you survive the morning design critique?`);
          lines.push(`[${baseDate}, 23:45:10] Frede: Hello?? Earth to Maya did they lock you in the studio for 14 hours`);
          lines.push(`[${baseDate}, 23:46:05] Frede: Wait nvm I just saw your story haha`);
          lines.push(`[${baseDate}, 23:48:22] Maya: omg sorry I left my phone on Do Not Disturb all day!!`);
          continue;
        }

        const isFrede = (c + (starterIsFrede ? 0 : 1)) % 2 === 0;
        if (isFrede) {
          const text = fredePhrases[pIdx % fredePhrases.length];
          lines.push(`[${baseDate}, ${hh}:${mm}:${ss}] Frede: ${text}`);
        } else {
          const text = mayaPhrases[pIdx % mayaPhrases.length];
          lines.push(`[${baseDate}, ${hh}:${mm}:${ss}] Maya: ${text}`);
        }
        pIdx++;
      }

      // Add late night 1:00 AM burst on certain days
      if (dIdx % 2 === 1) {
        lines.push(`[${baseDate}, 01:18:11] Maya: wait`);
        lines.push(`[${baseDate}, 01:18:24] Maya: are you still up`);
        lines.push(`[${baseDate}, 01:18:45] Maya: I just thought of the funniest thing from vinyl night`);
        lines.push(`[${baseDate}, 01:19:30] Frede: Always up for 1 AM lore, spill it`);
        lines.push(`[${baseDate}, 01:21:10] Maya: hahaha okay listen`);
      }
    }
  }

  // Insert the legendary Yap Award message (Longest single message)
  lines.push(
    `[22/10/26, 00:42:19] Maya: Okay I need to document this entire evening before I forget a single detail because tonight was genuinely a 10/10 fever dream. First we show up to the gallery opening thinking it's casual and everyone is dressed like futuristic architects, then we initiate emergency matcha protocol at 9 PM which was a terrible decision for our sleep schedules, then we somehow convince the street musician to play our favorite song twice in a row while it started drizzling, and we ended up debating which studio ghibli movie has the best soundtrack for two hours over midnight ramen. Honestly I don't think I've laughed that hard all year—thank you for always turning a random Tuesday into an entire movie plotline.`
  );
  lines.push(
    `[22/10/26, 00:43:05] Frede: Framing this message in the Louvre immediately. Best Tuesday on record, hands down.`
  );

  return lines.join("\n");
}
