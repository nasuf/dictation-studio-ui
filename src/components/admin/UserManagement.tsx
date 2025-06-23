import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Card,
  message,
  Modal,
  Select,
  Form,
  InputNumber,
  Button,
  Typography,
  List,
  Tag,
  Tooltip,
  Input,
  Space,
  Spin,
  Segmented,
  Empty,
  Progress,
} from "antd";
import { Line } from "@ant-design/charts";
import { api } from "@/api/api";
import { UserInfo, ProgressData } from "@/utils/type";
import { USER_ROLE } from "@/utils/const";
import {
  CopyOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  UserAddOutlined,
  SearchOutlined,
  BarChartOutlined,
  DownloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { formatTimestamp } from "../../utils/util";
import html2canvas from "html2canvas";
import { useTranslation } from "react-i18next";
import i18n from "../../utils/i18n";

const { Option } = Select;
const { Text, Paragraph } = Typography;

// 添加校验码类型定义
interface VerificationCode {
  code_part: string;
  full_code: string;
  duration: string;
  days: number;
  created_at: string;
  expires_at: string;
  remaining_seconds: number;
}

const UserManagement: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCodeModalVisible, setIsCodeModalVisible] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<UserInfo[]>([]);
  const [form] = Form.useForm();
  const [codeForm] = Form.useForm();
  const [isUpdating, setIsUpdating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [isCodesModalVisible, setIsCodesModalVisible] = useState(false);
  const [verificationCodes, setVerificationCodes] = useState<
    VerificationCode[]
  >([]);
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [selectedCode, setSelectedCode] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignForm] = Form.useForm();
  const [userOptions, setUserOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [showCustomDaysInput, setShowCustomDaysInput] = useState(false);
  const [customDaysValue, setCustomDaysValue] = useState<number | null>(null);
  const [showEditCustomDaysInput, setShowEditCustomDaysInput] = useState(false);
  const [editCustomDaysValue, setEditCustomDaysValue] = useState<number | null>(
    null
  );
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
  const [roleForm] = Form.useForm();
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isStatsModalVisible, setIsStatsModalVisible] = useState(false);
  const [statsData, setStatsData] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [selectedStatsPeriod, setSelectedStatsPeriod] = useState<
    1 | 3 | 7 | 30 | 60
  >(1);
  const [isExportingReport, setIsExportingReport] = useState(false);
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [selectedExportPeriods, setSelectedExportPeriods] = useState<
    (1 | 3 | 7 | 30 | 60)[]
  >([3]);
  const [selectedExportLanguages, setSelectedExportLanguages] = useState<
    string[]
  >(["en"]);
  const reportRef = useRef<HTMLDivElement>(null);
  const [isCoverModalVisible, setIsCoverModalVisible] = useState(false);
  const [selectedCoverPeriods, setSelectedCoverPeriods] = useState<
    (1 | 3 | 7 | 30 | 60)[]
  >([7]);
  const [selectedCoverLanguages, setSelectedCoverLanguages] = useState<
    string[]
  >(["zh"]);
  const [selectedColorScheme, setSelectedColorScheme] =
    useState<string>("pink");

  // User progress modal states
  const [isProgressModalVisible, setIsProgressModalVisible] = useState(false);
  const [selectedUserProgress, setSelectedUserProgress] = useState<
    ProgressData[]
  >([]);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string>("");
  const [isLoadingUserProgress, setIsLoadingUserProgress] = useState(false);

  // Format duration: if >= 60 minutes, show hours and minutes; otherwise just minutes
  const formatDuration = (durationInSeconds: number): string => {
    const minutes = Math.round(durationInSeconds / 60);
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours}h`;
      }
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.getAllUsers();
      setUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  const showMembershipModal = () => {
    if (selectedUsers.length === 0) {
      message.warning("Please select users to edit");
      return;
    }
    setIsEditModalVisible(true);

    // Set default values for the form
    form.setFieldsValue({
      durationOption: "30days", // Set default duration
    });
  };

  const showRoleModal = () => {
    if (selectedUsers.length === 0) {
      message.warning("Please select users to edit");
      return;
    }
    setIsRoleModalVisible(true);
    roleForm.resetFields();
  };

  const showCodeGeneratorModal = () => {
    setIsCodeModalVisible(true);
    setGeneratedCode("");
    setShowCustomDaysInput(false);
    setCustomDaysValue(null);
    codeForm.resetFields();
  };

  const handleGenerateCode = async () => {
    try {
      setIsGeneratingCode(true);
      const values = await codeForm.validateFields();

      let response;
      if (values.duration === "custom") {
        if (!customDaysValue || customDaysValue <= 0) {
          message.error("Please enter a valid number of days");
          setIsGeneratingCode(false);
          return;
        }
        response = await api.generateCustomVerificationCode(customDaysValue);
      } else {
        response = await api.generateVerificationCode(values.duration);
      }

      setGeneratedCode(response.data.code);
      message.success("Verification code generated successfully");
    } catch (error) {
      console.error("Error generating verification code:", error);
      message.error("Failed to generate verification code");
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        message.success("Code copied to clipboard");
      },
      (err) => {
        console.error("Could not copy text: ", err);
        message.error("Failed to copy code");
      }
    );
  };

  const handleDurationChange = (value: string) => {
    if (value === "custom") {
      setShowEditCustomDaysInput(true);
      form.setFieldValue("durationOption", "custom");
      setEditCustomDaysValue(null);
    } else {
      setShowEditCustomDaysInput(false);

      if (value === "30days") {
        form.setFieldValue("durationOption", "30days");
      } else if (value === "60days") {
        form.setFieldValue("durationOption", "60days");
      } else if (value === "90days") {
        form.setFieldValue("durationOption", "90days");
      } else if (value === "permanent") {
        form.setFieldValue("durationOption", "permanent");
      }
    }
  };

  const handleEditSubmit = async () => {
    setIsUpdating(true);
    try {
      const values = await form.validateFields();
      const emails = selectedUsers.map((user) => user.email);

      // 确定天数
      let duration;
      if (values.durationOption === "custom" && editCustomDaysValue) {
        duration = editCustomDaysValue;
      } else if (values.durationOption === "30days") {
        duration = 30;
      } else if (values.durationOption === "60days") {
        duration = 60;
      } else if (values.durationOption === "90days") {
        duration = 90;
      } else if (values.durationOption === "permanent") {
        duration = 365 * 100; // 永久
      }

      // 更新用户计划 - 只传递天数，让后端决定计划名称
      if (duration !== undefined) {
        try {
          const response = await api.updateUserDuration(emails, duration);

          if (
            response.data.results &&
            response.data.results.every((r: any) => r.success)
          ) {
            message.success("User memberships updated successfully");
            setIsEditModalVisible(false);
            setSelectedUsers([]);
            form.resetFields();
            fetchUsers();
          } else {
            // 显示具体的错误信息
            const failedUpdates = response.data.results.filter(
              (r: any) => !r.success
            );
            if (failedUpdates.length > 0) {
              message.error(
                `Failed updates: ${failedUpdates
                  .map((r: any) => `${r.email}: ${r.error}`)
                  .join(", ")}`
              );
            } else {
              message.error("Some membership updates failed");
            }
          }
        } catch (error: any) {
          console.error("API error:", error);
          if (error.response) {
            // 显示服务器返回的错误信息
            message.error(
              `Update failed: ${error.response.data.error || "Server error"}`
            );
          } else {
            message.error("Failed to connect to server");
          }
        }
      } else {
        message.warning("Please select a membership duration");
      }
    } catch (error) {
      console.error("Error updating user memberships:", error);
      message.error("Failed to update user memberships");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRoleSubmit = async () => {
    setIsUpdatingRole(true);
    try {
      const values = await roleForm.validateFields();
      const emails = selectedUsers.map((user) => user.email);

      if (values.role) {
        const response = await api.updateUserRole(emails, values.role);

        if (
          response.data.results &&
          response.data.results.every((r: any) => r.success)
        ) {
          message.success("User roles updated successfully");
          setIsRoleModalVisible(false);
          setSelectedUsers([]);
          roleForm.resetFields();
          fetchUsers();
        } else {
          message.error("Some role updates failed");
        }
      } else {
        message.warning("Please select a role");
      }
    } catch (error) {
      console.error("Error updating user roles:", error);
      message.error("Failed to update user roles");
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const rowSelection = {
    onChange: (_: React.Key[], selectedRows: UserInfo[]) => {
      setSelectedUsers(selectedRows);
    },
    selectedRowKeys: selectedUsers.map((user) => user.email),
  };

  const columns = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: any) => (
        <div
          className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600"
          onKeyDown={(e) => e.stopPropagation()}
        >
          <Input
            placeholder="Search username"
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => confirm()}
            className="mb-3 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-gray-100"
          />
          <Space className="flex justify-between w-full">
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              className="w-20 bg-blue-500 hover:bg-blue-600 border-blue-500"
            >
              Search
            </Button>
            <Button
              onClick={() => clearFilters()}
              size="small"
              className="w-20 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-500"
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered: boolean) => (
        <SearchOutlined
          className={`transition-colors duration-200 ${
            filtered
              ? "text-blue-500 dark:text-blue-400"
              : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          }`}
        />
      ),
      onFilter: (value: any, record: UserInfo) =>
        record.username
          ?.toString()
          .toLowerCase()
          .includes(value.toLowerCase()) || false,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: any) => (
        <div
          className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600"
          onKeyDown={(e) => e.stopPropagation()}
        >
          <Input
            placeholder="Search email"
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => confirm()}
            className="mb-3 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-gray-100"
          />
          <Space className="flex justify-between w-full">
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              className="w-20 bg-blue-500 hover:bg-blue-600 border-blue-500"
            >
              Search
            </Button>
            <Button
              onClick={() => clearFilters()}
              size="small"
              className="w-20 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-500"
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered: boolean) => (
        <SearchOutlined
          className={`transition-colors duration-200 ${
            filtered
              ? "text-blue-500 dark:text-blue-400"
              : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          }`}
        />
      ),
      onFilter: (value: any, record: UserInfo) =>
        record.email?.toString().toLowerCase().includes(value.toLowerCase()) ||
        false,
    },
    {
      title: "Plan Name",
      dataIndex: ["plan", "name"],
      key: "planName",
      filters: [
        { text: "Free", value: "Free" },
        { text: "Basic", value: "Basic" },
        { text: "Pro", value: "Pro" },
        { text: "Premium", value: "Premium" },
      ],
      onFilter: (value: any, record: UserInfo) => record.plan?.name === value,
      render: (name: string) => name || "",
    },
    {
      title: "Expire Time",
      dataIndex: ["plan", "expireTime"],
      key: "expireTime",
      render: (expireTime: number) => {
        return expireTime ? formatTimestamp(expireTime) : "";
      },
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      filters: [
        { text: "Admin", value: "admin" },
        { text: "User", value: "user" },
      ],
      onFilter: (value: any, record: UserInfo) =>
        record.role?.toLowerCase() === value,
    },
    {
      title: "Active",
      key: "hasDictationInput",
      width: 120,
      filters: [
        { text: "Active", value: "yes" },
        { text: "Inactive", value: "no" },
      ],
      onFilter: (value: any, record: UserInfo) => {
        const hasInput = checkUserHasDictationInput(record);
        return value === "yes" ? hasInput : !hasInput;
      },
      render: (_: any, record: UserInfo) => {
        const hasInput = checkUserHasDictationInput(record);
        const tooltipText = hasInput
          ? "User has completed dictation exercises with meaningful input"
          : "User has not completed any dictation exercises yet";

        return (
          <Tooltip title={tooltipText}>
            <Tag
              color={hasInput ? "green" : "volcano"}
              className="font-medium cursor-help"
            >
              {hasInput ? "Active" : "Inactive"}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: "Last Active Date",
      key: "lastActiveDate",
      render: (_: any, record: UserInfo) => {
        return getLastMeaningfulDictationInputDate(record);
      },
      sorter: (a: UserInfo, b: UserInfo) => {
        const aTimestamp = getLastMeaningfulDictationInputTimestamp(a);
        const bTimestamp = getLastMeaningfulDictationInputTimestamp(b);
        return aTimestamp - bTimestamp;
      },
      defaultSortOrder: "descend" as const,
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (created_at: number) => {
        if (created_at) {
          return formatTimestamp(created_at, "locale");
        }
        return "";
      },
      sorter: (a: UserInfo, b: UserInfo) =>
        (a.created_at || 0) - (b.created_at || 0),
    },
    {
      title: "Updated At",
      dataIndex: "updated_at",
      key: "updated_at",
      render: (updated_at: number) => {
        if (updated_at) {
          return formatTimestamp(updated_at, "locale");
        }
        return "";
      },
      sorter: (a: UserInfo, b: UserInfo) =>
        (a.updated_at || 0) - (b.updated_at || 0),
    },
    {
      title: "Progress",
      key: "progress",
      width: 120,
      render: (_: any, record: UserInfo) => {
        const hasProgress = checkUserHasDictationInput(record);
        return (
          <Tooltip
            title={
              hasProgress
                ? "View user's dictation progress"
                : "User has no progress data"
            }
          >
            <Button
              type="primary"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => showUserProgressModal(record.email)}
              disabled={!hasProgress || isLoadingUserProgress}
              loading={
                isLoadingUserProgress && selectedUserEmail === record.email
              }
              className="bg-blue-500 hover:bg-blue-600 border-blue-500 disabled:bg-gray-400"
            >
              View
            </Button>
          </Tooltip>
        );
      },
    },
  ];

  // 获取所有校验码
  const fetchVerificationCodes = async () => {
    setIsLoadingCodes(true);
    try {
      const response = await api.getAllVerificationCodes();
      setVerificationCodes(response.data.codes);
    } catch (error) {
      console.error("Error fetching verification codes:", error);
      message.error("Failed to fetch verification codes");
    } finally {
      setIsLoadingCodes(false);
    }
  };

  // 显示校验码列表弹窗
  const showCodesModal = () => {
    setIsCodesModalVisible(true);
    fetchVerificationCodes();
  };

  const formatRemainingTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const copyCodeToClipboard = (fullCode: string) => {
    navigator.clipboard.writeText(fullCode).then(
      () => {
        message.success("Code copied to clipboard");
      },
      (err) => {
        console.error("Could not copy text: ", err);
        message.error("Failed to copy code");
      }
    );
  };

  // 显示分发校验码的模态框
  const showAssignCodeModal = (code: string) => {
    setSelectedCode(code);
    setIsAssignModalVisible(true);
    assignForm.resetFields();
    fetchUserOptions();
  };

  // 获取用户列表用于下拉选择
  const fetchUserOptions = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await api.getAllUsers();
      const options = response.data.users.map((user: UserInfo) => ({
        label: `${user.username} (${user.email})`,
        value: user.email,
      }));
      setUserOptions(options);
    } catch (error) {
      console.error("Error fetching users for dropdown:", error);
      message.error("Failed to load users");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // 处理分发校验码
  const handleAssignCode = async () => {
    try {
      setIsAssigning(true);
      const values = await assignForm.validateFields();

      await api.assignVerificationCode(selectedCode, values.userEmail);
      message.success(
        `Verification code successfully assigned to ${values.userEmail}`
      );

      // 关闭模态框并刷新校验码列表
      setIsAssignModalVisible(false);
      fetchVerificationCodes();
    } catch (error) {
      console.error("Error assigning verification code:", error);
      message.error("Failed to assign verification code");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchUsers();
      message.success("User list refreshed");
    } catch (error) {
      // Error handling is already in fetchUsers
    } finally {
      setIsRefreshing(false);
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

  // 显示统计数据模态框
  const showStatsModal = () => {
    setIsStatsModalVisible(true);
    fetchUsageStats(selectedStatsPeriod);
  };

  // 获取使用统计数据
  const fetchUsageStats = async (days: 1 | 3 | 7 | 30 | 60) => {
    setIsLoadingStats(true);
    try {
      const response = await api.getUserUsageStats(days);
      setStatsData(response.data);
    } catch (error) {
      console.error("Error fetching usage statistics:", error);
      message.error("Failed to fetch usage statistics");
    } finally {
      setIsLoadingStats(false);
    }
  };

  // 处理统计周期变化
  const handleStatsPeriodChange = (period: 1 | 3 | 7 | 30 | 60) => {
    setSelectedStatsPeriod(period);
    fetchUsageStats(period);
  };

  // 显示导出选择模态框
  const showExportModal = () => {
    setIsExportModalVisible(true);
  };

  // 显示封面选择模态框
  const showCoverModal = () => {
    setIsCoverModalVisible(true);
  };

  // 获取色系配置
  const getColorScheme = (scheme: string) => {
    const schemes: { [key: string]: any } = {
      pink: {
        background:
          "linear-gradient(135deg, #ec4899 0%, #be185d 50%, #9f1239 100%)",
        backgroundColor: "#ec4899",
      },
      blue: {
        background:
          "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e3a8a 100%)",
        backgroundColor: "#3b82f6",
      },
      purple: {
        background:
          "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)",
        backgroundColor: "#8b5cf6",
      },
      green: {
        background:
          "linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)",
        backgroundColor: "#10b981",
      },
      orange: {
        background:
          "linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)",
        backgroundColor: "#f97316",
      },
    };
    return schemes[scheme] || schemes.pink;
  };

  // 获取封面文本内容
  const getCoverTexts = (language: string, period: 1 | 3 | 7 | 30 | 60) => {
    const now = new Date();

    const texts: { [key: string]: any } = {
      zh: {
        title: "📊 听写报告",
        subtitle: `${
          period === 1
            ? "昨日"
            : period === 3
            ? "近3日"
            : period === 7
            ? "本周"
            : period === 30
            ? "本月"
            : "近60日"
        }听写数据总览 · ${now.toLocaleDateString("zh-CN", {
          month: "long",
          day: "numeric",
        })}`,
        activeUsers: "活跃用户",
        newUsers: "新增用户",
        totalDuration: "总时长",
        brandTitle: "🎯 Dictation Studio",
        brandSlogan: "让外语听力学习更高效 · 数据驱动成长",
        periodText:
          period === 1
            ? "昨日"
            : period === 3
            ? "近3日"
            : period === 7
            ? "本周"
            : period === 30
            ? "本月"
            : "近60日",
        successMessage: "小红书封面已生成并下载！",
      },
      zhTraditional: {
        title: "📊 聽寫報告",
        subtitle: `${
          period === 1
            ? "昨日"
            : period === 3
            ? "近3日"
            : period === 7
            ? "本週"
            : period === 30
            ? "本月"
            : "近60日"
        }聽寫數據總覽 · ${now.toLocaleDateString("zh-TW", {
          month: "long",
          day: "numeric",
        })}`,
        activeUsers: "活躍用戶",
        newUsers: "新增用戶",
        totalDuration: "總時長",
        brandTitle: "🎯 Dictation Studio",
        brandSlogan: "讓外語聽力學習更高效 · 數據驅動成長",
        periodText:
          period === 1
            ? "昨日"
            : period === 3
            ? "近3日"
            : period === 7
            ? "本週"
            : period === 30
            ? "本月"
            : "近60日",
        successMessage: "小紅書封面已生成並下載！",
      },
      en: {
        title: "📊 Dictation Report",
        subtitle: `${
          period === 1
            ? "Yesterday"
            : period === 3
            ? "Last 3 Days"
            : period === 7
            ? "This Week"
            : period === 30
            ? "This Month"
            : "Last 60 Days"
        } Dictation Overview · ${now.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
        })}`,
        activeUsers: "Active Users",
        newUsers: "New Users",
        totalDuration: "Total Duration",
        brandTitle: "🎯 Dictation Studio",
        brandSlogan:
          "Learn Foreign Languages More Effectively · Data-Driven Growth",
        periodText:
          period === 1
            ? "yesterday"
            : period === 3
            ? "3days"
            : period === 7
            ? "week"
            : period === 30
            ? "month"
            : "60days",
        successMessage: "Xiaohongshu cover generated and downloaded!",
      },
      ja: {
        title: "📊 ディクテーションレポート",
        subtitle: `${
          period === 1
            ? "昨日"
            : period === 3
            ? "過去3日"
            : period === 7
            ? "今週"
            : period === 30
            ? "今月"
            : "過去60日"
        }のディクテーション概要 · ${now.toLocaleDateString("ja-JP", {
          month: "long",
          day: "numeric",
        })}`,
        activeUsers: "アクティブユーザー",
        newUsers: "新規ユーザー",
        totalDuration: "総時間",
        brandTitle: "🎯 Dictation Studio",
        brandSlogan: "外国語リスニング学習をより効率的に · データ駆動の成長",
        periodText:
          period === 1
            ? "昨日"
            : period === 3
            ? "3日間"
            : period === 7
            ? "週間"
            : period === 30
            ? "月間"
            : "60日間",
        successMessage: "シャオホンシュカバーが生成・ダウンロードされました！",
      },
      ko: {
        title: "📊 받아쓰기 리포트",
        subtitle: `${
          period === 1
            ? "어제"
            : period === 3
            ? "최근 3일"
            : period === 7
            ? "이번 주"
            : period === 30
            ? "이번 달"
            : "최근 60일"
        } 받아쓰기 개요 · ${now.toLocaleDateString("ko-KR", {
          month: "long",
          day: "numeric",
        })}`,
        activeUsers: "활성 사용자",
        newUsers: "신규 사용자",
        totalDuration: "총 시간",
        brandTitle: "🎯 Dictation Studio",
        brandSlogan: "외국어 청취 학습을 더 효율적으로 · 데이터 기반 성장",
        periodText:
          period === 1
            ? "어제"
            : period === 3
            ? "3일"
            : period === 7
            ? "주간"
            : period === 30
            ? "월간"
            : "60일",
        successMessage: "샤오홍슈 커버가 생성되어 다운로드되었습니다!",
      },
    };

    return texts[language] || texts.zh;
  };

  // 获取多个时间段的数据
  const fetchMultiplePeriodsData = async (periods: (1 | 3 | 7 | 30 | 60)[]) => {
    const data: { [key: number]: any } = {};

    for (const period of periods) {
      try {
        const response = await api.getUserUsageStats(period);
        data[period] = response.data;
      } catch (error) {
        console.error(`Error fetching data for ${period} days:`, error);
        message.error(`Failed to fetch data for ${period} days`);
        return null;
      }
    }

    return data;
  };

  // 语言映射
  const getLanguageTexts = (language: string) => {
    const currentLang = i18n.language;
    i18n.changeLanguage(language);

    const texts = {
      title: i18n.t("reportTitle"),
      generatedOn: i18n.t("reportGeneratedOn"),
      periods: i18n.t("reportPeriods"),
      summaryTitle: i18n.t("reportSummaryTitle"),
      dailyBreakdownTitle: i18n.t("reportDailyBreakdownTitle"),
      detailedData: i18n.t("reportDetailedData"),
      newUsers: i18n.t("reportNewUsers"),
      activeUsers: i18n.t("reportActiveUsers"),
      totalDuration: i18n.t("reportTotalDuration"),
      avgDaily: i18n.t("reportAvgDaily"),
      newUserRegistrations: i18n.t("reportNewUserRegistrations"),
      date: i18n.t("reportDate"),
      duration: i18n.t("reportDuration"),
      dailyDuration: i18n.t("reportDailyDuration"),
      keyInsightsTitle: i18n.t("reportKeyInsightsTitle"),
      userGrowth: i18n.t("reportUserGrowth"),
      userActivity: i18n.t("reportUserActivity"),
      engagement: i18n.t("reportEngagement"),
      analysis: i18n.t("reportAnalysis"),
      newUsersRegistered: i18n.t("reportNewUsersRegistered"),
      average: i18n.t("reportAverage"),
      usersPerDay: i18n.t("reportUsersPerDay"),
      activeUsersTotal: i18n.t("reportActiveUsersTotal"),
      total: i18n.t("reportTotal"),
      userAverage: i18n.t("reportUserAverage"),
      activationRate: i18n.t("reportActivationRate"),
      footer: i18n.t("reportFooter"),
      footerDisclaimer: i18n.t("reportFooterDisclaimer"),
      last: i18n.t("reportLast"),
      day: i18n.t("reportDay"),
      days: i18n.t("reportDays"),
    };

    i18n.changeLanguage(currentLang);
    return texts;
  };

  // 为特定语言生成报告
  const generateReportForLanguage = async (
    multiPeriodData: any,
    language: string
  ) => {
    const texts = getLanguageTexts(language);

    // Create a temporary report container
    const reportContainer = document.createElement("div");
    reportContainer.style.position = "fixed";
    reportContainer.style.top = "-9999px";
    reportContainer.style.left = "-9999px";
    reportContainer.style.width = "1400px";
    reportContainer.style.backgroundColor = "white";
    reportContainer.style.padding = "40px";
    reportContainer.style.fontFamily = "Arial, sans-serif";

    // Generate current timestamp
    const now = new Date();
    const timestamp = now.toLocaleString();

    // Generate periods summary
    const periodsText = selectedExportPeriods
      .map(
        (p) =>
          `${p} ${p > 1 ? texts.days.toLowerCase() : texts.day.toLowerCase()}`
      )
      .join(", ");

    // Create report HTML content
    reportContainer.innerHTML = `
      <div style="max-width: 1320px; margin: 0 auto;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid #1890ff; padding-bottom: 20px;">
          <h1 style="color: #1890ff; margin: 0; font-size: 36px; font-weight: bold;">
            ${texts.title}
          </h1>
          <p style="color: #666; margin: 10px 0 0 0; font-size: 18px;">
            ${texts.generatedOn} ${timestamp} | ${texts.periods}: ${periodsText}
          </p>
        </div>

        <!-- Summary Cards by Period -->
        <div style="margin-bottom: 40px;">
          <h2 style="color: #333; margin-bottom: 20px; font-size: 28px;">${
            texts.summaryTitle
          }</h2>
          ${selectedExportPeriods
            .map((period) => {
              const data = multiPeriodData[period];
              return `
              <div style="margin-bottom: 30px;">
                <h3 style="color: #1890ff; margin-bottom: 15px; font-size: 22px;">📅 ${
                  texts.last
                } ${period} ${period > 1 ? texts.days : texts.day}</h3>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
                  <div style="background: linear-gradient(135deg, #F59E0B 0%, #F97316 100%); color: white; padding: 18px; border-radius: 12px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <div style="font-size: 28px; font-weight: bold; margin-bottom: 6px;">
                      ${data.summary?.totalNewUsers || 0}
                    </div>
                    <div style="font-size: 13px; opacity: 0.9;">${
                      texts.newUsers
                    }</div>
                  </div>
                  <div style="background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); color: white; padding: 18px; border-radius: 12px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <div style="font-size: 28px; font-weight: bold; margin-bottom: 6px;">
                      ${data.summary?.totalActiveUsers || 0}
                    </div>
                    <div style="font-size: 13px; opacity: 0.9;">${
                      texts.activeUsers
                    }</div>
                  </div>
                  <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 18px; border-radius: 12px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <div style="font-size: 28px; font-weight: bold; margin-bottom: 6px;">
                      ${formatDuration(data.summary?.totalDuration || 0)}
                    </div>
                    <div style="font-size: 13px; opacity: 0.9;">${
                      texts.totalDuration
                    }</div>
                  </div>
                  <div style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: white; padding: 18px; border-radius: 12px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <div style="font-size: 28px; font-weight: bold; margin-bottom: 6px;">
                      ${formatDuration(data.summary?.avgDailyDuration || 0)}
                    </div>
                    <div style="font-size: 13px; opacity: 0.9;">${
                      texts.avgDaily
                    }</div>
                  </div>
                </div>
              </div>
            `;
            })
            .join("")}
        </div>

        <!-- Data Tables by Period -->
        <div style="margin-bottom: 40px;">
          <h2 style="color: #333; margin-bottom: 20px; font-size: 28px;">${
            texts.dailyBreakdownTitle
          }</h2>
          ${selectedExportPeriods
            .map((period) => {
              const data = multiPeriodData[period];
              return `
              <div style="margin-bottom: 35px;">
                <h3 style="color: #1890ff; margin-bottom: 20px; font-size: 22px;">📅 ${
                  texts.last
                } ${period} ${period > 1 ? texts.days : texts.day} - ${
                texts.detailedData
              }</h3>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                  
                  <!-- New Users Table -->
                  <div style="background: #fff7ed; padding: 20px; border-radius: 12px; border: 2px solid #fed7aa;">
                    <h4 style="color: #F59E0B; margin: 0 0 15px 0; font-size: 16px; font-weight: bold;">${
                      texts.newUserRegistrations
                    }</h4>
                    <div style="max-height: 250px; overflow-y: auto;">
                      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                        <thead>
                          <tr style="background: #fed7aa;">
                            <th style="padding: 6px 8px; text-align: left; border-bottom: 1px solid #f97316; font-weight: bold;">${
                              texts.date
                            }</th>
                            <th style="padding: 6px 8px; text-align: right; border-bottom: 1px solid #f97316; font-weight: bold;">${
                              texts.newUsers
                            }</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${(data.dailyNewUsers || [])
                            .map(
                              (item: any) => `
                            <tr>
                              <td style="padding: 5px 8px; border-bottom: 1px solid #fed7aa;">${
                                item.date
                              }</td>
                              <td style="padding: 5px 8px; text-align: right; border-bottom: 1px solid #fed7aa; font-weight: ${
                                item.newUsers > 0 ? "bold" : "normal"
                              }; color: ${
                                item.newUsers > 0 ? "#F59E0B" : "#666"
                              };">${item.newUsers}</td>
                            </tr>
                          `
                            )
                            .join("")}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <!-- Active Users Table -->
                  <div style="background: #eff6ff; padding: 20px; border-radius: 12px; border: 2px solid #bfdbfe;">
                    <h4 style="color: #3B82F6; margin: 0 0 15px 0; font-size: 16px; font-weight: bold;">👥 ${
                      texts.activeUsers
                    }</h4>
                    <div style="max-height: 250px; overflow-y: auto;">
                      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                        <thead>
                          <tr style="background: #bfdbfe;">
                            <th style="padding: 6px 8px; text-align: left; border-bottom: 1px solid #3b82f6; font-weight: bold;">${
                              texts.date
                            }</th>
                            <th style="padding: 6px 8px; text-align: right; border-bottom: 1px solid #3b82f6; font-weight: bold;">${
                              texts.activeUsers
                            }</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${(data.dailyActiveUsers || [])
                            .map(
                              (item: any) => `
                            <tr>
                              <td style="padding: 5px 8px; border-bottom: 1px solid #bfdbfe;">${
                                item.date
                              }</td>
                              <td style="padding: 5px 8px; text-align: right; border-bottom: 1px solid #bfdbfe; font-weight: ${
                                item.activeUsers > 0 ? "bold" : "normal"
                              }; color: ${
                                item.activeUsers > 0 ? "#3B82F6" : "#666"
                              };">${item.activeUsers}</td>
                            </tr>
                          `
                            )
                            .join("")}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <!-- Duration Table -->
                  <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; border: 2px solid #bbf7d0;">
                    <h4 style="color: #10B981; margin: 0 0 15px 0; font-size: 16px; font-weight: bold;">${
                      texts.dailyDuration
                    }</h4>
                    <div style="max-height: 250px; overflow-y: auto;">
                      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                        <thead>
                          <tr style="background: #bbf7d0;">
                            <th style="padding: 6px 8px; text-align: left; border-bottom: 1px solid #10b981; font-weight: bold;">${
                              texts.date
                            }</th>
                            <th style="padding: 6px 8px; text-align: right; border-bottom: 1px solid #10b981; font-weight: bold;">${
                              texts.duration
                            }</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${(data.dailyDuration || [])
                            .map(
                              (item: any) => `
                            <tr>
                              <td style="padding: 5px 8px; border-bottom: 1px solid #bbf7d0;">${
                                item.date
                              }</td>
                              <td style="padding: 5px 8px; text-align: right; border-bottom: 1px solid #bbf7d0; font-weight: ${
                                item.duration > 0 ? "bold" : "normal"
                              }; color: ${
                                item.duration > 0 ? "#10B981" : "#666"
                              };">${formatDuration(item.duration)}</td>
                            </tr>
                          `
                            )
                            .join("")}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            `;
            })
            .join("")}
        </div>

        <!-- Key Insights by Period -->
        <div style="margin-bottom: 40px;">
          <h2 style="color: #333; margin-bottom: 20px; font-size: 28px;">${
            texts.keyInsightsTitle
          }</h2>
          ${selectedExportPeriods
            .map((period) => {
              const data = multiPeriodData[period];
              const totalNewUsers = data.summary?.totalNewUsers || 0;
              const totalActiveUsers = data.summary?.totalActiveUsers || 0;
              const avgNewUsersPerDay =
                Math.round((totalNewUsers / period) * 10) / 10;
              const activationRate =
                totalNewUsers > 0
                  ? Math.round((totalActiveUsers / totalNewUsers) * 100)
                  : 0;
              const avgDailyDuration = data.summary?.avgDailyDuration || 0;

              return `
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 15px; margin-bottom: 20px; box-shadow: 0 8px 25px rgba(0,0,0,0.15);">
                <h3 style="color: #fff; margin: 0 0 20px 0; font-size: 20px; text-align: center;">📊 ${
                  texts.last
                } ${period} ${period > 1 ? texts.days : texts.day} ${
                texts.analysis
              }</h3>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                  <div style="text-align: center;">
                    <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">${
                      texts.userGrowth
                    }</div>
                    <div style="font-size: 24px; font-weight: bold; color: #ffd700; margin-bottom: 5px;">${totalNewUsers}</div>
                    <div style="font-size: 12px; opacity: 0.9;">${
                      texts.newUsersRegistered
                    }</div>
                    <div style="font-size: 12px; opacity: 0.9;">${
                      texts.average
                    }: ${avgNewUsersPerDay} ${texts.usersPerDay}</div>
                  </div>
                  <div style="text-align: center;">
                    <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">${
                      texts.userActivity
                    }</div>
                    <div style="font-size: 24px; font-weight: bold; color: #87ceeb; margin-bottom: 5px;">${totalActiveUsers}</div>
                    <div style="font-size: 12px; opacity: 0.9;">${
                      texts.activeUsersTotal
                    }</div>
                    <div style="font-size: 12px; opacity: 0.9;">${formatDuration(
                      data.summary?.totalDuration || 0
                    )} ${texts.total}</div>
                  </div>
                  <div style="text-align: center;">
                    <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">${
                      texts.engagement
                    }</div>
                    <div style="font-size: 24px; font-weight: bold; color: #98fb98; margin-bottom: 5px;">${formatDuration(
                      avgDailyDuration
                    )}</div>
                    <div style="font-size: 12px; opacity: 0.9;">${
                      texts.userAverage
                    }</div>
                    <div style="font-size: 12px; opacity: 0.9;">${activationRate}% ${
                texts.activationRate
              }</div>
                  </div>
                </div>
              </div>
            `;
            })
            .join("")}
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #f0f0f0; color: #666;">
          <p style="margin: 0; font-size: 16px; font-weight: bold;">${
            texts.footer
          }</p>
          <p style="margin: 5px 0 0 0; font-size: 12px;">${
            texts.footerDisclaimer
          }</p>
        </div>
      </div>
    `;

    document.body.appendChild(reportContainer);

    try {
      const canvas = await html2canvas(reportContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `dictation-studio-report-${periodsText.replace(
        /\s/g,
        "-"
      )}-${language}-${now.toISOString().slice(0, 19).replace(/:/g, "-")}.png`;
      link.href = imgData;
      link.click();
    } finally {
      document.body.removeChild(reportContainer);
    }
  };

  // 导出小红书封面
  const exportXiaohongshuCover = async () => {
    if (
      selectedCoverPeriods.length === 0 ||
      selectedCoverLanguages.length === 0
    ) {
      message.warning(t("pleaseSelectTimePeriodAndLanguage"));
      return;
    }

    setIsExportingReport(true);
    try {
      // Generate covers for all combinations of periods and languages
      for (const period of selectedCoverPeriods) {
        for (const language of selectedCoverLanguages) {
          await generateSingleCover(period, language, selectedColorScheme);
        }
      }

      message.success(t("coverGeneratedSuccessfully"));
      setIsCoverModalVisible(false);
    } catch (error) {
      console.error("Error generating Xiaohongshu covers:", error);
      message.error(t("failedToGenerateCover"));
    } finally {
      setIsExportingReport(false);
    }
  };

  const generateSingleCover = async (
    period: 1 | 3 | 7 | 30 | 60,
    language: string,
    colorScheme: string
  ) => {
    // 获取选中时间段的数据
    const response = await api.getUserUsageStats(period);
    const coverData = response.data;

    // Create a temporary cover container
    const coverContainer = document.createElement("div");
    coverContainer.style.position = "fixed";
    coverContainer.style.top = "-9999px";
    coverContainer.style.left = "-9999px";
    coverContainer.style.width = "750px"; // 小红书标准尺寸
    coverContainer.style.height = "937px"; // 4:5 比例
    coverContainer.style.backgroundColor = "#fff";
    coverContainer.style.fontFamily =
      "'PingFang SC', 'Helvetica Neue', Arial, sans-serif";

    // Generate current date
    const now = new Date();

    // Calculate key metrics
    const totalNewUsers = coverData.summary?.totalNewUsers || 0;
    const totalActiveUsers = coverData.summary?.totalActiveUsers || 0;
    const totalDuration = coverData.summary?.totalDuration || 0;

    // Get language-specific texts
    const coverTexts = getCoverTexts(language, period);

    // Get color scheme
    const colors = getColorScheme(colorScheme);

    // Create cover HTML content with gradient background
    coverContainer.innerHTML = `
      <div style="
        width: 100%; 
        height: 100%; 
        background: ${colors.background};
        position: relative;
        overflow: hidden;
      ">
        <!-- Decorative circles -->
        <div style="
          position: absolute;
          top: -50px;
          right: -50px;
          width: 200px;
          height: 200px;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
        "></div>
        <div style="
          position: absolute;
          bottom: -100px;
          left: -100px;
          width: 300px;
          height: 300px;
          background: rgba(255,255,255,0.05);
          border-radius: 50%;
        "></div>

        <!-- Main content -->
        <div style="
          padding: 60px 50px;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          z-index: 2;
        ">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 40px;">
            <div style="
              font-size: 48px;
              font-weight: 900;
              color: white;
              margin-bottom: 10px;
              text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">
              ${coverTexts.title}
            </div>
            <div style="
              font-size: 24px;
              color: rgba(255,255,255,0.9);
              font-weight: 300;
            ">
              ${coverTexts.subtitle}
            </div>
          </div>

          <!-- Key metrics -->
          <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
            <!-- Main metric -->
            <div style="
              text-align: center;
              margin-bottom: 50px;
              background: rgba(255,255,255,0.15);
              backdrop-filter: blur(10px);
              border-radius: 25px;
              padding: 40px 30px;
              border: 1px solid rgba(255,255,255,0.2);
            ">
              <div style="
                font-size: 80px;
                font-weight: 900;
                color: #FFD700;
                margin-bottom: 10px;
                text-shadow: 0 3px 6px rgba(0,0,0,0.3);
              ">
                ${totalActiveUsers}
              </div>
              <div style="
                font-size: 28px;
                color: white;
                font-weight: 600;
                margin-bottom: 8px;
              ">
                ${coverTexts.activeUsers}
              </div>
            </div>

            <!-- Secondary metrics -->
            <div style="
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            ">
              <div style="
                background: rgba(255,255,255,0.12);
                backdrop-filter: blur(8px);
                border-radius: 20px;
                padding: 25px 20px;
                text-align: center;
                border: 1px solid rgba(255,255,255,0.15);
              ">
                <div style="
                  font-size: 36px;
                  font-weight: 800;
                  color: #87CEEB;
                  margin-bottom: 8px;
                ">
                  ${totalNewUsers}
                </div>
                <div style="
                  font-size: 16px;
                  color: white;
                  font-weight: 500;
                ">
                  ${coverTexts.newUsers}
                </div>
              </div>
              <div style="
                background: rgba(255,255,255,0.12);
                backdrop-filter: blur(8px);
                border-radius: 20px;
                padding: 25px 20px;
                text-align: center;
                border: 1px solid rgba(255,255,255,0.15);
              ">
                <div style="
                  font-size: 36px;
                  font-weight: 800;
                  color: #98FB98;
                  margin-bottom: 8px;
                ">
                  ${formatDuration(totalDuration)}
                </div>
                <div style="
                  font-size: 16px;
                  color: white;
                  font-weight: 500;
                ">
                  ${coverTexts.totalDuration}
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center;">
            <div style="
              background: rgba(255,255,255,0.1);
              backdrop-filter: blur(8px);
              border-radius: 15px;
              padding: 20px;
              border: 1px solid rgba(255,255,255,0.15);
            ">
              <div style="
                font-size: 20px;
                color: white;
                font-weight: 600;
                margin-bottom: 5px;
              ">
                ${coverTexts.brandTitle}
              </div>
              <div style="
                font-size: 14px;
                color: rgba(255,255,255,0.8);
              ">
                ${coverTexts.brandSlogan}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(coverContainer);

    try {
      const canvas = await html2canvas(coverContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: colors.backgroundColor,
        width: 750,
        height: 937,
      });

      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");

      // Include both period and language in filename
      const periodTexts = {
        1: "1day",
        3: "3days",
        7: "7days",
        30: "30days",
        60: "60days",
      };

      link.download = `dictation-studio-xiaohongshu-cover-${
        periodTexts[period]
      }-${language}-${now.toISOString().slice(0, 10)}.png`;
      link.href = imgData;
      link.click();

      // Small delay between downloads to avoid browser blocking
      await new Promise((resolve) => setTimeout(resolve, 500));
    } finally {
      document.body.removeChild(coverContainer);
    }
  };

  // 导出统计报告
  const exportStatsReport = async () => {
    if (selectedExportPeriods.length === 0) {
      message.error("Please select at least one time period");
      return;
    }

    if (selectedExportLanguages.length === 0) {
      message.error("Please select at least one language");
      return;
    }

    setIsExportingReport(true);
    try {
      // 获取所有选中时间段的数据
      const multiPeriodData = await fetchMultiplePeriodsData(
        selectedExportPeriods
      );
      if (!multiPeriodData) {
        setIsExportingReport(false);
        return;
      }

      // 为每种语言生成报告
      for (const language of selectedExportLanguages) {
        await generateReportForLanguage(multiPeriodData, language);
      }

      message.success(
        `Reports exported successfully in ${selectedExportLanguages.length} language(s)!`
      );
      setIsExportModalVisible(false);
    } catch (error) {
      console.error("Error exporting report:", error);
      message.error("Failed to export statistics report");
    } finally {
      setIsExportingReport(false);
    }
  };

  // Check if user has real dictation input (is an active user)
  const checkUserHasDictationInput = (user: UserInfo): boolean => {
    if (!user.dictation_progress) {
      return false;
    }

    // Check if any channel has meaningful user input
    for (const channelKey in user.dictation_progress) {
      const channelProgress = user.dictation_progress[channelKey];

      // Check if user has made any input
      if (
        channelProgress?.userInput &&
        typeof channelProgress.userInput === "object"
      ) {
        const inputEntries = Object.entries(channelProgress.userInput);

        // Check if there are any non-empty user inputs
        for (const [_, inputValue] of inputEntries) {
          if (
            inputValue &&
            typeof inputValue === "string" &&
            inputValue.trim().length > 0
          ) {
            return true;
          }
        }
      }
    }

    return false;
  };

  // get last meaningful dictation input timestamp
  const getLastMeaningfulDictationInputTimestamp = (user: UserInfo): number => {
    if (!checkUserHasDictationInput(user)) {
      return 0;
    }

    // get the latest currentTime from all dictation progress entries
    const latestCurrentTime = Object.values(
      user.dictation_progress || {}
    ).reduce((latest, progress) => {
      return progress.currentTime > latest ? progress.currentTime : latest;
    }, 0);

    return latestCurrentTime;
  };

  // get last meaningful dictation input date
  const getLastMeaningfulDictationInputDate = (user: UserInfo): string => {
    const timestamp = getLastMeaningfulDictationInputTimestamp(user);

    if (timestamp === 0) {
      return "";
    }

    return formatTimestamp(timestamp, "locale");
  };

  return (
    <div style={{ padding: "20px" }}>
      <Card
        className="dark:bg-gray-800 dark:text-white shadow-md"
        title={
          <div className="text-xl font-semibold dark:text-white">
            User Management | Total: {users.length} | Active:{" "}
            {users.filter((user) => checkUserHasDictationInput(user)).length}
          </div>
        }
        extra={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="primary"
              onClick={handleRefresh}
              loading={isRefreshing}
              className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:border-blue-600"
            >
              Refresh User List
            </Button>
            <Button
              type="primary"
              onClick={showMembershipModal}
              disabled={selectedUsers.length === 0}
              className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:border-blue-600"
            >
              Edit Membership
            </Button>
            <Button
              type="primary"
              onClick={showRoleModal}
              disabled={selectedUsers.length === 0}
              className="dark:bg-green-600 dark:hover:bg-green-700 dark:border-green-600"
            >
              Edit Role
            </Button>
            <Button
              type="primary"
              onClick={showCodeGeneratorModal}
              className="dark:bg-purple-600 dark:hover:bg-purple-700 dark:border-purple-600"
            >
              Generate Membership Code
            </Button>
            <Button
              type="primary"
              onClick={showCodesModal}
              className="dark:bg-cyan-600 dark:hover:bg-cyan-700 dark:border-cyan-600"
            >
              View Active Codes
            </Button>
            <Button
              type="primary"
              onClick={showStatsModal}
              icon={<BarChartOutlined />}
              className="dark:bg-emerald-600 dark:hover:bg-emerald-700 dark:border-emerald-600"
            >
              Usage Statistics
            </Button>
          </div>
        }
        bodyStyle={{ paddingBottom: "80px" }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg">
          <Table
            rowSelection={{
              type: "checkbox",
              ...rowSelection,
            }}
            columns={columns}
            dataSource={users}
            rowKey="email"
            loading={isLoading}
            scroll={{
              y: 500, // Fixed height to ensure pagination is visible
              x: 1200, // Allow horizontal scroll if needed
            }}
            className="w-full dark:text-white [&_.ant-table]:dark:bg-gray-800 [&_.ant-table-thead>tr>th]:dark:bg-gray-700 [&_.ant-table-thead>tr>th]:dark:text-white [&_.ant-table-tbody>tr>td]:dark:bg-gray-800 [&_.ant-table-tbody>tr>td]:dark:text-white [&_.ant-table-tbody>tr:hover>td]:dark:bg-gray-700 [&_.ant-pagination]:dark:text-white [&_.ant-pagination-item]:dark:bg-gray-700 [&_.ant-pagination-item]:dark:border-gray-600 [&_.ant-pagination-item>a]:dark:text-white [&_.ant-pagination-item-active]:dark:bg-blue-600 [&_.ant-pagination-item-active]:dark:border-blue-600 [&_.ant-select-selector]:dark:bg-gray-700 [&_.ant-select-selector]:dark:border-gray-600 [&_.ant-select-selector]:dark:text-white [&_.ant-checkbox-wrapper]:dark:text-white [&_.ant-checkbox]:dark:border-gray-500 [&_.ant-checkbox-checked_.ant-checkbox-inner]:dark:bg-blue-600 [&_.ant-checkbox-checked_.ant-checkbox-inner]:dark:border-blue-600"
          />
        </div>
      </Card>

      {/* Edit Membership Modal */}
      <Modal
        title="Edit Membership"
        maskClosable={false}
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setShowEditCustomDaysInput(false);
          setEditCustomDaysValue(null);
          form.resetFields();
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsEditModalVisible(false);
              setShowEditCustomDaysInput(false);
              setEditCustomDaysValue(null);
              form.resetFields();
            }}
            className="bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-500"
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isUpdating}
            onClick={handleEditSubmit}
            disabled={
              isUpdating ||
              (showEditCustomDaysInput &&
                (!editCustomDaysValue || editCustomDaysValue <= 0))
            }
            className="bg-blue-500 hover:bg-blue-600 border-blue-500"
          >
            Update
          </Button>,
        ]}
        className="[&_.ant-modal-content]:bg-white [&_.ant-modal-content]:dark:bg-gray-800 [&_.ant-modal-header]:bg-white [&_.ant-modal-header]:dark:bg-gray-800 [&_.ant-modal-title]:dark:text-white [&_.ant-modal-body]:bg-white [&_.ant-modal-body]:dark:bg-gray-800 [&_.ant-modal-footer]:bg-white [&_.ant-modal-footer]:dark:bg-gray-800 [&_.ant-modal-footer]:border-t [&_.ant-modal-footer]:border-gray-200 [&_.ant-modal-footer]:dark:border-gray-600"
      >
        <Form form={form} layout="vertical" className="dark:text-white">
          <Form.Item
            name="durationOption"
            label={<span className="dark:text-white">Membership Duration</span>}
            rules={[
              { required: true, message: "Please select membership duration" },
            ]}
          >
            <Select
              placeholder="Select membership duration"
              onChange={handleDurationChange}
              className="[&_.ant-select-selector]:bg-white [&_.ant-select-selector]:dark:bg-gray-700 [&_.ant-select-selector]:border-gray-300 [&_.ant-select-selector]:dark:border-gray-600 [&_.ant-select-selection-item]:dark:text-white"
            >
              <Option value="30days">30 Days</Option>
              <Option value="60days">60 Days</Option>
              <Option value="90days">90 Days</Option>
              <Option value="permanent">Permanent</Option>
              <Option value="custom">Custom Days</Option>
            </Select>
          </Form.Item>

          {showEditCustomDaysInput && (
            <Form.Item
              name="customDays"
              label={<span className="dark:text-white">Enter Custom Days</span>}
              rules={[
                {
                  required: true,
                  message: "Please enter number of days",
                },
                {
                  type: "number",
                  min: 1,
                  message: "Days must be greater than 0",
                },
              ]}
            >
              <InputNumber
                min={1}
                placeholder="Enter number of days"
                className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                onChange={(value) => {
                  setEditCustomDaysValue(value as number);
                  form.setFieldValue("customDays", value);
                }}
              />
            </Form.Item>
          )}

          <div className="text-gray-500 dark:text-gray-400 mt-2">
            <span className="font-bold">
              Selected users ({selectedUsers.length}):
            </span>
            <br />
            <ul>
              {selectedUsers.map((user) => (
                <li key={user.email}>{user.email}</li>
              ))}
            </ul>
          </div>
        </Form>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        title="Edit Role"
        open={isRoleModalVisible}
        maskClosable={false}
        onCancel={() => {
          setIsRoleModalVisible(false);
          roleForm.resetFields();
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsRoleModalVisible(false);
              roleForm.resetFields();
            }}
            className="bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-500"
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isUpdatingRole}
            onClick={handleRoleSubmit}
            className="bg-blue-500 hover:bg-blue-600 border-blue-500"
          >
            Update
          </Button>,
        ]}
        className="[&_.ant-modal-content]:bg-white [&_.ant-modal-content]:dark:bg-gray-800 [&_.ant-modal-header]:bg-white [&_.ant-modal-header]:dark:bg-gray-800 [&_.ant-modal-title]:dark:text-white [&_.ant-modal-body]:bg-white [&_.ant-modal-body]:dark:bg-gray-800 [&_.ant-modal-footer]:bg-white [&_.ant-modal-footer]:dark:bg-gray-800 [&_.ant-modal-footer]:border-t [&_.ant-modal-footer]:border-gray-200 [&_.ant-modal-footer]:dark:border-gray-600"
      >
        <Form form={roleForm} layout="vertical" className="dark:text-white">
          <Form.Item
            name="role"
            label={<span className="dark:text-white">Role</span>}
            rules={[{ required: true, message: "Please select a role" }]}
          >
            <Select
              placeholder="Select role"
              className="[&_.ant-select-selector]:bg-white [&_.ant-select-selector]:dark:bg-gray-700 [&_.ant-select-selector]:border-gray-300 [&_.ant-select-selector]:dark:border-gray-600 [&_.ant-select-selection-item]:dark:text-white"
            >
              <Option value={USER_ROLE.USER}>User</Option>
              <Option value={USER_ROLE.ADMIN}>Admin</Option>
            </Select>
          </Form.Item>

          <div className="text-gray-500 dark:text-gray-400 mt-2">
            <span className="font-bold">
              Selected users ({selectedUsers.length}):
            </span>
            <br />
            <ul>
              {selectedUsers.map((user) => (
                <li key={user.email}>{user.email}</li>
              ))}
            </ul>
          </div>
        </Form>
      </Modal>

      {/* Generate Verification Code Modal */}
      <Modal
        title="Generate Membership Verification Code"
        open={isCodeModalVisible}
        maskClosable={false}
        onCancel={() => {
          setIsCodeModalVisible(false);
          setGeneratedCode("");
          setShowCustomDaysInput(false);
          setCustomDaysValue(null);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsCodeModalVisible(false);
              setGeneratedCode("");
              setShowCustomDaysInput(false);
              setCustomDaysValue(null);
            }}
            className="bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-500"
          >
            Cancel
          </Button>,
          <Button
            key="generate"
            type="primary"
            loading={isGeneratingCode}
            onClick={handleGenerateCode}
            disabled={
              isGeneratingCode ||
              (showCustomDaysInput &&
                (!customDaysValue || customDaysValue <= 0))
            }
            className="bg-blue-500 hover:bg-blue-600 border-blue-500"
          >
            Generate
          </Button>,
        ]}
        className="[&_.ant-modal-content]:bg-white [&_.ant-modal-content]:dark:bg-gray-800 [&_.ant-modal-header]:bg-white [&_.ant-modal-header]:dark:bg-gray-800 [&_.ant-modal-title]:dark:text-white [&_.ant-modal-body]:bg-white [&_.ant-modal-body]:dark:bg-gray-800 [&_.ant-modal-footer]:bg-white [&_.ant-modal-footer]:dark:bg-gray-800 [&_.ant-modal-footer]:border-t [&_.ant-modal-footer]:border-gray-200 [&_.ant-modal-footer]:dark:border-gray-600"
      >
        <Form form={codeForm} layout="vertical" className="dark:text-white">
          <Form.Item
            name="duration"
            label={<span className="dark:text-white">Membership Duration</span>}
            rules={[{ required: true, message: "Please select duration" }]}
          >
            <Select
              placeholder="Select membership duration"
              className="[&_.ant-select-selector]:bg-white [&_.ant-select-selector]:dark:bg-gray-700 [&_.ant-select-selector]:border-gray-300 [&_.ant-select-selector]:dark:border-gray-600 [&_.ant-select-selection-item]:dark:text-white"
              onChange={(value) => {
                if (value === "custom") {
                  setShowCustomDaysInput(true);
                  codeForm.setFieldValue("customDays", undefined);
                } else {
                  setShowCustomDaysInput(false);
                }
              }}
            >
              <Option value="30days">30 Days</Option>
              <Option value="60days">60 Days</Option>
              <Option value="90days">90 Days</Option>
              <Option value="permanent">Permanent</Option>
              <Option value="custom">Custom Days</Option>
            </Select>
          </Form.Item>

          {showCustomDaysInput && (
            <Form.Item
              name="customDays"
              label={<span className="dark:text-white">Enter Custom Days</span>}
              rules={[
                {
                  required: true,
                  message: "Please enter number of days",
                },
                {
                  type: "number",
                  min: 1,
                  message: "Days must be greater than 0",
                },
              ]}
            >
              <InputNumber
                min={1}
                placeholder="Enter number of days"
                className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                onChange={(value) => {
                  setCustomDaysValue(value as number);
                  codeForm.setFieldsValue({ customDays: value });
                }}
              />
            </Form.Item>
          )}
        </Form>

        {generatedCode && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <Text strong className="dark:text-white">
                Verification Code:
              </Text>
              <Button
                type="text"
                icon={
                  <CopyOutlined className="text-blue-500 dark:text-blue-400" />
                }
                onClick={() => copyToClipboard(generatedCode)}
                className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 bg-transparent border-none"
              >
                Copy
              </Button>
            </div>
            <Paragraph
              className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded font-mono"
              copyable={{ text: generatedCode, tooltips: ["Copy", "Copied!"] }}
            >
              <span className="dark:text-white">{generatedCode}</span>
            </Paragraph>
            <Text
              type="secondary"
              className="block mt-2 text-gray-600 dark:text-gray-300"
            >
              This code will expire in 1 hour. It can be used to activate a
              membership.
            </Text>
          </div>
        )}
      </Modal>

      {/* 校验码列表模态框 */}
      <Modal
        title="Active Verification Codes"
        open={isCodesModalVisible}
        maskClosable={false}
        onCancel={() => setIsCodesModalVisible(false)}
        footer={[
          <Button
            key="refresh"
            onClick={fetchVerificationCodes}
            loading={isLoadingCodes}
            className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Refresh
          </Button>,
          <Button
            key="close"
            type="primary"
            onClick={() => setIsCodesModalVisible(false)}
            className="bg-blue-500 hover:bg-blue-600 border-blue-500"
          >
            Close
          </Button>,
        ]}
        width={700}
        className="[&_.ant-modal-content]:bg-white [&_.ant-modal-content]:dark:bg-gray-800 [&_.ant-modal-header]:bg-white [&_.ant-modal-header]:dark:bg-gray-800 [&_.ant-modal-title]:dark:text-white [&_.ant-modal-body]:bg-white [&_.ant-modal-body]:dark:bg-gray-800 [&_.ant-modal-footer]:bg-white [&_.ant-modal-footer]:dark:bg-gray-800 [&_.ant-modal-footer]:border-t [&_.ant-modal-footer]:border-gray-200 [&_.ant-modal-footer]:dark:border-gray-600"
      >
        <List
          loading={isLoadingCodes}
          dataSource={verificationCodes}
          locale={{
            emptyText: (
              <span className="dark:text-gray-400">
                No active verification codes found
              </span>
            ),
          }}
          className="dark:text-white"
          pagination={{
            pageSize: 5,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20"],
            showTotal: (total) => `Total ${total} codes`,
            className: "dark:text-white",
            itemRender: (_, type, originalElement) => {
              if (
                type === "prev" ||
                type === "next" ||
                type === "jump-prev" ||
                type === "jump-next"
              ) {
                return React.cloneElement(
                  originalElement as React.ReactElement,
                  {
                    className: "dark:text-white dark:hover:text-blue-400",
                  }
                );
              }
              return originalElement;
            },
          }}
          renderItem={(code) => (
            <List.Item
              key={code.code_part}
              className="dark:border-gray-700"
              actions={[
                <Tooltip title="Assign to user">
                  <Button
                    icon={<UserAddOutlined />}
                    onClick={() => showAssignCodeModal(code.full_code)}
                    className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 mr-2"
                  >
                    Assign
                  </Button>
                </Tooltip>,
                <Tooltip title="Copy full verification code">
                  <Button
                    icon={<CopyOutlined />}
                    onClick={() => copyCodeToClipboard(code.full_code)}
                    className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Copy
                  </Button>
                </Tooltip>,
              ]}
            >
              <List.Item.Meta
                title={
                  <div className="flex items-center gap-2 dark:text-white">
                    <span className="font-mono dark:text-blue-300">
                      {code.full_code}
                    </span>
                    <Tag
                      color={
                        code.duration === "permanent"
                          ? "gold"
                          : code.duration === "90days"
                          ? "green"
                          : code.duration === "60days"
                          ? "blue"
                          : code.duration.startsWith("custom_")
                          ? "purple"
                          : "cyan"
                      }
                      className={
                        code.duration === "permanent"
                          ? "dark:bg-yellow-600 dark:text-white"
                          : code.duration === "90days"
                          ? "dark:bg-green-600 dark:text-white"
                          : code.duration === "60days"
                          ? "dark:bg-blue-600 dark:text-white"
                          : code.duration.startsWith("custom_")
                          ? "dark:bg-purple-600 dark:text-white"
                          : "dark:bg-cyan-600 dark:text-white"
                      }
                    >
                      {code.duration === "permanent"
                        ? "Permanent"
                        : code.duration === "90days"
                        ? "90 Days"
                        : code.duration === "60days"
                        ? "60 Days"
                        : code.duration === "30days"
                        ? "30 Days"
                        : code.duration.startsWith("custom_")
                        ? `${code.days} Days`
                        : `${code.days} Days`}
                    </Tag>
                  </div>
                }
                description={
                  <div className="flex flex-col gap-1 text-xs dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      <CalendarOutlined className="dark:text-gray-300" />{" "}
                      Created: {formatTimestamp(code.created_at, "locale")}
                    </div>
                    <div className="flex items-center gap-1">
                      <ClockCircleOutlined className="dark:text-gray-300" />{" "}
                      Expires: {formatTimestamp(code.expires_at, "locale")}
                      <span className="ml-2 text-red-500 dark:text-red-400">
                        (in {formatRemainingTime(code.remaining_seconds)})
                      </span>
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Modal>

      {/* 分发校验码的模态框 */}
      <Modal
        title="Assign Verification Code"
        open={isAssignModalVisible}
        maskClosable={false}
        onCancel={() => setIsAssignModalVisible(false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => setIsAssignModalVisible(false)}
            className="bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-500"
          >
            Cancel
          </Button>,
          <Button
            key="assign"
            type="primary"
            loading={isAssigning}
            onClick={handleAssignCode}
            className="bg-blue-500 hover:bg-blue-600 border-blue-500"
          >
            Assign
          </Button>,
        ]}
        className="[&_.ant-modal-content]:bg-white [&_.ant-modal-content]:dark:bg-gray-800 [&_.ant-modal-header]:bg-white [&_.ant-modal-header]:dark:bg-gray-800 [&_.ant-modal-title]:dark:text-white [&_.ant-modal-body]:bg-white [&_.ant-modal-body]:dark:bg-gray-800 [&_.ant-modal-footer]:bg-white [&_.ant-modal-footer]:dark:bg-gray-800 [&_.ant-modal-footer]:border-t [&_.ant-modal-footer]:border-gray-200 [&_.ant-modal-footer]:dark:border-gray-600"
      >
        <Form form={assignForm} layout="vertical">
          <Form.Item
            name="userEmail"
            label={<span className="dark:text-white">Select User</span>}
            rules={[{ required: true, message: "Please select a user" }]}
          >
            <Select
              showSearch
              placeholder="Search and select user"
              optionFilterProp="label"
              loading={isLoadingUsers}
              options={userOptions}
              className="[&_.ant-select-selector]:bg-white [&_.ant-select-selector]:dark:bg-gray-700 [&_.ant-select-selector]:border-gray-300 [&_.ant-select-selector]:dark:border-gray-600 [&_.ant-select-selection-item]:dark:text-white"
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
            <Text strong className="dark:text-white">
              Selected Code:
            </Text>
            <Paragraph className="p-2 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded font-mono">
              <span className="dark:text-white">{selectedCode}</span>
            </Paragraph>
            <Text type="secondary" className="block mt-2 dark:text-gray-300">
              This code will be assigned to the specified user and activated
              immediately.
            </Text>
          </div>
        </Form>
      </Modal>

      {/* Usage Statistics Modal */}
      <Modal
        title="User Usage Statistics"
        open={isStatsModalVisible}
        maskClosable={false}
        onCancel={() => setIsStatsModalVisible(false)}
        footer={[
          <Button
            key="export"
            type="default"
            icon={<DownloadOutlined />}
            onClick={showExportModal}
            disabled={isLoadingStats}
            className="bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-500"
          >
            Export Report
          </Button>,
          <Button
            key="exportCover"
            type="default"
            onClick={showCoverModal}
            disabled={isLoadingStats}
            className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white border-0"
          >
            {t("xiaohongshuCover")}
          </Button>,
          <Button
            key="close"
            type="primary"
            onClick={() => setIsStatsModalVisible(false)}
            className="bg-blue-500 hover:bg-blue-600 border-blue-500"
          >
            Close
          </Button>,
        ]}
        width={900}
        className="[&_.ant-modal-content]:bg-white [&_.ant-modal-content]:dark:bg-gray-800 [&_.ant-modal-header]:bg-white [&_.ant-modal-header]:dark:bg-gray-800 [&_.ant-modal-title]:dark:text-white [&_.ant-modal-body]:bg-white [&_.ant-modal-body]:dark:bg-gray-800 [&_.ant-modal-footer]:bg-white [&_.ant-modal-footer]:dark:bg-gray-800 [&_.ant-modal-footer]:border-t [&_.ant-modal-footer]:border-gray-200 [&_.ant-modal-footer]:dark:border-gray-600"
      >
        <div className="space-y-6" ref={reportRef}>
          {/* Period Selector */}
          <div className="flex justify-center">
            <Segmented
              value={selectedStatsPeriod}
              onChange={(value) =>
                handleStatsPeriodChange(value as 7 | 30 | 60)
              }
              options={[
                { label: "Last 1 Day", value: 1 },
                { label: "Last 3 Days", value: 3 },
                { label: "Last 7 Days", value: 7 },
                { label: "Last 30 Days", value: 30 },
                { label: "Last 60 Days", value: 60 },
              ]}
              className="dark:bg-gray-700 [&_.ant-segmented-item]:dark:text-white [&_.ant-segmented-item-selected]:dark:bg-blue-600 [&_.ant-segmented-item-selected]:dark:text-white"
            />
          </div>

          {/* Loading Spinner */}
          {isLoadingStats && (
            <div className="flex justify-center py-8">
              <Spin size="large" className="dark:text-white" />
            </div>
          )}

          {/* Charts */}
          {!isLoadingStats && statsData && (
            <div className="space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="dark:bg-gray-700 dark:border-gray-600">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {statsData.summary?.totalNewUsers || 0}
                    </div>
                    <div className="text-gray-600 dark:text-gray-300">
                      New Users
                    </div>
                  </div>
                </Card>
                <Card className="dark:bg-gray-700 dark:border-gray-600">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {statsData.summary?.totalActiveUsers || 0}
                    </div>
                    <div className="text-gray-600 dark:text-gray-300">
                      Total Active Users
                    </div>
                  </div>
                </Card>
                <Card className="dark:bg-gray-700 dark:border-gray-600">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatDuration(statsData.summary?.totalDuration || 0)}
                    </div>
                    <div className="text-gray-600 dark:text-gray-300">
                      Total Duration
                    </div>
                  </div>
                </Card>
                <Card className="dark:bg-gray-700 dark:border-gray-600">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {formatDuration(statsData.summary?.avgDailyDuration || 0)}
                    </div>
                    <div className="text-gray-600 dark:text-gray-300">
                      Avg Daily Duration
                    </div>
                  </div>
                </Card>
              </div>

              {/* New Users Chart */}
              <Card
                title={
                  <span className="dark:text-white">
                    Daily New User Registrations
                  </span>
                }
                className="dark:bg-gray-700 dark:border-gray-600"
              >
                <div className="h-40">
                  <Line
                    data={statsData.dailyNewUsers || []}
                    xField="date"
                    yField="newUsers"
                    smooth={true}
                    color="#F59E0B"
                    point={{
                      size: 4,
                      shape: "circle",
                      style: {
                        fill: "#F59E0B",
                        stroke: "#F59E0B",
                        lineWidth: 2,
                      },
                    }}
                    theme={
                      document.documentElement.classList.contains("dark")
                        ? "dark"
                        : "light"
                    }
                    tooltip={{
                      showTitle: true,
                      title: "Date",
                      showMarkers: true,
                      shared: false,
                      valueFormatter: (_title: any, data: any) => {
                        if (!data || data.length === 0) return "";
                        const item = data[0];
                        return `
                          <div style="padding: 8px; background: white; border: 1px solid #ccc; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            <div style="margin-bottom: 4px; font-weight: bold;">${item.title}</div>
                            <div style="color: #F59E0B;">New Users: ${item.value}</div>
                          </div>
                        `;
                      },
                    }}
                    xAxis={{
                      label: {
                        style: {
                          fill: document.documentElement.classList.contains(
                            "dark"
                          )
                            ? "#F9FAFB"
                            : "#374151",
                        },
                      },
                    }}
                    yAxis={{
                      label: {
                        style: {
                          fill: document.documentElement.classList.contains(
                            "dark"
                          )
                            ? "#F9FAFB"
                            : "#374151",
                        },
                      },
                    }}
                  />
                </div>
              </Card>

              {/* Active Users Chart */}
              <Card
                title={
                  <span className="dark:text-white">Daily Active Users</span>
                }
                className="dark:bg-gray-700 dark:border-gray-600"
              >
                <div className="h-40">
                  <Line
                    data={statsData.dailyActiveUsers || []}
                    xField="date"
                    yField="activeUsers"
                    smooth={true}
                    color="#3B82F6"
                    point={{
                      size: 4,
                      shape: "circle",
                      style: {
                        fill: "#3B82F6",
                        stroke: "#3B82F6",
                        lineWidth: 2,
                      },
                    }}
                    theme={
                      document.documentElement.classList.contains("dark")
                        ? "dark"
                        : "light"
                    }
                    tooltip={{
                      showTitle: true,
                      title: "Date",
                      showMarkers: true,
                      shared: false,
                      valueFormatter: (_title: any, data: any) => {
                        if (!data || data.length === 0) return "";
                        const item = data[0];
                        return `
                          <div style="padding: 8px; background: white; border: 1px solid #ccc; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            <div style="margin-bottom: 4px; font-weight: bold;">${item.title}</div>
                            <div style="color: #3B82F6;">Active Users: ${item.value}</div>
                          </div>
                        `;
                      },
                    }}
                    xAxis={{
                      label: {
                        style: {
                          fill: document.documentElement.classList.contains(
                            "dark"
                          )
                            ? "#F9FAFB"
                            : "#374151",
                        },
                      },
                    }}
                    yAxis={{
                      label: {
                        style: {
                          fill: document.documentElement.classList.contains(
                            "dark"
                          )
                            ? "#F9FAFB"
                            : "#374151",
                        },
                      },
                    }}
                  />
                </div>
              </Card>

              {/* Total Duration Chart */}
              <Card
                title={
                  <span className="dark:text-white">
                    Daily Total Duration (Minutes)
                  </span>
                }
                className="dark:bg-gray-700 dark:border-gray-600"
              >
                <div className="h-40">
                  <Line
                    data={(statsData.dailyDuration || []).map((item: any) => ({
                      ...item,
                      duration: Math.round(item.duration / 60),
                    }))}
                    xField="date"
                    yField="duration"
                    smooth={true}
                    color="#10B981"
                    point={{
                      size: 4,
                      shape: "circle",
                      style: {
                        fill: "#10B981",
                        stroke: "#10B981",
                        lineWidth: 2,
                      },
                    }}
                    theme={
                      document.documentElement.classList.contains("dark")
                        ? "dark"
                        : "light"
                    }
                    tooltip={{
                      showTitle: true,
                      title: "Date",
                      showMarkers: true,
                      shared: false,
                      valueFormatter: (_title: any, data: any) => {
                        if (!data || data.length === 0) return "";
                        const item = data[0];
                        return `
                          <div style="padding: 8px; background: white; border: 1px solid #ccc; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            <div style="margin-bottom: 4px; font-weight: bold;">${item.title}</div>
                            <div style="color: #10B981;">Duration: ${item.value} min</div>
                          </div>
                        `;
                      },
                    }}
                    xAxis={{
                      label: {
                        style: {
                          fill: document.documentElement.classList.contains(
                            "dark"
                          )
                            ? "#F9FAFB"
                            : "#374151",
                        },
                      },
                    }}
                    yAxis={{
                      label: {
                        style: {
                          fill: document.documentElement.classList.contains(
                            "dark"
                          )
                            ? "#F9FAFB"
                            : "#374151",
                        },
                      },
                    }}
                  />
                </div>
              </Card>
            </div>
          )}

          {/* No Data Message */}
          {!isLoadingStats && !statsData && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No statistics data available
            </div>
          )}
        </div>
      </Modal>

      {/* Export Selection Modal */}
      <Modal
        title="Export Statistics Report"
        open={isExportModalVisible}
        maskClosable={false}
        onCancel={() => setIsExportModalVisible(false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => setIsExportModalVisible(false)}
            className="bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-500"
          >
            Cancel
          </Button>,
          <Button
            key="export"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={exportStatsReport}
            loading={isExportingReport}
            disabled={
              selectedExportPeriods.length === 0 ||
              selectedExportLanguages.length === 0
            }
            className="bg-blue-500 hover:bg-blue-600 border-blue-500"
          >
            {t("exportAsMultiLanguage")}
          </Button>,
        ]}
        className="[&_.ant-modal-content]:bg-white [&_.ant-modal-content]:dark:bg-gray-800 [&_.ant-modal-header]:bg-white [&_.ant-modal-header]:dark:bg-gray-800 [&_.ant-modal-title]:dark:text-white [&_.ant-modal-body]:bg-white [&_.ant-modal-body]:dark:bg-gray-800 [&_.ant-modal-footer]:bg-white [&_.ant-modal-footer]:dark:bg-gray-800 [&_.ant-modal-footer]:border-t [&_.ant-modal-footer]:border-gray-200 [&_.ant-modal-footer]:dark:border-gray-600"
      >
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
              📊 Select Time Periods to Include
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Choose one or more time periods to include in your statistics
              report. The report will contain detailed data for each selected
              period.
            </p>
          </div>

          <div className="space-y-3">
            {[1, 3, 7, 30, 60].map((period) => (
              <div
                key={period}
                className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => {
                  const newSelection = selectedExportPeriods.includes(
                    period as 1 | 3 | 7 | 30 | 60
                  )
                    ? selectedExportPeriods.filter((p) => p !== period)
                    : [...selectedExportPeriods, period as 1 | 3 | 7 | 30 | 60];
                  setSelectedExportPeriods(newSelection);
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedExportPeriods.includes(
                    period as 1 | 3 | 7 | 30 | 60
                  )}
                  onChange={() => {}}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    Last {period} Day{period > 1 ? "s" : ""}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {period === 1
                      ? "Yesterday's data"
                      : period === 3
                      ? "Past 3 days analysis"
                      : period === 7
                      ? "Past week analysis"
                      : period === 30
                      ? "Monthly overview"
                      : "Quarterly summary"}
                  </div>
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  {period === 1
                    ? "📅"
                    : period === 3
                    ? "🗓️"
                    : period === 7
                    ? "📊"
                    : period === 30
                    ? "📈"
                    : "📋"}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start space-x-2">
              <div className="text-blue-600 dark:text-blue-400 mt-0.5">💡</div>
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Tip:</strong> Select multiple periods to create a
                comprehensive comparison report. Each period will be displayed
                as a separate section with detailed statistics and insights.
              </div>
            </div>
          </div>

          {/* Language Selection */}
          <div className="mt-6 border-t border-gray-200 dark:border-gray-600 pt-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
              🌐 {t("selectExportLanguages")}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {t("exportLanguageDescription")}
            </p>

            <div className="space-y-3">
              {[
                { code: "en", name: "English", flag: "🇺🇸" },
                { code: "zh", name: t("simplifiedChinese"), flag: "🇨🇳" },
                {
                  code: "zhTraditional",
                  name: t("traditionalChinese"),
                  flag: "🇹🇼",
                },
                { code: "ja", name: "日本語", flag: "🇯🇵" },
                { code: "ko", name: "한국어", flag: "🇰🇷" },
              ].map((language) => (
                <div
                  key={language.code}
                  className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => {
                    const newSelection = selectedExportLanguages.includes(
                      language.code
                    )
                      ? selectedExportLanguages.filter(
                          (l) => l !== language.code
                        )
                      : [...selectedExportLanguages, language.code];
                    setSelectedExportLanguages(newSelection);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedExportLanguages.includes(language.code)}
                    onChange={() => {}}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {language.name}
                    </div>
                  </div>
                  <div className="text-lg">{language.flag}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          {(selectedExportPeriods.length > 0 ||
            selectedExportLanguages.length > 0) && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="text-sm text-green-800 dark:text-green-200 space-y-1">
                {selectedExportPeriods.length > 0 && (
                  <div>
                    <strong>Selected periods:</strong>{" "}
                    {selectedExportPeriods
                      .map((p) => `${p} day${p > 1 ? "s" : ""}`)
                      .join(", ")}
                  </div>
                )}
                {selectedExportLanguages.length > 0 && (
                  <div>
                    <strong>{t("selectedLanguages")}:</strong>{" "}
                    {selectedExportLanguages
                      .map((code) => {
                        const langMap: { [key: string]: string } = {
                          en: "English",
                          zh: t("simplifiedChinese"),
                          zhTraditional: t("traditionalChinese"),
                          ja: "日本語",
                          ko: "한국어",
                        };
                        return langMap[code] || code;
                      })
                      .join(", ")}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Cover Selection Modal */}
      <Modal
        title={t("generateXiaohongshuCover")}
        open={isCoverModalVisible}
        maskClosable={false}
        onCancel={() => setIsCoverModalVisible(false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => setIsCoverModalVisible(false)}
            className="bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-500"
          >
            {t("cancel")}
          </Button>,
          <Button
            key="generate"
            type="primary"
            onClick={exportXiaohongshuCover}
            loading={isExportingReport}
            disabled={
              selectedCoverPeriods.length === 0 ||
              selectedCoverLanguages.length === 0
            }
            className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 border-0"
          >
            {t("generateCover")}
          </Button>,
        ]}
        className="[&_.ant-modal-content]:bg-white [&_.ant-modal-content]:dark:bg-gray-800 [&_.ant-modal-header]:bg-white [&_.ant-modal-header]:dark:bg-gray-800 [&_.ant-modal-title]:dark:text-white [&_.ant-modal-body]:bg-white [&_.ant-modal-body]:dark:bg-gray-800 [&_.ant-modal-footer]:bg-white [&_.ant-modal-footer]:dark:bg-gray-800 [&_.ant-modal-footer]:border-t [&_.ant-modal-footer]:border-gray-200 [&_.ant-modal-footer]:dark:border-gray-600"
      >
        <div className="space-y-6">
          {/* Time Period Selection */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
              📅 {t("selectTimePeriods")}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {t("selectDataTimePeriods")}
            </p>
            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  value: 1,
                  title: t("yesterdayData"),
                  desc: t("showYesterdayUserActivity"),
                  icon: "📅",
                },
                {
                  value: 3,
                  title: t("last3DaysData"),
                  desc: t("showLast3DaysDataTrend"),
                  icon: "🗓️",
                },
                {
                  value: 7,
                  title: t("thisWeekData"),
                  desc: t("showThisWeekOverallPerformance"),
                  icon: "📊",
                },
                {
                  value: 30,
                  title: t("thisMonthData"),
                  desc: t("showThisMonthCompleteData"),
                  icon: "📈",
                },
                {
                  value: 60,
                  title: t("last60DaysData"),
                  desc: t("showLast60DaysLongTermTrend"),
                  icon: "📋",
                },
              ].map((period) => (
                <div
                  key={period.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedCoverPeriods.includes(
                      period.value as 1 | 3 | 7 | 30 | 60
                    )
                      ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20"
                      : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => {
                    const newSelection = selectedCoverPeriods.includes(
                      period.value as 1 | 3 | 7 | 30 | 60
                    )
                      ? selectedCoverPeriods.filter((p) => p !== period.value)
                      : [
                          ...selectedCoverPeriods,
                          period.value as 1 | 3 | 7 | 30 | 60,
                        ];
                    setSelectedCoverPeriods(newSelection);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedCoverPeriods.includes(
                      period.value as 1 | 3 | 7 | 30 | 60
                    )}
                    onChange={() => {}}
                    className="mr-3 h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {period.title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {period.desc}
                    </div>
                  </div>
                  <div className="text-2xl">{period.icon}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Language Selection */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
              🌐 {t("selectCoverLanguages")}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {t("selectCoverLanguageVersion")}
            </p>
            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  code: "zh",
                  name: t("simplifiedChinese"),
                  flag: "🇨🇳",
                  desc: t("suitableForDomesticUsers"),
                },
                {
                  code: "zhTraditional",
                  name: t("traditionalChinese"),
                  flag: "🇹🇼",
                  desc: t("suitableForHongKongTaiwanUsers"),
                },
                {
                  code: "en",
                  name: "English",
                  flag: "🇺🇸",
                  desc: t("suitableForInternationalUsers"),
                },
                {
                  code: "ja",
                  name: "日本語",
                  flag: "🇯🇵",
                  desc: t("suitableForJapaneseUsers"),
                },
                {
                  code: "ko",
                  name: "한국어",
                  flag: "🇰🇷",
                  desc: t("suitableForKoreanUsers"),
                },
              ].map((language) => (
                <div
                  key={language.code}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedCoverLanguages.includes(language.code)
                      ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20"
                      : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => {
                    const newSelection = selectedCoverLanguages.includes(
                      language.code
                    )
                      ? selectedCoverLanguages.filter(
                          (l) => l !== language.code
                        )
                      : [...selectedCoverLanguages, language.code];
                    setSelectedCoverLanguages(newSelection);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedCoverLanguages.includes(language.code)}
                    onChange={() => {}}
                    className="mr-3 h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {language.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {language.desc}
                    </div>
                  </div>
                  <div className="text-2xl">{language.flag}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Color Scheme Selection */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
              🎨 {t("selectColorScheme")}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {t("selectCoverColorScheme")}
            </p>
            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  code: "pink",
                  name: t("pinkGradient"),
                  desc: t("xiaohongshuClassicPinkTheme"),
                  gradient:
                    "linear-gradient(135deg, #ec4899 0%, #be185d 50%, #9f1239 100%)",
                },
                {
                  code: "blue",
                  name: t("blueGradient"),
                  desc: t("professionalBlueTheme"),
                  gradient:
                    "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e3a8a 100%)",
                },
                {
                  code: "purple",
                  name: t("purpleGradient"),
                  desc: t("elegantPurpleTheme"),
                  gradient:
                    "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)",
                },
                {
                  code: "green",
                  name: t("greenGradient"),
                  desc: t("freshGreenTheme"),
                  gradient:
                    "linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)",
                },
                {
                  code: "orange",
                  name: t("orangeGradient"),
                  desc: t("vibrantOrangeTheme"),
                  gradient:
                    "linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)",
                },
              ].map((scheme) => (
                <div
                  key={scheme.code}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedColorScheme === scheme.code
                      ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20"
                      : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setSelectedColorScheme(scheme.code)}
                >
                  <input
                    type="radio"
                    name="colorScheme"
                    checked={selectedColorScheme === scheme.code}
                    onChange={() => {}}
                    className="mr-3 h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {scheme.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {scheme.desc}
                    </div>
                  </div>
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                    style={{ background: scheme.gradient }}
                  ></div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          {(selectedCoverPeriods.length > 0 ||
            selectedCoverLanguages.length > 0) && (
            <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20 border border-pink-200 dark:border-pink-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="text-pink-600 dark:text-pink-400 mt-0.5 text-xl">
                  📱
                </div>
                <div className="flex-1">
                  <div className="font-medium text-pink-800 dark:text-pink-200 mb-2">
                    {t("coverPreviewInfo")}
                  </div>
                  <div className="text-sm text-pink-700 dark:text-pink-300 space-y-1">
                    {selectedCoverPeriods.length > 0 && (
                      <div>
                        <strong>{t("timePeriod")}:</strong>{" "}
                        {selectedCoverPeriods
                          .map((period) => {
                            const periodNames = {
                              1: t("yesterdayData"),
                              3: t("last3DaysData"),
                              7: t("thisWeekData"),
                              30: t("thisMonthData"),
                              60: t("last60DaysData"),
                            };
                            return periodNames[period];
                          })
                          .join(", ")}
                      </div>
                    )}
                    {selectedCoverLanguages.length > 0 && (
                      <div>
                        <strong>{t("selectCoverLanguages")}:</strong>{" "}
                        {selectedCoverLanguages
                          .map((code) => {
                            const langMap: { [key: string]: string } = {
                              zh: t("simplifiedChinese"),
                              zhTraditional: t("traditionalChinese"),
                              en: "English",
                              ja: "日本語",
                              ko: "한국어",
                            };
                            return langMap[code] || code;
                          })
                          .join(", ")}
                      </div>
                    )}
                    <div>
                      <strong>{t("colorScheme")}:</strong>{" "}
                      {selectedColorScheme === "pink" && t("pinkGradient")}
                      {selectedColorScheme === "blue" && t("blueGradient")}
                      {selectedColorScheme === "purple" && t("purpleGradient")}
                      {selectedColorScheme === "green" && t("greenGradient")}
                      {selectedColorScheme === "orange" && t("orangeGradient")}
                    </div>
                    <div>
                      <strong>{t("coverSize")}:</strong>{" "}
                      {t("xiaohongshuStandardRatio")}
                    </div>
                    {selectedCoverPeriods.length > 0 &&
                      selectedCoverLanguages.length > 0 && (
                        <div className="mt-2 p-2 bg-pink-100 dark:bg-pink-800/30 rounded">
                          <strong>Total covers to generate:</strong>{" "}
                          {selectedCoverPeriods.length *
                            selectedCoverLanguages.length}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* User Progress Modal */}
      <Modal
        title={`User Progress - ${selectedUserEmail}`}
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
            Close
          </Button>,
        ]}
        width={800}
        className="[&_.ant-modal-content]:bg-white [&_.ant-modal-content]:dark:bg-gray-800 [&_.ant-modal-header]:bg-white [&_.ant-modal-header]:dark:bg-gray-800 [&_.ant-modal-title]:dark:text-white [&_.ant-modal-body]:bg-white [&_.ant-modal-body]:dark:bg-gray-800 [&_.ant-modal-footer]:bg-white [&_.ant-modal-footer]:dark:bg-gray-800 [&_.ant-modal-footer]:border-t [&_.ant-modal-footer]:border-gray-200 [&_.ant-modal-footer]:dark:border-gray-600 [&_*::-webkit-scrollbar]:w-2 [&_*::-webkit-scrollbar-track]:bg-gray-200 [&_*::-webkit-scrollbar-track]:dark:bg-gray-700 [&_*::-webkit-scrollbar-thumb]:bg-gray-400 [&_*::-webkit-scrollbar-thumb]:dark:bg-gray-600 [&_*::-webkit-scrollbar-thumb]:rounded-full [&_*::-webkit-scrollbar-thumb:hover]:bg-gray-500 [&_*::-webkit-scrollbar-thumb:hover]:dark:bg-gray-500"
      >
        {isLoadingUserProgress ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" className="dark:text-white" />
          </div>
        ) : selectedUserProgress.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <Empty
              description={
                <span className="text-gray-500 dark:text-gray-400">
                  No progress data available for this user
                </span>
              }
            />
          </div>
        ) : (
          <div
            className="max-h-96 overflow-y-auto"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: document.documentElement.classList.contains(
                "dark"
              )
                ? "rgb(75, 85, 99) rgb(55, 65, 81)"
                : "rgb(156, 163, 175) rgb(229, 231, 235)",
            }}
          >
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">
                    📺 {channelName}
                  </h3>
                  <div className="space-y-3">
                    {channelVideos.map((video) => (
                      <div
                        key={video.videoId}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                      >
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate mb-2">
                            {video.videoTitle}
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="flex-1">
                              <Progress
                                percent={video.overallCompletion}
                                size="small"
                                status="active"
                                strokeColor="#1890ff"
                                trailColor={
                                  document.documentElement.classList.contains(
                                    "dark"
                                  )
                                    ? "rgba(255, 255, 255, 0.1)"
                                    : "rgba(0, 0, 0, 0.06)"
                                }
                                className="[&_.ant-progress-text]:!text-gray-900 dark:[&_.ant-progress-text]:!text-gray-100 [&_.ant-progress-bg]:!bg-gray-200 dark:[&_.ant-progress-bg]:!bg-gray-600"
                                showInfo={true}
                                format={(percent) => (
                                  <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                    {percent}%
                                  </span>
                                )}
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

export default UserManagement;
