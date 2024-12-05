import { useState, useRef, useEffect, useCallback } from "react";
import { Input, InputRef, Layout, Menu, Empty } from "antd";
import {
  SoundOutlined,
  EditOutlined,
  UnorderedListOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { MagicCard } from "@/lib/magic-ui-components/MagicCard";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { ScrollableContainer } from "@/components/dictation/video/Widget";

const { Content, Sider } = Layout;

interface WordProps {
  style: React.CSSProperties;
  onEditingChange: (isEditing: boolean) => void;
  onWordsToDeleteChange: (words: Set<string>) => void;
  shouldReset?: boolean;
}

export const Word: React.FC<WordProps> = ({
  style,
  onEditingChange,
  onWordsToDeleteChange,
  shouldReset,
}) => {
  const { t } = useTranslation();
  const [activeMode, setActiveMode] = useState<"dictation" | "preview">(
    "preview"
  );
  const missedWords = useSelector(
    (state: RootState) => state.user.userInfo?.missed_words || []
  );

  const [userInput, setUserInput] = useState("");
  const [isBlurred, setIsBlurred] = useState(true);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const userInputRef = useRef<InputRef>(null);
  const [randomWord, setRandomWord] = useState("");
  const [wordsToDelete, setWordsToDelete] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (shouldReset) {
      setWordsToDelete(new Set());
    }
  }, [shouldReset]);

  useEffect(() => {
    if (activeMode === "dictation") {
      fetchRandomWord();
    }
  }, [missedWords, activeMode]);

  useEffect(() => {
    if (userInputRef.current) {
      userInputRef.current.focus();
    }
  }, []);

  const fetchRandomWord = () => {
    const newWord = missedWords[Math.floor(Math.random() * missedWords.length)];
    setUserInput("");
    setIsBlurred(true);
    setRandomWord(newWord);
    speakWord(newWord);
    if (userInputRef.current) {
      userInputRef.current.focus();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Tab") {
      event.preventDefault();
      speakWord(randomWord);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (isBlurred) {
        setIsBlurred(false);
        validateAnswer(userInput);
      } else {
        setIsCorrect(null);
        fetchRandomWord();
      }
    }
    if (userInputRef.current) {
      userInputRef.current.focus();
    }
  };

  const validateAnswer = (userInput: string) => {
    setIsCorrect(
      String(userInput).toLowerCase() === String(randomWord).toLowerCase()
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

  const handleDeleteWord = (word: string) => {
    const newWordsToDelete = new Set(wordsToDelete);
    if (newWordsToDelete.has(word)) {
      newWordsToDelete.delete(word);
    } else {
      newWordsToDelete.add(word);
    }
    setWordsToDelete(newWordsToDelete);
    onWordsToDeleteChange(newWordsToDelete);
    onEditingChange(newWordsToDelete.size > 0);
  };

  const DictationMode = () => (
    <div className="flex flex-col items-center justify-center w-full h-full p-4">
      <div
        style={style}
        className="flex flex-col items-center justify-center gap-4 mb-8"
        onClick={() => speakWord(randomWord)}
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
              {randomWord}
            </div>
            <div
              className={`mt-4 ${
                isCorrect === null
                  ? "text-black dark:text-orange-500"
                  : isCorrect
                  ? "text-green-500 dark:text-green-400"
                  : "text-red-500 dark:text-red-400"
              } transition-colors duration-300`}
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
          onChange={(e) => {
            setUserInput(e.target.value);
            if (userInputRef.current) {
              userInputRef.current.focus();
            }
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (userInputRef.current) {
              userInputRef.current.focus();
            }
          }}
          placeholder={t("inputPlaceHolder")}
          className="w-full text-lg p-2"
          autoFocus
        />
        <div
          className="bg-gradient-to-r from-blue-300 to-gray-100 border-blue-500 text-blue-700 p-4
              dark:bg-gradient-to-r dark:from-orange-900 dark:to-gray-800 dark:border-blue-400 dark:text-orange-300 rounded-md"
        >
          <p className="font-bold">{t("wordDictationKeyboardInstructions")}</p>
        </div>
      </div>
    </div>
  );

  const PreviewMode = () => {
    return (
      <ScrollableContainer className="h-full overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-4xl mx-auto p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {missedWords.map((word, index) => (
              <div
                key={index}
                className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-4 cursor-pointer"
                onClick={() => speakWord(word)}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`
                    text-lg font-medium transition-colors duration-300
                    ${
                      wordsToDelete.has(word)
                        ? "text-gray-300 dark:text-gray-600"
                        : "text-gray-900 dark:text-white"
                    }
                  `}
                  >
                    {word}
                  </span>
                  <div className="flex items-center gap-2">
                    <SoundOutlined className="text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <DeleteOutlined
                      className="text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWord(word);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollableContainer>
    );
  };

  const menuItems = [
    {
      key: "preview",
      icon: <UnorderedListOutlined />,
      label: t("wordPreview"),
      className: "dark:text-white",
    },
    {
      key: "dictation",
      icon: <EditOutlined />,
      label: t("wordDictation"),
      className: "dark:text-white",
    },
  ];

  return (
    <Layout className="h-full bg-transparent">
      {missedWords.length > 0 ? (
        <>
          <Sider
            className="bg-white dark:bg-gray-800 dark:text-white"
            width={200}
          >
            <Menu
              mode="inline"
              selectedKeys={[activeMode]}
              style={{ height: "100%", borderRight: 0 }}
              onSelect={({ key }) =>
                setActiveMode(key as "dictation" | "preview")
              }
              className="bg-white dark:bg-gray-800 dark:text-white"
              items={menuItems}
            />
          </Sider>
          <Content className="overflow-hidden bg-transparent bg-gradient-to-br from-gray-200 via-gray-100 to-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
            {activeMode === "dictation" ? <DictationMode /> : <PreviewMode />}
          </Content>
        </>
      ) : (
        <div className="flex justify-center items-center h-full w-full">
          <Empty
            description={t("noCollectedWords")}
            className="dark:text-gray-400"
          />
        </div>
      )}
    </Layout>
  );
};
