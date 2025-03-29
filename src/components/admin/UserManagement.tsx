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
} from "antd";
import { api } from "@/api/api";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Navigate } from "react-router-dom";
import { UserInfo } from "@/utils/type";
import { USER_PLAN, USER_ROLE } from "@/utils/const";
import {
  CopyOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  UserAddOutlined,
} from "@ant-design/icons";

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
  const [showDuration, setShowDuration] = useState(false);
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

  const showEditModal = () => {
    if (selectedUsers.length === 0) {
      message.warning("Please select users to edit");
      return;
    }
    setIsEditModalVisible(true);

    // Set default values for the form
    form.setFieldsValue({
      duration: 30, // Set default duration
    });
  };

  const showCodeGeneratorModal = () => {
    setIsCodeModalVisible(true);
    setGeneratedCode("");
    codeForm.resetFields();
  };

  const handleGenerateCode = async () => {
    try {
      setIsGeneratingCode(true);
      const values = await codeForm.validateFields();

      const response = await api.generateVerificationCode(values.duration);
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

  const handlePlanChange = (value: string) => {
    setShowDuration(value === USER_PLAN.PRO || value === USER_PLAN.PREMIUM);
    if (!value || value === USER_PLAN.FREE) {
      form.setFieldValue("duration", undefined);
    }
  };

  const handleEditSubmit = async () => {
    setIsUpdating(true);
    try {
      const values = await form.validateFields();
      const emails = selectedUsers.map((user) => user.email);
      const updates: Promise<any>[] = [];

      if (values.plan) {
        updates.push(
          api.updateUserPlan(
            emails,
            values.plan,
            values.plan === USER_PLAN.PRO || values.plan === USER_PLAN.PREMIUM
              ? values.duration
              : undefined
          )
        );
      }

      if (values.role) {
        updates.push(api.updateUserRole(emails, values.role));
      }

      const results = await Promise.all(updates);

      const allSuccessful = results.every(
        (response) =>
          response.data.results &&
          response.data.results.every((r: any) => r.success)
      );

      if (allSuccessful) {
        message.success("Users updated successfully");
        setIsEditModalVisible(false);
        setSelectedUsers([]);
        form.resetFields();
        fetchUsers();
      } else {
        message.error("Some updates failed");
      }
    } catch (error) {
      console.error("Error updating users:", error);
      message.error("Failed to update users");
    } finally {
      setIsUpdating(false);
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
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Plan Name",
      dataIndex: ["plan", "name"],
      key: "planName",
      render: (name: string) => name || "",
    },
    {
      title: "Expire Time",
      dataIndex: ["plan", "expireTime"],
      key: "expireTime",
      render: (expireTime: string) => {
        return expireTime ? new Date(expireTime).toLocaleString() : "";
      },
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
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

  if (!userInfo || userInfo.role !== USER_ROLE.ADMIN) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ padding: "20px" }}>
      <Card
        title="User Management"
        extra={
          <div className="flex gap-2">
            <button
              className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white shadow-md rounded-md hover:bg-blue-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50
       dark:bg-blue-700 dark:text-white dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:dark:opacity-50"
              onClick={showEditModal}
              disabled={selectedUsers.length === 0}
            >
              Edit Selected Users ({selectedUsers.length})
            </button>
            <button
              className="flex items-center justify-center px-4 py-2 bg-green-500 text-white shadow-md rounded-md hover:bg-green-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50
       dark:bg-green-700 dark:text-white dark:hover:bg-green-800"
              onClick={showCodeGeneratorModal}
            >
              Generate Membership Code
            </button>
            <button
              className="flex items-center justify-center px-4 py-2 bg-purple-500 text-white shadow-md rounded-md hover:bg-purple-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50
       dark:bg-purple-700 dark:text-white dark:hover:bg-purple-800"
              onClick={showCodesModal}
            >
              View Active Codes
            </button>
          </div>
        }
      >
        <Table
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
          }}
          columns={columns}
          dataSource={users}
          rowKey="email"
          loading={isLoading}
        />
      </Card>

      {/* Edit Users Modal */}
      <Modal
        confirmLoading={isUpdating}
        title={`Edit Users (${selectedUsers.length} selected)`}
        open={isEditModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => {
          setIsEditModalVisible(false);
          form.resetFields();
        }}
      >
        <Form form={form}>
          <Form.Item name="plan" label="Plan">
            <Select
              allowClear
              placeholder="Select new plan"
              onChange={handlePlanChange}
            >
              <Option value={USER_PLAN.FREE}>Free</Option>
              <Option value={USER_PLAN.PRO}>Pro</Option>
              <Option value={USER_PLAN.PREMIUM}>Premium</Option>
            </Select>
          </Form.Item>
          {showDuration && (
            <Form.Item
              name="duration"
              label="Duration (days)"
              rules={[{ required: true, message: "Please input duration" }]}
            >
              <InputNumber
                min={1}
                max={3650}
                defaultValue={30}
                style={{ width: "100%" }}
                addonAfter="days"
              />
            </Form.Item>
          )}
          <Form.Item name="role" label="Role">
            <Select allowClear placeholder="Select new role">
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
        onCancel={() => {
          setIsCodeModalVisible(false);
          setGeneratedCode("");
        }}
        footer={[
          <Button key="cancel" onClick={() => setIsCodeModalVisible(false)}>
            Close
          </Button>,
          <Button
            key="generate"
            type="primary"
            loading={isGeneratingCode}
            onClick={handleGenerateCode}
            disabled={isGeneratingCode}
          >
            {generatedCode ? "Generate New Code" : "Generate Code"}
          </Button>,
        ]}
        className="dark:bg-gray-800 dark:text-white"
        styles={{
          header: {
            background: "var(--color-bg-container)",
            color: "var(--color-text)",
          },
          body: {
            background: "var(--color-bg-container)",
            color: "var(--color-text)",
          },
          footer: {
            background: "var(--color-bg-container)",
            borderTop: "1px solid var(--color-border)",
          },
          mask: {
            backdropFilter: "blur(4px)",
          },
          content: {
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
            borderBottom: "none",
          },
        }}
      >
        <Form form={codeForm} layout="vertical" className="dark:text-white">
          <Form.Item
            name="duration"
            label={<span className="dark:text-white">Membership Duration</span>}
            rules={[{ required: true, message: "Please select duration" }]}
          >
            <Select
              placeholder="Select membership duration"
              className="dark:bg-gray-700 dark:text-white"
            >
              <Option value="1month">1 Month</Option>
              <Option value="3months">3 Months</Option>
              <Option value="6months">6 Months</Option>
              <Option value="permanent">Permanent</Option>
            </Select>
          </Form.Item>
        </Form>

        {generatedCode && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <Text strong className="dark:text-white">
                Verification Code:
              </Text>
              <Button
                type="text"
                icon={<CopyOutlined className="dark:text-blue-400" />}
                onClick={() => copyToClipboard(generatedCode)}
                className="dark:text-blue-400 dark:hover:text-blue-300"
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
            <Text type="secondary" className="block mt-2 dark:text-gray-300">
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
        onCancel={() => setIsCodesModalVisible(false)}
        footer={[
          <Button
            key="refresh"
            onClick={fetchVerificationCodes}
            loading={isLoadingCodes}
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Refresh
          </Button>,
          <Button
            key="close"
            type="primary"
            onClick={() => setIsCodesModalVisible(false)}
          >
            Close
          </Button>,
        ]}
        width={700}
        className="dark:bg-gray-800 dark:text-white"
        styles={{
          header: {
            background: "var(--color-bg-container)",
            color: "var(--color-text)",
          },
          body: {
            background: "var(--color-bg-container)",
            color: "var(--color-text)",
          },
          footer: {
            background: "var(--color-bg-container)",
            borderTop: "1px solid var(--color-border)",
          },
          mask: {
            backdropFilter: "blur(4px)",
          },
          content: {
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
            borderBottom: "none",
          },
        }}
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
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600 mr-2"
                  >
                    Assign
                  </Button>
                </Tooltip>,
                <Tooltip title="Copy full verification code">
                  <Button
                    icon={<CopyOutlined />}
                    onClick={() => copyCodeToClipboard(code.full_code)}
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
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
                          : code.duration === "6months"
                          ? "green"
                          : code.duration === "3months"
                          ? "blue"
                          : "cyan"
                      }
                      className={
                        code.duration === "permanent"
                          ? "dark:bg-yellow-600 dark:text-white"
                          : code.duration === "6months"
                          ? "dark:bg-green-600 dark:text-white"
                          : code.duration === "3months"
                          ? "dark:bg-blue-600 dark:text-white"
                          : "dark:bg-cyan-600 dark:text-white"
                      }
                    >
                      {code.duration === "permanent"
                        ? "Permanent"
                        : code.duration === "6months"
                        ? "6 Months"
                        : code.duration === "3months"
                        ? "3 Months"
                        : "1 Month"}
                    </Tag>
                  </div>
                }
                description={
                  <div className="flex flex-col gap-1 text-xs dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      <CalendarOutlined className="dark:text-gray-300" />{" "}
                      Created: {new Date(code.created_at).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <ClockCircleOutlined className="dark:text-gray-300" />{" "}
                      Expires: {new Date(code.expires_at).toLocaleString()}
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
        onCancel={() => setIsAssignModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsAssignModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="assign"
            type="primary"
            loading={isAssigning}
            onClick={handleAssignCode}
          >
            Assign
          </Button>,
        ]}
        className="dark:bg-gray-800 dark:text-white"
        styles={{
          header: {
            background: "var(--color-bg-container)",
            color: "var(--color-text)",
          },
          body: {
            background: "var(--color-bg-container)",
            color: "var(--color-text)",
          },
          footer: {
            background: "var(--color-bg-container)",
            borderTop: "1px solid var(--color-border)",
          },
          mask: {
            backdropFilter: "blur(4px)",
          },
          content: {
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
            borderBottom: "none",
          },
        }}
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
              className="dark:bg-gray-700 dark:text-white"
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
    </div>
  );
};

export default UserManagement;
