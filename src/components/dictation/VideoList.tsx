import React, { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { Card } from "antd";
import { api } from "../../api/api";

interface Video {
  video_id: string;
  link: string;
}

const VideoList: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const { channelId } = useParams<{ channelId: string }>();
  const location = useLocation();
  const channelName = location.state?.channelName;

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await api.getVideoList(channelId!);
        setVideos(response.data.videos);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };

    if (channelId) {
      fetchVideos();
    }
  }, [channelId]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>{channelName} Videos</h2>
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
              cover={<img alt={video.video_id} src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`} />}
            >
              <Card.Meta title={video.video_id} />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default VideoList;
