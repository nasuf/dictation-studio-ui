import React, { useState, useEffect } from "react";
import { Card, Progress, Layout, theme, Menu } from "antd";
import { api } from "@/api/api";
import {
  ScrollableContainer,
  VideoCardGrid,
} from "@/components/dictation/video/Widget";
import { UserProgressData } from "@/utils/type";

const { Content, Sider } = Layout;

const UserProgress: React.FC = () => {
  const [allProgress, setAllProgress] = useState<UserProgressData[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const { token } = theme.useToken();

  useEffect(() => {
    const fetchAllProgress = async () => {
      try {
        const response = await api.getAllProgress();
        const data = response.data;
        setAllProgress(data.progress);
        if (data.progress.length > 0) {
          setSelectedChannel(data.progress[0].channelId);
        }
      } catch (error) {
        console.error("Error fetching progress:", error);
      }
    };

    fetchAllProgress();
  }, []);

  const channels = Array.from(
    new Set(allProgress.map((item) => item.channelId))
  );

  const filteredVideos = allProgress.filter(
    (item) => item.channelId === selectedChannel
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={200}
        theme="light"
        style={{ background: token.colorBgContainer }}
      >
        <Menu
          mode="inline"
          selectedKeys={[selectedChannel || ""]}
          style={{ height: "100%", borderRight: 0 }}
          onSelect={({ key }) => setSelectedChannel(key)}
        >
          {channels.map((channelId) => (
            <Menu.Item key={channelId}>
              {allProgress.find((item) => item.channelId === channelId)
                ?.channelName || channelId}
            </Menu.Item>
          ))}
        </Menu>
      </Sider>
      <Content
        style={{
          padding: "0 24px",
          minHeight: 280,
          background: token.colorBgContainer,
        }}
      >
        <ScrollableContainer>
          <VideoCardGrid>
            {filteredVideos.map((video) => (
              <Card
                key={video.videoId}
                hoverable
                cover={
                  <img
                    alt={video.videoTitle}
                    src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                  />
                }
              >
                <Card.Meta title={video.videoTitle} />
                <Progress
                  percent={video.overallCompletion}
                  size="small"
                  status="active"
                  style={{ marginTop: "10px" }}
                />
              </Card>
            ))}
          </VideoCardGrid>
        </ScrollableContainer>
      </Content>
    </Layout>
  );
};

export default UserProgress;
