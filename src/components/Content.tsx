import React, { useRef, useState, useMemo } from "react";
import { Layout, Button, Modal, Tag, Checkbox } from "antd";
import { Route, Routes, useLocation, Link } from "react-router-dom";
import {
  CloudUploadOutlined,
  FileTextOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { ChevronRightIcon } from "@heroicons/react/20/solid";

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
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import UserManagement from "@/components/admin/UserManagement";
import UserProgress from "@/components/profile/Progress";
import Information from "@/components/profile/Information";

import nlp from "compromise";
import { FilterOption } from "@/utils/type";

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
  const videoMainRef = useRef<VideoMainRef>(null);
  const { t } = useTranslation();
  const isDictationStarted = useSelector(
    (state: RootState) => state.user.isDictationStarted
  );

  const componentStyle = {
    width: "640px",
    height: "390px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const getBreadcrumbItems = () => {
    const pathSnippets = location.pathname.split("/").filter((i) => i);
    const breadcrumbItems = [{ title: "Home", path: "/" }];

    pathSnippets.forEach((snippet, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
      let title = snippet.charAt(0).toUpperCase() + snippet.slice(1);

      if (snippet === "channel" && location.state && location.state.name) {
        title = location.state.name;
      }

      breadcrumbItems.push({ title, path: url });
    });

    return breadcrumbItems;
  };

  const handleSaveProgress = () => {
    if (videoMainRef.current) {
      videoMainRef.current.saveProgress();
    }
  };

  const isVideoPage = /^\/dictation\/video\/[^/]+\/[^/]+$/.test(
    location.pathname
  );

  const [isMissedWordsModalVisible, setIsMissedWordsModalVisible] =
    useState(false);
  const [missedWords, setMissedWords] = useState<string[]>([]);
  const [isDictationCompleted, setIsDictationCompleted] = useState(false);

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

  return (
    <div className="h-[calc(100vh-64px)]">
      <Content className="p-6 bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 h-full">
        <div className="flex justify-between items-center mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg shadow-md px-4 py-2">
              {getBreadcrumbItems().map((item, index) => (
                <li key={index} className="inline-flex items-center">
                  {index > 0 && (
                    <ChevronRightIcon
                      className="w-5 h-5 text-gray-400 mx-2"
                      aria-hidden="true"
                    />
                  )}
                  <Link
                    to={item.path}
                    className={`inline-flex items-center text-sm font-medium transition-colors duration-200 ease-in-out
                      ${
                        index === getBreadcrumbItems().length - 1
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                      }`}
                  >
                    {index === 0 ? (
                      <HomeOutlined className="mr-2 h-5 w-5" />
                    ) : (
                      <span
                        className={`w-2 h-2 rounded-full mr-2
                          ${
                            index === getBreadcrumbItems().length - 1
                              ? "bg-blue-600 dark:bg-blue-400"
                              : "bg-gray-300 dark:bg-gray-600"
                          }`}
                      ></span>
                    )}
                    {item.title}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
          {isVideoPage && (
            <div className="space-x-4">
              <Button
                onClick={showMissedWordsModal}
                disabled={!isDictationCompleted}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out transform hover:scale-105"
              >
                <FileTextOutlined className="mr-2" />
                {t("missedWordsSummary")}
              </Button>
              <Button
                onClick={handleSaveProgress}
                disabled={!isDictationStarted}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white dark:from-green-600 dark:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out transform hover:scale-105"
              >
                <CloudUploadOutlined className="mr-2" />
                {t("saveProgressBtnText")}
              </Button>
            </div>
          )}
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md h-full">
          <Layout className="bg-transparent h-full">
            <AppSider />
            <Content className="p-6 min-h-[80vh] h-full bg-gradient-to-r from-gray-100 via-gray-50 to-gray-0 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 ">
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
                  element={
                    <VideoMain
                      ref={videoMainRef}
                      onComplete={() => setIsDictationCompleted(true)}
                    />
                  }
                />
                <Route
                  path="/dictation/word"
                  element={<Word style={componentStyle} />}
                />
                <Route path="/collection/video" element={<div>文章收藏</div>} />
                <Route path="/collection/word" element={<div>单词收藏</div>} />
                <Route
                  path="/radio"
                  element={<Radio style={componentStyle} />}
                />
                <Route path="/admin/channel" element={<ChannelManagement />} />
                <Route path="/admin/video" element={<VideoManagement />} />
                <Route path="/admin/user" element={<UserManagement />} />
                <Route path="/profile" element={<Information />} />
                <Route path="/profile/infomation" element={<Information />} />
                <Route path="/profile/progress" element={<UserProgress />} />
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
          bodyStyle={{ maxHeight: "calc(100vh - 200px)", padding: 0 }}
          className="dark:bg-gray-800 dark:text-white"
        >
          <div className="sticky top-0 bg-white dark:bg-gray-700 z-10 p-4 border-b border-gray-200 dark:border-gray-600">
            <Checkbox
              checked={selectAll}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="mb-2 font-bold dark:text-white"
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
                className="mr-4 mb-2 dark:text-gray-300"
              >
                {t(option.translationKey)}
              </Checkbox>
            ))}
          </div>
          <div className="p-4 overflow-y-auto max-h-[calc(100vh-300px)] dark:bg-gray-800">
            <div className="flex flex-wrap gap-2">
              {filteredMissedWords.map((word) => (
                <Tag
                  key={word}
                  closable
                  onClose={() => handleRemoveMissedWord(word)}
                  className="text-base py-1 px-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {word}
                </Tag>
              ))}
            </div>
          </div>
        </Modal>
      </Content>
    </div>
  );
};

export default AppContent;
