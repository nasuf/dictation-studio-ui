import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { TranscriptItem } from "./type";

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

// Check if the text ends with a sentence-ending punctuation mark in various languages
export const isCompleteSentence = (text: string): boolean => {
  const trimmedText = text.trim();
  // Regular expression that matches sentence-ending punctuation in multiple languages
  // English: . ! ?
  // Chinese/Japanese: 。 ！ ？
  // Korean: . ! ? (same as English but used in Korean context)
  // Also includes other full-width variants used in Asian languages
  return /[.!?。！？｡!?]$/.test(trimmedText);
};

// Function to automatically merge transcript items based on sentence completion and max duration
export const autoMergeTranscriptItems = (
  transcript: TranscriptItem[],
  maxDuration: number
): TranscriptItem[] => {
  if (transcript.length < 2) {
    return transcript; // Return original if less than 2 items
  }

  // Sort by start time
  const sortedTranscript = [...transcript].sort((a, b) => a.start - b.start);
  const result: TranscriptItem[] = [];
  let current: TranscriptItem | null = null;

  for (const item of sortedTranscript) {
    // If there's no current item, set the current item as the first item
    if (!current) {
      current = { ...item };
      continue;
    }

    // Check if the current item is a complete sentence
    const isCurrentComplete = isCompleteSentence(current.transcript);

    // Check if merging would exceed the max duration limit
    const wouldExceedTimeLimit = item.end - current.start > maxDuration;

    // If current item is a complete sentence or merging would exceed time limit, save current item and start a new one
    if (isCurrentComplete || wouldExceedTimeLimit) {
      result.push(current);
      current = { ...item };
    } else {
      // Otherwise merge the current item with the next item
      current = {
        start: current.start,
        end: item.end,
        transcript: `${current.transcript} ${item.transcript}`,
      };
    }
  }

  // Add the last item
  if (current) {
    result.push(current);
  }

  return result;
};
