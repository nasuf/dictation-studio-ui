import React, { useState, useEffect } from "react";
import { Layout, Menu, Empty } from "antd";
import { api } from "@/api/api";
import {
  UniversalCard,
  UniversalContentInfo,
  UniversalContentTitle,
  ScrollableContainer,
  VideoCardGrid,
  SkeletonImage,
  StatusIndicator,
} from "@/components/dictation/video/Widget";
import { ProgressData } from "@/utils/type";
import { Link } from "react-router-dom";
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

  const getVideoStatus = (overallCompletion: number) => {
    const videoProgress = overallCompletion || 0;
    if (videoProgress >= 100) return "completed";
    if (videoProgress > 0) return "in_progress";
    return "not_started";
  };

  const getStatusText = (overallCompletion: number) => {
    const status = getVideoStatus(overallCompletion);
    switch (status) {
      case "completed":
        return t("completed");
      case "in_progress":
        return t("inProgress");
      default:
        return t("notStarted");
    }
  };

  const getStatusColor = (overallCompletion: number) => {
    const status = getVideoStatus(overallCompletion);
    switch (status) {
      case "completed":
        return "#52c41a"; // green
      case "in_progress":
        return "#1890ff"; // blue
      default:
        return "#9e9e9e"; // gray
    }
  };

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
                  <Link
                    key={video.videoId}
                    to={`/dictation/video/${selectedChannel}/${video.videoId}`}
                  >
                    <UniversalCard
                      contentType="video"
                      hoverable
                      key={video.videoId}
                      cover={
                        <div
                          style={{ position: "relative", paddingTop: "56.25%" }}
                        >
                          {!loadedImages[video.videoId] && (
                            <SkeletonImage active />
                          )}
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
                              borderRadius: "8px 8px 0 0",
                            }}
                          />
                          {/* Progress percentage badge in top-right corner */}
                          {(video.overallCompletion || 0) > 0 && (
                            <div className="absolute top-2 right-2">
                              <div
                                className="text-white text-xs font-medium px-1.5 py-0.5 rounded"
                                style={{
                                  backgroundColor: getStatusColor(
                                    video.overallCompletion
                                  ),
                                }}
                              >
                                {Math.round(video.overallCompletion || 0)}%
                              </div>
                            </div>
                          )}
                        </div>
                      }
                      styles={{ body: { padding: 0 } }}
                    >
                      <UniversalContentInfo contentType="video">
                        <UniversalContentTitle level={5} contentType="video">
                          {video.videoTitle}
                        </UniversalContentTitle>
                        <StatusIndicator>
                          <div
                            className="status-dot"
                            style={{
                              backgroundColor: getStatusColor(
                                video.overallCompletion
                              ),
                            }}
                          />
                          <span
                            className="status-text"
                            style={{
                              color: getStatusColor(video.overallCompletion),
                            }}
                          >
                            {getStatusText(video.overallCompletion)}
                          </span>
                        </StatusIndicator>
                      </UniversalContentInfo>
                    </UniversalCard>
                  </Link>
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
