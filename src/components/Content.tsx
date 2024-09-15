import React, { useEffect, useRef, useState } from "react";
import { Breadcrumb, Layout, Menu, theme, Input } from "antd";
import YouTube, { YouTubePlayer } from "react-youtube";
import AppSider from "./Sider";

const { Content } = Layout;

const AppContent: React.FC = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const playerRef = useRef<YouTubePlayer | null>(null);
  const [userInput, setUserInput] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!playerRef.current) return;

      if (event.key === "Tab") {
        event.preventDefault(); // 防止 Tab 键的默认行为
        if (isPlaying) {
          playerRef.current.pauseVideo();
          setIsPlaying(false);
        } else {
          playerRef.current.playVideo();
          setIsPlaying(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isPlaying]);

  const onReady = (event: { target: YouTubePlayer }) => {
    playerRef.current = event.target;
  };

  return (
    <Content style={{ padding: "0 48px" }}>
      <Breadcrumb style={{ margin: "16px 0" }}>
        <Breadcrumb.Item>Home</Breadcrumb.Item>
        <Breadcrumb.Item>List</Breadcrumb.Item>
        <Breadcrumb.Item>App</Breadcrumb.Item>
      </Breadcrumb>
      <Layout
        style={{
          padding: "24px 0",
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
        }}
      >
        <AppSider />
        <Content
          style={{
            padding: "0 24px",
            minHeight: 280,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <YouTube
            videoId="7lOJxI-3oqQ" // 替换为你想要的视频ID
            opts={{
              height: "390",
              width: "640",
              playerVars: {
                autoplay: 0,
              },
            }}
            onReady={onReady}
          />
          <Input
            style={{ marginTop: "20px", width: "640px" }}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="输入你听到的内容"
          />
          <p style={{ marginTop: "10px" }}>
            按 Tab 键开始/暂停视频。在句子结束时暂停，然后输入你听到的内容。
          </p>
        </Content>
      </Layout>
    </Content>
  );
};

export default AppContent;
