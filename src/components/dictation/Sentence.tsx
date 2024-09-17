import { MagicCard } from "@/lib/magic-ui-components/MagicCard";
import { Alert, Input, InputRef } from "antd";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

export const Sentence: React.FC<{ style: React.CSSProperties }> = ({
  style,
}) => {
  const [sentence, setSentence] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isBlurred, setIsBlurred] = useState(true);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const userInputRef = useRef<InputRef>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setSentence("Get a new sentence");
    fetchNewSentence();
  }, []);

  useEffect(() => {
    if (userInputRef.current) {
      userInputRef.current.focus();
    }
  }, []);

  const fetchNewSentence = async () => {
    setUserInput("");
    setIsBlurred(true);
    setIsCorrect(null);

    try {
      const response = await axios.post(
        "http://localhost:4001/tts/",
        { text: sentence },
        {
          responseType: "blob",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const audioUrl = URL.createObjectURL(response.data);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      }
    } catch (error) {
      console.error("Error fetching new sentence:", error);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Tab") {
      event.preventDefault(); // Prevent default tab behavior
      if (audioRef.current) {
        audioRef.current.play();
      }
    } else if (event.key === "Enter") {
      event.preventDefault(); // Prevent default enter behavior
      if (isBlurred) {
        setIsBlurred(false);
        validateAnswer(userInput);
      } else {
        setIsCorrect(null);
        fetchNewSentence();
      }
    }
  };

  const validateAnswer = (userInput: string) => {
    setIsCorrect(
      String(userInput).toLowerCase() === String(sentence).toLowerCase()
    );
  };

  return (
    <>
      <div
        style={style}
        className={
          "flex h-[500px] w-full flex-col gap-4 lg:h-[250px] lg:flex-row"
        }
        onClick={() => audioRef.current?.play()}
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
              {sentence}
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
          message="按 Enter 键提交并验证答案。再次按 Enter 键获取下一个句子。按 Tab 键或点击卡片重新播放句子发音。"
          type="info"
          showIcon
        />
      </p>
      <audio ref={audioRef} />
    </>
  );
};
