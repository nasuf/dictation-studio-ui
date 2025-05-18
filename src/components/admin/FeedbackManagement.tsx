import React, { useEffect, useState } from "react";
import {
  Card,
  List,
  Input,
  Button,
  Spin,
  Modal,
  message as antdMessage,
} from "antd";
import { api } from "@/api/api";
import { useTranslation } from "react-i18next";
import { FeedbackMessage } from "@/utils/type";

const { TextArea } = Input;

export default function FeedbackManagement() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState<FeedbackMessage[]>([]);
  const [reply, setReply] = useState<{ [id: string]: string }>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [imgOffset, setImgOffset] = useState({ x: 0, y: 0 });
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // 获取所有反馈
  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await api.getAllFeedbackMessages();
      setFeedbacks(
        res.data.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp).getTime(),
        }))
      );
    } catch (e) {
      antdMessage.error(t("errorFetchingFeedback"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
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

  // 按用户分组
  const grouped = feedbacks.reduce((acc, fb) => {
    const email = fb.userEmail || "unknown";
    if (!acc[email]) acc[email] = [];
    acc[email].push(fb);
    return acc;
  }, {} as Record<string, any[]>);

  // Extract user list
  const userList = Array.from(
    new Set(feedbacks.map((fb) => fb.userEmail || "unknown"))
  );
  // Default to first user if none selected
  useEffect(() => {
    if (!selectedUser && userList.length > 0) {
      setSelectedUser(userList[0]);
    }
  }, [userList, selectedUser]);

  // 发送回复
  const handleReply = async (feedbackId: string) => {
    if (!reply[feedbackId]?.trim()) return;
    try {
      await api.replyFeedback(feedbackId, {
        status: "resolved",
        response: reply[feedbackId],
      });
      antdMessage.success(t("feedbackSubmitted"));
      setReply((r) => ({ ...r, [feedbackId]: "" }));
      fetchFeedbacks();
    } catch {
      antdMessage.error(t("errorSubmittingFeedback"));
    }
  };

  return (
    <div className="flex h-full">
      {loading ? (
        <Spin />
      ) : (
        <>
          <div className="w-64 border-r p-4 bg-white dark:bg-gray-900">
            <ul>
              {userList.map((email) => (
                <li
                  key={email}
                  className={`cursor-pointer p-2 rounded ${
                    selectedUser === email ? "bg-blue-100 dark:bg-gray-900" : ""
                  }`}
                  onClick={() => setSelectedUser(email)}
                >
                  {email}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex-1 p-6">
            {selectedUser && grouped[selectedUser] && (
              <Card key={selectedUser} title={selectedUser} className="mb-6">
                <List
                  dataSource={grouped[selectedUser].sort(
                    (a, b) => a.timestamp - b.timestamp
                  )}
                  renderItem={(item) => (
                    <List.Item
                      className={
                        item.sender === "admin"
                          ? "justify-end"
                          : "justify-start"
                      }
                      style={{
                        display: "flex",
                        flexDirection:
                          item.sender === "admin" ? "row-reverse" : "row",
                      }}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          item.sender === "admin"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 dark:bg-gray-800"
                        }`}
                      >
                        <div className="text-xs opacity-70 mt-1 dark:text-gray-400">
                          {new Date(item.timestamp).toLocaleString()}
                        </div>
                        <div className="dark:text-gray-400">{item.message}</div>
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
                        {item.response && (
                          <div className="mt-2 p-2 bg-blue-100 text-blue-800 rounded">
                            <b>Admin:</b> {item.response}
                          </div>
                        )}
                      </div>
                    </List.Item>
                  )}
                />
                {/* 回复输入框 */}
                <div className="flex gap-2 mt-2">
                  <TextArea
                    rows={2}
                    value={
                      reply[
                        grouped[selectedUser][grouped[selectedUser].length - 1]
                          .id
                      ] || ""
                    }
                    onChange={(e) =>
                      setReply((r) => ({
                        ...r,
                        [grouped[selectedUser][grouped[selectedUser].length - 1]
                          .id]: e.target.value,
                      }))
                    }
                    placeholder={t("enterFeedback")}
                  />
                  <Button
                    type="primary"
                    onClick={() =>
                      handleReply(
                        grouped[selectedUser][grouped[selectedUser].length - 1]
                          .id
                      )
                    }
                  >
                    {t("send")}
                  </Button>
                </div>
              </Card>
            )}
            {/* 图片预览 */}
            <Modal
              open={!!previewImage}
              footer={null}
              onCancel={() => setPreviewImage(null)}
              centered
              bodyStyle={{ padding: 0, background: "transparent" }}
              style={{ background: "transparent" }}
            >
              <div
                style={{
                  width: "100%",
                  height: "80vh",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "auto",
                  background: "#222",
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
                    display: "block",
                    margin: "auto",
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
        </>
      )}
    </div>
  );
}
