import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Empty } from "antd";
import { PlayCircleOutlined } from "@ant-design/icons";
import { api } from "@/api/api";
import { Video } from "@/utils/type";
import {
  ScrollableContainer,
  VideoCardGrid,
  UniversalCard,
  UniversalContentInfo,
  UniversalContentTitle,
  StatusIndicator,
  SkeletonImage,
} from "./Widget";
import { useDispatch, useSelector } from "react-redux";
import { setVideoName } from "@/redux/navigationSlice";
import { useTranslation } from "react-i18next";
import { VISIBILITY_OPTIONS } from "@/utils/const";
import { RootState } from "@/redux/store";
import MobileHeader from "@/components/MobileHeader";

interface VideoListProps {
  progressFilter?: string;
}

const VideoList: React.FC<VideoListProps> = ({ progressFilter = "all" }) => {
  const { channelId } = useParams<{ channelId: string }>();
  const location = useLocation();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [videos, setVideos] = useState<Video[]>([]);
  const [progress, setProgress] = useState<{ [key: string]: number }>({});
  const [loadedImages, setLoadedImages] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [progressFilterState, setProgressFilterState] = useState(progressFilter);

  // Get channel name from Redux state
  const channelName = useSelector((state: RootState) => state.navigation.channelName) || location.state?.name;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [videoResponse, progressResponse] = await Promise.all([
        api.getVideoList(channelId!, VISIBILITY_OPTIONS.Public),
        api.getChannelProgress(channelId!),
      ]);
      setVideos(videoResponse.data.videos);
      setProgress(progressResponse.data.progress);
      setLoadedImages(
        videoResponse.data.videos.reduce(
          (acc: { [key: string]: boolean }, video: Video) => {
            acc[video.video_id] = false;
            return acc;
          },
          {}
        )
      );
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        setIsUnauthorized(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [channelId]);

  const handleImageLoad = (videoId: string) => {
    setLoadedImages((prev) => ({ ...prev, [videoId]: true }));
  };

  // Calculate status counts
  const getVideoStatus = (videoId: string) => {
    const videoProgress = progress[videoId] || 0;
    if (videoProgress >= 100) return "completed";
    if (videoProgress > 0) return "in_progress";
    return "not_started";
  };

  const getStatusText = (videoId: string) => {
    const status = getVideoStatus(videoId);
    switch (status) {
      case "completed":
        return t("completed");
      case "in_progress":
        return t("inProgress");
      default:
        return t("notStarted");
    }
  };

  const getStatusColor = (videoId: string) => {
    const status = getVideoStatus(videoId);
    switch (status) {
      case "completed":
        return "#52c41a"; // green
      case "in_progress":
        return "#1890ff"; // blue
      default:
        return "#9e9e9e"; // gray
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 md:h-32 md:w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Filter and sort videos
  const filteredAndSortedVideos = videos
    .filter((video) => {
      // Apply search filter
      const matchesSearch = video.title.toLowerCase().includes(searchValue.toLowerCase());
      if (!matchesSearch) return false;

      // Apply progress filter
      const videoProgress = progress[video.video_id] || 0;
      switch (progressFilterState) {
        case "completed":
        case "done":
          return videoProgress >= 100;
        case "in_progress":
          return videoProgress > 0 && videoProgress < 100;
        case "not_started":
          return videoProgress === 0;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      const progressA = progress[a.video_id] || 0;
      const progressB = progress[b.video_id] || 0;

      // Default to recent sorting - prioritize videos with progress, then by created_at
      const hasProgressA = progressA > 0;
      const hasProgressB = progressB > 0;

      // If one has progress and the other doesn't, prioritize the one with progress
      if (hasProgressA && !hasProgressB) return -1;
      if (!hasProgressA && hasProgressB) return 1;

      // If both have progress or both don't have progress, sort by created_at (descending)
      return b.created_at - a.created_at;
    });

  // Calculate status counts
  const videoStatusCounts = {
    completed: videos.filter(video => (progress[video.video_id] || 0) >= 100).length,
    in_progress: videos.filter(video => {
      const p = progress[video.video_id] || 0;
      return p > 0 && p < 100;
    }).length,
    not_started: videos.filter(video => (progress[video.video_id] || 0) === 0).length,
  };

  return (
    <div className="flex flex-col h-full">
      {/* Mobile Header - only visible on small screens */}
      <div className="md:hidden">
        <MobileHeader
          channelName={channelName}
          videoCount={videos.length}
          onRefresh={fetchData}
          onSearch={setSearchValue}
          searchValue={searchValue}
          isLoading={loading}
        />
      </div>

      {/* Mobile Status Filter Tabs - Flutter-style design */}
      <div className="md:hidden flex-shrink-0">
        <div className="mx-3 my-2 p-2 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex gap-2">
            <button
              onClick={() => setProgressFilterState(progressFilterState === 'done' ? 'all' : 'done')}
              className={`flex flex-col items-center px-1.5 py-1 text-xs font-medium rounded-lg transition-all duration-200 flex-1 min-h-[40px] ${
                progressFilterState === 'done'
                  ? 'bg-blue-500 text-white shadow-sm border-2 border-blue-600'
                  : videoStatusCounts.completed > 0
                    ? 'bg-blue-50/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 hover:bg-blue-100/70 dark:hover:bg-blue-900/50'
                    : 'bg-gray-100/50 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 border border-gray-300/30 dark:border-gray-600/30'
              }`}
              disabled={videoStatusCounts.completed === 0}
            >
              <span className="font-semibold text-sm leading-none">{videoStatusCounts.completed}</span>
              <span className="text-[10px] mt-0.5 leading-none">{t('done')}</span>
            </button>
            <button
              onClick={() => setProgressFilterState(progressFilterState === 'in_progress' ? 'all' : 'in_progress')}
              className={`flex flex-col items-center px-1.5 py-1 text-xs font-medium rounded-lg transition-all duration-200 flex-1 min-h-[40px] ${
                progressFilterState === 'in_progress'
                  ? 'bg-orange-500 text-white shadow-sm border-2 border-orange-600'
                  : videoStatusCounts.in_progress > 0
                    ? 'bg-orange-50/50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-800/60 hover:bg-orange-100/70 dark:hover:bg-orange-900/50'
                    : 'bg-gray-100/50 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 border border-gray-300/30 dark:border-gray-600/30'
              }`}
              disabled={videoStatusCounts.in_progress === 0}
            >
              <span className="font-semibold text-sm leading-none">{videoStatusCounts.in_progress}</span>
              <span className="text-[10px] mt-0.5 leading-none">{t('inProgress')}</span>
            </button>
            <button
              onClick={() => setProgressFilterState(progressFilterState === 'not_started' ? 'all' : 'not_started')}
              className={`flex flex-col items-center px-1.5 py-1 text-xs font-medium rounded-lg transition-all duration-200 flex-1 min-h-[40px] ${
                progressFilterState === 'not_started'
                  ? 'bg-gray-500 text-white shadow-sm border-2 border-gray-600'
                  : videoStatusCounts.not_started > 0
                    ? 'bg-gray-50/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 border border-gray-300/60 dark:border-gray-600/60 hover:bg-gray-100/70 dark:hover:bg-gray-600/50'
                    : 'bg-gray-100/50 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 border border-gray-300/30 dark:border-gray-600/30'
              }`}
              disabled={videoStatusCounts.not_started === 0}
            >
              <span className="font-semibold text-sm leading-none">{videoStatusCounts.not_started}</span>
              <span className="text-[10px] mt-0.5 leading-none">{t('notStarted')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Video List */}
      <ScrollableContainer>
        {filteredAndSortedVideos.length === 0 ? (
          <div className="flex justify-center items-center h-full w-full">
            <Empty
              description={
                isUnauthorized 
                  ? t("unauthorized") 
                  : searchValue 
                    ? t("noSearchResults") 
                    : t("comingSoon")
              }
            />
          </div>
        ) : (
          <VideoCardGrid>
            {filteredAndSortedVideos
              .map((video) => (
                <Link
                  key={video.video_id}
                  to={`/dictation/video/${channelId}/${video.video_id}`}
                  onClick={() => dispatch(setVideoName(video.title))}
                  state={{ name: video.title }}
                >
                  <UniversalCard
                    contentType="video"
                    hoverable
                    cover={
                      <div
                        style={{ position: "relative", paddingTop: "56.25%" }}
                      >
                        {!loadedImages[video.video_id] && (
                          <SkeletonImage active />
                        )}
                        <img
                          alt={video.title}
                          src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
                          onLoad={() => handleImageLoad(video.video_id)}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: loadedImages[video.video_id]
                              ? "block"
                              : "none",
                            borderRadius: "8px 8px 0 0",
                          }}
                        />
                        {/* Progress bar at bottom of image */}
                        {(progress[video.video_id] || 0) > 0 && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                            <div
                              className="h-full transition-all duration-300"
                              style={{
                                width: `${progress[video.video_id] || 0}%`,
                                backgroundColor: getStatusColor(video.video_id),
                              }}
                            />
                          </div>
                        )}
                        {/* Play button */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-9 h-9 bg-black/70 rounded-full flex items-center justify-center">
                            <PlayCircleOutlined className="text-white text-lg" />
                          </div>
                        </div>
                        {/* Progress percentage badge in top-right corner */}
                        {(progress[video.video_id] || 0) > 0 && (
                          <div className="absolute top-2 right-2">
                            <div
                              className="text-white text-xs font-medium px-1.5 py-0.5 rounded"
                              style={{
                                backgroundColor: getStatusColor(video.video_id),
                              }}
                            >
                              {Math.round(progress[video.video_id] || 0)}%
                            </div>
                          </div>
                        )}
                      </div>
                    }
                    styles={{ body: { padding: 0 } }}
                  >
                    <UniversalContentInfo contentType="video">
                      <UniversalContentTitle level={5} contentType="video">
                        {video.title}
                      </UniversalContentTitle>
                      <StatusIndicator>
                        <div
                          className="status-dot"
                          style={{
                            backgroundColor: getStatusColor(video.video_id),
                          }}
                        />
                        <span
                          className="status-text"
                          style={{ color: getStatusColor(video.video_id) }}
                        >
                          {getStatusText(video.video_id)}
                        </span>
                      </StatusIndicator>
                    </UniversalContentInfo>
                  </UniversalCard>
                </Link>
              ))}
          </VideoCardGrid>
        )}
      </ScrollableContainer>
    </div>
  );
};

export default VideoList;
