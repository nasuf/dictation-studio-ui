// create a component that shows the user's channel recommendation

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, Input, Button, List, Empty, Spin, message, Select } from "antd";
import {
  LinkOutlined,
  YoutubeOutlined,
  TranslationOutlined,
} from "@ant-design/icons";
import { api } from "../../api/api";
import { LANGUAGES } from "../../utils/const";

interface ChannelRecommendation {
  id: string;
  name: string;
  link: string;
  imageUrl: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  language?: string;
}

const ChannelRecommendation = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [channelLink, setChannelLink] = useState("");
  const [channelName, setChannelName] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [recommendations, setRecommendations] = useState<
    ChannelRecommendation[]
  >([]);

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
      setRecommendations(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching channel recommendations:", error);
      message.error(t("errorFetchingChannelRecommendations"));
      setLoading(false);

      // Use mock data if API fails in development
      if (process.env.NODE_ENV === "development") {
        setRecommendations([
          {
            id: "1",
            name: "English with Lucy",
            link: "https://www.youtube.com/c/EnglishwithLucy",
            imageUrl:
              "https://yt3.googleusercontent.com/ytc/APkrFKb5msRrGk_CcJLQ_8-Ci3mi9E8a1Y0P85EjzHdI=s176-c-k-c0x00ffffff-no-rj",
            submittedAt: new Date().toISOString(),
            status: "approved",
            language: "en",
          },
          {
            id: "2",
            name: "Learn Chinese with ChineseFor.Us",
            link: "https://www.youtube.com/c/ChineseForUs",
            imageUrl:
              "https://yt3.googleusercontent.com/ytc/APkrFKa50z1KPYa-N_WwR_oCdHDtX7dA2Ot7yw_QGNeo=s176-c-k-c0x00ffffff-no-rj",
            submittedAt: new Date().toISOString(),
            status: "pending",
            language: "zh",
          },
        ]);
      }
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

  return (
    <div className="h-full flex flex-col p-4 md:p-6">
      {/* Centered container with maximum width */}
      <div className="w-full max-w-3xl mx-auto flex flex-col h-full">
        {/* Top form card for submitting recommendation */}
        <Card
          className="mb-4 shadow-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
          title={
            <div className="flex items-center">
              <YoutubeOutlined className="mr-2 text-red-600 dark:text-red-500" />
              <span>{t("recommendYoutubeChannel")}</span>
            </div>
          }
        >
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {t("helpUsGrowByRecommending")}
          </p>

          <div className="flex flex-col gap-4">
            <Input
              placeholder={t("enterYoutubeChannelLink")}
              value={channelLink}
              onChange={(e) => setChannelLink(e.target.value)}
              prefix={<LinkOutlined className="text-gray-400" />}
              className="w-full dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
              onPressEnter={submitChannelRecommendation}
            />

            <Input
              placeholder={t("enterChannelName")}
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              className="w-full dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
              onPressEnter={submitChannelRecommendation}
            />

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex flex-1 items-center">
                <TranslationOutlined className="mr-2 text-gray-400" />
                <Select
                  value={selectedLanguage}
                  onChange={setSelectedLanguage}
                  options={languageOptions}
                  className="w-full min-w-[120px] dark:bg-gray-700 dark:text-gray-200"
                  placeholder={t("selectLanguage")}
                />
              </div>

              <Button
                type="primary"
                onClick={submitChannelRecommendation}
                loading={submitting}
                className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                {t("submit")}
              </Button>
            </div>
          </div>
        </Card>

        {/* Bottom card for viewing recommendations - with flex-grow to extend to bottom */}
        <Card
          className="flex-grow overflow-hidden shadow-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
          title={
            <div className="flex items-center">
              <YoutubeOutlined className="mr-2 text-red-600 dark:text-red-500" />
              <span>{t("yourRecommendedChannels")}</span>
            </div>
          }
          bodyStyle={{
            height: "calc(100% - 57px)",
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
                      // avatar={<Avatar src={item.imageUrl} />}
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
                className="py-16"
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ChannelRecommendation;
