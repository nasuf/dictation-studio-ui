import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, Progress } from "antd";
import { api } from "@/api/api";
import {
  VideoCardGrid,
  CustomCardMeta,
  CustomHoverCard,
  ScrollableContainer,
} from "@/components/dictation/video/Widget";
import { Video } from "@/utils/type";

const { Meta } = Card;

const VideoList: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const { channelId } = useParams<{ channelId: string }>();
  const [progress, setProgress] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await api.getVideoList(channelId!);
        if (Array.isArray(response.data)) {
          setVideos(response.data);
          fetchProgress(response.data);
        } else if (response.data && Array.isArray(response.data.videos)) {
          setVideos(response.data.videos);
          fetchProgress(response.data.videos);
        } else {
          console.error("Unexpected API response format:", response.data);
          setVideos([]);
        }
      } catch (error) {
        console.error("Error fetching videos:", error);
        setVideos([]);
      }
    };

    fetchVideos();
  }, [channelId]);

  const fetchProgress = async (videoList: Video[]) => {
    try {
      const progressPromises = videoList.map((video) =>
        api.getUserProgress(channelId!, video.video_id)
      );
      const progressResponses = await Promise.all(progressPromises);
      const newProgress: { [key: string]: number } = {};
      progressResponses.forEach((response, index) => {
        if (response.data && response.data.overallCompletion) {
          newProgress[videoList[index].video_id] =
            response.data.overallCompletion;
        }
      });
      setProgress(newProgress);
    } catch (error) {
      console.error("Error fetching progress:", error);
    }
  };

  return (
    <ScrollableContainer>
      <VideoCardGrid>
        {videos.map((video) => (
          <Link
            key={video.video_id}
            to={`/dictation/video/${channelId}/${video.video_id}`}
          >
            <CustomHoverCard
              hoverable
              style={{ width: "100%" }}
              cover={
                <img
                  alt={video.title}
                  src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
                />
              }
            >
              <CustomCardMeta
                title={video.title}
                description={
                  <Progress
                    percent={Math.round(progress[video.video_id] || 0)}
                    status="active"
                    format={(percent) => `${percent}%`}
                  />
                }
              />
            </CustomHoverCard>
          </Link>
        ))}
      </VideoCardGrid>
    </ScrollableContainer>
  );
};

export default VideoList;
