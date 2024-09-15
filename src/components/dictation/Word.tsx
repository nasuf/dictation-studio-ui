import { MagicCard } from "@/lib/magic-ui-components/MagicCard";
import { useEffect, useState } from "react";

export const Word = () => {
  const [randomWord, setRandomWord] = useState<string>("");
  useEffect(() => {
    setRandomWord(getRandomWord());
  });
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
    <div
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
  );
};
