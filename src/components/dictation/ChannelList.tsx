import React from "react";
import { Link } from "react-router-dom";
import { Card, Avatar } from "antd";
import { YoutubeOutlined, VideoCameraOutlined } from "@ant-design/icons";

const channels = [
  {
    id: "UCYxRlFDqcWM4y7FfpiAN3KQ",
    name: "BBC Ideas",
    icon: <YoutubeOutlined style={{ fontSize: 64 }} />,
  },
  {
    id: "UCAuUUnT6oDeKwE6v1NGQxug",
    name: "TED",
    icon: <VideoCameraOutlined style={{ fontSize: 64 }} />,
  },
];

const ChannelList: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h2>选择一个YouTube频道</h2>
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        {channels.map((channel) => (
          <Link key={channel.id} to={`/dictation/video/channel/${channel.id}`}>
            <Card
              hoverable
              style={{ width: 240 }}
              cover={
                <Avatar
                  size={200}
                  icon={channel.icon}
                  style={{
                    backgroundColor: "#f56a00",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    margin: "20px auto",
                  }}
                />
              }
            >
              <Card.Meta title={channel.name} style={{ textAlign: "center" }} />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ChannelList;
