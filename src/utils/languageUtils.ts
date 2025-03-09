/**
 * Language utilities for multi-language text processing
 * Supports English, Chinese, Japanese and Korean
 */

// Language specific punctuation patterns
const PUNCTUATION_PATTERNS = {
  en: /[^\w\s]|_/g,
  zh: /[《》「」『』，。！？、：；（）【】""'']/g,
  ja: /[『』。、！？：；（）【】""'']/g,
  ko: /[『』。、！？：；（）【】""'']/g,
};

// Default fallback language
const DEFAULT_LANGUAGE = "en";

/**
 * Detect language from text (simplified detection)
 * This is a basic implementation that can be enhanced with more sophisticated language detection
 */
export const detectLanguage = (text: string): string => {
  // Chinese character range
  const zhRegex = /[\u4e00-\u9fff]/;
  // Japanese specific characters (including hiragana and katakana)
  const jaRegex = /[\u3040-\u309f\u30a0-\u30ff]/;
  // Korean character range
  const koRegex = /[\uac00-\ud7af\u1100-\u11ff]/;

  if (zhRegex.test(text) && !jaRegex.test(text)) return "zh";
  if (jaRegex.test(text)) return "ja";
  if (koRegex.test(text)) return "ko";
  return "en"; // Default to English
};

/**
 * Clean string by removing punctuation and normalizing spaces
 * Different cleaning strategies for different languages
 */
export const cleanString = (
  str: string,
  language: string = DEFAULT_LANGUAGE
): string => {
  // Normalize Unicode (important for CJK languages)
  const normalized = str.normalize("NFKC");

  // Get language-specific punctuation pattern or fall back to English
  const pattern =
    PUNCTUATION_PATTERNS[language as keyof typeof PUNCTUATION_PATTERNS] ||
    PUNCTUATION_PATTERNS.en;

  // For non-English languages, lowercase only applies to mixed content
  const lowercased = language === "en" ? normalized.toLowerCase() : normalized;

  // Remove punctuation and normalize spaces
  return lowercased.replace(pattern, "").replace(/\s+/g, " ").trim();
};

/**
 * Split text into words based on language
 * Different splitting strategies for different languages
 */
export const splitWords = (
  text: string,
  language: string = DEFAULT_LANGUAGE
): string[] => {
  // For English and other space-delimited languages
  if (language === "en") {
    return text.split(/\s+/);
  }

  // For Chinese - character by character splitting is more accurate for dictation
  if (language === "zh") {
    // For Chinese, split each character independently
    const chars = Array.from(text);
    return chars.filter((char) => char.trim() !== "");
  }

  // For Japanese and Korean
  if (["ja", "ko"].includes(language)) {
    try {
      // Try using Intl.Segmenter if available (modern browsers)
      // @ts-ignore - Intl.Segmenter might not be recognized by TypeScript but is available in modern browsers
      if (typeof Intl !== "undefined" && typeof Intl.Segmenter === "function") {
        // @ts-ignore - Using Segmenter API
        const segmenter = new Intl.Segmenter(language, { granularity: "word" });
        // @ts-ignore - Using Segmenter API
        const segments = segmenter.segment(text);
        // @ts-ignore - Using Segmenter API
        return (
          Array.from(segments)
            // @ts-ignore - segment is a custom type from Intl.Segmenter
            .filter((segment) => segment.segment.trim() !== "")
            // @ts-ignore - segment is a custom type from Intl.Segmenter
            .map((segment) => segment.segment)
        );
      }
    } catch (e) {
      console.warn(
        "Segmenter not available, falling back to character-by-character segmentation"
      );
    }

    // Fallback: character-by-character segmentation
    const chars = Array.from(text);
    return chars.filter((char) => char.trim() !== "");
  }

  // Default fallback
  return text.split(/\s+/);
};

/**
 * Calculate word similarity for fuzzy matching
 * @returns similarity score between 0 and 1
 */
export const calculateSimilarity = (a: string, b: string): number => {
  if (a === b) return 1; // Exact match
  if (a.length === 0 || b.length === 0) return 0;

  // For single characters, higher baseline similarity
  if (a.length === 1 && b.length === 1) {
    return a === b ? 1 : 0.3; // Give non-matching singles a base similarity
  }

  // For very short words, use a simpler matching approach
  if (a.length < 3 || b.length < 3) {
    // If one is contained in the other
    if (a.includes(b) || b.includes(a)) {
      return 0.85; // High similarity for substring matches in short words
    }
  }

  // Levenshtein distance implementation for fuzzy matching
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= a.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  // Calculate similarity score (1 - normalized distance)
  const distance = matrix[a.length][b.length];
  const maxLength = Math.max(a.length, b.length);
  return maxLength === 0 ? 1 : 1 - distance / maxLength;
};

/**
 * Language-specific normalization of words
 * For stemming, lemmatization, etc.
 */
export const normalizeWord = (
  word: string,
  language: string = DEFAULT_LANGUAGE
): string => {
  // Different normalization strategies based on language
  switch (language) {
    case "en":
      // English-specific normalization (stemming/lemmatization)
      // For a production app, consider using a proper NLP library
      return word
        .toLowerCase()
        .replace(/['']s$/, "") // Remove possessive 's'
        .replace(/(?:ed|ing)$/, ""); // Simple suffix removal

    case "zh":
    case "ja":
    case "ko":
      // For CJK languages, minimal normalization
      // In a production app, use language-specific NLP libraries
      return word;

    default:
      return word.toLowerCase();
  }
};
