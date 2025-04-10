import React, { useState } from "react";
import { Modal, Button, Checkbox, Tag, Empty, message, Select } from "antd";
import { useTranslation } from "react-i18next";
import { FilterOption } from "@/utils/type";
import { api } from "@/api/api";
import { useDispatch, useSelector } from "react-redux";
import {
  setCurrentMissedWords,
  setMissedWords,
  setStructuredMissedWords,
} from "@/redux/userSlice";
import { ARTICLES_AND_DETERMINERS, FILTER_OPTIONS } from "@/utils/const";
import nlp from "compromise";
import { VideoMainRef } from "@/components/dictation/video/VideoMain";
import { RootState } from "@/redux/store";
import { GlobalOutlined } from "@ant-design/icons";

const { Option } = Select;

interface MissedWordsModalProps {
  visible: boolean;
  onClose: () => void;
  videoMainRef: React.RefObject<VideoMainRef>;
}

const MissedWordsModal: React.FC<MissedWordsModalProps> = ({
  visible,
  onClose,
  videoMainRef,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isSavingWords, setIsSavingWords] = useState(false);
  const [filterOptions, setFilterOptions] =
    useState<FilterOption[]>(FILTER_OPTIONS);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const currentMissedWords = useSelector(
    (state: RootState) => state.user.currentMissedWords
  );

  // Language options
  const LANGUAGE_OPTIONS = [
    { value: "all", label: "All Languages" },
    { value: "en", label: "English" },
    { value: "zh", label: "Chinese" },
    { value: "ja", label: "Japanese" },
    { value: "ko", label: "Korean" },
    { value: "other", label: "Other" },
  ];

  // Function to detect language for word organization
  const detectWordLanguage = (word: string): string => {
    if (!word) return "other";

    const charCode = word.charCodeAt(0);

    // Chinese character range
    if (0x4e00 <= charCode && charCode <= 0x9fff) {
      return "zh";
    }
    // Japanese character ranges (Hiragana, Katakana)
    else if (
      (0x3040 <= charCode && charCode <= 0x309f) ||
      (0x30a0 <= charCode && charCode <= 0x30ff)
    ) {
      return "ja";
    }
    // Korean character range (Hangul)
    else if (0xac00 <= charCode && charCode <= 0xd7a3) {
      return "ko";
    }
    // Basic Latin alphabet and common English characters
    else if (
      (0x0020 <= charCode && charCode <= 0x007f) ||
      (0x0080 <= charCode && charCode <= 0x00ff)
    ) {
      return "en";
    }
    // Other languages/scripts
    else {
      return "other";
    }
  };

  // Group words by language
  const groupWordsByLanguage = (words: string[]) => {
    const grouped: Record<string, string[]> = {};

    words.forEach((word) => {
      const lang = detectWordLanguage(word);
      if (!grouped[lang]) {
        grouped[lang] = [];
      }
      grouped[lang].push(word);
    });

    return grouped;
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setFilterOptions(filterOptions.map((option) => ({ ...option, checked })));
  };

  const handleFilterChange = (key: string, checked: boolean) => {
    setFilterOptions((prevOptions) => {
      const newOptions = prevOptions.map((option) =>
        option.key === key ? { ...option, checked } : option
      );
      setSelectAll(newOptions.every((option) => option.checked));
      return newOptions;
    });
  };

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
  };

  const handleSaveMissedWords = async () => {
    try {
      setIsSavingWords(true);
      const response = await api.saveMissedWords(newMissedWords);
      message.success(t("missedWordsSaved"));

      // Update both the flat list and structured format
      dispatch(setMissedWords(response.data.missed_words));
      if (response.data.structured_missed_words) {
        dispatch(
          setStructuredMissedWords(response.data.structured_missed_words)
        );
      } else {
        // If backend doesn't return structured format, create it locally
        dispatch(
          setStructuredMissedWords(
            groupWordsByLanguage(response.data.missed_words)
          )
        );
      }

      onClose();
    } catch (error) {
      console.error("Error saving missed words:", error);
      message.error(t("missedWordsSaveFailed"));
    } finally {
      setIsSavingWords(false);
    }
  };

  const handleRemoveMissedWord = (word: string) => {
    if (videoMainRef.current) {
      const cleanWord = word.replace(/^[^\w\s]+|[^\w\s]+$/g, "").toLowerCase();
      videoMainRef.current.removeMissedWord(cleanWord);
      dispatch(
        setCurrentMissedWords(currentMissedWords.filter((w) => w !== word))
      );
    }
  };

  // Filter words first by applied filters
  const filteredWords = currentMissedWords.filter((word) => {
    const doc = nlp(word);
    if (
      filterOptions.find((o) => o.key === "removePrepositions")?.checked &&
      doc.prepositions().length > 0
    )
      return false;
    if (
      filterOptions.find((o) => o.key === "removePronouns")?.checked &&
      doc.pronouns().length > 0
    )
      return false;
    if (
      filterOptions.find((o) => o.key === "removeAuxiliaryVerbs")?.checked &&
      doc.verbs().conjugate().length > 0
    )
      return false;
    if (
      filterOptions.find((o) => o.key === "removeNumbers")?.checked &&
      doc.numbers().length > 0
    )
      return false;
    if (
      filterOptions.find((o) => o.key === "removeArticleOrDeterminer")
        ?.checked &&
      ARTICLES_AND_DETERMINERS.includes(word.toLowerCase())
    )
      return false;
    if (
      filterOptions.find((o) => o.key === "removeConjunctions")?.checked &&
      doc.conjunctions().length > 0
    )
      return false;
    return true;
  });

  // Then filter by selected language
  const newMissedWords =
    selectedLanguage === "all"
      ? filteredWords
      : filteredWords.filter(
          (word) => detectWordLanguage(word) === selectedLanguage
        );

  // Count words by language for display
  const wordCountsByLanguage = groupWordsByLanguage(filteredWords);

  return (
    <Modal
      title={t("missedWordsSummary")}
      open={visible}
      onCancel={onClose}
      footer={
        newMissedWords.length > 0
          ? [
              <Button
                key="cancel"
                onClick={onClose}
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
              >
                {t("cancel")}
              </Button>,
              <Button
                key="save"
                type="primary"
                loading={isSavingWords}
                onClick={handleSaveMissedWords}
                className="bg-blue-500 hover:bg-blue-600 dark:bg-orange-500 dark:hover:bg-orange-600"
              >
                {t("save")}
              </Button>,
            ]
          : null
      }
      width={800}
      styles={{
        body: {
          maxHeight: "calc(100vh - 250px)",
          padding: 0,
        },
      }}
      className="dark:bg-gray-800 dark:text-white"
    >
      {filteredWords.length > 0 ? (
        <div className="sticky top-0 bg-white dark:bg-gray-700 z-10 p-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center">
              <GlobalOutlined className="text-gray-500 mr-2" />
              <span className="mr-2 text-gray-700 dark:text-gray-300">
                {t("languageFilter")}:
              </span>
              <Select
                value={selectedLanguage}
                onChange={handleLanguageChange}
                style={{ width: 180 }}
                className="dark:text-gray-700"
              >
                {LANGUAGE_OPTIONS.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {t(option.label)}
                    {option.value !== "all" &&
                      wordCountsByLanguage[option.value] &&
                      ` (${wordCountsByLanguage[option.value].length})`}
                  </Option>
                ))}
              </Select>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">
                {t("totalWords")}: {filteredWords.length}
              </span>
            </div>
          </div>

          <Checkbox
            checked={selectAll}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="mb-2 font-bold"
          >
            {t("selectAll")}
          </Checkbox>
          <br />
          {filterOptions.map((option) => (
            <Checkbox
              key={option.key}
              checked={option.checked}
              onChange={(e) => handleFilterChange(option.key, e.target.checked)}
              className="mr-4 mb-2"
            >
              {t(option.translationKey)}
            </Checkbox>
          ))}
        </div>
      ) : (
        <Empty description={t("noMissedWordsYet")} />
      )}
      <div className="p-4 overflow-y-auto max-h-[calc(100vh-400px)] dark:bg-gray-800 custom-scrollbar">
        <div className="flex flex-wrap gap-2">
          {newMissedWords.map((word) => (
            <Tag
              key={word}
              closable
              onClose={() => handleRemoveMissedWord(word)}
              className="text-base py-1 px-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
            >
              {word}
            </Tag>
          ))}
        </div>
        {newMissedWords.length === 0 && filteredWords.length > 0 && (
          <Empty description={t("noWordsInSelectedLanguage")} />
        )}
      </div>
    </Modal>
  );
};

export default MissedWordsModal;
