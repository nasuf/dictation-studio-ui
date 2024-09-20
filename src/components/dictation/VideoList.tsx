import React from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { Card } from "antd";

const videos = [
  {
    id: "7QDGDh9KT_U",
    title: "The psychology behind a pandemic - Samir Dedhia",
    thumbnail: "https://img.youtube.com/vi/7QDGDh9KT_U/mqdefault.jpg",
  },
  {
    id: "c7YiPA8Qd8s",
    title: "How to be a better conversationalist | Celeste Headlee",
    thumbnail: "https://img.youtube.com/vi/c7YiPA8Qd8s/mqdefault.jpg",
  },
];

const VideoList: React.FC = () => {
  const { channelId } = useParams();
  const location = useLocation();
  const channelName = location.state?.name;

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {videos.map((video) => (
          <Link
            key={video.id}
            to={`/dictation/video/${channelId}/${video.id}`}
            state={{ name: video.title, channelName: channelName }}
          >
            <Card
              hoverable
              style={{ width: 300 }}
              cover={<img alt={video.title} src={video.thumbnail} />}
            >
              <Card.Meta title={video.title} />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default VideoList;
