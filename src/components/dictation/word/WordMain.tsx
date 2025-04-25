import { useState, useRef, useEffect, useCallback } from "react";
import { InputRef, Layout, Empty } from "antd";
import { SoundOutlined, DeleteOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { ScrollableContainer } from "@/components/dictation/video/Widget";
import { LANGUAGES } from "@/utils/const";

const { Content } = Layout;

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
  onEditingChange,
  onWordsToDeleteChange,
  shouldReset,
}) => {
  const { t } = useTranslation();

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

  const userInputRef = useRef<InputRef>(null);
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
    if (userInputRef.current) {
      userInputRef.current.focus();
    }
  }, []);

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
        ``;
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

  const PreviewMode = () => {
    const filteredWords = getFilteredWords();

    return (
      <ScrollableContainer className="h-full overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-4xl mx-auto p-6">
          {filteredWords.length > 0 && (
            <div className="flex justify-between mb-4">
              <span className="text-gray-500 dark:text-gray-400">
                {t("totalWords")}: {filteredWords.length}
              </span>
            </div>
          )}

          {filteredWords.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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

  return (
    <Layout className="h-full bg-transparent">
      {allWords.length > 0 ? (
        <Content className="overflow-hidden bg-transparent bg-gradient-to-br from-gray-200 via-gray-100 to-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
          {<PreviewMode />}
        </Content>
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
