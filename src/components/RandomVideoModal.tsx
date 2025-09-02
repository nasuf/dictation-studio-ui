import React, { useState, useCallback } from "react";
import { Modal, Button, Card, Typography, Space, Spin, message } from "antd";
import {
  ReloadOutlined,
  PlayCircleOutlined,
  RedoOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/api";

const { Title, Text } = Typography;

interface RandomVideo {
  channel_id: string;
  video_id: string;
  video_title: string;
  video_link: string;
  channel_name: string;
  channel_image_url: string;
  language: string;
}

interface RandomVideoModalProps {
  visible: boolean;
  onCancel: () => void;
}

const RandomVideoModal: React.FC<RandomVideoModalProps> = ({
  visible,
  onCancel,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [randomVideo, setRandomVideo] = useState<RandomVideo | null>(null);

  const getLanguageDisplay = (language: string) => {
    const displayMap: { [key: string]: string } = {
      en: "EN",
      english: "EN",
      zh: "中文",
      chinese: "中文",
      ja: "日本語",
      japanese: "日本語",
      ko: "한국어",
      korean: "한국어",
    };
    return (
      displayMap[language?.toLowerCase()] || language?.toUpperCase() || "EN"
    );
  };

  const fetchRandomVideo = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getRandomVideo();
      setRandomVideo(response.data.video);
    } catch (error: unknown) {
      console.error("Error fetching random video:", error);
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "status" in error.response &&
        error.response.status === 404
      ) {
        message.info(t("noPublicVideosAvailable"));
      } else {
        message.error(t("failedToLoadRandomVideo"));
      }
    } finally {
      setLoading(false);
    }
  }, [t]);

  const handleStartDictation = () => {
    if (randomVideo) {
      navigate(
        `/dictation/video/${randomVideo.channel_id}/${randomVideo.video_id}`
      );
      onCancel();
    }
  };

  const handleModalOpen = useCallback(() => {
    if (visible && !randomVideo) {
      fetchRandomVideo();
    }
  }, [visible, randomVideo, fetchRandomVideo]);

  React.useEffect(() => {
    handleModalOpen();
  }, [visible, handleModalOpen]);

  const handleCancel = () => {
    setRandomVideo(null);
    onCancel();
  };

  return (
    <Modal
      title={
        <Space align="center">
          <RedoOutlined style={{ color: "#1890ff" }} />
          <span>{t("randomDictation")}</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      width={600}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          {t("cancel")}
        </Button>,
        <Button
          key="shuffle"
          icon={<ReloadOutlined />}
          onClick={fetchRandomVideo}
          loading={loading}
          disabled={!randomVideo}
        >
          {t("tryAnother")}
        </Button>,
        <Button
          key="start"
          type="primary"
          icon={<PlayCircleOutlined />}
          onClick={handleStartDictation}
          disabled={!randomVideo}
          loading={loading}
        >
          {t("startDictation")}
        </Button>,
      ]}
      className="random-video-modal"
    >
      <div className="p-4">
        {loading && !randomVideo ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Spin size="large" />
            <Text className="mt-4 text-gray-500 dark:text-gray-300">
              {t("findingRandomVideo")}
            </Text>
          </div>
        ) : randomVideo ? (
          <div className="space-y-4">
            {/* Video Card */}
            <Card
              hoverable
              className="overflow-hidden"
              cover={
                <div className="relative" style={{ paddingTop: "56.25%" }}>
                  <img
                    alt={randomVideo.video_title}
                    src={`https://img.youtube.com/vi/${randomVideo.video_id}/mqdefault.jpg`}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/404.jpg";
                    }}
                  />

                  {/* Language tag */}
                  <div className="absolute top-2 right-2">
                    <div className="inline-flex items-center px-2 py-1 rounded-full bg-black/70 backdrop-blur-sm">
                      <div className="w-1.5 h-1.5 rounded-full mr-1.5 bg-blue-400" />
                      <span className="text-white text-xs font-medium">
                        {getLanguageDisplay(randomVideo.language)}
                      </span>
                    </div>
                  </div>

                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                      <PlayCircleOutlined className="text-2xl text-blue-500" />
                    </div>
                  </div>
                </div>
              }
            >
              <div className="p-2">
                <Title
                  level={4}
                  className="mb-2 line-clamp-2 text-gray-900 dark:text-white"
                >
                  {randomVideo.video_title}
                </Title>

                <Space align="center" className="mb-2">
                  <img
                    src={randomVideo.channel_image_url}
                    alt={randomVideo.channel_name}
                    className="w-6 h-6 rounded-full"
                    onError={(e) => {
                      e.currentTarget.src = "/404.jpg";
                    }}
                  />
                  <Text className="text-gray-500 dark:text-gray-300">
                    {randomVideo.channel_name}
                  </Text>
                </Space>
              </div>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12">
            <Text className="text-gray-500 dark:text-gray-300">
              {t("noVideosFound")}
            </Text>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default RandomVideoModal;
