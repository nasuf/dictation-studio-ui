import React, { useState } from "react";
import { Modal, Button, Checkbox, Tag, Empty, message } from "antd";
import { useTranslation } from "react-i18next";
import { FilterOption } from "@/utils/type";
import { api } from "@/api/api";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentMissedWords, setMissedWords } from "@/redux/userSlice";
import { ARTICLES_AND_DETERMINERS, FILTER_OPTIONS } from "@/utils/const";
import nlp from "compromise";
import { VideoMainRef } from "@/components/dictation/video/VideoMain";
import { RootState } from "@/redux/store";

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
  const currentMissedWords = useSelector(
    (state: RootState) => state.user.currentMissedWords
  );

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

  const handleSaveMissedWords = async () => {
    try {
      setIsSavingWords(true);

      // 调用API保存分组后的missed_words
      const response = await api.saveMissedWords(filteredWords);
      message.success(t("missedWordsSaved"));

      // 直接更新Redux中的结构化missed_words
      if (response.data && response.data.missed_words) {
        dispatch(setMissedWords(response.data.missed_words));
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
  return (
    <Modal
      title={t("missedWordsSummary")}
      open={visible}
      onCancel={onClose}
      footer={
        filteredWords.length > 0
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
          {filteredWords.map((word) => (
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
      </div>
    </Modal>
  );
};

export default MissedWordsModal;
