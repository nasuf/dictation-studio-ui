import React, { useEffect, useState } from "react";
import {
  Card,
  List,
  Input,
  Button,
  Modal,
  message as antdMessage,
  Menu,
  Layout,
  Upload,
  Empty,
} from "antd";
import { api } from "@/api/api";
import { useTranslation } from "react-i18next";
import { FeedbackMessage, FeedbackUserList } from "@/utils/type";
import type { UploadFile, RcFile } from "antd/es/upload/interface";
import { UploadOutlined, SendOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Content, Sider } = Layout;

export default function FeedbackManagement() {
  const { t } = useTranslation();
  const [pageLoading, setPageLoading] = useState(false);
  const [feedbackUserList, setFeedbackUserList] = useState<FeedbackUserList[]>(
    []
  );
  const [reply, setReply] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [imgOffset, setImgOffset] = useState({ x: 0, y: 0 });
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [adminFileList, setAdminFileList] = useState<UploadFile[]>([]);
  const [feedbackMessages, setFeedbackMessages] = useState<FeedbackMessage[]>(
    []
  );
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);

  // 获取所有反馈
  const fetchFeedbackUserList = async () => {
    setPageLoading(true);
    try {
      const res = await api.getAllFeedbackUserList();
      const list = res.data.sort(
        (a: FeedbackUserList, b: FeedbackUserList) => b.timestamp - a.timestamp
      );
      setFeedbackUserList(list);
      setSelectedUser(list[0].email);
    } catch (e) {
      antdMessage.error(t("errorFetchingFeedback"));
    } finally {
      setPageLoading(false);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      setFeedbackLoading(true);
      const res = await api.getFeedbackMessages(selectedUser);
      setFeedbackMessages(
        res.data.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp).getTime(),
        }))
      );
    } catch (e) {
      antdMessage.error(t("errorFetchingFeedback"));
    } finally {
      setFeedbackLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [selectedUser]);

  useEffect(() => {
    fetchFeedbackUserList();
  }, []);

  // Reset scale when opening/closing preview
  useEffect(() => {
    if (previewImage) {
      setScale(1);
      setImgOffset({ x: 0, y: 0 });
    }
  }, [previewImage]);

  // Mouse down handler for image drag
  const handleMouseDown = (e: React.MouseEvent<HTMLImageElement>) => {
    if (scale === 1) return; // only allow dragging when zoomed in
    setDragging(true);
    setDragStart({ x: e.clientX - imgOffset.x, y: e.clientY - imgOffset.y });
  };

  // Mouse move handler for drag
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging || !dragStart) return;
    setImgOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  // Mouse up handler
  const handleMouseUp = () => {
    setDragging(false);
    setDragStart(null);
  };

  // Handle admin image upload
  const handleAdminUpload = async (file: RcFile) => {
    if (file.size > 1024 * 1024) {
      // 1MB limit
      antdMessage.error(t("imageSizeLimit"));
      return false;
    }
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      antdMessage.error(t("onlyImagesAllowed"));
      return false;
    }
    const uploadFile: UploadFile = {
      uid: file.uid,
      name: file.name,
      status: "done",
      originFileObj: file,
    };
    setAdminFileList([uploadFile]);
    return false; // Prevent auto upload
  };

  // Update handleReply to send image if present
  const handleReply = async (selectedUser: string) => {
    try {
      setReplyLoading(true);
      const formData = new FormData();
      if (!reply) {
        antdMessage.error(t("contentCannotBeEmpty"));
        return;
      }
      formData.append("response", reply);
      if (adminFileList.length > 0 && adminFileList[0].originFileObj) {
        formData.append("images", adminFileList[0].originFileObj);
      }
      await api.replyFeedback(selectedUser, {
        response: reply || "",
        images:
          adminFileList.length > 0 ? adminFileList[0].originFileObj : undefined,
      });
      antdMessage.success(t("feedbackSubmitted"));
      setReply("");
      setAdminFileList([]);
      fetchFeedbacks();
    } catch (e) {
      antdMessage.error(t("errorSubmittingFeedback"));
    } finally {
      setReplyLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (feedbackUserList.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Empty
          description={
            <span className="text-gray-500 dark:text-gray-400">
              No feedback data available
            </span>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <>
        <Sider
          className="bg-white dark:bg-gray-800 dark:text-white"
          width={200}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedUser || ""]}
            style={{ height: "100%", borderRight: 0 }}
            onSelect={({ key }) => {
              setSelectedUser(key);
            }}
            className="bg-white dark:bg-gray-800 dark:text-white"
          >
            {feedbackUserList.map((user: FeedbackUserList) => (
              <Menu.Item key={user.email} className="dark:text-white">
                {user.email}
              </Menu.Item>
            ))}
          </Menu>
        </Sider>

        <Content className="overflow-hidden bg-transparent">
          <div className="h-full flex flex-col p-4 md:p-6 w-full max-w-3xl mx-auto">
            {/* Feedback message list */}
            <Card
              className="flex-grow overflow-hidden shadow-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 mb-4"
              title={selectedUser || t("feedbackHistory")}
              bodyStyle={{ height: "calc(100% - 57px)", padding: 0 }}
            >
              <div className="h-full overflow-auto p-4">
                <List
                  loading={feedbackLoading}
                  dataSource={feedbackMessages}
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
                            item.senderType === "admin"
                              ? "flex-end"
                              : "flex-start",
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

            {/* Reply input area, only show if selectedUser and messages exist */}
            {selectedUser && (
              <Card className="shadow-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700">
                {/* Reply text area */}
                <TextArea
                  rows={2}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder={t("enterFeedback")}
                  className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                />
                {/* Button row: upload left, send right */}
                <div className="flex justify-between items-center mt-2">
                  <Upload
                    beforeUpload={handleAdminUpload}
                    fileList={adminFileList}
                    onRemove={() => setAdminFileList([])}
                    maxCount={1}
                    accept="image/*"
                    showUploadList={{ showPreviewIcon: false }}
                  >
                    <Button icon={<UploadOutlined />}>
                      {t("uploadImage")}
                    </Button>
                  </Upload>
                  <Button
                    type="primary"
                    onClick={() => handleReply(selectedUser)}
                    loading={replyLoading}
                    icon={<SendOutlined />}
                  >
                    {t("send")}
                  </Button>
                </div>
              </Card>
            )}

            {/* Image preview modal (unchanged) */}
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
                  // height: "80vh",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "auto",
                  background: "#222",
                  cursor: dragging
                    ? "grabbing"
                    : scale > 1
                    ? "grab"
                    : "default",
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
                    transform: `scale(${scale}) translate(${
                      imgOffset.x / scale
                    }px, ${imgOffset.y / scale}px)`,
                    transition: dragging ? "none" : "transform 0.2s",
                    cursor:
                      scale > 1 ? (dragging ? "grabbing" : "grab") : "zoom-in",
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
        </Content>
      </>
    </div>
  );
}
