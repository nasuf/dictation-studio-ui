import React from "react";
import { Breadcrumb, Layout, theme } from "antd";
import { Route, Routes, useLocation } from "react-router-dom";

import AppSider from "@/components/Sider";
import { Word } from "@/components/dictation/Word";
import Video from "@/components/dictation/Video";
import Radio from "@/components/dictation/Radio";
import ChannelList from "@/components/dictation/ChannelList";
import VideoList from "@/components/dictation/VideoList";

const { Content } = Layout;

const AppContent: React.FC = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const location = useLocation();

  const componentStyle = {
    width: "640px",
    height: "390px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const getBreadcrumbItems = () => {
    const pathSnippets = location.pathname.split("/").filter((i) => i);
    const breadcrumbItems = [{ title: "Home", path: "/" }];

    pathSnippets.forEach((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
      breadcrumbItems.push({
        title:
          pathSnippets[index].charAt(0).toUpperCase() +
          pathSnippets[index].slice(1),
        path: url,
      });
    });

    return breadcrumbItems;
  };

  return (
    <Content style={{ padding: "0 48px" }}>
      <Breadcrumb style={{ margin: "16px 0" }}>
        {getBreadcrumbItems().map((item, index) => (
          <Breadcrumb.Item key={index}>{item.title}</Breadcrumb.Item>
        ))}
      </Breadcrumb>
      <Layout
        style={{
          height: "80vh",
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
          <Routes>
            <Route path="/dictation/video" element={<ChannelList />} />
            <Route
              path="/dictation/video/channel/:channelId"
              element={<VideoList />}
            />
            <Route path="/dictation/video/:videoId" element={<Video />} />
            <Route
              path="/dictation/word"
              element={<Word style={componentStyle} />}
            />
            <Route path="/collection/video" element={<div>文章收藏</div>} />
            <Route path="/collection/word" element={<div>单词收藏</div>} />
            <Route path="/radio" element={<Radio style={componentStyle} />} />
            <Route path="/" element={<ChannelList />} />
          </Routes>
        </Content>
      </Layout>
    </Content>
  );
};

export default AppContent;
