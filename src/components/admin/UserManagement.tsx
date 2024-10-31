import React, { useState, useEffect } from "react";
import { Table, Card, message, Button, Modal, Select, Form } from "antd";
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
  const [editingUser, setEditingUser] = useState<UserInfo | null>(null);
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

  const showEditModal = (user: UserInfo) => {
    setEditingUser(user);
    form.setFieldsValue({ plan: user.plan });
    setIsEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await api.updateUserPlan(editingUser.email, values.plan);
        message.success("User plan updated successfully");
        setIsEditModalVisible(false);
        fetchUsers(); // Refresh the user list
      }
    } catch (error) {
      console.error("Error updating user plan:", error);
      message.error("Failed to update user plan");
    }
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
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: UserInfo) => (
        <Button onClick={() => showEditModal(record)}>Edit Plan</Button>
      ),
    },
  ];

  if (!userInfo || userInfo.plan !== USER_PLAN.ADMIN) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ padding: "20px" }}>
      <Card title="User Management">
        <Table
          columns={columns}
          dataSource={users}
          rowKey="email"
          loading={isLoading}
        />
      </Card>
      <Modal
        title="Edit User Plan"
        open={isEditModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setIsEditModalVisible(false)}
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
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
