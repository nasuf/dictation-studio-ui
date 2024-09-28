import React, { useRef } from "react";
import { Breadcrumb, Layout, theme, Button } from "antd";
import { Route, Routes, useLocation, Link } from "react-router-dom";

import AppSider from "@/components/Sider";
import { Word } from "@/components/dictation/Word";
import VideoMain, {
  VideoMainRef,
} from "@/components/dictation/video/VideoMain";
import Radio from "@/components/dictation/Radio";
import ChannelList from "@/components/dictation/video/ChannelList";
import VideoList from "@/components/dictation/video/VideoList";
import ChannelManagement from "@/components/admin/ChannelManagement";
import VideoManagement from "@/components/admin/VideoManagement";
import { useTranslation } from "react-i18next";
import { CloudUploadOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import UserManagement from "@/components/admin/UserManagement";

const { Content } = Layout;

const AppContent: React.FC = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const location = useLocation();
  const videoMainRef = useRef<VideoMainRef>(null);
  const { t } = useTranslation();
  const isDictationStarted = useSelector(
    (state: RootState) => state.user.isDictationStarted
  );

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

    pathSnippets.forEach((snippet, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
      let title = snippet.charAt(0).toUpperCase() + snippet.slice(1);

      if (snippet === "channel" && location.state && location.state.name) {
        title = location.state.name;
      }

      breadcrumbItems.push({ title, path: url });
    });

    return breadcrumbItems;
  };

  const handleSaveProgress = () => {
    if (videoMainRef.current) {
      videoMainRef.current.saveProgress();
    }
  };

  const isVideoPage = /^\/dictation\/video\/[^/]+\/[^/]+$/.test(
    location.pathname
  );

  return (
    <Content style={{ padding: "0 48px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "16px 0",
        }}
      >
        <Breadcrumb>
          {getBreadcrumbItems().map((item, index) => (
            <Breadcrumb.Item key={index}>
              <Link to={item.path}>{item.title}</Link>
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
        {isVideoPage && (
          <Button onClick={handleSaveProgress} disabled={!isDictationStarted}>
            <CloudUploadOutlined />
            {t("saveProgressBtnText")}
          </Button>
        )}
      </div>
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
            width: "100%",
            overflow: "auto",
          }}
        >
          <Routes>
            <Route path="/" element={<ChannelList />} />
            <Route path="/dictation" element={<ChannelList />} />
            <Route path="/dictation/video" element={<ChannelList />} />
            <Route path="/dictation/video/:channelId" element={<VideoList />} />
            <Route
              path="/dictation/video/:channelId/:videoId"
              element={<VideoMain ref={videoMainRef} />}
            />
            <Route
              path="/dictation/word"
              element={<Word style={componentStyle} />}
            />
            <Route path="/collection/video" element={<div>文章收藏</div>} />
            <Route path="/collection/word" element={<div>单词收藏</div>} />
            <Route path="/radio" element={<Radio style={componentStyle} />} />
            <Route path="/admin/channel" element={<ChannelManagement />} />
            <Route path="/admin/video" element={<VideoManagement />} />
            <Route path="/admin/user" element={<UserManagement />} />
            <Route path="/profile" element={<div>个人中心</div>} />
          </Routes>
        </Content>
      </Layout>
    </Content>
  );
};

export default AppContent;
