import React, { useRef, useState, useMemo, useEffect } from "react";
import { Layout, Modal, Tag, Checkbox, Empty } from "antd";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  CloudUploadOutlined,
  LoadingOutlined,
  FileTextOutlined,
  ArrowLeftOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { resetNavigation } from "@/redux/navigationSlice";
import AppSider from "@/components/Sider";
import { Word } from "@/components/dictation/Word";
import VideoMain, {
  VideoMainRef,
} from "@/components/dictation/video/VideoMain";
import Radio from "@/components/dictation/Radio";
import ChannelList from "@/components/dictation/video/ChannelList";
import VideoList from "@/components/dictation/video/VideoList";
import ChannelManagement from "@/components/admin/ChannelManagement";
import VideoManagement from "@/components/admin/VideoManagement";
import { useTranslation } from "react-i18next";
import UserManagement from "@/components/admin/UserManagement";
import UserProgress from "@/components/profile/Progress";
import Information from "@/components/profile/Information";

import nlp from "compromise";
import { FilterOption } from "@/utils/type";
import { UpgradePlan } from "@/components/profile/UpgradePlan";

const { Content } = Layout;

const isArticleOrDeterminer = (word: string): boolean => {
  const articlesAndDeterminers = [
    "a",
    "an",
    "the",
    "this",
    "that",
    "these",
    "those",
    "my",
    "your",
    "his",
    "her",
    "its",
    "our",
    "their",
    "some",
    "any",
    "many",
    "much",
    "few",
    "little",
    "several",
    "enough",
    "all",
    "both",
    "each",
    "every",
  ];
  return articlesAndDeterminers.includes(word.toLowerCase());
};

const removePunctuation = (word: string) => {
  return word.replace(/^[^\w\s]+|[^\w\s]+$/g, "").toLowerCase();
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const videoMainRef = useRef<VideoMainRef>(null);
  const { t } = useTranslation();
  const isDictationStarted = useSelector(
    (state: RootState) => state.user.isDictationStarted
  );
  const isSavingProgress = useSelector(
    (state: RootState) => state.user.isSavingProgress
  );

  useEffect(() => {
    const pathParts = location.pathname.split("/");
    if (pathParts[1] !== "dictation" || pathParts[2] !== "video") {
      dispatch(resetNavigation());
    }
  }, [location.pathname, dispatch]);

  const componentStyle = {
    width: "640px",
    height: "390px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const handleSaveProgress = () => {
    if (videoMainRef.current) {
      videoMainRef.current.saveProgress();
    }
  };

  const handleResetProgress = () => {
    if (videoMainRef.current) {
      videoMainRef.current.resetProgress();
    }
  };

  const isVideoPage = /^\/dictation\/video\/[^/]+\/[^/]+$/.test(
    location.pathname
  );

  const [isMissedWordsModalVisible, setIsMissedWordsModalVisible] =
    useState(false);
  const [missedWords, setMissedWords] = useState<string[]>([]);

  const showMissedWordsModal = () => {
    if (videoMainRef.current) {
      setMissedWords(videoMainRef.current.getMissedWords());
      setIsMissedWordsModalVisible(true);
    }
  };

  const handleRemoveMissedWord = (word: string) => {
    if (videoMainRef.current) {
      const cleanWord = removePunctuation(word);
      videoMainRef.current.removeMissedWord(cleanWord);
      setMissedWords((prev) =>
        prev.filter((w) => removePunctuation(w) !== cleanWord)
      );
    }
  };

  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([
    {
      key: "removePrepositions",
      translationKey: "filterPrepositions",
      checked: false,
    },
    { key: "removePronouns", translationKey: "filterPronouns", checked: false },
    {
      key: "removeAuxiliaryVerbs",
      translationKey: "filterAuxiliaryVerbs",
      checked: false,
    },
    { key: "removeNumbers", translationKey: "filterNumbers", checked: false },
    {
      key: "removeArticleOrDeterminer",
      translationKey: "filterArticlesAndDeterminers",
      checked: false,
    },
    {
      key: "removeConjunctions",
      translationKey: "filterConjunctions",
      checked: false,
    },
  ]);

  const [selectAll, setSelectAll] = useState(false);

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

  const filteredMissedWords = useMemo(() => {
    return missedWords.filter((word) => {
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
        isArticleOrDeterminer(word)
      )
        return false;
      if (
        filterOptions.find((o) => o.key === "removeConjunctions")?.checked &&
        doc.conjunctions().length > 0
      )
        return false;
      return true;
    });
  }, [missedWords, filterOptions]);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-700">
      <div className="flex-shrink-0 p-6">
        <div className="flex justify-between items-center">
          <button
            onClick={handleGoBack}
            className="flex items-center justify-center px-4 py-2 bg-white-500 text-black shadow-md rounded-md hover:bg-gray-100 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-100 focus:ring-opacity-50
             dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:hover:text-gray-300 dark:hover:ring-gray-600"
          >
            <ArrowLeftOutlined className="mr-2" />
            <span>{t("goBack")}</span>
          </button>
          {isVideoPage && (
            <div className="space-x-4 button-container">
              <button
                onClick={showMissedWordsModal}
                className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white shadow-md rounded-md hover:bg-blue-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50
   dark:bg-blue-700 dark:text-white dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:dark:opacity-50"
              >
                <FileTextOutlined className="mr-2" />
                {t("missedWordsSummary")}
              </button>
              <button
                onClick={handleResetProgress}
                disabled={!isDictationStarted}
                className="flex items-center justify-center px-4 py-2 bg-yellow-500 text-white shadow-md rounded-md hover:bg-yellow-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-opacity-50
   dark:bg-yellow-700 dark:text-white dark:hover:bg-yellow-800"
              >
                <ReloadOutlined className="mr-2" />
                {t("resetProgress")}
              </button>
              <button
                onClick={handleSaveProgress}
                disabled={!isDictationStarted}
                className="flex items-center justify-center px-4 py-2 bg-green-500 text-white shadow-md rounded-md hover:bg-green-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50
   dark:bg-green-700 dark:text-white dark:hover:bg-green-800"
              >
                {isSavingProgress ? (
                  <LoadingOutlined className="mr-2" />
                ) : (
                  <CloudUploadOutlined className="mr-2" />
                )}
                {t("saveProgressBtnText")}
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex-grow overflow-hidden bg-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 rounded-lg mx-6 mb-6">
        <Layout className="h-full bg-transparent">
          <AppSider />
          <Content className="overflow-hidden bg-transparent bg-gradient-to-br from-gray-200 via-gray-100 to-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 custom-scrollbar">
            <Routes>
              <Route path="/" element={<ChannelList />} />
              <Route path="/dictation" element={<ChannelList />} />
              <Route path="/dictation/video" element={<ChannelList />} />
              <Route
                path="/dictation/video/:channelId"
                element={<VideoList />}
              />
              <Route
                path="/dictation/video/:channelId/:videoId"
                element={<VideoMain ref={videoMainRef} onComplete={() => {}} />}
              />
              <Route
                path="/dictation/word"
                element={<Word style={componentStyle} />}
              />
              <Route path="/collection/video" element={<div>文章收藏</div>} />
              <Route path="/collection/word" element={<div>单词收藏</div>} />
              <Route path="/radio" element={<Radio style={componentStyle} />} />
              <Route path="/admin/channel" element={<ChannelManagement />} />
              <Route path="/admin/video" element={<VideoManagement />} />
              <Route path="/admin/user" element={<UserManagement />} />
              <Route path="/profile" element={<Information />} />
              <Route path="/profile/information" element={<Information />} />
              <Route path="/profile/progress" element={<UserProgress />} />
              <Route path="/profile/upgrade-plan" element={<UpgradePlan />} />
            </Routes>
          </Content>
        </Layout>
      </div>
      <Modal
        title={t("missedWordsSummary")}
        open={isMissedWordsModalVisible}
        onCancel={() => setIsMissedWordsModalVisible(false)}
        footer={null}
        width={800}
        styles={{ body: { maxHeight: "calc(100vh - 200px)", padding: 0 } }}
        className="dark:bg-gray-800 dark:text-white"
      >
        {/* if there are no missed words, don't show the filter options */}
        {filteredMissedWords.length > 0 ? (
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
                onChange={(e) =>
                  handleFilterChange(option.key, e.target.checked)
                }
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
            {filteredMissedWords.map((word) => (
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
    </div>
  );
};

export default AppContent;
