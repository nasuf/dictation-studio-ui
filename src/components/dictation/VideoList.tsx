import React from "react";
import { Link, useParams } from "react-router-dom";
import { Card } from "antd";

// 这里我们使用硬编码的视频列表，实际应用中你需要从YouTube API获取数据
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
  const { channelId } = useParams<{ channelId: string }>();

  // 使用 channelId 来获取特定频道的视频
  // 这里你可能需要根据 channelId 来过滤视频或从 API 获取数据

  return (
    <div style={{ padding: "20px" }}>
      <h2>视频列表</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {videos.map((video) => (
          <Link key={video.id} to={`/dictation/video/${video.id}`}>
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
