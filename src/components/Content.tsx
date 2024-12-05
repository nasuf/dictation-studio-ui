import React, { useEffect, useRef, useState } from "react";
import { Layout, message } from "antd";
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
import { COMPONENT_STYLE } from "@/utils/const";
import { UpgradePlan } from "@/components/profile/UpgradePlan";
import MissedWordsModal from "@/components/dictation/video/MissedWordsModal";
import { api } from "@/api/api";
import { setCurrentMissedWords, setMissedWords } from "@/redux/userSlice";

const { Content } = Layout;

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
  const [isMissedWordsModalVisible, setIsMissedWordsModalVisible] =
    useState(false);
  const [isWordEditing, setIsWordEditing] = useState(false);
  const [wordsToDelete, setWordsToDelete] = useState<Set<string>>(new Set());
  const [shouldResetWords, setShouldResetWords] = useState(false);

  useEffect(() => {
    const pathParts = location.pathname.split("/");
    if (pathParts[1] !== "dictation" || pathParts[2] !== "video") {
      dispatch(resetNavigation());
    }
  }, [location.pathname, dispatch]);

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

  const showMissedWordsModal = () => {
    if (videoMainRef.current) {
      dispatch(setCurrentMissedWords(videoMainRef.current.getMissedWords()));
      setIsMissedWordsModalVisible(true);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const [isSavingWords, setIsSavingWords] = useState(false);

  const handleDeleteMissedWords = async () => {
    try {
      setIsSavingWords(true);
      const response = await api.deleteMissedWords(Array.from(wordsToDelete));
      message.success(t("wordsDeletedSuccess"));

      if (response.data) {
        // refresh latest missed words
        dispatch(setMissedWords(response.data.missed_words));
      }
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
          {isWordEditing && (
            <div className="space-x-4 button-container">
              <button
                onClick={handleMissedWordCancelDelete}
                className="flex items-center justify-center px-4 py-2 bg-gray-500 text-white shadow-md rounded-md hover:bg-gray-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-50
                dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleDeleteMissedWords}
                disabled={wordsToDelete.size === 0 || isSavingWords}
                className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white shadow-md rounded-md hover:bg-blue-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50
                dark:bg-blue-700 dark:text-white dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingWords ? <LoadingOutlined className="mr-2" /> : null}
                {t("submit")}
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
              <Route path="/profile" element={<Information />} />
              <Route path="/profile/information" element={<Information />} />
              <Route path="/profile/progress" element={<UserProgress />} />
              <Route path="/profile/upgrade-plan" element={<UpgradePlan />} />
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
