import { detect as tinyldDetect } from "tinyld";

const SUPPORTED_LOCALES = new Set(["en", "ms", "zh"]);
const WORD_REGEX = /[\p{L}']+/gu;

// High-confidence Malay tokens - standard vocabulary accessible to all Malaysian speakers
const MALAY_HIGH_CONFIDENCE_TOKENS = new Set([
  "aku", "awak", "kau", "engkau", "kita", "kami", "saya", "anda",
  "lah", "kan", "kah", "pun", "je", "la", "kot", "ke",
  "tak", "tidak", "jangan", "jadi", "boleh", "mau", "mahu",
  "macam", "mcm", "rasa", "sangat", "sebab", "kenapa", "kerana",
  "dengan", "untuk", "dari", "dalam", "pada", "akan", "sudah", "dah",
  "belum", "sedang", "tengah", "lagi", "juga", "pula", "sahaja", "saja",
  "yang", "ini", "itu", "tu", "ni", "sini", "situ", "sana",
  "ada", "tiada", "banyak", "sikit", "semua", "setiap", "beberapa",
  "betul", "salah", "baik", "buruk", "bagus", "teruk", "cantik",
  "hodoh", "besar", "kecil", "tinggi", "rendah", "jauh", "dekat",
  "cepat", "lambat", "panas", "sejuk", "dingin", "basah", "kering"
]);

// Malaysian discourse markers and particles - standard forms without heavy dialect
const MALAY_DISCOURSE_MARKERS = new Set([
  "lah", "kan", "kah", "pun", "je", "la", "kot", "ke", "ape", "apa",
  "eh", "ah", "oh", "weh", "woi", "ish", "aduh", "alamak", "aiyah",
  "haiya", "aiyo", "walao", "waleh", "mana", "macamana", "camna",
  "apa", "kenapa", "bila", "mana", "siapa", "berapa", "bagaimana"
]);

const MALAY_COMMON_TOKENS = new Set([
  "aku", "anda", "awak", "ayah", "bang", "banyak", "belum", "betul",
  "boleh", "dah", "dengan", "dia", "esok", "faham", "hai", "harap",
  "ish", "iya", "jadi", "jangan", "jauh", "jom", "ingat", "je",
  "juga", "kah", "kak", "kami", "kamu", "kan", "kau", "ke", "kenapa",
  "kerana", "kita", "kot", "lah", "lagi", "la", "maaf", "macam",
  "malam", "mana", "mau", "mahu", "mcm", "mereka", "nanti", "ok",
  "okay", "perlu", "pun", "rasa", "sahaja", "saya", "sayang", "sebab",
  "sangat", "selalu", "tak", "tidak", "tolong", "woi", "weh", "ya",
  "yang", "benda", "perkara", "masa", "waktu", "hari", "minggu",
  "bulan", "tahun", "tempat", "rumah", "sekolah", "kerja", "main",
  "makan", "minum", "tidur", "bangun", "pergi", "balik", "datang",
  "sampai", "tiba", "start", "mula", "habis", "selesai", "tamat"
]);

const MALAY_PREFIXES = [
  "ber",
  "ter",
  "se",
  "ke",
  "mem",
  "men",
  "meng",
  "meny",
  "pem",
  "pen",
  "peng",
  "peny",
  "per",
  "memper",
  "aku",
  "ku",
];

const MALAY_SUFFIXES = [
  "apa",
  "ape",
  "kan",
  "kah",
  "ke",
  "nya",
  "pun",
  "saja",
  "sahaja",
  "je",
  "nye",
  "tau",
  "ni",
  "lah",
  "ini",
  "itu",
  "tu",
  "mu",
  "ku",
];

const MALAY_INTERNAL_PATTERNS = [
  /(ng|ny)[aeiou]/, // sayang, tanya
  /(lah|kah|kan|nya|pun)$/,
  /^(aku|kau|kita|kami|awak|anda|engkau|korang|saya)$/,
];

const MALAYSIAN_ENGLISH_TOKENS = new Set([
  "lah", "lor", "meh", "wor", "leh", "mah", "geh", "hah", "hor",
  "can", "cannot", "kenot", "liddat", "lidat", "like", "that",
  "wat", "what", "how", "where", "when", "why", "which", "who",
  "one", "wan", "want", "dont", "wont", "cannot", "kenot",
  "sure", "confirm", "steady", "shiok", "power", "best", "nice",
  "very", "super", "damn", "damn", "quite", "abit", "a", "bit",
  "already", "oredi", "still", "yet", "never", "also", "oso",
  "go", "come", "see", "look", "hear", "say", "tell", "ask",
  "give", "take", "put", "get", "have", "got", "make", "do"
]);

const ENGLISH_COMMON_TOKENS = new Set([
  "i", "me", "you", "we", "they", "he", "she", "it", "my", "your",
  "our", "their", "his", "her", "its", "this", "that", "these", "those",
  "hey", "hello", "hi", "bye", "goodbye", "thanks", "thank", "please",
  "sorry", "excuse", "welcome", "yes", "no", "yeah", "yep", "nope",
  "i'm", "i'll", "i'd", "i've", "you're", "you'll", "you'd", "you've",
  "we're", "we'll", "we'd", "we've", "they're", "they'll", "they'd",
  "don't", "won't", "can't", "couldn't", "shouldn't", "wouldn't",
  "isn't", "aren't", "wasn't", "weren't", "hasn't", "haven't", "hadn't",
  "really", "very", "quite", "pretty", "super", "so", "too", "enough",
  "maybe", "perhaps", "probably", "possibly", "definitely", "certainly",
  "just", "only", "even", "still", "already", "yet", "again", "also",
  "like", "love", "hate", "enjoy", "prefer", "want", "need", "wish",
  "should", "could", "would", "might", "must", "have", "had", "has",
  "feel", "think", "know", "believe", "understand", "remember", "forget",
  "help", "support", "assist", "guide", "teach", "learn", "study",
  "okay", "ok", "alright", "fine", "sure", "right", "correct", "wrong",
  "good", "great", "awesome", "amazing", "bad", "terrible", "awful",
  "safe", "dangerous", "careful", "worry", "concern", "care", "protect",
  "together", "alone", "with", "without", "around", "near", "far", "close"
]);

const ENGLISH_PREFIXES = ["re", "un", "dis", "pre", "pro", "con", "inter", "over", "under"];

const ENGLISH_SUFFIXES = [
  "ing",
  "ed",
  "er",
  "ers",
  "est",
  "ly",
  "tion",
  "sion",
  "ment",
  "ness",
  "able",
  "ible",
  "less",
];

const ENGLISH_CONTRACTIONS = ["n't", "'re", "'ll", "'ve", "'d", "'m", "'s"];

const DETECTED_LANGUAGE_CODE_MAP: Record<string, SupportedLocale> = {
  en: "en",
  eng: "en",
  english: "en",
  "en-us": "en",
  "en-gb": "en",
  ms: "ms",
  msa: "ms",
  malay: "ms",
  id: "ms",
  ind: "ms",
  indonesian: "ms",
  bahasamelayu: "ms",
  zh: "zh",
  zho: "zh",
  cmn: "zh",
  mandarin: "zh",
  chinese: "zh",
  "zh-cn": "zh",
  "zh-hans": "zh",
  "zh-hant": "zh"
};

const tokenLanguageCache = new Map<string, SupportedLocale | null>();

function scoreMalayToken(token: string): number {
  let score = 0;
  let confidence = 1.0;

  // High confidence Malay tokens (particles, pronouns, common words)
  if (MALAY_HIGH_CONFIDENCE_TOKENS.has(token)) {
    score += 1.5;
    confidence = 1.2;
  } else if (MALAY_COMMON_TOKENS.has(token)) {
    score += 1.0;
    confidence = 1.0;
  }

  // Discourse markers and particles are strong indicators of Malay
  if (MALAY_DISCOURSE_MARKERS.has(token)) {
    score += 1.3;
    confidence = 1.3;
  }

  // Short particles that are critical in bahasa rojak
  if (token.length <= 3) {
    if (["lah", "kan", "kah", "pun", "je", "la", "kot", "ke"].includes(token)) {
      score += 1.2;
      confidence = 1.4;
    } else if (["ya", "ah", "eh", "oh"].includes(token)) {
      score += 0.6;
    }
  }

  // Malay morphological patterns
  if (MALAY_SUFFIXES.some((suffix) => token.endsWith(suffix) && token.length > suffix.length + 1)) {
    score += 0.4;
  }

  if (MALAY_PREFIXES.some((prefix) => token.startsWith(prefix) && token.length > prefix.length + 1)) {
    score += 0.4;
  }

  // Malay phonological patterns
  if (MALAY_INTERNAL_PATTERNS.some((pattern) => pattern.test(token))) {
    score += 0.35;
  }

  // Malay-specific letter combinations
  if (token.includes("ng") || token.includes("ny") || token.includes("kh") || token.includes("sy")) {
    score += 0.3;
  }

  // Double vowels common in Malay
  if (/[aeiou]{2}/.test(token)) {
    score += 0.2;
  }

  return Math.min(score * confidence, 2.0);
}

function scoreEnglishToken(token: string): number {
  let score = 0;
  let confidence = 1.0;

  // Malaysian English variants get special treatment
  if (MALAYSIAN_ENGLISH_TOKENS.has(token)) {
    score += 1.2; // Higher score for Malaysian English
    confidence = 1.3;
  } else if (ENGLISH_COMMON_TOKENS.has(token)) {
    score += 1.0;
    confidence = 1.0;
  }

  // English contractions are strong indicators
  if (ENGLISH_CONTRACTIONS.some((suffix) => token.endsWith(suffix))) {
    score += 0.5;
    confidence = 1.2;
  }

  // English morphological patterns
  if (ENGLISH_SUFFIXES.some((suffix) => token.endsWith(suffix) && token.length > suffix.length + 1)) {
    score += 0.4;
  }

  if (ENGLISH_PREFIXES.some((prefix) => token.startsWith(prefix) && token.length > prefix.length + 1)) {
    score += 0.35;
  }

  // Pure English alphabetic pattern
  if (/^[a-z]+$/.test(token) && token.length > 2) {
    score += 0.3;
  }

  // Apostrophes in English
  if (token.includes("'")) {
    score += 0.4;
  }

  // Common English patterns
  if (/^(th|sh|ch|wh|ph|gh)/.test(token)) {
    score += 0.3;
  }

  // English consonant clusters
  if (/[bcdfghjklmnpqrstvwxyz]{2,}/.test(token) && token.length > 3) {
    score += 0.2;
  }

  return Math.min(score * confidence, 1.8);
}

export type SupportedLocale = "en" | "ms" | "zh";

export function normaliseLocaleCode(raw: unknown): SupportedLocale | undefined {
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return undefined;
  if (SUPPORTED_LOCALES.has(trimmed as SupportedLocale)) {
    return trimmed as SupportedLocale;
  }
  if (trimmed.startsWith("zh")) return "zh";
  if (trimmed.startsWith("ms") || trimmed.startsWith("id")) return "ms";
  if (trimmed.startsWith("en")) return "en";
  return undefined;
}

export function detectLocaleFromMessage(message: string): SupportedLocale | undefined {
  const proportions = detectLanguageProportions(message);
  const total = proportions.en + proportions.ms + proportions.zh;
  if (total === 0) return "en"; // Default fallback to English when no language detected

  // Calculate percentages for better decision making
  const percentages = {
    en: (proportions.en / total) * 100,
    ms: (proportions.ms / total) * 100,
    zh: (proportions.zh / total) * 100
  };

  // For Malaysian context: if both Malay and English are present with reasonable amounts,
  // prioritize Malay as the base language for bahasa rojak
  if (percentages.ms >= 20 && percentages.en >= 15) {
    return "ms";
  }

  // If one language clearly dominates (>60%), use that
  if (percentages.ms > 60) return "ms";
  if (percentages.en > 60) return "en";
  if (percentages.zh > 60) return "zh";

  // For mixed language with Chinese, prefer the stronger non-Chinese language
  if (percentages.zh > 0) {
    if (percentages.ms > percentages.en) return "ms";
    if (percentages.en > percentages.ms) return "en";
    return "zh";
  }

  // Default precedence for Malaysian context: ms > en > zh
  const precedence: SupportedLocale[] = ["ms", "en", "zh"];
  let bestLocale: SupportedLocale = "en";
  let bestScore = -1;

  (["ms", "en", "zh"] as SupportedLocale[]).forEach((locale) => {
    const score = proportions[locale];
    if (score > bestScore) {
      bestLocale = locale;
      bestScore = score;
      return;
    }
    if (Math.abs(score - bestScore) < 0.1 && score > 0) {
      if (precedence.indexOf(locale) < precedence.indexOf(bestLocale)) {
        bestLocale = locale;
      }
    }
  });

  return bestScore > 0 ? bestLocale : undefined;
}

export function determineEffectiveLocale(params: {
  message?: string;
  localeOverride?: string;
  sessionLocale?: string | null;
}): SupportedLocale | undefined {
  const { message, localeOverride, sessionLocale } = params;

  if (message) {
    const detectedLocale = detectLocaleFromMessage(message);
    if (detectedLocale) return detectedLocale;
  }

  const normalizedOverride = normaliseLocaleCode(localeOverride);
  if (normalizedOverride) return normalizedOverride;

  return normaliseLocaleCode(sessionLocale);
}

export type LanguageProportions = {
  en: number;
  ms: number;
  zh: number;
};

function getWordWeight(word: string, isDiscourseMarker: boolean, isHighConfidence: boolean): number {
  // Discourse markers and particles have higher weight in Malaysian context
  if (isDiscourseMarker) return 2.0;
  if (isHighConfidence) return 1.5;

  // Function words (pronouns, determiners) have higher weight
  const functionWords = new Set([
    "i", "you", "we", "they", "he", "she", "it", "my", "your", "our", "their",
    "this", "that", "these", "those", "a", "an", "the",
    "aku", "kau", "dia", "kita", "kami", "mereka", "saya", "awak", "anda",
    "ini", "itu", "tu", "ni"
  ]);

  if (functionWords.has(word)) return 1.3;

  // Short particles (1-3 characters) get higher weight in Malaysian context
  if (word.length <= 3 && /^[a-z]+$/.test(word)) return 1.2;

  return 1.0;
}

export function detectLanguageProportions(message: string): LanguageProportions {
  const counts: LanguageProportions = { en: 0, ms: 0, zh: 0 };
  const content = message ? message.trim() : "";
  if (!content) {
    return counts;
  }

  const lower = content.toLowerCase();
  const wordMatches = lower.match(WORD_REGEX);

  if (wordMatches) {
    let totalWeight = 0;

    wordMatches.forEach((word) => {
      if (!word) return;

      // Handle Chinese characters
      if (/^[\u3400-\u9FFF]+$/.test(word)) {
        const weight = word.length * 1.5; // Chinese characters carry more weight
        counts.zh += weight;
        totalWeight += weight;
        return;
      }

      // Skip non-alphabetic words (except apostrophes for contractions)
      if (!/^[a-z']+$/.test(word)) {
        return;
      }

      // Try library detection first for less ambiguous words
      const detectedLocale = detectTokenLocale(word);
      if (detectedLocale && word.length > 3) {
        const weight = getWordWeight(word, false, true);
        counts[detectedLocale] += weight;
        totalWeight += weight;
        return;
      }

      // Use enhanced scoring for Malaysian context
      const malayScore = scoreMalayToken(word);
      const englishScore = scoreEnglishToken(word);

      const isDiscourseMarker = MALAY_DISCOURSE_MARKERS.has(word);
      const isHighConfidenceMs = MALAY_HIGH_CONFIDENCE_TOKENS.has(word);
      const isHighConfidenceEn = ENGLISH_COMMON_TOKENS.has(word) || MALAYSIAN_ENGLISH_TOKENS.has(word);

      const baseWeight = getWordWeight(word, isDiscourseMarker, isHighConfidenceMs || isHighConfidenceEn);

      // Handle ambiguous or unknown words
      if (malayScore === 0 && englishScore === 0) {
        // Default to English for unknown words (conservative approach)
        counts.en += 0.3 * baseWeight;
        totalWeight += 0.3 * baseWeight;
        return;
      }

      // Clear winner with sufficient confidence
      if (malayScore > englishScore && malayScore >= 0.8) {
        counts.ms += malayScore * baseWeight;
        totalWeight += malayScore * baseWeight;
        return;
      }

      if (englishScore > malayScore && englishScore >= 0.8) {
        counts.en += englishScore * baseWeight;
        totalWeight += englishScore * baseWeight;
        return;
      }

      // Distribute proportionally for ambiguous words
      const totalScore = malayScore + englishScore;
      if (totalScore > 0) {
        const malayProportion = (malayScore / totalScore) * baseWeight;
        const englishProportion = (englishScore / totalScore) * baseWeight;

        counts.ms += malayProportion;
        counts.en += englishProportion;
        totalWeight += baseWeight;
      }
    });

    // Normalize proportions to account for weighted scoring
    const total = counts.en + counts.ms + counts.zh;
    if (total > 0) {
      const factor = Math.max(1, totalWeight / wordMatches.length);
      counts.en = Math.max(0, counts.en / factor);
      counts.ms = Math.max(0, counts.ms / factor);
      counts.zh = Math.max(0, counts.zh / factor);
    }
  }

  // Add debugging information
  const debugTotal = counts.en + counts.ms + counts.zh;
  console.log("Enhanced language proportions:", {
    raw: { en: counts.en.toFixed(2), ms: counts.ms.toFixed(2), zh: counts.zh.toFixed(2) },
    percentages: {
      en: debugTotal > 0 ? Math.round((counts.en / debugTotal) * 100) : 0,
      ms: debugTotal > 0 ? Math.round((counts.ms / debugTotal) * 100) : 0,
      zh: debugTotal > 0 ? Math.round((counts.zh / debugTotal) * 100) : 0
    },
    message: message.substring(0, 100) + (message.length > 100 ? '...' : '')
  });

  return counts;
}

function detectTokenLocale(token: string): SupportedLocale | undefined {
  if (!token) return undefined;
  const cached = tokenLanguageCache.get(token);
  if (cached !== undefined) {
    return cached ?? undefined;
  }

  let result: SupportedLocale | null = null;
  try {
    const detectedCode = tinyldDetect(token);
    const mapped = normaliseDetectedLanguageCode(detectedCode);
    if (mapped) {
      result = mapped;
    }
  } catch (error) {
    // tinyld may throw on very short or unusual tokens; ignore and fall back to heuristics.
  }

  tokenLanguageCache.set(token, result);
  return result ?? undefined;
}

function normaliseDetectedLanguageCode(code?: string | null): SupportedLocale | undefined {
  if (!code) return undefined;
  const trimmed = code.trim().toLowerCase();
  if (!trimmed || trimmed === "und" || trimmed === "unk" || trimmed === "unknown") return undefined;
  if (DETECTED_LANGUAGE_CODE_MAP[trimmed]) {
    return DETECTED_LANGUAGE_CODE_MAP[trimmed];
  }
  if (trimmed.startsWith("zh")) return "zh";
  if (trimmed.startsWith("cmn")) return "zh";
  if (trimmed.startsWith("ms") || trimmed.startsWith("id") || trimmed.startsWith("mal")) return "ms";
  if (trimmed.startsWith("en")) return "en";
  return undefined;
}
