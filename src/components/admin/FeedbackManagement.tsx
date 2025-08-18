import { useEffect, useState } from "react";
import {
  Card,
  List,
  Input,
  Button,
  message as antdMessage,
  Menu,
  Upload,
  Empty,
  Image,
} from "antd";
import { api } from "@/api/api";
import { useTranslation } from "react-i18next";
import { FeedbackMessage, FeedbackUserList } from "@/utils/type";
import type { UploadFile, RcFile } from "antd/es/upload/interface";
import { formatTimestamp } from "@/utils/util";
import {
  UploadOutlined,
  SendOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;

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
      <div className="h-full flex flex-col p-2 sm:p-4 md:p-6">
        <Card className="flex-grow flex items-center justify-center shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <Empty
            description={
              <span className="text-gray-500 dark:text-gray-400">
                No feedback data available
              </span>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row p-2 sm:p-4 md:p-6">
      {/* Mobile User Selection */}
      <div className="lg:hidden mb-4">
        <Card className="shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium dark:text-gray-300">Select User:</span>
            <Menu
              mode="horizontal"
              selectedKeys={[selectedUser || ""]}
              onSelect={({ key }) => setSelectedUser(key)}
              className="bg-transparent dark:bg-gray-800 dark:text-white border-none overflow-x-auto"
              style={{ borderBottom: "none" }}
            >
              {feedbackUserList.map((user: FeedbackUserList) => (
                <Menu.Item key={user.email} className="dark:text-white text-xs">
                  {user.email.length > 20 ? `${user.email.substring(0, 20)}...` : user.email}
                </Menu.Item>
              ))}
            </Menu>
          </div>
        </Card>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:w-64 lg:mr-4">
        <Card className="h-full shadow-sm dark:bg-gray-800 dark:border-gray-700" bodyStyle={{ padding: 0 }}>
          <Menu
            mode="inline"
            selectedKeys={[selectedUser || ""]}
            style={{ height: "100%", borderRight: 0 }}
            onSelect={({ key }) => setSelectedUser(key)}
            className="bg-white dark:bg-gray-800 dark:text-white"
          >
            {feedbackUserList.map((user: FeedbackUserList) => (
              <Menu.Item key={user.email} className="dark:text-white">
                <div className="truncate" title={user.email}>
                  {user.email}
                </div>
              </Menu.Item>
            ))}
          </Menu>
        </Card>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {/* Feedback message list */}
        <Card
          className="flex-grow overflow-hidden shadow-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 mb-4"
          title={
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span className="text-sm sm:text-base truncate" title={selectedUser}>
                {selectedUser ? 
                  (selectedUser.length > 30 ? `${selectedUser.substring(0, 30)}...` : selectedUser) 
                  : t("feedbackHistory")
                }
              </span>
              <Button
                type="primary"
                onClick={fetchFeedbacks}
                icon={<ReloadOutlined />}
                size="small"
                className="w-full sm:w-auto"
              >
                {t("refresh")}
              </Button>
            </div>
          }
          bodyStyle={{ height: "calc(100% - 65px)", padding: 0 }}
        >
          <div className="h-full overflow-auto p-2 sm:p-4">
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
                    className={`max-w-[85%] sm:max-w-[70%] p-2 sm:p-3 rounded-lg ${
                      item.senderType === "admin" 
                        ? "bg-blue-50 dark:bg-blue-900/30" 
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}
                    style={{
                      alignSelf:
                        item.senderType === "admin"
                          ? "flex-end"
                          : "flex-start",
                    }}
                  >
                    <div className="text-xs opacity-70 mb-1 dark:text-gray-400">
                      {formatTimestamp(item.timestamp, "locale")}
                      {item.senderType === "admin" ? " · Admin" : ""}
                    </div>
                    {item.message && (
                      <div className="dark:text-gray-400 text-sm">
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
                          className="mb-2 rounded max-w-full"
                          style={{ maxHeight: window.innerWidth < 640 ? 150 : 200 }}
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
              rows={window.innerWidth < 640 ? 3 : 4}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={t("enterFeedback")}
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            />
            {/* Button row: upload left, send right */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 mt-2">
              <Upload
                beforeUpload={handleAdminUpload}
                fileList={adminFileList}
                onRemove={() => setAdminFileList([])}
                maxCount={1}
                accept="image/*"
                showUploadList={{ showPreviewIcon: false }}
              >
                <Button icon={<UploadOutlined />} size="small" className="w-full sm:w-auto">
                  {t("uploadImage")}
                </Button>
              </Upload>
              <Button
                type="primary"
                onClick={() => handleReply(selectedUser)}
                loading={replyLoading}
                icon={<SendOutlined />}
                size="small"
                className="w-full sm:w-auto"
              >
                {t("send")}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
