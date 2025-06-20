import React, { useState, useEffect } from "react";
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
} from "antd";
import { Line } from "@ant-design/charts";
import { api } from "@/api/api";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Navigate } from "react-router-dom";
import { UserInfo } from "@/utils/type";
import { USER_ROLE } from "@/utils/const";
import {
  CopyOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  UserAddOutlined,
  SearchOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { formatTimestamp } from "../../utils/util";

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
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCodeModalVisible, setIsCodeModalVisible] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<UserInfo[]>([]);
  const userInfo = useSelector((state: RootState) => state.user.userInfo);
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
    1 | 7 | 30 | 60
  >(1);

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

  // 显示统计数据模态框
  const showStatsModal = () => {
    setIsStatsModalVisible(true);
    fetchUsageStats(selectedStatsPeriod);
  };

  // 获取使用统计数据
  const fetchUsageStats = async (days: 1 | 7 | 30 | 60) => {
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
  const handleStatsPeriodChange = (period: 1 | 7 | 30 | 60) => {
    setSelectedStatsPeriod(period);
    fetchUsageStats(period);
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

      // Also check if user has made significant progress (more than 5% completion)
      if (
        channelProgress?.overallCompletion &&
        channelProgress.overallCompletion > 0.05
      ) {
        return true;
      }
    }

    return false;
  };

  if (!userInfo || userInfo.role !== USER_ROLE.ADMIN) {
    return <Navigate to="/" replace />;
  }

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
        <div className="space-y-6">
          {/* Period Selector */}
          <div className="flex justify-center">
            <Segmented
              value={selectedStatsPeriod}
              onChange={(value) =>
                handleStatsPeriodChange(value as 7 | 30 | 60)
              }
              options={[
                { label: "Last 1 Day", value: 1 },
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
    </div>
  );
};

export default UserManagement;
