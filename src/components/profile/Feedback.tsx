import React, { useState, useEffect } from "react";
import { Card, Input, Button, message, List, Upload, Form, Image } from "antd";
import { useNavigate } from "react-router-dom";
import {
  UploadOutlined,
  SendOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type { UploadFile, RcFile } from "antd/es/upload/interface";
import { api } from "@/api/api";
import { useTranslation } from "react-i18next";
import { FeedbackMessage } from "@/utils/type";
import { formatTimestamp } from "@/utils/util";

const { TextArea } = Input;

const Feedback: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();

  // Fetch feedback messages
  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await api.getFeedbackMessages();
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching feedback messages:", error);
      message.error(t("errorFetchingFeedback"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Handle file upload
  const handleUpload = async (file: RcFile) => {
    if (file.size > 1024 * 1024) {
      // 1MB limit
      message.error(t("imageSizeLimit"));
      return false;
    }

    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error(t("onlyImagesAllowed"));
      return false;
    }

    const uploadFile: UploadFile = {
      uid: file.uid,
      name: file.name,
      status: "done",
      originFileObj: file,
    };
    setFileList([uploadFile]);
    return false; // Prevent auto upload
  };

  // Handle message submission
  const handleSubmit = async (values: { content: string }) => {
    if (!values.content) {
      message.error(t("contentCannotBeEmpty"));
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("message", values.content);
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("images", fileList[0].originFileObj);
      }

      await api.submitFeedback(formData);
      message.success(t("feedbackSubmitted"));
      form.resetFields();
      setFileList([]);
      fetchMessages();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      message.error(t("errorSubmittingFeedback"));
    } finally {
      setSubmitting(false);
    }
  };

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
              <span className="text-lg mr-2">💬</span>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("feedback")}
              </h1>
            </div>
          </div>
          <button
            onClick={fetchMessages}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ReloadOutlined className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((item, index) => (
                  <div
                    key={index}
                    className={`flex ${item.senderType === "admin" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-3 ${
                        item.senderType === "admin"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                      }`}
                    >
                      {item.message && (
                        <div className="text-sm">{item.message}</div>
                      )}
                      {/* 渲染图片 */}
                      {Array.isArray(item.images) &&
                        item.images.map((img: string, idx: number) => (
                          <Image
                            key={idx}
                            src={img}
                            alt="Feedback"
                            className="mt-2 rounded-lg"
                            style={{ maxHeight: 150, maxWidth: "100%" }}
                            preview={{
                              mask: false,
                            }}
                          />
                        ))}
                      <div className={`text-xs mt-2 opacity-70 ${
                        item.senderType === "admin" ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                      }`}>
                        {formatTimestamp(item.timestamp, "locale")}
                        {item.senderType === "admin" ? " · Admin" : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <span className="text-4xl mb-3">💬</span>
                <p className="text-gray-500 dark:text-gray-400">
                  {t("noFeedbackMessages")}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {t("sendFirstFeedbackMessage")}
                </p>
              </div>
            )}
          </div>

          {/* 输入区域 */}
          <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">
            <Form form={form} onFinish={handleSubmit}>
              <Form.Item name="content" className="mb-3">
                <TextArea
                  rows={3}
                  placeholder={t("enterFeedback")}
                  className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                  maxLength={1000}
                  showCount
                />
              </Form.Item>
              <div className="flex items-center justify-between">
                <Upload
                  beforeUpload={handleUpload}
                  fileList={fileList}
                  onRemove={() => setFileList([])}
                  maxCount={1}
                  accept="image/*"
                  showUploadList={false}
                >
                  <Button
                    icon={<UploadOutlined />}
                    className="dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                  >
                    {fileList.length > 0 ? "✓" : t("uploadImage")}
                  </Button>
                </Upload>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={() => form.submit()}
                  loading={submitting}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {t("send")}
                </Button>
              </div>
              {fileList.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <span className="mr-2">📎 {fileList[0].name}</span>
                    <Button
                      type="text"
                      size="small"
                      onClick={() => setFileList([])}
                      className="text-red-500 hover:text-red-600 p-0 h-auto"
                    >
                      删除
                    </Button>
                  </div>
                </div>
              )}
            </Form>
          </div>
        </div>
      </div>
    </div>
  );

  // 桌面端渲染函数
  const renderDesktopView = () => (
    <div className="h-full flex flex-col p-4 md:p-6">
      <div className="w-full max-w-3xl mx-auto flex flex-col h-full">
        {/* Messages List */}
        <Card
          className="flex-grow overflow-hidden shadow-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 mb-4"
          title={t("feedbackHistory")}
          // place a refresh button in title
          extra={
            <Button
              type="primary"
              onClick={fetchMessages}
              icon={<ReloadOutlined />}
            >
              {t("refresh")}
            </Button>
          }
          bodyStyle={{ height: "calc(100% - 57px)", padding: 0 }}
        >
          <div className="h-full overflow-auto p-4">
            <List
              loading={loading}
              itemLayout="horizontal"
              dataSource={messages}
              renderItem={(item) => (
                <List.Item
                  className={
                    item.senderType === "admin"
                      ? "justify-end"
                      : "justify-start"
                  }
                  style={{
                    display: "flex",
                    flexDirection:
                      item.senderType === "admin" ? "row-reverse" : "row",
                  }}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg bg-gray-100 dark:bg-gray-800`}
                    style={{
                      alignSelf:
                        item.senderType === "admin" ? "flex-end" : "flex-start",
                    }}
                  >
                    <div className="text-xs opacity-70 mt-1 dark:text-gray-400">
                      {formatTimestamp(item.timestamp, "locale")}
                      {item.senderType === "admin" ? " · Admin" : ""}
                    </div>
                    {item.message && (
                      <div className="dark:text-gray-400">{item.message}</div>
                    )}
                    {/* Render images if present */}
                    {Array.isArray(item.images) &&
                      item.images.map((img: string, idx: number) => (
                        <Image
                          key={idx}
                          src={img}
                          alt="Feedback"
                          className="mb-2 rounded"
                          style={{ maxHeight: 200 }}
                          preview={{
                            mask: false,
                          }}
                        />
                      ))}
                  </div>
                </List.Item>
              )}
            />
          </div>
        </Card>

        {/* Input Form */}
        <Card className="shadow-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700">
          <Form form={form} onFinish={handleSubmit}>
            <Form.Item name="content">
              <TextArea
                rows={4}
                placeholder={t("enterFeedback")}
                className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
              />
            </Form.Item>
            <div className="flex justify-between items-center">
              <Upload
                beforeUpload={handleUpload}
                fileList={fileList}
                onRemove={() => setFileList([])}
                maxCount={1}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>{t("uploadImage")}</Button>
              </Upload>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={() => form.submit()}
                loading={submitting}
              >
                {t("send")}
              </Button>
            </div>
          </Form>
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
    </>
  );
};

export default Feedback;
