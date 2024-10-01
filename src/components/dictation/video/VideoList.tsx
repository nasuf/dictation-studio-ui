import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Progress } from "antd";
import { api } from "@/api/api";
import { Video } from "@/utils/type";
import {
  ScrollableContainer,
  VideoCardGrid,
  CustomHoverCard,
  CustomCardMeta,
  ScrollingTitle,
  SkeletonImage,
} from "./Widget";
import { resetScrollPosition } from "@/utils/util";

const VideoList: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const [videos, setVideos] = useState<Video[]>([]);
  const [progress, setProgress] = useState<{ [key: string]: number }>({});
  const [loadedImages, setLoadedImages] = useState<{ [key: string]: boolean }>(
    {}
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [videoResponse, progressResponse] = await Promise.all([
          api.getVideoList(channelId!),
          api.getChannelProgress(channelId!),
        ]);
        setVideos(videoResponse.data.videos);
        setProgress(progressResponse.data.progress);
        // Initialize all images as not loaded
        setLoadedImages(
          videoResponse.data.videos.reduce(
            (acc: { [key: string]: boolean }, video: Video) => {
              acc[video.video_id] = false;
              return acc;
            },
            {}
          )
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [channelId]);

  const handleImageLoad = (videoId: string) => {
    setLoadedImages((prev) => ({ ...prev, [videoId]: true }));
  };

  return (
    <ScrollableContainer className="h-full overflow-y-auto">
      <VideoCardGrid>
        {videos.map((video) => (
          <Link
            key={video.video_id}
            to={`/dictation/video/${channelId}/${video.video_id}`}
          >
            <CustomHoverCard
              hoverable
              cover={
                <div style={{ position: "relative", paddingTop: "56.25%" }}>
                  {!loadedImages[video.video_id] && <SkeletonImage active />}
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
                      display: loadedImages[video.video_id] ? "block" : "none",
                      borderRadius: "10px 10px 0 0",
                    }}
                  />
                </div>
              }
            >
              <CustomCardMeta
                title={
                  <ScrollingTitle onMouseLeave={resetScrollPosition}>
                    <div className="inner-text">{video.title}</div>
                  </ScrollingTitle>
                }
              />
              <Progress
                percent={progress[video.video_id] || 0}
                size="small"
                status="active"
                style={{ marginTop: "10px" }}
              />
            </CustomHoverCard>
          </Link>
        ))}
      </VideoCardGrid>
    </ScrollableContainer>
  );
};

export default VideoList;
