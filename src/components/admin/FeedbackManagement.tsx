import { useEffect, useState } from "react";
import {
  Card,
  List,
  Input,
  Button,
  message as antdMessage,
  Menu,
  Layout,
  Upload,
  Empty,
  Image,
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
      // res.data could be empty array
      if (res.data.length === 0) {
        setFeedbackUserList([]);
        setSelectedUser("");
        return;
      }
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
                        {item.message && (
                          <div className="dark:text-gray-400">
                            {item.message}
                          </div>
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
          </div>
        </Content>
      </>
    </div>
  );
}
