import React, { useState, useEffect } from "react";
import { Progress, Layout, theme, Menu } from "antd";
import { api } from "@/api/api";
import {
  CustomCardMeta,
  CustomHoverCard,
  ScrollableContainer,
  ScrollingTitle,
  VideoCardGrid,
  SkeletonImage,
} from "@/components/dictation/video/Widget";
import { UserProgressData } from "@/utils/type";
import { Link } from "react-router-dom";
import { resetScrollPosition } from "@/utils/util";

const { Content, Sider } = Layout;

const UserProgress: React.FC = () => {
  const [allProgress, setAllProgress] = useState<UserProgressData[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const { token } = theme.useToken();
  const [loadedImages, setLoadedImages] = useState<{ [key: string]: boolean }>(
    {}
  );

  useEffect(() => {
    const fetchAllProgress = async () => {
      try {
        const response = await api.getAllProgress();
        const data = response.data;
        setAllProgress(data.progress);
        if (data.progress.length > 0) {
          setSelectedChannel(data.progress[0].channelId);
        }
        // Initialize all images as not loaded
        setLoadedImages(
          data.progress.reduce(
            (acc: { [key: string]: boolean }, item: UserProgressData) => {
              acc[item.videoId] = false;
              return acc;
            },
            {}
          )
        );
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

  const handleImageLoad = (videoId: string) => {
    setLoadedImages((prev) => ({ ...prev, [videoId]: true }));
  };

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
              <Link
                key={video.videoId}
                to={`/dictation/video/${selectedChannel}/${video.videoId}`}
              >
                <CustomHoverCard
                  key={video.videoId}
                  hoverable
                  cover={
                    <div style={{ position: "relative", paddingTop: "56.25%" }}>
                      {!loadedImages[video.videoId] && <SkeletonImage active />}
                      <img
                        alt={video.videoTitle}
                        src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                        onLoad={() => handleImageLoad(video.videoId)}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: loadedImages[video.videoId]
                            ? "block"
                            : "none",
                          borderRadius: "10px 10px 0 0",
                        }}
                      />
                    </div>
                  }
                >
                  <CustomCardMeta
                    title={
                      <ScrollingTitle onMouseLeave={resetScrollPosition}>
                        <div className="inner-text">{video.videoTitle}</div>
                      </ScrollingTitle>
                    }
                  />
                  <Progress
                    percent={video.overallCompletion}
                    size="small"
                    status="active"
                    style={{ marginTop: "10px" }}
                  />
                </CustomHoverCard>
              </Link>
            ))}
          </VideoCardGrid>
        </ScrollableContainer>
      </Content>
    </Layout>
  );
};

export default UserProgress;
