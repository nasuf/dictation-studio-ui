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
import { LANGUAGES } from "@/utils/const";

const { Content, Sider } = Layout;

// Define language mapping between Content.tsx and WordMain.tsx
const LANGUAGE_MAPPING: Record<string, string> = {
  [LANGUAGES.All]: "all",
  [LANGUAGES.English]: "en",
  [LANGUAGES.Chinese]: "zh",
  [LANGUAGES.Japanese]: "ja",
  [LANGUAGES.Korean]: "ko",
};

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

  // 从Redux获取用户信息和结构化的missed_words数据
  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const missedWords = useSelector(
    (state: RootState) => state.user.userInfo?.missed_words || {}
  );

  // 获取当前选择的语言
  const selectedLanguage = useSelector(
    (state: RootState) =>
      LANGUAGE_MAPPING[state.navigation.selectedLanguage] || "all"
  );

  // 创建扁平化的单词列表用于展示
  const [allWords, setAllWords] = useState<string[]>([]);

  // 当Redux数据变化时更新本地状态
  useEffect(() => {
    try {
      // 提取所有单词，创建扁平化的列表
      // 如果missedWords结构不正确，使用安全的方式处理
      const values = Object.values(missedWords);
      const flattenedWords = Array.isArray(values) ? values.flat() : [];
      setAllWords(flattenedWords);
    } catch (error) {
      console.error("Error processing missed words:", error);
      setAllWords([]);
    }
  }, [missedWords]);

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

  // 获取基于选定语言的过滤后单词
  const getFilteredWords = useCallback(() => {
    if (selectedLanguage === "all") {
      return allWords;
    }

    // 如果选择了特定语言，返回该语言的单词
    if (missedWords[selectedLanguage]) {
      return missedWords[selectedLanguage];
    }

    // 如果没有该语言的单词，返回空数组
    return [];
  }, [allWords, missedWords, selectedLanguage]);

  useEffect(() => {
    if (activeMode === "dictation") {
      fetchRandomWord();
    }
  }, [allWords, activeMode, selectedLanguage]);

  useEffect(() => {
    if (userInputRef.current) {
      userInputRef.current.focus();
    }
  }, []);

  const fetchRandomWord = () => {
    const filteredWords = getFilteredWords();

    if (filteredWords.length === 0) {
      setRandomWord("");
      return;
    }

    const newWord =
      filteredWords[Math.floor(Math.random() * filteredWords.length)];
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

      // Determine language for speech synthesis
      const charCode = word.charCodeAt(0);
      if (charCode >= 0x4e00 && charCode <= 0x9fff) {
        utterance.lang = "zh-CN"; // Chinese
      } else if (
        (charCode >= 0x3040 && charCode <= 0x309f) ||
        (charCode >= 0x30a0 && charCode <= 0x30ff)
      ) {
        utterance.lang = "ja-JP"; // Japanese
      } else if (charCode >= 0xac00 && charCode <= 0xd7a3) {
        utterance.lang = "ko-KR"; // Korean
      } else {
        utterance.lang = "en-US"; // Default to English
      }

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

  const DictationMode = () => {
    const filteredWords = getFilteredWords();

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-4">
        {filteredWords.length > 0 ? (
          <>
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
                <p className="font-bold">
                  {t("wordDictationKeyboardInstructions")}
                </p>
              </div>
            </div>
          </>
        ) : (
          <Empty
            description={
              selectedLanguage === "all"
                ? t("noCollectedWords")
                : t("noWordsInSelectedLanguage")
            }
            className="dark:text-gray-400"
          />
        )}
      </div>
    );
  };

  const PreviewMode = () => {
    const filteredWords = getFilteredWords();

    return (
      <ScrollableContainer className="h-full overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-4xl mx-auto p-6">
          <div className="flex justify-between mb-4">
            <span className="text-gray-500 dark:text-gray-400">
              {t("totalWords")}: {filteredWords.length}
            </span>
          </div>

          {filteredWords.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredWords.map((word, index) => (
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
          ) : (
            <Empty
              description={
                selectedLanguage === "all"
                  ? t("noCollectedWords")
                  : t("noWordsInSelectedLanguage")
              }
              className="dark:text-gray-400"
            />
          )}
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
      {allWords.length > 0 ? (
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
            description={
              !userInfo
                ? t("loginToViewWords")
                : selectedLanguage === "all"
                ? t("noCollectedWords")
                : t("noWordsInSelectedLanguage")
            }
            className="dark:text-gray-400"
          />
        </div>
      )}
    </Layout>
  );
};
