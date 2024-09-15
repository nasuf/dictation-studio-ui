import { MagicCard } from "@/lib/magic-ui-components/MagicCard";
import { Input, InputRef } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";

export const Word: React.FC<{ style: React.CSSProperties }> = ({ style }) => {
  interface WordData {
    word: string;
    definition?: string;
  }
  const [wordData, setWordData] = useState<WordData>({ word: "" });
  const [userInput, setUserInput] = useState("");
  const [isBlurred, setIsBlurred] = useState(true);
  const userInputRef = useRef<InputRef>(null);

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
        setWordData({ word: data.word });
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
      } else {
        fetchRandomWord();
      }
    }
  };

  const speakWord = useCallback((word: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    } else {
      console.log("Text-to-speech not supported.");
    }
  }, []);

  useEffect(() => {
    fetchRandomWord();
  }, []);

  useEffect(() => {
    if (userInputRef.current) {
      userInputRef.current.focus();
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
          <div
            style={{
              filter: isBlurred ? "blur(10px)" : "none",
              transition: "filter 0.3s ease-in-out",
            }}
          >
            {wordData.word}
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
        按 Enter 键提交并验证答案。再次按 Enter 键获取下一个单词。
      </p>
      <p style={{ marginTop: "10px" }}>按 Tab 键或点击卡片重新播放单词发音。</p>
    </>
  );
};
