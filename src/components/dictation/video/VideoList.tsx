import React, { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { Card, Spin } from "antd";
import { api } from "@/api/api";
import { ScrollingTitle } from "@/components/dictation/video/Widget";

interface Video {
  video_id: string;
  link: string;
  title: string;
}

const VideoList: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { channelId } = useParams<{ channelId: string }>();
  const location = useLocation();
  const channelName = location.state?.channelName;

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      try {
        const response = await api.getVideoList(channelId!);
        setVideos(response.data.videos);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (channelId) {
      fetchVideos();
    }
  }, [channelId]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" tip="Loading videos..." />
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {videos.map((video) => (
          <Link
            key={video.video_id}
            to={`/dictation/video/${channelId}/${video.video_id}`}
            state={{ channelId, channelName, videoId: video.video_id }}
          >
            <Card
              hoverable
              style={{ width: 300 }}
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
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default VideoList;
