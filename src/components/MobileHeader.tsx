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
import { Input, Select, Button, Modal } from "antd";
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
    <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
      <div className="px-4 py-3">
        {/* Title and Actions Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Dictation Studio
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {channelCount !== undefined ? `${channelCount} channels` : "Loading..."}
            </p>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              type="text"
              icon={<GlobalOutlined className="text-gray-600 dark:text-gray-400" />}
              size="small"
              onClick={() => setShowLanguageModal(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            />
            <Button
              type="text"
              icon={<ReloadOutlined className={`text-gray-600 dark:text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />}
              size="small"
              onClick={onRefresh}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            />
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-2">
          <Input
            placeholder={t("searchChannels")}
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchValue}
            onChange={(e) => onSearch?.(e.target.value)}
            className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
            size="middle"
          />
        </div>

        {/* Language Filter */}
        {selectedLanguage !== LANGUAGES.All && (
          <div className="mt-2">
            <Select
              value={selectedLanguage}
              onChange={handleLanguageChange}
              options={languageOptions}
              size="small"
              className="min-w-[120px]"
              suffixIcon={<GlobalOutlined />}
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderVideoListHeader = () => (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
      <div className="px-4 py-3">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center flex-1">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              size="small"
              onClick={handleBack}
              className="mr-2 p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            />
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                {channelName || t("videos")}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {videoCount !== undefined ? `${videoCount} videos` : "Loading..."}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              type="text"
              icon={<ReloadOutlined className={`text-gray-600 dark:text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />}
              size="small"
              onClick={onRefresh}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            />
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-3">
          <Input
            placeholder={t("searchVideos")}
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchValue}
            onChange={(e) => onSearch?.(e.target.value)}
            className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
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
        <div className="space-y-2">
          {languageOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => handleLanguageChange(option.value)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedLanguage === option.value
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{option.label}</span>
                {selectedLanguage === option.value && (
                  <span className="text-blue-600 dark:text-blue-400">✓</span>
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