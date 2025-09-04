import React, { useEffect, useRef, useState } from "react";
import { Layout, message } from "antd";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  CloudUploadOutlined,
  LoadingOutlined,
  ArrowLeftOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  RedoOutlined,
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
import AdminPortal from "@/components/admin/AdminPortal";
import { useTranslation } from "react-i18next";
import UserManagement from "@/components/admin/UserManagement";
import UserProgress from "@/components/profile/Progress";
import Information from "@/components/profile/Information";
import { COMPONENT_STYLE } from "@/utils/const";
import { UpgradePlan } from "@/components/profile/UpgradePlan";
import MissedWordsModal from "@/components/dictation/video/MissedWordsModal";
import VideoErrorReportModal from "@/components/dictation/video/VideoErrorReportModal";
import SettingsModal from "@/components/dictation/video/SettingsModal";
import { api } from "@/api/api";
import { setMissedWords } from "@/redux/userSlice";
import { LANGUAGES, VISIBILITY_OPTIONS } from "@/utils/const";
import { Select } from "antd";
import { Channel } from "@/utils/type";
import ChannelRecommendation from "@/components/profile/ChannelRecommendation";
import Feedback from "@/components/profile/Feedback";
import FeedbackManagement from "@/components/admin/FeedbackManagement";
import VideoErrorReportManagement from "@/components/admin/VideoErrorReportManagement";
import UserVideoErrorReports from "@/components/profile/VideoErrorReports";
import Reward from "@/components/profile/Reward";
import RandomVideoModal from "@/components/RandomVideoModal";

const { Content } = Layout;

interface AppContentProps {
  siderCollapsed?: boolean;
  setSiderCollapsed?: (collapsed: boolean) => void;
  isMobile?: boolean;
}

const AppContent: React.FC<AppContentProps> = ({
  siderCollapsed: propSiderCollapsed,
  setSiderCollapsed: propSetSiderCollapsed,
  isMobile: propIsMobile,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Extract video information from URL for error reporting
  const pathParts = location.pathname.split("/");
  const currentChannelId = pathParts[3]; // /dictation/video/channelId/videoId
  const currentVideoId = pathParts[4];
  const [currentVideoTitle, setCurrentVideoTitle] = useState("");
  const [currentChannelName, setCurrentChannelName] = useState("");
  const videoMainRef = useRef<VideoMainRef>(null);
  const { t } = useTranslation();
  const isDictationStarted = useSelector(
    (state: RootState) => state.user.isDictationStarted
  );
  const isSavingProgress = useSelector(
    (state: RootState) => state.user.isSavingProgress
  );
  const [isMissedWordsModalVisible, setIsMissedWordsModalVisible] =
    useState(false);
  const [isVideoErrorReportModalVisible, setIsVideoErrorReportModalVisible] =
    useState(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [isRandomVideoModalVisible, setIsRandomVideoModalVisible] = useState(false);
  const [isWordEditing, setIsWordEditing] = useState(false);
  const [wordsToDelete, setWordsToDelete] = useState<Set<string>>(new Set());
  const [shouldResetWords, setShouldResetWords] = useState(false);
  const [isSavingWords, setIsSavingWords] = useState(false);
  
  // Video list state for status filtering
  const [progressFilter, setProgressFilter] = useState('all');
  const [videoStatusCounts, setVideoStatusCounts] = useState({
    completed: 0,
    in_progress: 0,
    not_started: 0,
  });
  
  // Use props if provided, otherwise fallback to local state
  const [localSiderCollapsed, setLocalSiderCollapsed] = useState(false);
  const [localIsMobile, setLocalIsMobile] = useState(false);
  
  const siderCollapsed = propSiderCollapsed !== undefined ? propSiderCollapsed : localSiderCollapsed;
  const setSiderCollapsed = propSetSiderCollapsed || setLocalSiderCollapsed;
  const isMobile = propIsMobile !== undefined ? propIsMobile : localIsMobile;

  // 检测当前是否是VideoMain页面，并设置默认的Sider状态
  useEffect(() => {
    const pathSegments = location.pathname.split("/");
    const isVideoMainPage = pathSegments.length === 5 && 
                            pathSegments[1] === "dictation" && 
                            pathSegments[2] === "video" && 
                            pathSegments[3] && // channelId exists
                            pathSegments[4]; // videoId exists
    
    // 如果是VideoMain页面，默认隐藏Sider；其他页面默认显示
    if (propSetSiderCollapsed === undefined) {
      setLocalSiderCollapsed(Boolean(isVideoMainPage));
    }
  }, [location.pathname, propSiderCollapsed]);

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

  const isVideoListPage =
    location.pathname.includes("/dictation/video/") &&
    location.pathname.split("/").length === 4;

  const isProfilePage = location.pathname.startsWith("/profile");

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

  // 刷新频道数据
  const refreshChannels = async () => {
    setIsLoadingChannels(true);
    try {
      const response = await api.getChannels(
        VISIBILITY_OPTIONS.Public,
        LANGUAGES.All
      );
      setAllChannels(response.data);
      filterChannelsByLanguage(response.data, selectedLanguage);
    } catch (error) {
      console.error("Error refreshing channels:", error);
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

    // 如果是视频页面，获取视频标题和频道名称用于错误报告
    if (isVideoPage && currentChannelId && currentVideoId) {
      fetchVideoTitle();
      fetchChannelName();
    }

    // 如果是视频列表页面，获取视频状态统计
    if (isVideoListPage) {
      fetchVideoStatusCounts();
    }
  }, [
    location.pathname,
    dispatch,
    isChannelListPage,
    isVideoPage,
    isVideoListPage,
    currentChannelId,
    currentVideoId,
  ]);

  // 获取视频标题
  const fetchVideoTitle = async () => {
    try {
      const response = await api.getVideoTranscript(
        currentChannelId,
        currentVideoId
      );
      setCurrentVideoTitle(response.data.title || "");
    } catch (error) {
      console.error("Error fetching video title:", error);
    }
  };

  // 获取频道名称
  const fetchChannelName = async () => {
    try {
      const response = await api.getChannels("all", "all");
      const channel = response.data.find(
        (ch: Channel) => ch.id === currentChannelId
      );
      if (channel && channel.name) {
        setCurrentChannelName(channel.name);
      }
    } catch (error) {
      console.error("Error fetching channel name:", error);
    }
  };

  // 获取视频状态统计
  const fetchVideoStatusCounts = async () => {
    if (!isVideoListPage || !currentChannelId) return;
    
    try {
      const [videoResponse, progressResponse] = await Promise.all([
        api.getVideoList(currentChannelId, VISIBILITY_OPTIONS.Public),
        api.getChannelProgress(currentChannelId),
      ]);
      
      const videos = videoResponse.data.videos;
      const progress = progressResponse.data.progress;
      
      const counts = videos.reduce((acc: any, video: any) => {
        const videoProgress = progress[video.video_id] || 0;
        if (videoProgress >= 100) {
          acc.completed++;
        } else if (videoProgress > 0) {
          acc.in_progress++;
        } else {
          acc.not_started++;
        }
        return acc;
      }, { completed: 0, in_progress: 0, not_started: 0 });
      
      setVideoStatusCounts(counts);
    } catch (error) {
      console.error("Error fetching video status counts:", error);
    }
  };

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

  // const showMissedWordsModal = () => {
  //   if (videoMainRef.current) {
  //     dispatch(setCurrentMissedWords(videoMainRef.current.getMissedWords()));
  //     setIsMissedWordsModalVisible(true);
  //   }
  // };

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

  // Only run local mobile detection if not using props
  useEffect(() => {
    if (propIsMobile === undefined) {
      const checkScreenSize = () => {
        const mobile = window.innerWidth < 768;
        setLocalIsMobile(mobile);
        setLocalSiderCollapsed(mobile);
      };

      checkScreenSize();
      window.addEventListener("resize", checkScreenSize);
      return () => window.removeEventListener("resize", checkScreenSize);
    }
  }, [propIsMobile]);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-700">
      {/* Hide Content header on mobile for channel list, video list and profile pages */}
      <div className={`flex-shrink-0 p-4 sm:p-6 ${isMobile && (isChannelListPage || isVideoListPage || isProfilePage) ? 'hidden' : ''}`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={handleGoBack}
              className="hidden md:flex items-center justify-center px-4 py-2 bg-white-500 text-black shadow-md rounded-md hover:bg-gray-100 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-100 focus:ring-opacity-50
               dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:hover:text-gray-300 dark:hover:ring-gray-600"
            >
              <ArrowLeftOutlined className="mr-2" />
              <span>{t("goBack")}</span>
            </button>

            {/* 移动端语言选择器和随机视频按钮 - 右对齐 */}
            {isMobile && (isChannelListPage || isWordPage) && (
              <div className="flex items-center gap-1 ml-auto">
                <span className="text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap">
                  {t("dictationLanguage")}:
                </span>
                <Select
                  value={selectedLanguage}
                  onChange={handleLanguageChange}
                  style={{ minWidth: 100 }}
                  options={languageOptions}
                  className="dark:bg-gray-700"
                  size="small"
                />
                {/* 移动端随机视频按钮 - 只显示图标 */}
                <button
                  onClick={() => setIsRandomVideoModalVisible(true)}
                  className="flex items-center justify-center p-2 bg-purple-500 text-white shadow-md rounded-md hover:bg-purple-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50 dark:bg-purple-700 dark:text-white dark:hover:bg-purple-800"
                  title={t("randomDictation")}
                >
                  <RedoOutlined />
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col lg:flex-row items-end lg:items-center gap-4 w-full lg:w-auto ml-auto">
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

            {/* 桌面端语言选择器和随机视频按钮 */}
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
                {/* 随机视频按钮 */}
                <button
                  onClick={() => setIsRandomVideoModalVisible(true)}
                  className="flex items-center justify-center px-4 py-2 bg-purple-500 text-white shadow-md rounded-md hover:bg-purple-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50 dark:bg-purple-700 dark:text-white dark:hover:bg-purple-800"
                  title={t("randomDictation")}
                >
                  <RedoOutlined className="mr-2" />
                  <span>{t("randomDictation")}</span>
                </button>
              </div>
            )}

            {/* Video Status Filter Tabs - Flutter-style design - Only show on desktop */}
            {isVideoListPage && !isMobile && (
              <div className="w-full flex justify-center md:justify-end">
                <div className="p-2 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex gap-3">
                    <button
                      onClick={() => setProgressFilter(progressFilter === 'completed' ? 'all' : 'completed')}
                      className={`flex flex-col items-center px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 min-w-[60px] min-h-[50px] ${
                        progressFilter === 'completed'
                          ? 'bg-blue-500 text-white shadow-sm border-2 border-blue-600'
                          : videoStatusCounts.completed > 0
                            ? 'bg-blue-50/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 hover:bg-blue-100/70 dark:hover:bg-blue-900/50'
                            : 'bg-gray-100/50 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 border border-gray-300/30 dark:border-gray-600/30'
                      }`}
                      disabled={videoStatusCounts.completed === 0}
                    >
                      <span className="font-semibold text-base leading-none">{videoStatusCounts.completed}</span>
                      <span className="text-[11px] mt-1 leading-none">{t('done')}</span>
                    </button>
                    <button
                      onClick={() => setProgressFilter(progressFilter === 'in_progress' ? 'all' : 'in_progress')}
                      className={`flex flex-col items-center px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 min-w-[60px] min-h-[50px] ${
                        progressFilter === 'in_progress'
                          ? 'bg-orange-500 text-white shadow-sm border-2 border-orange-600'
                          : videoStatusCounts.in_progress > 0
                            ? 'bg-orange-50/50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-800/60 hover:bg-orange-100/70 dark:hover:bg-orange-900/50'
                            : 'bg-gray-100/50 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 border border-gray-300/30 dark:border-gray-600/30'
                      }`}
                      disabled={videoStatusCounts.in_progress === 0}
                    >
                      <span className="font-semibold text-base leading-none">{videoStatusCounts.in_progress}</span>
                      <span className="text-[11px] mt-1 leading-none">{t('inProgress')}</span>
                    </button>
                    <button
                      onClick={() => setProgressFilter(progressFilter === 'not_started' ? 'all' : 'not_started')}
                      className={`flex flex-col items-center px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 min-w-[60px] min-h-[50px] ${
                        progressFilter === 'not_started'
                          ? 'bg-gray-500 text-white shadow-sm border-2 border-gray-600'
                          : videoStatusCounts.not_started > 0
                            ? 'bg-gray-50/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 border border-gray-300/60 dark:border-gray-600/60 hover:bg-gray-100/70 dark:hover:bg-gray-600/50'
                            : 'bg-gray-100/50 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 border border-gray-300/30 dark:border-gray-600/30'
                      }`}
                      disabled={videoStatusCounts.not_started === 0}
                    >
                      <span className="font-semibold text-base leading-none">{videoStatusCounts.not_started}</span>
                      <span className="text-[11px] mt-1 leading-none">{t('notStarted')}</span>
                    </button>
                    <button
                      onClick={() => setProgressFilter('all')}
                      className={`flex flex-col items-center px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 min-w-[60px] min-h-[50px] ${
                        progressFilter === 'all'
                          ? 'bg-blue-600 text-white shadow-sm border-2 border-blue-700'
                          : 'bg-blue-50/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 hover:bg-blue-100/70 dark:hover:bg-blue-900/50'
                      }`}
                    >
                      <span className="font-semibold text-base leading-none">{videoStatusCounts.completed + videoStatusCounts.in_progress + videoStatusCounts.not_started}</span>
                      <span className="text-[11px] mt-1 leading-none">{t('all')}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isVideoPage && (
              <div className="flex flex-row gap-1 md:gap-4 w-auto button-container">
                {/* Mobile: Icon-only buttons, Desktop: Full buttons */}
                <button
                  onClick={() => setIsVideoErrorReportModalVisible(true)}
                  className="flex items-center justify-center p-2 md:px-4 md:py-2 bg-red-500 text-white shadow-md rounded-md hover:bg-red-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50 dark:bg-red-700 dark:text-white dark:hover:bg-red-800"
                  title={t("reportError")}
                >
                  <ExclamationCircleOutlined className="md:mr-2" />
                  <span className="hidden md:inline">{t("reportError")}</span>
                </button>
                <button
                  onClick={handleResetProgress}
                  disabled={!isDictationStarted}
                  className="flex items-center justify-center p-2 md:px-4 md:py-2 bg-yellow-500 text-white shadow-md rounded-md hover:bg-yellow-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-opacity-50 dark:bg-yellow-700 dark:text-white dark:hover:bg-yellow-800 disabled:opacity-50"
                  title={t("resetProgress")}
                >
                  <ReloadOutlined className="md:mr-2" />
                  <span className="hidden md:inline">{t("resetProgress")}</span>
                </button>
                <button
                  onClick={handleSaveProgress}
                  disabled={!isDictationStarted}
                  className="flex items-center justify-center p-2 md:px-4 md:py-2 bg-green-500 text-white shadow-md rounded-md hover:bg-green-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50 dark:bg-green-700 dark:text-white dark:hover:bg-green-800 disabled:opacity-50"
                  title={t("saveProgressBtnText")}
                >
                  {isSavingProgress ? (
                    <LoadingOutlined className="md:mr-2" />
                  ) : (
                    <CloudUploadOutlined className="md:mr-2" />
                  )}
                  <span className="hidden md:inline">
                    {t("saveProgressBtnText")}
                  </span>
                </button>
                <button
                  onClick={() => setIsSettingsModalVisible(true)}
                  className="flex items-center justify-center p-2 md:px-4 md:py-2 bg-gray-500 text-white shadow-md rounded-md hover:bg-gray-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                  title={t("playerSettings")}
                >
                  <svg className="w-4 h-4 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="hidden md:inline">{t("settings")}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex-grow overflow-hidden bg-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 rounded-lg mx-2 sm:mx-4 md:mx-6 mb-2 sm:mb-4 md:mb-6">
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
                    onRefresh={refreshChannels}
                  />
                }
              />
              <Route
                path="/dictation"
                element={
                  <ChannelList
                    channels={filteredChannels}
                    isLoading={isLoadingChannels}
                    onRefresh={refreshChannels}
                  />
                }
              />
              <Route
                path="/dictation/video"
                element={
                  <ChannelList
                    channels={filteredChannels}
                    isLoading={isLoadingChannels}
                    onRefresh={refreshChannels}
                  />
                }
              />
              <Route path="/dictation/progress" element={<UserProgress />} />
              <Route
                path="/dictation/video/:channelId"
                element={<VideoList progressFilter={progressFilter} />}
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
              <Route path="/admin/portal" element={<AdminPortal />} />
              <Route path="/admin/channel" element={<ChannelManagement />} />
              <Route path="/admin/video" element={<VideoManagement />} />
              <Route path="/admin/user" element={<UserManagement />} />
              <Route path="/admin/feedback" element={<FeedbackManagement />} />
              <Route
                path="/admin/video-error-reports"
                element={<VideoErrorReportManagement />}
              />
              <Route path="/profile" element={<Information />} />
              <Route path="/profile/information" element={<Information />} />
              <Route path="/profile/progress" element={<UserProgress />} />
              <Route path="/profile/upgrade-plan" element={<UpgradePlan />} />
              <Route
                path="/profile/channel-recommendation"
                element={<ChannelRecommendation />}
              />
              <Route path="/profile/feedback" element={<Feedback />} />
              <Route
                path="/profile/video-error-reports"
                element={<UserVideoErrorReports />}
              />
              <Route path="/profile/reward-developer" element={<Reward />} />
            </Routes>
          </Content>
        </Layout>
      </div>
      <MissedWordsModal
        visible={isMissedWordsModalVisible}
        onClose={() => setIsMissedWordsModalVisible(false)}
        videoMainRef={videoMainRef}
      />
      {isVideoPage && currentChannelId && currentVideoId && (
        <VideoErrorReportModal
          visible={isVideoErrorReportModalVisible}
          onClose={() => setIsVideoErrorReportModalVisible(false)}
          channelId={currentChannelId}
          videoId={currentVideoId}
          videoTitle={currentVideoTitle}
          channelName={currentChannelName}
        />
      )}
      {isVideoPage && videoMainRef.current && (
        <SettingsModal
          visible={isSettingsModalVisible}
          onClose={() => setIsSettingsModalVisible(false)}
          playbackSpeed={videoMainRef.current.getSettings().playbackSpeed}
          autoRepeat={videoMainRef.current.getSettings().autoRepeat}
          shortcuts={videoMainRef.current.getSettings().shortcuts}
          settingShortcut={videoMainRef.current.getSettings().settingShortcut}
          handleSpeedChange={(speed) => videoMainRef.current?.updateSpeedSetting(speed)}
          handleAutoRepeatChange={(repeat) => videoMainRef.current?.updateAutoRepeatSetting(repeat)}
          handleShortcutSet={(key) => videoMainRef.current?.updateShortcutSetting(key)}
          handleShortcutKeyPress={(e) => videoMainRef.current?.handleShortcutKeyPress(e)}
          onSave={async () => {
            if (videoMainRef.current) {
              await videoMainRef.current.saveSettings();
            }
          }}
        />
      )}
      <RandomVideoModal
        visible={isRandomVideoModalVisible}
        onCancel={() => setIsRandomVideoModalVisible(false)}
      />
    </div>
  );
};

export default AppContent;
