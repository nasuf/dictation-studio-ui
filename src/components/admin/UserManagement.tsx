import React, { useState, useEffect } from "react";
import { Table, Card, message, Modal, Select, Form, InputNumber } from "antd";
import { api } from "@/api/api";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Navigate } from "react-router-dom";
import { UserInfo } from "@/utils/type";
import { USER_PLAN, USER_ROLE } from "@/utils/const";

const { Option } = Select;

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<UserInfo[]>([]);
  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const [form] = Form.useForm();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDuration, setShowDuration] = useState(false);

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

  if (!userInfo || userInfo.role !== USER_ROLE.ADMIN) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ padding: "20px" }}>
      <Card
        title="User Management"
        extra={
          <button
            className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white shadow-md rounded-md hover:bg-blue-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50
   dark:bg-blue-700 dark:text-white dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:dark:opacity-50"
            onClick={showEditModal}
            disabled={selectedUsers.length === 0}
          >
            Edit Selected Users ({selectedUsers.length})
          </button>
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
    </div>
  );
};

export default UserManagement;
