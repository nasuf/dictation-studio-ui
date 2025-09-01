import React, { useState, useEffect } from "react";
import { Layout, Menu, Empty } from "antd";
import { api } from "@/api/api";
import {
  ScrollableContainer,
  VideoCardGrid,
} from "@/components/dictation/video/Widget";
import VideoCard from "@/components/dictation/video/VideoCard";
import { ProgressData } from "@/utils/type";
import { useTranslation } from "react-i18next";

const { Content, Sider } = Layout;

const UserProgress: React.FC = () => {
  const [allProgress, setAllProgress] = useState<ProgressData[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<{ [key: string]: boolean }>(
    {}
  );
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllProgress = async () => {
      try {
        const response = await api.getAllProgress();
        const data = response.data;
        setAllProgress(data.progress);
        if (data.progress.length > 0) {
          setSelectedChannel(data.progress[0].channelId);
        }
        setLoadedImages(
          data.progress.reduce(
            (acc: { [key: string]: boolean }, item: ProgressData) => {
              acc[item.videoId] = false;
              return acc;
            },
            {}
          )
        );
      } catch (error) {
        console.error("Error fetching progress:", error);
      } finally {
        setLoading(false);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }


  return (
    <Layout className="h-full bg-transparent">
      {allProgress.length === 0 ? (
        <div className="flex items-center justify-center h-full w-full">
          <Empty
            description={
              <span className="text-gray-500 dark:text-gray-400">
                {t("noProgressDataAvailable")}
              </span>
            }
          />
        </div>
      ) : (
        <>
          <Sider
            className="modern-sider shadow-xl border-r border-slate-300 dark:border-slate-600"
            width={200}
            style={{
              overflow: "hidden",
              height: "100%",
            }}
          >
            {/* Background Pattern */}
            <div className="sider-pattern"></div>

            {/* Floating Elements */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="sider-floating-element"
                  style={{
                    width: `${8 + i * 3}px`,
                    height: `${8 + i * 3}px`,
                    left: `${20 + i * 50}%`,
                    top: `${20 + i * 40}%`,
                    animationDelay: `${i * 1.5}s`,
                    animationDuration: `${5 + i * 0.5}s`,
                  }}
                />
              ))}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10" style={{ height: 'calc(100% - 2rem)', padding: '1rem 0' }}>
              <Menu
                mode="inline"
                selectedKeys={[selectedChannel || ""]}
                style={{
                  background: "transparent",
                  border: "none",
                  minHeight: "auto",
                }}
                className="bg-transparent"
                onSelect={({ key }) => setSelectedChannel(key)}
              >
                {channels.map((channelId) => (
                  <Menu.Item key={channelId} className="modern-menu-item-sider no-link">
                    {allProgress.find((item) => item.channelId === channelId)
                      ?.channelName || channelId}
                  </Menu.Item>
                ))}
              </Menu>
            </div>
          </Sider>
          <Content className="overflow-hidden bg-transparent bg-gradient-to-br from-gray-200 via-gray-100 to-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
            <ScrollableContainer className="h-full overflow-y-auto custom-scrollbar">
              <VideoCardGrid>
                {filteredVideos.map((video) => (
                  <VideoCard
                    key={video.videoId}
                    videoId={video.videoId}
                    videoTitle={video.videoTitle || ""}
                    progress={video.overallCompletion || 0}
                    isImageLoaded={loadedImages[video.videoId] || false}
                    onImageLoad={handleImageLoad}
                    linkPath={selectedChannel ? `/dictation/video/${selectedChannel}/${video.videoId}` : undefined}
                  />
                ))}
              </VideoCardGrid>
            </ScrollableContainer>
          </Content>
        </>
      )}
    </Layout>
  );
};

export default UserProgress;
