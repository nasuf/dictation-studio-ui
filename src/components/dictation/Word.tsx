import { MagicCard } from "@/lib/magic-ui-components/MagicCard";
import { Input } from "antd";
import { useEffect, useState } from "react";

export const Word: React.FC<{ style: React.CSSProperties }> = ({ style }) => {
  const [randomWord, setRandomWord] = useState<string>("");
  useEffect(() => {
    setRandomWord(getRandomWord());
  });
  const [userInput, setUserInput] = useState("");
  const getRandomWord = () => {
    const words = [
      "apple",
      "banana",
      "cherry",
      "date",
      "elderberry",
      "fig",
      "grape",
    ];
    return words[Math.floor(Math.random() * words.length)];
  };
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
          {randomWord}
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
