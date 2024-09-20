import { MagicCard } from "@/lib/magic-ui-components/MagicCard";
import { Alert, Input, InputRef } from "antd";
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
        const response = await fetch(
          "https://api.api-ninjas.com/v1/randomword",
          {
            headers: {
              "X-Api-Key": "SzOENN9+NEKsUgzzSNsrSw==9hOxftSvUXPrb5di", // Replace with your actual API key
            },
          }
        );
        const data = await response.json();
        setWordData({ word: data.word[0] });
        speakWord(data.word);
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
    <>
      <div
        style={style}
        className={
          "flex h-[500px] w-full flex-col gap-4 lg:h-[250px] lg:flex-row"
        }
        onClick={() => speakWord(wordData.word)}
      >
        <MagicCard
          className="cursor-pointer flex-col items-center justify-center shadow-2xl whitespace-nowrap text-4xl"
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
      <Input
        ref={userInputRef}
        style={{ marginTop: "20px", width: "640px" }}
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="输入你听到的内容"
      />
      <p style={{ marginTop: "10px" }}>
        <Alert
          message={t("wordDictationKeyboardInstructions")}
          type="info"
          showIcon
        />
      </p>
    </>
  );
};
