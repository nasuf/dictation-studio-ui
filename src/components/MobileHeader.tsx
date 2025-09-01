import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { setSelectedLanguage } from "@/redux/navigationSlice";
import { 
  ArrowLeftOutlined, 
  ReloadOutlined, 
  SearchOutlined, 
  GlobalOutlined
} from "@ant-design/icons";
import { Input, Select, Modal } from "antd";
import { LANGUAGES } from "@/utils/const";

interface MobileHeaderProps {
  onRefresh?: () => void;
  onSearch?: (value: string) => void;
  channelCount?: number;
  videoCount?: number;
  channelName?: string;
  searchValue?: string;
  isLoading?: boolean;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  onRefresh,
  onSearch,
  channelCount,
  videoCount,
  channelName,
  searchValue = "",
  isLoading = false,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const selectedLanguage = useSelector((state: RootState) => state.navigation.selectedLanguage);

  const isChannelListPage = location.pathname === "/" || location.pathname === "/dictation" || location.pathname === "/dictation/video";
  const isVideoListPage = location.pathname.match(/^\/dictation\/video\/[^/]+$/);

  const handleBack = () => {
    navigate(-1);
  };

  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const handleLanguageChange = (value: string) => {
    dispatch(setSelectedLanguage(value));
    setShowLanguageModal(false);
  };

  const languageOptions = [
    { label: t("allLanguages"), value: LANGUAGES.All },
    { label: "English", value: LANGUAGES.English },
    { label: "中文", value: LANGUAGES.Chinese },
    { label: "日本語", value: LANGUAGES.Japanese },
    { label: "한국어", value: LANGUAGES.Korean },
  ];



  const renderChannelListHeader = () => (
    <div className="modern-mobile-header">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="mobile-floating-orb"
            style={{
              width: `${12 + i * 4}px`,
              height: `${12 + i * 4}px`,
              left: `${15 + i * 25}%`,
              top: `${30 + i * 10}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${4 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="modern-mobile-header-content">
        {/* Title and Actions Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-xl modern-mobile-title">
              Dictation Studio
            </h1>
            <p className="text-sm modern-mobile-subtitle">
              {channelCount !== undefined ? `${channelCount} channels` : "Loading..."}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowLanguageModal(true)}
              className="modern-mobile-button"
            >
              <GlobalOutlined />
            </button>
            <button
              onClick={onRefresh}
              className="modern-mobile-button"
            >
              <ReloadOutlined className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-3">
          <Input
            placeholder={t("searchChannels")}
            prefix={<SearchOutlined className="text-blue-700 opacity-60" />}
            value={searchValue}
            onChange={(e) => onSearch?.(e.target.value)}
            className="modern-mobile-input"
            size="middle"
          />
        </div>

        {/* Language Filter */}
        {selectedLanguage !== LANGUAGES.All && (
          <div className="mt-3">
            <Select
              value={selectedLanguage}
              onChange={handleLanguageChange}
              options={languageOptions}
              size="small"
              className="min-w-[120px] modern-mobile-select"
              suffixIcon={<GlobalOutlined />}
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderVideoListHeader = () => (
    <div className="modern-mobile-header">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="mobile-floating-orb"
            style={{
              width: `${12 + i * 4}px`,
              height: `${12 + i * 4}px`,
              left: `${15 + i * 25}%`,
              top: `${30 + i * 10}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${4 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="modern-mobile-header-content">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center flex-1">
            <button
              onClick={handleBack}
              className="modern-mobile-button mr-3"
            >
              <ArrowLeftOutlined />
            </button>
            <div className="flex-1">
              <h1 className="text-xl modern-mobile-title truncate">
                {channelName || t("videos")}
              </h1>
              <p className="text-sm modern-mobile-subtitle">
                {videoCount !== undefined ? `${videoCount} videos` : "Loading..."}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onRefresh}
              className="modern-mobile-button"
            >
              <ReloadOutlined className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-3">
          <Input
            placeholder={t("searchVideos")}
            prefix={<SearchOutlined className="text-blue-700 opacity-60" />}
            value={searchValue}
            onChange={(e) => onSearch?.(e.target.value)}
            className="modern-mobile-input"
            size="middle"
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Render appropriate header */}
      {isChannelListPage && renderChannelListHeader()}
      {isVideoListPage && renderVideoListHeader()}

      {/* Language Selection Modal */}
      <Modal
        title={t("selectLanguage")}
        open={showLanguageModal}
        onCancel={() => setShowLanguageModal(false)}
        footer={null}
        className="mobile-modal"
      >
        <div className="space-y-3">
          {languageOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => handleLanguageChange(option.value)}
              className={`p-4 rounded-16 cursor-pointer transition-all duration-300 ${
                selectedLanguage === option.value
                  ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-600 shadow-lg transform scale-105'
                  : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800/50 dark:hover:to-gray-700/30 hover:shadow-md hover:transform hover:scale-102'
              }`}
              style={{
                backdropFilter: 'blur(8px)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{option.label}</span>
                {selectedLanguage === option.value && (
                  <span className="text-blue-600 dark:text-blue-400 text-lg">✓</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default MobileHeader;