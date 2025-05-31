import React, { useState, useEffect } from "react";
import { Card, Input, Button, message, List, Upload, Form, Modal } from "antd";
import {
  UploadOutlined,
  SendOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type { UploadFile, RcFile } from "antd/es/upload/interface";
import { api } from "@/api/api";
import { useTranslation } from "react-i18next";
import { FeedbackMessage } from "@/utils/type";

const { TextArea } = Input;

const Feedback: React.FC = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [imgOffset, setImgOffset] = useState({ x: 0, y: 0 });

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
    if (!values.content && fileList.length === 0) {
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

  // mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLImageElement>) => {
    if (scale === 1) return; // only allow dragging when zoomed in
    setDragging(true);
    setDragStart({ x: e.clientX - imgOffset.x, y: e.clientY - imgOffset.y });
  };

  // mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging || !dragStart) return;
    setImgOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  // mouse up
  const handleMouseUp = () => {
    setDragging(false);
    setDragStart(null);
  };

  return (
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
                      {new Date(item.timestamp).toLocaleString()}
                      {item.senderType === "admin" ? " · Admin" : ""}
                    </div>
                    <div className="dark:text-gray-400">{item.message}</div>
                    {/* Render images if present */}
                    {Array.isArray(item.images) &&
                      item.images.map((img: string, idx: number) => (
                        <img
                          key={idx}
                          src={img}
                          alt="Feedback"
                          className="max-w-full h-auto mb-2 rounded cursor-pointer"
                          style={{ maxHeight: 200 }}
                          onClick={() => setPreviewImage(img)}
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

      <Modal
        open={!!previewImage}
        footer={null}
        onCancel={() => setPreviewImage(null)}
        centered
        width={800}
        styles={{
          body: {
            padding: 0,
            background: "transparent",
          },
          content: {
            padding: 0,
          },
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "auto",
            background: "#222",
            cursor: dragging ? "grabbing" : scale > 1 ? "grab" : "default",
            userSelect: "none",
            position: "relative",
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            src={previewImage || ""}
            alt="Preview"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              transform: `scale(${scale}) translate(${imgOffset.x / scale}px, ${
                imgOffset.y / scale
              }px)`,
              transition: dragging ? "none" : "transform 0.2s",
              cursor: scale > 1 ? (dragging ? "grabbing" : "grab") : "zoom-in",
              background: "#222",
            }}
            onWheel={(e) => {
              e.preventDefault();
              let newScale = scale;
              if (e.deltaY < 0) {
                newScale = Math.min(scale + 0.1, 5);
              } else {
                newScale = Math.max(scale - 0.1, 1);
              }
              setScale(newScale);
              if (newScale === 1) setImgOffset({ x: 0, y: 0 }); // reset offset when zooming out
            }}
            onMouseDown={handleMouseDown}
            draggable={false}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Feedback;
