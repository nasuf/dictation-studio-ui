import React, { useState, useEffect } from "react";
import { Table, Card, message, Modal, Select, Form } from "antd";
import { api } from "@/api/api";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Navigate } from "react-router-dom";
import { UserInfo } from "@/utils/type";
import { USER_PLAN } from "@/utils/const";

const { Option } = Select;

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<UserInfo[]>([]);
  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const [form] = Form.useForm();

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
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      const emails = selectedUsers.map((user) => user.email);

      const response = await api.updateUserPlan(emails, values.plan);
      if (
        response.data.results &&
        response.data.results.every((r: any) => r.success)
      ) {
        message.success("User plans updated successfully");
        setIsEditModalVisible(false);
        setSelectedUsers([]);
        form.resetFields();
        fetchUsers(); // Refresh the user list
      }
    } catch (error) {
      console.error("Error updating user plans:", error);
      message.error("Failed to update user plans");
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
      title: "Plan",
      dataIndex: "plan",
      key: "plan",
    },
  ];

  if (!userInfo || userInfo.plan !== USER_PLAN.ADMIN) {
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
        title={`Edit Plan for ${selectedUsers.length} Users`}
        open={isEditModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => {
          setIsEditModalVisible(false);
          form.resetFields();
        }}
      >
        <Form form={form}>
          <Form.Item
            name="plan"
            label="Plan"
            rules={[{ required: true, message: "Please select a plan" }]}
          >
            <Select>
              <Option value={USER_PLAN.ADMIN}>Admin</Option>
              <Option value={USER_PLAN.FREE}>Free</Option>
              <Option value={USER_PLAN.PRO}>Pro</Option>
              <Option value={USER_PLAN.PREMIUM}>Premium</Option>
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
