// create a component that shows the user's channel recommendation

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Input,
  Button,
  List,
  Empty,
  Spin,
  message,
  Select,
  Modal,
} from "antd";
import {
  LinkOutlined,
  YoutubeOutlined,
  TranslationOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { api } from "../../api/api";
import { LANGUAGES } from "../../utils/const";
import { ChannelRecommendationItem } from "@/utils/type";

const ChannelRecommendation = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [channelLink, setChannelLink] = useState("");
  const [channelName, setChannelName] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [recommendations, setRecommendations] = useState<
    ChannelRecommendationItem[]
  >([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Validate YouTube URL
  const isValidYoutubeUrl = (url: string) => {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return regex.test(url);
  };

  // Fetch user's channel recommendations
  const fetchChannelRecommendations = async () => {
    setLoading(true);
    try {
      const response = await api.getChannelRecommendations();
      // sort by submittedAt in descending order
      response.data.sort(
        (a: ChannelRecommendationItem, b: ChannelRecommendationItem) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
      setRecommendations(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching channel recommendations:", error);
      message.error(t("errorFetchingChannelRecommendations"));
      setLoading(false);
    }
  };

  // Submit a new channel recommendation
  const submitChannelRecommendation = async () => {
    if (!channelLink.trim()) {
      message.error(t("pleaseEnterYoutubeChannelLink"));
      return;
    }

    if (!isValidYoutubeUrl(channelLink)) {
      message.error(t("pleaseEnterValidYoutubeUrl"));
      return;
    }

    if (!channelName.trim()) {
      message.error(t("pleaseEnterChannelName"));
      return;
    }

    setSubmitting(true);
    try {
      await api.submitChannelRecommendation({
        link: channelLink,
        language: selectedLanguage,
        name: channelName,
      });
      message.success(t("channelRecommendationSubmitted"));
      setChannelLink("");
      setChannelName("");
      fetchChannelRecommendations(); // Refresh the list
      setSubmitting(false);
    } catch (error) {
      console.error("Error submitting channel recommendation:", error);
      message.error(t("errorSubmittingChannelRecommendation"));
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchChannelRecommendations();
  }, []);

  // Get status text and color based on recommendation status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-500 dark:text-green-400";
      case "rejected":
        return "text-red-500 dark:text-red-400";
      default:
        return "text-orange-500 dark:text-orange-400";
    }
  };

  // Get language options for dropdown
  const languageOptions = Object.entries(LANGUAGES)
    .filter(([key]) => key !== "All") // Filter out 'All' option
    .map(([key, value]) => ({
      label: t(key.toLowerCase()),
      value,
    }));

  // 移动端渲染函数
  const renderMobileView = () => (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* 移动端标题栏 */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => navigate(-1)}
              className="mr-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center">
              <YoutubeOutlined className="mr-2 text-red-600 dark:text-red-500 text-lg" />
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("channelRecommendation")}
              </h1>
            </div>
          </div>
          <button
            onClick={fetchChannelRecommendations}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ReloadOutlined className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* 移动端内容区域 */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* 添加频道按钮 */}
        <div className="mb-4">
          <button
            onClick={() => setModalVisible(true)}
            className="w-full flex items-center justify-center py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors shadow-sm"
          >
            <YoutubeOutlined className="mr-2" />
            {t("recommendYoutubeChannel")}
          </button>
        </div>

        {/* 推荐列表 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spin size="large" />
            </div>
          ) : recommendations.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {recommendations.map((item, index) => (
                <div key={index} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-1">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {item.name}
                          </a>
                        </h3>
                        {item.language && (
                          <span className="ml-2 inline-block px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                            {Object.keys(LANGUAGES).find(
                              (key) => LANGUAGES[key as keyof typeof LANGUAGES] === item.language
                            ) || item.language}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                        <div className="truncate">{item.link}</div>
                        <div>
                          {t("submitted")}: {new Date(item.submittedAt).toLocaleDateString()}
                        </div>
                        {item.status === "rejected" && item.reason && (
                          <div className="text-red-500 dark:text-red-400">
                            {t("rejectedReason")}: {item.reason}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ml-2 ${
                      item.status === "approved"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : item.status === "rejected"
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                    }`}>
                      {t(item.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <YoutubeOutlined className="text-4xl text-gray-400 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-center">
                {t("noRecommendedChannelsYet")}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1">
                {t("helpUsGrowByRecommending")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // 桌面端渲染函数
  const renderDesktopView = () => (
    <div className="h-full flex flex-col p-4 md:p-6">
      {/* Centered container with maximum width */}
      <div className="w-full max-w-3xl mx-auto flex flex-col h-full">
        {/* Top form card for submitting recommendation */}

        {/* Bottom card for viewing recommendations - with flex-grow to extend to bottom */}
        <Card
          className="flex-grow overflow-hidden shadow-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
          title={
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <YoutubeOutlined className="mr-2 text-red-600 dark:text-red-500" />
                <span>{t("yourRecommendedChannels")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="primary"
                  onClick={() => setModalVisible(true)}
                  className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  + {t("recommendYoutubeChannel")}
                </Button>
                <Button
                  type="primary"
                  onClick={fetchChannelRecommendations}
                  icon={<ReloadOutlined />}
                >
                  {t("refresh")}
                </Button>
              </div>
            </div>
          }
          bodyStyle={{
            padding: 0,
            display: "flex",
          }}
        >
          <div className="w-full overflow-auto p-6">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <Spin size="large" />
              </div>
            ) : recommendations.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={recommendations}
                renderItem={(item) => (
                  <List.Item
                    className="dark:border-gray-700"
                    actions={[
                      <span
                        key="status"
                        className={getStatusColor(item.status)}
                      >
                        {t(item.status)}
                      </span>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <div>
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="dark:text-blue-400 hover:underline"
                          >
                            {item.name}
                          </a>
                          {item.language && (
                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                              {Object.keys(LANGUAGES).find(
                                (key) =>
                                  LANGUAGES[key as keyof typeof LANGUAGES] ===
                                  item.language
                              ) || item.language}
                            </span>
                          )}
                        </div>
                      }
                      description={
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          <div>{item.link}</div>
                          <div>
                            {t("submitted")}:{" "}
                            {new Date(item.submittedAt).toLocaleDateString()}
                          </div>
                          {item.status === "rejected" && (
                            <div>Rejected reason: {item.reason}</div>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                description={
                  <span className="dark:text-gray-400">
                    {t("noRecommendedChannelsYet")}
                  </span>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <>
      {/* 大屏幕版本 - 768px及以上 */}
      <div className="hidden md:block h-full">
        {renderDesktopView()}
      </div>
      
      {/* 小屏幕版本 - 768px以下 */}
      <div className="block md:hidden h-full">
        {renderMobileView()}
      </div>

      {/* 共用的Modal - 移动端优化 */}
      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        title={
          <div className="flex items-center">
            <YoutubeOutlined className="mr-2 text-red-600 dark:text-red-500" />
            <span>{t("recommendYoutubeChannel")}</span>
          </div>
        }
        destroyOnClose
        maskClosable={false}
        width="90%"
        style={{ maxWidth: 500 }}
        className="mobile-modal"
      >
        <div className="pt-4">
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
            {t("helpUsGrowByRecommending")}
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("youtubeChannelLink")}
              </label>
              <Input
                placeholder={t("enterYoutubeChannelLink")}
                value={channelLink}
                onChange={(e) => setChannelLink(e.target.value)}
                prefix={<LinkOutlined className="text-gray-400" />}
                className="w-full dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                size="large"
                onPressEnter={submitChannelRecommendation}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("channelName")}
              </label>
              <Input
                placeholder={t("enterChannelName")}
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                className="w-full dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                size="large"
                onPressEnter={submitChannelRecommendation}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("language")}
              </label>
              <div className="flex items-center">
                <TranslationOutlined className="mr-3 text-gray-400" />
                <Select
                  value={selectedLanguage}
                  onChange={setSelectedLanguage}
                  options={languageOptions}
                  className="flex-1 dark:bg-gray-700 dark:text-gray-200"
                  placeholder={t("selectLanguage")}
                  size="large"
                />
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <Button
                type="primary"
                onClick={async () => {
                  await submitChannelRecommendation();
                  setModalVisible(false);
                }}
                loading={submitting}
                className="w-full h-12 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-base font-medium"
                size="large"
              >
                {submitting ? t("submitting") : t("submit")}
              </Button>
              <Button
                onClick={() => setModalVisible(false)}
                className="w-full h-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                size="large"
              >
                {t("cancel")}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ChannelRecommendation;
