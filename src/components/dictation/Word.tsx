import { MagicCard } from "@/lib/magic-ui-components/MagicCard";
import { Input } from "antd";
import { useEffect, useState } from "react";

export const Word: React.FC<{ style: React.CSSProperties }> = ({ style }) => {
  interface WordData {
    word: string;
    definition?: string;
  }
  const [wordData, setWordData] = useState<WordData>({ word: "" });
  const [userInput, setUserInput] = useState("");

  const fetchRandomWord = async () => {
    try {
      // Using the Random Word API from API Ninjas
      const response = await fetch("https://api.api-ninjas.com/v1/randomword", {
        headers: {
          "X-Api-Key": "SzOENN9+NEKsUgzzSNsrSw==9hOxftSvUXPrb5di", // Replace with your actual API key
        },
      });
      const data = await response.json();
      setWordData({ word: data.word });
    } catch (error) {
      console.error("Error fetching random word:", error);
      setWordData({ word: "Error fetching word" });
    }
  };

  useEffect(() => {
    fetchRandomWord();
  }, []);

  return (
    <>
      <div
        style={style}
        className={
          "flex h-[500px] w-full flex-col gap-4 lg:h-[250px] lg:flex-row"
        }
      >
        <MagicCard
          className="cursor-pointer flex-col items-center justify-center shadow-2xl whitespace-nowrap text-4xl"
          gradientColor={"#D9D9D955"}
        >
          {wordData.word}
        </MagicCard>
      </div>
      <Input
        style={{ marginTop: "20px", width: "640px" }}
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="输入你听到的内容"
      />
      <p style={{ marginTop: "10px" }}>按 Enter 键提交并验证答案。</p>
    </>
  );
};
