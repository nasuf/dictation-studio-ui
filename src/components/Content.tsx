import React, { useEffect, useRef, useState } from "react";
import { Layout, message } from "antd";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  CloudUploadOutlined,
  LoadingOutlined,
  FileTextOutlined,
  ArrowLeftOutlined,
  ReloadOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { resetNavigation, setSelectedLanguage } from "@/redux/navigationSlice";
import AppSider from "@/components/Sider";
import { Word } from "@/components/dictation/word/WordMain";
import VideoMain, {
  VideoMainRef,
} from "@/components/dictation/video/VideoMain";
import Radio from "@/components/dictation/radio/RadioMain";
import ChannelList from "@/components/dictation/video/ChannelList";
import VideoList from "@/components/dictation/video/VideoList";
import ChannelManagement from "@/components/admin/ChannelManagement";
import VideoManagement from "@/components/admin/VideoManagement";
import { useTranslation } from "react-i18next";
import UserManagement from "@/components/admin/UserManagement";
import UserProgress from "@/components/profile/Progress";
import Information from "@/components/profile/Information";
import { COMPONENT_STYLE } from "@/utils/const";
import { UpgradePlan } from "@/components/profile/UpgradePlan";
import MissedWordsModal from "@/components/dictation/video/MissedWordsModal";
import { api } from "@/api/api";
import { setCurrentMissedWords, setMissedWords } from "@/redux/userSlice";
import { LANGUAGES, VISIBILITY_OPTIONS } from "@/utils/const";
import { Select } from "antd";
import { Channel } from "@/utils/type";
import ChannelRecommendation from "@/components/profile/ChannelRecommendation";
import Feedback from "@/components/profile/Feedback";
import FeedbackManagement from "@/components/admin/FeedbackManagement";

const { Content } = Layout;

const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const videoMainRef = useRef<VideoMainRef>(null);
  const { t, i18n } = useTranslation();
  const isDictationStarted = useSelector(
    (state: RootState) => state.user.isDictationStarted
  );
  const isSavingProgress = useSelector(
    (state: RootState) => state.user.isSavingProgress
  );
  const [isMissedWordsModalVisible, setIsMissedWordsModalVisible] =
    useState(false);
  const [isWordEditing, setIsWordEditing] = useState(false);
  const [wordsToDelete, setWordsToDelete] = useState<Set<string>>(new Set());
  const [shouldResetWords, setShouldResetWords] = useState(false);
  const [isSavingWords, setIsSavingWords] = useState(false);
  const [siderCollapsed, setSiderCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 频道列表状态
  const [allChannels, setAllChannels] = useState<Channel[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);

  // 从Redux中获取当前选择的语言
  const selectedLanguage = useSelector(
    (state: RootState) => state.navigation.selectedLanguage
  );

  // 从Redux中获取用户信息
  const userInfo = useSelector((state: RootState) => state.user.userInfo);

  const isChannelListPage =
    location.pathname === "/" ||
    location.pathname === "/dictation" ||
    location.pathname === "/dictation/video";

  const isVideoPage =
    location.pathname.includes("/dictation/video/") &&
    location.pathname.split("/").length > 4;

  const isWordPage = location.pathname === "/dictation/word";

  // 获取所有频道数据
  const fetchAllChannels = async () => {
    if (allChannels.length > 0) return; // 已经加载过则不再重复加载

    setIsLoadingChannels(true);
    try {
      const response = await api.getChannels(
        VISIBILITY_OPTIONS.Public,
        LANGUAGES.All
      );
      setAllChannels(response.data);
      filterChannelsByLanguage(response.data, selectedLanguage);
    } catch (error) {
      console.error("Error fetching channels:", error);
    } finally {
      setIsLoadingChannels(false);
    }
  };

  // 根据语言过滤频道
  const filterChannelsByLanguage = (channels: Channel[], language: string) => {
    if (language === LANGUAGES.All) {
      setFilteredChannels(channels);
    } else {
      const filtered = channels.filter(
        (channel) => channel.language === language
      );
      setFilteredChannels(filtered);
    }
  };

  useEffect(() => {
    // Set initial language to user interface language or default to All
    const uiLanguage = i18n.language;
    if (uiLanguage === "zh-CN" || uiLanguage === "zh-TW") {
      dispatch(setSelectedLanguage(LANGUAGES.Chinese));
    } else if (uiLanguage === "ja") {
      dispatch(setSelectedLanguage(LANGUAGES.Japanese));
    } else if (uiLanguage === "ko") {
      dispatch(setSelectedLanguage(LANGUAGES.Korean));
    } else {
      dispatch(setSelectedLanguage(LANGUAGES.All));
    }
  }, [i18n.language, dispatch]);

  useEffect(() => {
    // If on channels page, load channel data
    if (location.pathname === "/") {
      dispatch(fetchAllChannels() as any);
    }
  }, [dispatch, location.pathname]);

  useEffect(() => {
    const pathParts = location.pathname.split("/");
    if (pathParts[1] !== "dictation" || pathParts[2] !== "video") {
      dispatch(resetNavigation());
    }

    // 如果是频道列表页面，加载频道数据
    if (isChannelListPage) {
      fetchAllChannels();
    }
  }, [location.pathname, dispatch, isChannelListPage]);

  useEffect(() => {
    if (allChannels.length > 0) {
      filterChannelsByLanguage(allChannels, selectedLanguage);
    }
  }, [selectedLanguage, allChannels]);

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

  const showMissedWordsModal = () => {
    if (videoMainRef.current) {
      dispatch(setCurrentMissedWords(videoMainRef.current.getMissedWords()));
      setIsMissedWordsModalVisible(true);
    }
  };

  const handleGoBack = async () => {
    // if is video page, save progress
    if (isVideoPage && videoMainRef.current) {
      try {
        await videoMainRef.current.saveProgress();
        console.log("Progress saved before navigation");
      } catch (error) {
        console.error("Failed to save progress before navigation:", error);
      }
    }
    navigate(-1);
  };

  const handleDeleteMissedWords = async () => {
    try {
      setIsSavingWords(true);

      // 获取当前Redux中的missed_words
      const currentMissedWords = userInfo?.missed_words || {};

      // 创建一个新的对象来存储更新后的missed_words
      const updatedMissedWords = { ...currentMissedWords };

      // 从所有语言类别中删除选中的单词
      Array.from(wordsToDelete).forEach((word) => {
        Object.keys(updatedMissedWords).forEach((lang) => {
          if (updatedMissedWords[lang]) {
            updatedMissedWords[lang] = updatedMissedWords[lang].filter(
              (w: string) => w !== word
            );
          }
        });
      });

      // 调用API删除单词
      await api.deleteMissedWords(Array.from(wordsToDelete));
      message.success(t("wordsDeletedSuccess"));

      // 直接使用我们更新的missed_words数据更新Redux
      dispatch(setMissedWords(updatedMissedWords));

      setWordsToDelete(new Set());
      setIsWordEditing(false);
    } catch (error) {
      console.error("Error deleting words:", error);
      message.error(t("wordsDeleteFailed"));
    } finally {
      setIsSavingWords(false);
    }
  };

  const handleMissedWordCancelDelete = () => {
    setWordsToDelete(new Set());
    setIsWordEditing(false);
    setShouldResetWords(true);
    setTimeout(() => {
      setShouldResetWords(false);
    }, 0);
  };

  const handleLanguageChange = (value: string) => {
    dispatch(setSelectedLanguage(value));
  };

  const languageOptions = [
    { label: t("allLanguages"), value: LANGUAGES.All },
    { label: "English", value: LANGUAGES.English },
    { label: "中文", value: LANGUAGES.Chinese },
    { label: "日本語", value: LANGUAGES.Japanese },
    { label: "한국어", value: LANGUAGES.Korean },
  ];

  // 检测屏幕尺寸
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSiderCollapsed(mobile);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-700">
      <div className="flex-shrink-0 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto">
            {isMobile && (
              <button
                onClick={() => setSiderCollapsed(!siderCollapsed)}
                className="flex items-center justify-center p-2 bg-white-500 text-black shadow-md rounded-md hover:bg-gray-100 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-100 focus:ring-opacity-50
                 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:hover:text-gray-300 dark:hover:ring-gray-600"
              >
                <MenuOutlined />
              </button>
            )}
            <button
              onClick={handleGoBack}
              className={`${
                isMobile ? "hidden" : "flex"
              } items-center justify-center px-4 py-2 bg-white-500 text-black shadow-md rounded-md hover:bg-gray-100 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-100 focus:ring-opacity-50
               dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:hover:text-gray-300 dark:hover:ring-gray-600`}
            >
              <ArrowLeftOutlined className="mr-2" />
              <span>{t("goBack")}</span>
            </button>

            {/* 移动端语言选择器 */}
            {isMobile && (isChannelListPage || isWordPage) && (
              <div className="flex items-center gap-1 flex-1 min-w-0">
                <span className="text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap flex-shrink-0">
                  {t("dictationLanguage")}:
                </span>
                <Select
                  value={selectedLanguage}
                  onChange={handleLanguageChange}
                  style={{ flex: 1, minWidth: 80 }}
                  options={languageOptions}
                  className="dark:bg-gray-700"
                  size="small"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 w-full lg:w-auto">
            {isWordEditing && (
              <div className="flex gap-2 w-full md:w-auto">
                <button
                  onClick={handleMissedWordCancelDelete}
                  className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 bg-gray-500 text-white shadow-md rounded-md hover:bg-gray-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-50
                  dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={handleDeleteMissedWords}
                  disabled={wordsToDelete.size === 0 || isSavingWords}
                  className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 bg-blue-500 text-white shadow-md rounded-md hover:bg-blue-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50
                  dark:bg-blue-700 dark:text-white dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingWords ? <LoadingOutlined className="mr-2" /> : null}
                  {t("submit")}
                </button>
              </div>
            )}

            {/* 桌面端语言选择器 */}
            {!isMobile && (isChannelListPage || isWordPage) && (
              <div className="flex items-center gap-3 whitespace-nowrap">
                <span className="text-gray-600 dark:text-gray-300 text-sm lg:text-base flex-shrink-0">
                  {t("dictationLanguage")}:
                </span>
                <Select
                  value={selectedLanguage}
                  onChange={handleLanguageChange}
                  style={{ minWidth: 150 }}
                  options={languageOptions}
                  className="dark:bg-gray-700"
                />
              </div>
            )}
            {isVideoPage && (
              <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:w-auto button-container">
                <button
                  onClick={showMissedWordsModal}
                  className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white shadow-md rounded-md hover:bg-blue-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50
     dark:bg-blue-700 dark:text-white dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:dark:opacity-50"
                >
                  <FileTextOutlined className="mr-2" />
                  <span className="hidden md:inline">
                    {t("missedWordsSummary")}
                  </span>
                  <span className="md:hidden">{t("missedWords")}</span>
                </button>
                <button
                  onClick={handleResetProgress}
                  disabled={!isDictationStarted}
                  className="flex items-center justify-center px-4 py-2 bg-yellow-500 text-white shadow-md rounded-md hover:bg-yellow-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-opacity-50
     dark:bg-yellow-700 dark:text-white dark:hover:bg-yellow-800"
                >
                  <ReloadOutlined className="mr-2" />
                  <span className="hidden md:inline">{t("resetProgress")}</span>
                  <span className="md:hidden">{t("reset")}</span>
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
                  <span className="hidden md:inline">
                    {t("saveProgressBtnText")}
                  </span>
                  <span className="md:hidden">{t("save")}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex-grow overflow-hidden bg-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 rounded-lg mx-3 md:mx-6 mb-3 md:mb-6">
        <Layout className="h-full bg-transparent">
          <AppSider collapsed={siderCollapsed} onCollapse={setSiderCollapsed} />
          <Content className="overflow-hidden bg-transparent bg-gradient-to-br from-gray-200 via-gray-100 to-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 custom-scrollbar">
            <Routes>
              <Route
                path="/"
                element={
                  <ChannelList
                    channels={filteredChannels}
                    isLoading={isLoadingChannels}
                  />
                }
              />
              <Route
                path="/dictation"
                element={
                  <ChannelList
                    channels={filteredChannels}
                    isLoading={isLoadingChannels}
                  />
                }
              />
              <Route
                path="/dictation/video"
                element={
                  <ChannelList
                    channels={filteredChannels}
                    isLoading={isLoadingChannels}
                  />
                }
              />
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
                element={
                  <Word
                    style={COMPONENT_STYLE}
                    onEditingChange={setIsWordEditing}
                    onWordsToDeleteChange={setWordsToDelete}
                    shouldReset={shouldResetWords}
                  />
                }
              />
              <Route path="/collection/video" element={<div>文章收藏</div>} />
              <Route path="/collection/word" element={<div>单词收藏</div>} />
              <Route
                path="/radio"
                element={<Radio style={COMPONENT_STYLE} />}
              />
              <Route path="/admin/channel" element={<ChannelManagement />} />
              <Route path="/admin/video" element={<VideoManagement />} />
              <Route path="/admin/user" element={<UserManagement />} />
              <Route path="/admin/feedback" element={<FeedbackManagement />} />
              <Route path="/profile" element={<Information />} />
              <Route path="/profile/information" element={<Information />} />
              <Route path="/profile/progress" element={<UserProgress />} />
              <Route path="/profile/upgrade-plan" element={<UpgradePlan />} />
              <Route
                path="/profile/channel-recommendation"
                element={<ChannelRecommendation />}
              />
              <Route path="/profile/feedback" element={<Feedback />} />
            </Routes>
          </Content>
        </Layout>
      </div>
      <MissedWordsModal
        visible={isMissedWordsModalVisible}
        onClose={() => setIsMissedWordsModalVisible(false)}
        videoMainRef={videoMainRef}
      />
    </div>
  );
};

export default AppContent;
