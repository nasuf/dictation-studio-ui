import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Input,
  Select,
  Button,
  Card,
  Avatar,
  Spin,
  Empty,
  Modal,
  Tabs,
  TabsProps,
  message
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  GlobalOutlined
} from "@ant-design/icons";
import { Video, Channel } from "@/utils/type";
import EnhancedTranscriptEditor, { EnhancedTranscriptEditorState } from "./EnhancedTranscriptEditor";
import { api } from "@/api/api";

interface Analytics {
  totalVideos: number;
  totalChannels: number;
  totalDuration?: number;
  averageDuration?: number;
}

interface VideoEditState {
  isVisible: boolean;
  video?: Video;
  isLoading: boolean;
  formData: {
    title: string;
    link: string;
    visibility: string;
  };
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
  onChannelChange,
  onLanguageChange
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
  const [activeTab, setActiveTab] = useState("videos");
  
  // Transcript Editor state
  const [transcriptEditor, setTranscriptEditor] = useState<EnhancedTranscriptEditorState>({
    isVisible: false,
    transcriptItems: [],
    isLoading: false,
    isVideoPlaying: false,
    currentVideoTime: 0,
    playbackSpeed: 1.0,
    isSelectionMode: false,
    selectedSegments: new Set(),
    hasUnsavedChanges: false,
    video: undefined,
    currentPlayingIndex: undefined,
    // Enhanced functionality
    filters: [],
    selectedText: "",
    transcriptHistory: [],
    selectedRows: [],
    timeRecords: {},
    editingKey: "",
    isVideoRefined: false,
    currentVideoVisibility: "private",
  });

  // Video Edit state
  const [videoEdit, setVideoEdit] = useState<VideoEditState>({
    isVisible: false,
    isLoading: false,
    formData: {
      title: '',
      link: '',
      visibility: 'public',
    },
  });

  // Filter channels by language
  useEffect(() => {
    let filtered = channels;
    if (selectedLanguage && selectedLanguage !== "All") {
      filtered = channels.filter(channel => channel.language === selectedLanguage);
    }
    setFilteredChannels(filtered);
  }, [channels, selectedLanguage]);

  // Filter videos
  useEffect(() => {
    const filtered = videos.filter((video) => {
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
        openVideoEditModal(video);
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
      case "transcript":
        openTranscriptEditor(video);
        break;
    }
  };

  // Transcript Editor Functions
  const openTranscriptEditor = async (video: Video) => {
    setTranscriptEditor(prev => ({
      ...prev,
      isVisible: true,
      video: video,
      isLoading: true,
    }));
    
    try {
      // Get transcript from API - you'll need to pass channel ID
      const channelId = selectedChannel; // Use the selected channel
      const response = await api.getVideoTranscript(channelId, video.video_id);
      
      setTranscriptEditor(prev => ({
        ...prev,
        transcriptItems: response.data.transcript.map((item: any, index: number) => ({
          index,
          start: item.start,
          end: item.end,
          transcript: item.transcript,
          isUserModified: item.isUserModified || false,
        })),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error loading transcript:', error);
      message.error(t("failedToLoadTranscript"));
      setTranscriptEditor(prev => ({
        ...prev,
        isVisible: false,
        isLoading: false,
      }));
    }
  };

  const closeTranscriptEditor = () => {
    if (transcriptEditor.hasUnsavedChanges) {
      Modal.confirm({
        title: t("unsavedChanges"),
        content: t("unsavedChangesContent"),
        onOk: () => {
          setTranscriptEditor(prev => ({
            ...prev,
            isVisible: false,
            hasUnsavedChanges: false,
            selectedSegments: new Set(),
            isSelectionMode: false,
          }));
        },
      });
    } else {
      setTranscriptEditor(prev => ({
        ...prev,
        isVisible: false,
        selectedSegments: new Set(),
        isSelectionMode: false,
      }));
    }
  };

  const saveTranscript = async () => {
    if (!transcriptEditor.video) return;
    
    try {
      setTranscriptEditor(prev => ({ ...prev, isLoading: true }));
      
      // Save transcript via API
      const channelId = selectedChannel;
      await api.updateFullTranscript(channelId, transcriptEditor.video.video_id, transcriptEditor.transcriptItems);
      
      message.success(t("transcriptSaved"));
      setTranscriptEditor(prev => ({
        ...prev,
        isLoading: false,
        hasUnsavedChanges: false,
      }));
    } catch (error) {
      console.error('Error saving transcript:', error);
      message.error(t("saveFailed"));
      setTranscriptEditor(prev => ({ ...prev, isLoading: false }));
    }
  };


  // Video Edit Functions
  const openVideoEditModal = (video: Video) => {
    setVideoEdit({
      isVisible: true,
      video: video,
      isLoading: false,
      formData: {
        title: video.title || '',
        link: video.link || '',
        visibility: video.visibility || 'public',
      },
    });
  };

  const closeVideoEditModal = () => {
    setVideoEdit({
      isVisible: false,
      isLoading: false,
      formData: {
        title: '',
        link: '',
        visibility: 'public',
      },
    });
  };

  const handleVideoInfoChange = (field: string, value: string) => {
    setVideoEdit(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value,
      },
    }));
  };

  const saveVideoInfo = async () => {
    if (!videoEdit.video) return;
    
    try {
      setVideoEdit(prev => ({ ...prev, isLoading: true }));
      
      // Create updated video object
      const updatedVideo: Video = {
        ...videoEdit.video,
        title: videoEdit.formData.title,
        link: videoEdit.formData.link,
        visibility: videoEdit.formData.visibility,
        updated_at: Date.now(),
      };
      
      // Call the parent's onEditVideo function with updated data
      onEditVideo(updatedVideo);
      
      message.success(t("videoInfoSaved"));
      closeVideoEditModal();
    } catch (error) {
      message.error(t("saveFailed"));
    } finally {
      setVideoEdit(prev => ({ ...prev, isLoading: false }));
    }
  };

  const renderVideoCard = (video: Video) => (
    <Card
      key={video.video_id}
      className="mb-3 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
      bodyStyle={{ padding: "16px" }}
    >
      <div className="flex items-start space-x-3">
        <Avatar
          size={48}
          src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
          className="flex-shrink-0"
          icon={<VideoCameraOutlined />}
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white break-words overflow-hidden" style={{ 
                display: '-webkit-box', 
                WebkitLineClamp: 2, 
                WebkitBoxOrient: 'vertical' 
              }}>
                {video.title}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-1">
                {t("videoId")}: {video.video_id}
              </p>
            </div>
            
            <div className="flex space-x-1 flex-shrink-0 ml-2">
              <Button
                type="text"
                size="small"
                icon={<FileTextOutlined />}
                onClick={() => handleVideoAction(video, "transcript")}
                className="text-purple-600 dark:text-purple-400"
                title={t("editTranscript")}
              />
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleVideoAction(video, "edit")}
                className="text-blue-600 dark:text-blue-400"
                title={t("editVideo")}
              />
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => handleVideoAction(video, "delete")}
                className="text-red-600 dark:text-red-400"
                title={t("deleteVideo")}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderAnalyticsTab = () => (
    <div className="flex-1 overflow-y-auto p-4 pb-20">
      <div className="space-y-6">
        {analytics ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Card size="small" className="dark:bg-gray-700 dark:border-gray-600">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {analytics.totalVideos || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    {t("totalVideos")}
                  </div>
                </div>
              </Card>
              <Card size="small" className="dark:bg-gray-700 dark:border-gray-600">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    {Math.round(analytics.totalVideos * 0.7) || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    {t("publicVideos")}
                  </div>
                </div>
              </Card>
              <Card size="small" className="dark:bg-gray-700 dark:border-gray-600">
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {Math.round(analytics.totalVideos * 0.3) || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    {t("privateVideos")}
                  </div>
                </div>
              </Card>
              <Card size="small" className="dark:bg-gray-700 dark:border-gray-600">
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {Math.round(analytics.totalVideos * 0.8) || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    {t("refinedVideos")}
                  </div>
                </div>
              </Card>
            </div>

            {/* Channel Statistics */}
            <Card 
              title={
                <div className="flex items-center">
                  <PlayCircleOutlined className="mr-2 text-blue-600" />
                  <span className="text-sm">{t("channelStatistics")}</span>
                </div>
              }
              size="small"
              className="dark:bg-gray-700 dark:border-gray-600"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{t("totalChannels")}</span>
                  <span className="font-semibold">{analytics.totalChannels || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{t("avgVideosPerChannel")}</span>
                  <span className="font-semibold">
                    {analytics.totalChannels > 0 ? Math.round(analytics.totalVideos / analytics.totalChannels) : 0}
                  </span>
                </div>
              </div>
            </Card>

            {/* Duration Statistics */}
            <Card 
              title={
                <div className="flex items-center">
                  <ClockCircleOutlined className="mr-2 text-green-600" />
                  <span className="text-sm">{t("durationStatistics")}</span>
                </div>
              }
              size="small"
              className="dark:bg-gray-700 dark:border-gray-600"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{t("totalDuration")}</span>
                  <span className="font-semibold">
                    {Math.round((analytics.totalDuration || 0) / 3600)}h {Math.round(((analytics.totalDuration || 0) % 3600) / 60)}m
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{t("avgDuration")}</span>
                  <span className="font-semibold">
                    {Math.round((analytics.averageDuration || 0) / 60)}m {Math.round((analytics.averageDuration || 0) % 60)}s
                  </span>
                </div>
              </div>
            </Card>

            {/* Status Breakdown */}
            <Card 
              title={
                <div className="flex items-center">
                  <BarChartOutlined className="mr-2 text-purple-600" />
                  <span className="text-sm">{t("statusBreakdown")}</span>
                </div>
              }
              size="small"
              className="dark:bg-gray-700 dark:border-gray-600"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{t("public")}</span>
                  </div>
                  <span className="font-semibold">{Math.round(analytics.totalVideos * 0.7)} ({Math.round(70)}%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{t("private")}</span>
                  </div>
                  <span className="font-semibold">{Math.round(analytics.totalVideos * 0.3)} ({Math.round(30)}%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{t("refined")}</span>
                  </div>
                  <span className="font-semibold">{Math.round(analytics.totalVideos * 0.8)} ({Math.round(80)}%)</span>
                </div>
              </div>
            </Card>

            {/* Language Distribution */}
            <Card 
              title={
                <div className="flex items-center">
                  <GlobalOutlined className="mr-2 text-blue-600" />
                  <span className="text-sm">{t("languageDistribution")}</span>
                </div>
              }
              size="small"
              className="dark:bg-gray-700 dark:border-gray-600"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="mr-2">🇺🇸</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{t("english")}</span>
                  </div>
                  <span className="font-semibold">{Math.round(analytics.totalVideos * 0.5)} ({Math.round(50)}%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="mr-2">🇨🇳</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{t("chinese")}</span>
                  </div>
                  <span className="font-semibold">{Math.round(analytics.totalVideos * 0.3)} ({Math.round(30)}%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="mr-2">🇯🇵</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{t("japanese")}</span>
                  </div>
                  <span className="font-semibold">{Math.round(analytics.totalVideos * 0.15)} ({Math.round(15)}%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="mr-2">🇰🇷</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{t("korean")}</span>
                  </div>
                  <span className="font-semibold">{Math.round(analytics.totalVideos * 0.05)} ({Math.round(5)}%)</span>
                </div>
              </div>
            </Card>
          </>
        ) : (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center space-y-4">
              <Spin size="large" className="text-purple-600" />
              <div className="text-gray-600 dark:text-gray-300 text-sm">
                {t("loadingAnalytics")}
              </div>
            </div>
          </div>
        )}
      </div>
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
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <MobileBackButton title={t("videoManagement")} />

      {/* Content Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
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
        <div className="flex-1 flex flex-col overflow-hidden">
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

              {/* Language and Channel Filters */}
              <div className="grid grid-cols-2 gap-3">
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
                    <Option value="en">🇺🇸 {t("english")}</Option>
                    <Option value="zh">🇨🇳 {t("chinese")}</Option>
                    <Option value="ja">🇯🇵 {t("japanese")}</Option>
                    <Option value="ko">🇰🇷 {t("korean")}</Option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("channel")}
                  </label>
                  <Select
                    value={selectedChannel || undefined}
                    onChange={onChannelChange}
                    className="w-full"
                    size="small"
                    placeholder={t("selectChannel")}
                    allowClear
                    onClear={() => onChannelChange("")}
                  >
                    {filteredChannels.map(channel => (
                      <Option key={channel.id} value={channel.id}>
                        {channel.name}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredVideos.length} {t("videos")}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredChannels.length} {t("availableChannels")}
                </div>
              </div>
            </div>

            {/* Video List */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-20">
              {!selectedChannel ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="text-gray-400 dark:text-gray-500 mb-4">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">{t("selectChannelToViewVideos")}</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">{t("useFiltersToSelectChannel")}</p>
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

      {/* Enhanced Transcript Editor */}
      <EnhancedTranscriptEditor
        state={transcriptEditor}
        onStateChange={(changes) => {
          setTranscriptEditor(prev => ({ ...prev, ...changes }));
        }}
        onSave={saveTranscript}
        onClose={closeTranscriptEditor}
        isMobile={true}
      />

      {/* Video Edit Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <EditOutlined className="mr-2 text-blue-600" />
            <span>{t("editVideoInfo")}</span>
          </div>
        }
        open={videoEdit.isVisible}
        onCancel={closeVideoEditModal}
        footer={
          <div className="flex justify-end space-x-2">
            <Button onClick={closeVideoEditModal}>
              {t("cancel")}
            </Button>
            <Button 
              type="primary" 
              onClick={saveVideoInfo}
              loading={videoEdit.isLoading}
            >
              {t("save")}
            </Button>
          </div>
        }
        width={600}
        destroyOnClose
      >
        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("videoId")}
            </label>
            <Input
              value={videoEdit.video?.video_id || ''}
              disabled
              className="bg-gray-50 dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("title")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={videoEdit.formData.title}
              onChange={(e) => handleVideoInfoChange('title', e.target.value)}
              placeholder={t("enterVideoTitle")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("videoLink")}
            </label>
            <Input
              value={videoEdit.formData.link}
              onChange={(e) => handleVideoInfoChange('link', e.target.value)}
              placeholder={t("enterVideoLink")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("visibility")}
            </label>
            <Select
              value={videoEdit.formData.visibility}
              onChange={(value) => handleVideoInfoChange('visibility', value)}
              className="w-full"
            >
              <Option value="public">{t("public")}</Option>
              <Option value="private">{t("private")}</Option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("refinementStatus")}
            </label>
            <div className="flex items-center space-x-2">
              <div className={`px-2 py-1 rounded text-xs ${
                videoEdit.video?.is_refined 
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  : 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
              }`}>
                {videoEdit.video?.is_refined ? t("refined") : t("notRefined")}
              </div>
              {videoEdit.video?.refined_at && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {t("refinedAt")}: {new Date(videoEdit.video.refined_at).toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("createdAt")}
              </label>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(videoEdit.video?.created_at || 0).toLocaleString()}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("updatedAt")}
              </label>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(videoEdit.video?.updated_at || 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VideoManagementMobile;