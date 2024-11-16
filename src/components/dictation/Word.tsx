import { api } from "@/api/api";
import { MagicCard } from "@/lib/magic-ui-components/MagicCard";
import { Input, InputRef } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export const Word: React.FC<{ style: React.CSSProperties }> = ({ style }) => {
  interface WordData {
    word: string;
    definition?: string;
  }

  const [wordData, setWordData] = useState<WordData>({ word: "" });
  const [userInput, setUserInput] = useState("");
  const [isBlurred, setIsBlurred] = useState(true);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const { t } = useTranslation();
  const userInputRef = useRef<InputRef>(null);

  useEffect(() => {
    fetchRandomWord();
  }, []);

  useEffect(() => {
    if (userInputRef.current) {
      userInputRef.current.focus();
    }
  }, []);

  const fetchRandomWord = () => {
    setUserInput("");
    setIsBlurred(true);
    (async () => {
      try {
        // Using the Random Word API from API Ninjas
        // const response = await fetch(
        //   "https://api.api-ninjas.com/v1/randomword",
        //   {
        //     headers: {
        //       "X-Api-Key": "SzOENN9+NEKsUgzzSNsrSw==9hOxftSvUXPrb5di", // Replace with your actual API key
        //     },
        //   }
        // );
        const response = await api.getMissedWords();
        const missed_words = response.data.missed_words;
        const randomIndex = Math.floor(Math.random() * missed_words.length);
        setWordData({ word: missed_words[randomIndex] });
        speakWord(missed_words[randomIndex]);
      } catch (error) {
        console.error("Error fetching random word:", error);
        setWordData({ word: "Error fetching word" });
      }
    })();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Tab") {
      event.preventDefault(); // Prevent default tab behavior
      speakWord(wordData.word);
    } else if (event.key === "Enter") {
      event.preventDefault(); // Prevent default tab behavior
      if (isBlurred) {
        setIsBlurred(false);
        validateAnswer(userInput);
      } else {
        setIsCorrect(null);
        fetchRandomWord();
      }
    }
  };

  const validateAnswer = (userInput: string) => {
    setIsCorrect(
      String(userInput).toLowerCase() === String(wordData.word).toLowerCase()
    );
  };

  const speakWord = useCallback((word: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      utterance.rate = 1.0;
      speechSynthesis.speak(utterance);
      console.log("Speaking word:", word);
    } else {
      console.log("Text-to-speech not supported.");
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4">
      <div
        style={style}
        className="flex flex-col items-center justify-center gap-4 mb-8"
      >
        <MagicCard
          className="cursor-pointer flex-col items-center justify-center shadow-2xl whitespace-nowrap text-4xl w-full"
          gradientColor={"#D9D9D955"}
        >
          <div className="flex flex-col justify-between items-center h-full py-8">
            <div
              className="flex-grow flex items-center justify-center"
              style={{
                filter: isBlurred ? "blur(10px)" : "none",
                transition: "filter 0.3s ease-in-out",
              }}
            >
              {wordData.word}
            </div>
            <div
              className="mt-4"
              style={{
                color:
                  isCorrect === true
                    ? "green"
                    : isCorrect === null
                    ? "black"
                    : "red",
              }}
            >
              {userInput}
            </div>
          </div>
        </MagicCard>
      </div>

      <div className="flex flex-col items-center gap-4 w-full max-w-[640px]">
        <Input
          ref={userInputRef}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("inputPlaceHolder")}
          className="w-full"
        />
        <div
          className="bg-gradient-to-r from-blue-300 to-gray-100 border-blue-500 text-blue-700 p-4
              dark:bg-gradient-to-r dark:from-orange-600 dark:to-gray-700 dark:border-blue-400 dark:text-blue-200 rounded-md"
        >
          <p className="font-bold">{t("wordDictationKeyboardInstructions")}</p>
        </div>
      </div>
    </div>
  );
};
