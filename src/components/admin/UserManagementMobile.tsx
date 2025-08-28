import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Input,
  Select,
  Button,
  Card,
  Avatar,
  Tag,
  Spin,
  Empty,
  Modal,
  Form,
  message,
  Progress,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  EditOutlined,
  FilterOutlined,
  PlusOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  FileTextOutlined,
  KeyOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { UserInfo, ProgressData } from "@/utils/type";
import { USER_ROLE } from "@/utils/const";
import { formatTimestamp } from "../../utils/util";
import { api } from "@/api/api";
import MobileBackButton from "./MobileBackButton";

const { Option } = Select;
const { Search } = Input;

interface UserManagementMobileProps {
  users: UserInfo[];
  isLoading: boolean;
  onRefresh: () => void;
  onEditUser: (
    user: UserInfo,
    changes: { role?: string; membership?: string }
  ) => void;
  onGenerateCode: () => void;
  onViewCodes: () => void;
  onViewStats: () => void;
}

const UserManagementMobile: React.FC<UserManagementMobileProps> = ({
  users,
  isLoading,
  onRefresh,
  onEditUser,
  onGenerateCode,
  onViewCodes,
  onViewStats,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedMembership, setSelectedMembership] = useState("All");
  const [filteredUsers, setFilteredUsers] = useState<UserInfo[]>([]);
  const [sortBy, setSortBy] = useState("lastActive");
  const [showFilters, setShowFilters] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<UserInfo | null>(null);
  const [form] = Form.useForm();

  // User progress modal states
  const [isProgressModalVisible, setIsProgressModalVisible] = useState(false);
  const [selectedUserProgress, setSelectedUserProgress] = useState<
    ProgressData[]
  >([]);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string>("");
  const [isLoadingUserProgress, setIsLoadingUserProgress] = useState(false);

  // Filter and sort users
  useEffect(() => {
    let filtered = users.filter((user) => {
      const username = user.username || "";
      const email = user.email || "";
      const matchesSearch =
        (typeof username === "string" ? username.toLowerCase() : "").includes(
          searchQuery.toLowerCase()
        ) ||
        (typeof email === "string" ? email.toLowerCase() : "").includes(
          searchQuery.toLowerCase()
        );

      const matchesRole = selectedRole === "All" || user.role === selectedRole;

      const matchesMembership =
        selectedMembership === "All" ||
        (selectedMembership === "Premium" && user.plan?.name !== "FREE") ||
        (selectedMembership === "Free" && user.plan?.name === "FREE");

      return matchesSearch && matchesRole && matchesMembership;
    });

    // Sort users
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "username":
          return String(a.username || "").localeCompare(
            String(b.username || "")
          );
        case "email":
          return String(a.email || "").localeCompare(String(b.email || ""));
        case "createdAt":
          return (b.created_at || 0) - (a.created_at || 0);
        case "lastActive":
        default:
          return (b.updated_at || 0) - (a.updated_at || 0);
      }
    });

    setFilteredUsers(filtered);
  }, [users, searchQuery, selectedRole, selectedMembership, sortBy]);

  const getRoleColor = (role?: string) => {
    switch (role) {
      case USER_ROLE.ADMIN:
        return "red";
      default:
        return "default";
    }
  };

  const getPlanColor = (planName?: string) => {
    return planName === "FREE" ? "default" : "blue";
  };

  const handleEditUser = (user: UserInfo) => {
    setEditingUser(user);
    form.setFieldsValue({
      role: user.role,
      membership: user.plan?.name === "FREE" ? "Free" : "Premium",
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await onEditUser(editingUser, values);
        message.success(t("userUpdatedSuccessfully"));
        setEditModalVisible(false);
        setEditingUser(null);
      }
    } catch (error) {
      message.error(t("updateUserFailed"));
    }
  };

  // Show user progress modal and fetch data
  const showUserProgressModal = (userEmail: string) => {
    // Immediately show modal with loading state
    setSelectedUserEmail(userEmail);
    setSelectedUserProgress([]);
    setIsProgressModalVisible(true);
    setIsLoadingUserProgress(true);

    // Then fetch the data
    fetchUserProgressData(userEmail);
  };

  // Fetch user progress data
  const fetchUserProgressData = async (userEmail: string) => {
    try {
      const response = await api.getUserProgressByEmail(userEmail);
      const progressData = response.data.progress || [];
      setSelectedUserProgress(progressData);
    } catch (error) {
      console.error("Error fetching user progress:", error);
      message.error("Failed to fetch user progress");
      // If error occurs, close the modal
      setIsProgressModalVisible(false);
    } finally {
      setIsLoadingUserProgress(false);
    }
  };

  const renderUserCard = (user: UserInfo) => (
    <Card
      key={user.email}
      className="mb-3 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
      bodyStyle={{ padding: "16px" }}
    >
      <div className="flex items-start space-x-3">
        <Avatar
          size={48}
          src={user.avatar}
          icon={<UserOutlined />}
          className="flex-shrink-0"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user.username}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-1">
                {user.email}
              </p>
            </div>

            <div className="flex space-x-1">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => showUserProgressModal(user.email)}
                className="flex-shrink-0 text-green-600 dark:text-green-400"
                title={t("viewProgress")}
              />
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEditUser(user)}
                className="flex-shrink-0 text-blue-600 dark:text-blue-400"
                title={t("editUser")}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <Tag color={getRoleColor(user.role)}>{user.role || "User"}</Tag>
            <Tag color={getPlanColor(user.plan?.name)}>
              {user.plan?.name || "FREE"}
            </Tag>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <CalendarOutlined className="mr-1" />
              <span>
                {t("joined")}: {formatTimestamp(user.created_at || 0, "date")}
              </span>
            </div>
            <div className="flex items-center">
              <ClockCircleOutlined className="mr-1" />
              <span>
                {t("active")}: {formatTimestamp(user.updated_at || 0, "date")}
              </span>
            </div>
          </div>

          {user.plan?.expireTime && (
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              {t("expires")}: {formatTimestamp(user.plan.expireTime, "date")}
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <MobileBackButton title={t("userManagement")} />

      {/* Content Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Search and Filter Section */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <Search
            placeholder={t("searchUsers")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            prefix={<SearchOutlined />}
            allowClear
          />

          <div className="flex items-center justify-between">
            <Button
              type="text"
              icon={<FilterOutlined />}
              onClick={() => setShowFilters(!showFilters)}
              className="text-blue-600 dark:text-blue-400"
            >
              {t("filters")}
            </Button>

            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {filteredUsers.length} {t("users")}
              </div>

              <div className="flex space-x-1">
                <Button
                  type="text"
                  size="small"
                  icon={<KeyOutlined />}
                  onClick={onGenerateCode}
                  className="text-purple-600 dark:text-purple-400 p-1"
                  title={t("generateCode")}
                />
                <Button
                  type="text"
                  size="small"
                  icon={<FileTextOutlined />}
                  onClick={onViewCodes}
                  className="text-cyan-600 dark:text-cyan-400 p-1"
                  title={t("viewActiveCodes")}
                />
                <Button
                  type="text"
                  size="small"
                  icon={<BarChartOutlined />}
                  onClick={onViewStats}
                  className="text-emerald-600 dark:text-emerald-400 p-1"
                  title={t("usageStatistics")}
                />
                <Button
                  type="text"
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={onRefresh}
                  className="text-blue-600 dark:text-blue-400 p-1"
                  title={t("refreshUsers")}
                />
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("role")}
                </label>
                <Select
                  value={selectedRole}
                  onChange={setSelectedRole}
                  className="w-full"
                  size="small"
                >
                  <Option value="All">{t("allRoles")}</Option>
                  <Option value={USER_ROLE.ADMIN}>{t("admin")}</Option>
                  <Option value={USER_ROLE.USER}>{t("user")}</Option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("membership")}
                </label>
                <Select
                  value={selectedMembership}
                  onChange={setSelectedMembership}
                  className="w-full"
                  size="small"
                >
                  <Option value="All">{t("allMemberships")}</Option>
                  <Option value="Premium">{t("premium")}</Option>
                  <Option value="Free">{t("free")}</Option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("sortBy")}
                </label>
                <Select
                  value={sortBy}
                  onChange={setSortBy}
                  className="w-full"
                  size="small"
                >
                  <Option value="lastActive">{t("lastActive")}</Option>
                  <Option value="username">{t("username")}</Option>
                  <Option value="email">{t("email")}</Option>
                  <Option value="createdAt">{t("joinDate")}</Option>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-20">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Spin size="large" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <Empty
              description={t("noUsersFound")}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <div>{filteredUsers.map(renderUserCard)}</div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="absolute bottom-6 right-6">
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<PlusOutlined />}
          className="shadow-lg"
          onClick={() => {
            // Handle add user action
            // message.info(t("addUserFeatureComingSoon"));
            console.log("Add user feature coming soon");
          }}
        />
      </div>

      {/* Edit User Modal */}
      <Modal
        title={t("editUser")}
        open={editModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingUser(null);
        }}
        okText={t("save")}
        cancelText={t("cancel")}
        className="dark:bg-gray-800"
      >
        <Form form={form} layout="vertical" className="space-y-4">
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Avatar
                size={40}
                src={editingUser?.avatar}
                icon={<UserOutlined />}
              />
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {editingUser?.username}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {editingUser?.email}
                </div>
              </div>
            </div>
          </div>

          <Form.Item
            name="role"
            label={t("role")}
            rules={[{ required: true, message: t("pleaseSelectRole") }]}
          >
            <Select placeholder={t("selectRole")}>
              <Option value={USER_ROLE.USER}>{t("user")}</Option>
              <Option value={USER_ROLE.ADMIN}>{t("admin")}</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="membership"
            label={t("membership")}
            rules={[{ required: true, message: t("pleaseSelectMembership") }]}
          >
            <Select placeholder={t("selectMembership")}>
              <Option value="Free">{t("free")}</Option>
              <Option value="Premium">{t("premium")}</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* User Progress Modal */}
      <Modal
        title={`${t("userProgress")} - ${selectedUserEmail}`}
        open={isProgressModalVisible}
        maskClosable={false}
        onCancel={() => {
          setIsProgressModalVisible(false);
          setSelectedUserProgress([]);
          setSelectedUserEmail("");
        }}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => {
              setIsProgressModalVisible(false);
              setSelectedUserProgress([]);
              setSelectedUserEmail("");
            }}
            className="bg-blue-500 hover:bg-blue-600 border-blue-500"
          >
            {t("close")}
          </Button>,
        ]}
        width="90%"
        className="max-w-2xl [&_.ant-modal-content]:bg-white [&_.ant-modal-content]:dark:bg-gray-800 [&_.ant-modal-header]:bg-white [&_.ant-modal-header]:dark:bg-gray-800 [&_.ant-modal-title]:dark:text-white [&_.ant-modal-body]:bg-white [&_.ant-modal-body]:dark:bg-gray-800 [&_.ant-modal-footer]:bg-white [&_.ant-modal-footer]:dark:bg-gray-800 [&_.ant-modal-footer]:border-t [&_.ant-modal-footer]:border-gray-200 [&_.ant-modal-footer]:dark:border-gray-600"
      >
        {isLoadingUserProgress ? (
          <div className="flex justify-center items-center h-32">
            <Spin size="large" className="dark:text-white" />
          </div>
        ) : selectedUserProgress.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <Empty
              description={
                <span className="text-gray-500 dark:text-gray-400">
                  {t("noProgressData")}
                </span>
              }
            />
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {/* Group videos by channel */}
            {Array.from(
              new Set(selectedUserProgress.map((item) => item.channelId))
            ).map((channelId) => {
              const channelVideos = selectedUserProgress.filter(
                (video) => video.channelId === channelId
              );
              const channelName = channelVideos[0]?.channelName || channelId;

              return (
                <div key={channelId} className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">
                    📺 {channelName}
                  </h3>
                  <div className="space-y-3">
                    {channelVideos.map((video) => (
                      <div
                        key={video.videoId}
                        className="flex flex-col p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex-1 min-w-0 mb-2">
                          <div className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-2">
                            {video.videoTitle}
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1">
                              <Progress
                                percent={video.overallCompletion}
                                size="small"
                                status="active"
                                strokeColor="#1890ff"
                                className="[&_.ant-progress-text]:text-xs [&_.ant-progress-text]:dark:text-white"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManagementMobile;
