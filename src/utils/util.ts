import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { TranscriptItem } from "./type";
import { detectLanguage } from "./languageUtils";

export const resetScrollPosition = (e: React.MouseEvent<HTMLDivElement>) => {
  const innerText = e.currentTarget.querySelector(".inner-text") as HTMLElement;
  if (innerText) {
    innerText.style.animation = "none";
    innerText.offsetHeight;
    innerText.style.animation = "";
  }
};

// UUID generation function that works in both browser and test environments
export const uuid = () => {
  // Check if window and crypto are available (browser environment)
  if (typeof window !== "undefined" && window.crypto) {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const array = new Uint8Array(1);
      window.crypto.getRandomValues(array);
      const r = array[0] % 16;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  } else {
    // Fallback for test environments
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const localStorageCleanup = () => {
  localStorage.clear();
};

// Simplified sentence completion check based on punctuation
export const isCompleteSentence = (text: string): boolean => {
  const trimmedText = text.trim();
  if (!trimmedText) return false;

  const language = detectLanguage(trimmedText);

  switch (language) {
    case "en":
      // English: period, exclamation, question mark
      // Avoid common abbreviations like "Mr.", "Dr.", "etc."
      if (/[.!?]$/.test(trimmedText)) {
        const commonAbbreviations =
          /\b(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|vs|etc|i\.e|e\.g|Inc|Ltd|Corp|Co)\.$$/i;
        return !commonAbbreviations.test(trimmedText);
      }
      return false;

    case "zh":
      // Chinese: 句号、感叹号、问号
      return /[。！？]$/.test(trimmedText);

    case "ja":
      // Japanese: 句点、感嘆符、疑問符
      return /[。！？｡]$/.test(trimmedText);

    case "ko":
      // Korean: 마침표、느낌표、물음표
      return /[。！？]$/.test(trimmedText);

    default:
      return /[.!?。！？｡]$/.test(trimmedText);
  }
};

// Simplified function to check if two transcript items should be merged
const shouldMergeItems = (current: TranscriptItem): boolean => {
  const currentText = current.transcript.trim();
  const language = detectLanguage(currentText);

  // If current sentence is complete (ends with sentence-ending punctuation), don't merge
  if (isCompleteSentence(currentText)) {
    return false;
  }

  // Check for continuation punctuation that suggests merging
  switch (language) {
    case "en":
      // English: merge if ends with comma, semicolon, colon, dash, or no punctuation
      return /[,;:\-–—]$/.test(currentText) || !/[.!?]$/.test(currentText);

    case "zh":
      // Chinese: merge if ends with comma, pause mark, semicolon, colon, dash, or no punctuation
      return (
        /[，、；：—–-]$/.test(currentText) || !/[。！？]$/.test(currentText)
      );

    case "ja":
      // Japanese: merge if ends with comma, semicolon, colon, dash, or no punctuation
      return (
        /[、，；：—–-]$/.test(currentText) || !/[。！？｡]$/.test(currentText)
      );

    case "ko":
      // Korean: merge if ends with comma, semicolon, colon, dash, or no punctuation
      return (
        /[，、；：—–-]$/.test(currentText) || !/[。！？]$/.test(currentText)
      );

    default:
      return !/[.!?。！？｡]$/.test(currentText);
  }
};

// Check if a complete sentence is too short and should be merged regardless of time limit
const isShortCompleteSentence = (text: string, language: string): boolean => {
  const trimmedText = text.trim();

  switch (language) {
    case "en":
      // English: count words, consider short if less than 5 words
      const words = trimmedText.split(/\s+/).filter((word) => word.length > 0);
      return words.length < 5;

    case "zh":
    case "ja":
    case "ko":
      // CJK languages: count characters, consider short if less than 6 characters
      // Remove punctuation for counting
      const chars = trimmedText.replace(/[。！？｡.!?，、；：—–-\s]/g, "");
      return chars.length < 6;

    default:
      // Default to English logic
      const defaultWords = trimmedText
        .split(/\s+/)
        .filter((word) => word.length > 0);
      return defaultWords.length < 3;
  }
};

// Simplified function to automatically merge transcript items based on punctuation and length
export const autoMergeTranscriptItems = (
  transcript: TranscriptItem[],
  maxDuration: number = 10 // Default 10 seconds max
): TranscriptItem[] => {
  if (transcript.length < 2) {
    return transcript;
  }

  // Sort by start time
  const sortedTranscript = [...transcript].sort((a, b) => a.start - b.start);
  const result: TranscriptItem[] = [];
  let current: TranscriptItem | null = null;

  for (const item of sortedTranscript) {
    if (!current) {
      current = { ...item };
      continue;
    }

    const language = detectLanguage(current.transcript);
    const mergedDuration = item.end - current.start;

    // Check if current sentence is complete (ends with sentence-ending punctuation)
    const isCurrentComplete = isCompleteSentence(current.transcript);

    // Check if current complete sentence is too short
    const isCurrentShort =
      isCurrentComplete &&
      isShortCompleteSentence(current.transcript, language);

    // Check if merging would exceed time limit (with tolerance)
    const wouldExceedTimeLimit = mergedDuration > maxDuration;

    // Check if current should be merged based on punctuation
    const shouldMerge = shouldMergeItems(current);

    // Enhanced decision logic for merging
    const shouldFinalizeCurrent =
      (isCurrentComplete && !isCurrentShort) || // Complete sentence that's not short - don't merge
      (wouldExceedTimeLimit && !isCurrentShort) || // Would exceed time limit and not short - don't merge
      (!shouldMerge && !isCurrentShort); // Punctuation suggests not to merge and not short

    if (shouldFinalizeCurrent) {
      result.push(current);
      current = { ...item };
    } else {
      // Merge items with proper spacing
      const separator =
        language === "zh" || language === "ja" || language === "ko" ? "" : " ";
      current = {
        start: current.start,
        end: item.end,
        transcript: current.transcript + separator + item.transcript,
      };
    }
  }

  // Add the last item
  if (current) {
    result.push(current);
  }

  return result;
};

/**
 * Format millisecond timestamp to readable date time string
 * @param timestamp - millisecond timestamp
 * @param format - format type ('date' for YYYY-MM-DD, 'datetime' for YYYY-MM-DD HH:mm:ss, 'time' for HH:mm:ss)
 * @returns formatted date time string
 */
export const formatTimestamp = (
  timestamp: number | string | null | undefined,
  format: "date" | "datetime" | "time" = "datetime"
): string => {
  if (!timestamp) return "";

  try {
    const date = new Date(Number(timestamp));

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    switch (format) {
      case "date":
        return `${year}-${month}-${day}`;
      case "time":
        return `${hours}:${minutes}:${seconds}`;
      case "datetime":
      default:
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return "";
  }
};
