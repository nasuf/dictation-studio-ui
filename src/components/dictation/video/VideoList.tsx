import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
import { useDispatch } from "react-redux";
import { setVideoName } from "@/redux/navigationSlice";
import { useTranslation } from "react-i18next";
import { VISIBILITY_OPTIONS } from "@/utils/const";

interface VideoListProps {
  progressFilter?: string;
}

const VideoList: React.FC<VideoListProps> = ({ progressFilter = "all" }) => {
  const { channelId } = useParams<{ channelId: string }>();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [videos, setVideos] = useState<Video[]>([]);
  const [progress, setProgress] = useState<{ [key: string]: number }>({});
  const [loadedImages, setLoadedImages] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
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

  return (
    <div className="flex flex-col h-full">
      {/* Video List */}
      <ScrollableContainer>
        {videos.length === 0 ? (
          <div className="flex justify-center items-center h-full w-full">
            <Empty
              description={isUnauthorized ? t("unauthorized") : t("comingSoon")}
            />
          </div>
        ) : (
          <VideoCardGrid>
            {videos
              .filter((video) => {
                // Apply progress filter
                if (progressFilter === "all") return true;

                const videoProgress = progress[video.video_id] || 0;
                switch (progressFilter) {
                  case "completed":
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
                // Get progress for both videos
                const progressA = progress[a.video_id] || 0;
                const progressB = progress[b.video_id] || 0;

                // Check if videos have progress (> 0)
                const hasProgressA = progressA > 0;
                const hasProgressB = progressB > 0;

                // If one has progress and the other doesn't, prioritize the one with progress
                if (hasProgressA && !hasProgressB) {
                  return -1; // a comes first
                }
                if (!hasProgressA && hasProgressB) {
                  return 1; // b comes first
                }

                // If both have progress or both don't have progress, sort by created_at (descending)
                return b.created_at - a.created_at;
              })
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
