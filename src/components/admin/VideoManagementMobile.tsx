import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Input,
  Select,
  Button,
  Card,
  Avatar,
  Tag,
  message,
  Spin,
  Empty,
  Modal,
  Tabs,
  TabsProps,
  Statistic
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FilterOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  VideoCameraOutlined
} from "@ant-design/icons";
import { Video, Channel } from "@/utils/type";

interface Analytics {
  totalVideos: number;
  totalChannels: number;
  totalDuration?: number;
  averageDuration?: number;
}
import MobileBackButton from "./MobileBackButton";

const { Option } = Select;
const { Search } = Input;

interface VideoManagementMobileProps {
  videos: Video[];
  channels: Channel[];
  analytics?: Analytics;
  isLoading: boolean;
  selectedChannel: string;
  selectedLanguage: string;
  onRefresh: () => void;
  onEditVideo: (video: Video) => void;
  onDeleteVideo: (video: Video) => void;
  onAddVideo: () => void;
  onEditTranscript: (video: Video) => void;
  onChannelChange: (channel: string) => void;
  onLanguageChange: (language: string) => void;
}

const VideoManagementMobile: React.FC<VideoManagementMobileProps> = ({
  videos,
  channels,
  analytics,
  isLoading,
  selectedChannel,
  selectedLanguage,
  onEditVideo,
  onDeleteVideo,
  onAddVideo,
  onEditTranscript,
  onChannelChange,
  onLanguageChange
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("videos");

  // Filter videos
  useEffect(() => {
    let filtered = videos.filter((video) => {
      const videoTitle = video.title || "";
      const videoId = video.video_id || "";
      const matchesSearch = 
        (typeof videoTitle === 'string' ? videoTitle.toLowerCase() : "").includes(searchQuery.toLowerCase()) ||
        (typeof videoId === 'string' ? videoId.toLowerCase() : "").includes(searchQuery.toLowerCase());
      
      const matchesChannel = selectedChannel === "All" || true; // Simplified for now
      const matchesLanguage = selectedLanguage === "All" || true; // Simplified for now

      return matchesSearch && matchesChannel && matchesLanguage;
    });

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

    setFilteredVideos(filtered);
  }, [videos, searchQuery, selectedChannel, selectedLanguage]);

  // const getLanguageFlag = (language: string) => {
  //   switch (language) {
  //     case "en": return "🇺🇸";
  //     case "zh": return "🇨🇳";
  //     case "ja": return "🇯🇵";
  //     case "ko": return "🇰🇷";
  //     default: return "🌐";
  //   }
  // };

  // const getChannelName = (channelId: string) => {
  //   const channel = channels.find(c => c.id === channelId);
  //   return channel?.name || channelId;
  // };

  const handleVideoAction = (video: Video, action: string) => {
    switch (action) {
      case "edit":
        onEditVideo(video);
        break;
      case "delete":
        Modal.confirm({
          title: t("confirmDelete"),
          content: t("confirmDeleteVideo", { title: video.title }),
          okText: t("delete"),
          okType: "danger",
          cancelText: t("cancel"),
          onOk: () => onDeleteVideo(video),
        });
        break;
      case "view":
        // For now just show message
        message.info("Video view functionality to be implemented");
        break;
      case "transcript":
        onEditTranscript(video);
        break;
    }
  };

  const renderVideoCard = (video: Video) => (
    <Card
      key={video.video_id}
      className="mb-3 border border-gray-200 dark:border-gray-700 shadow-sm"
      bodyStyle={{ padding: "16px" }}
    >
      <div className="flex items-start space-x-3">
        <Avatar
          size={48}
          src=""
          className="flex-shrink-0"
          icon={<VideoCameraOutlined />}
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
                {video.title}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                Channel Info
              </p>
            </div>
            
            <div className="flex space-x-1 ml-2">
              <Button
                type="text"
                size="small"
                icon={<FileTextOutlined />}
                onClick={() => handleVideoAction(video, "transcript")}
                className="text-purple-600 dark:text-purple-400"
                title="Edit Transcript"
              />
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleVideoAction(video, "view")}
                className="text-green-600 dark:text-green-400"
                title="View Video"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            <Tag>
              🌐 Video
            </Tag>
          </div>

          <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center justify-between">
              <span>{t("videoId")}: {video.video_id}</span>
              <span>{new Date(video.created_at || 0).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-3">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleVideoAction(video, "edit")}
              className="text-blue-600 dark:text-blue-400"
            >
              {t("edit")}
            </Button>
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleVideoAction(video, "delete")}
              className="text-red-600 dark:text-red-400"
              danger
            >
              {t("delete")}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderAnalyticsTab = () => (
    <div className="p-4 space-y-4">
      {analytics ? (
        <div className="grid grid-cols-2 gap-4">
          <Card size="small" className="text-center">
            <Statistic 
              title={t("totalVideos")} 
              value={analytics.totalVideos} 
              prefix={<VideoCameraOutlined />}
            />
          </Card>
          <Card size="small" className="text-center">
            <Statistic 
              title={t("totalChannels")} 
              value={analytics.totalChannels}
              prefix={<PlayCircleOutlined />}
            />
          </Card>
          <Card size="small" className="text-center">
            <Statistic 
              title={t("totalDuration")} 
              value={Math.round((analytics.totalDuration || 0) / 3600)} 
              suffix="h"
            />
          </Card>
          <Card size="small" className="text-center">
            <Statistic 
              title={t("avgDuration")} 
              value={Math.round((analytics.averageDuration || 0) / 60)} 
              suffix="min"
            />
          </Card>
        </div>
      ) : (
        <div className="text-center py-8">
          <Spin size="large" />
          <p className="text-gray-500 mt-2">{t("loadingAnalytics")}</p>
        </div>
      )}
    </div>
  );

  const tabItems: TabsProps['items'] = [
    {
      key: 'videos',
      label: `${t("videos")} (${filteredVideos.length})`,
    },
    {
      key: 'analytics',
      label: t("analytics"),
    }
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <MobileBackButton title={t("videoManagement")} />

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="small"
          className="px-4"
        />
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'videos' && (
          <>
            {/* Search and Filter Section */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 space-y-3">
              <Search
                placeholder={t("searchVideos")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                prefix={<SearchOutlined />}
                allowClear
              />

              <div className="flex items-center justify-between">
                <Button
                  type="text"
                  icon={<FilterOutlined />}
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-blue-600 dark:text-blue-400"
                >
                  {t("filters")}
                </Button>
                
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredVideos.length} {t("videos")}
                </div>
              </div>

              {showFilters && (
                <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t("channel")}
                    </label>
                    <Select
                      value={selectedChannel || undefined}
                      onChange={onChannelChange}
                      className="w-full"
                      size="small"
                      placeholder="Select a channel"
                      allowClear
                      onClear={() => onChannelChange("")}
                    >
                      {channels.map(channel => (
                        <Option key={channel.id} value={channel.id}>
                          {channel.name}
                        </Option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t("language")}
                    </label>
                    <Select
                      value={selectedLanguage}
                      onChange={onLanguageChange}
                      className="w-full"
                      size="small"
                    >
                      <Option value="All">{t("allLanguages")}</Option>
                      <Option value="en">🇺🇸 English</Option>
                      <Option value="zh">🇨🇳 中文</Option>
                      <Option value="ja">🇯🇵 日本語</Option>
                      <Option value="ko">🇰🇷 한국어</Option>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {/* Video List */}
            <div className="flex-1 overflow-y-auto p-4 pb-20">
              {!selectedChannel ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="text-gray-400 dark:text-gray-500 mb-4">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">Select a channel to view videos</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Use filters above to select a channel</p>
                </div>
              ) : isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <Spin size="large" />
                </div>
              ) : filteredVideos.length === 0 ? (
                <Empty
                  description={t("noVideosFound")}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <div>
                  {filteredVideos.map(renderVideoCard)}
                </div>
              )}
            </div>
          </>
        )}
        
        {activeTab === 'analytics' && renderAnalyticsTab()}
      </div>

      {/* Floating Action Button - only show on videos tab */}
      {activeTab === 'videos' && (
        <div className="absolute bottom-6 right-6">
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<PlusOutlined />}
            className="shadow-lg"
            onClick={onAddVideo}
          />
        </div>
      )}
    </div>
  );
};

export default VideoManagementMobile;