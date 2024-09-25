import React, { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { Card, Spin } from "antd";
import { api } from "@/api/api";
import {
  HoverCard,
  ScrollingTitle,
  VideoCardGrid,
  ProgressBar,
  StyledScrollableContainer,
} from "@/components/dictation/video/Widget";
import { Video } from "@/utils/type";

interface VideoWithProgress extends Video {
  overallCompletion: number;
}

const VideoList: React.FC = () => {
  const [videos, setVideos] = useState<VideoWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { channelId } = useParams<{ channelId: string }>();
  const location = useLocation();
  const channelName = location.state?.channelName;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [videoResponse, progressResponse] = await Promise.all([
          api.getVideoList(channelId!),
          api.getChannelProgress(channelId!),
        ]);

        const videoList = videoResponse.data.videos;
        const progressList = progressResponse.data.progress;

        const videosWithProgress = videoList.map((video: Video) => {
          const progress = progressList.find(
            (p: any) => p.videoId === video.video_id
          );
          return {
            ...video,
            overallCompletion: progress ? progress.overallCompletion : 0,
          };
        });

        setVideos(videosWithProgress);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (channelId) {
      fetchData();
    }
  }, [channelId]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Spin size="large" tip="Loading videos..." />
      </div>
    );
  }

  const overallProgress =
    videos.reduce((sum, video) => sum + video.overallCompletion, 0) /
    videos.length;

  return (
    <StyledScrollableContainer>
      <VideoCardGrid>
        {videos.map((video) => (
          <Link
            key={video.video_id}
            to={`/dictation/video/${channelId}/${video.video_id}`}
            state={{ channelId, channelName, videoId: video.video_id }}
          >
            <HoverCard
              hoverable
              style={{ width: "100%", position: "relative" }}
              cover={
                <img
                  alt={video.title}
                  src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
                />
              }
            >
              <Card.Meta
                title={
                  <ScrollingTitle>
                    <span className="inner-text">{video.title}</span>
                  </ScrollingTitle>
                }
              />
              {video.overallCompletion > 0 && (
                <ProgressBar
                  percent={video.overallCompletion}
                  className="progress-bar"
                />
              )}
            </HoverCard>
          </Link>
        ))}
      </VideoCardGrid>
      {overallProgress > 0 && <ProgressBar percent={overallProgress} />}
    </StyledScrollableContainer>
  );
};

export default VideoList;
