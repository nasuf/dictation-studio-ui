import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Empty, Progress } from "antd";
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
import { useDispatch } from "react-redux";
import { setVideoName } from "@/redux/navigationSlice";
import { t } from "i18next";

const VideoList: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const dispatch = useDispatch();
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
          api.getVideoList(channelId!, false),
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <ScrollableContainer className="h-full overflow-y-auto custom-scrollbar">
      {videos.length === 0 ? (
        <div className="flex justify-center items-center h-full w-full">
          <Empty
            description={isUnauthorized ? t("unauthorized") : t("comingSoon")}
          />
        </div>
      ) : (
        <VideoCardGrid>
          {videos.map((video) => (
            <Link
              key={video.video_id}
              to={`/dictation/video/${channelId}/${video.video_id}`}
              onClick={() => dispatch(setVideoName(video.title))}
              state={{ name: video.title }}
            >
              <CustomHoverCard
                hoverable
                className="video-card"
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
                        display: loadedImages[video.video_id]
                          ? "block"
                          : "none",
                        borderRadius: "8px 8px 0 0",
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
      )}
    </ScrollableContainer>
  );
};

export default VideoList;
