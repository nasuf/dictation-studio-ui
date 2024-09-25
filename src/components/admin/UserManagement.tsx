import React, { useState, useEffect } from "react";
import { Table, Card, message, Button, Modal } from "antd";
import { api } from "@/api/api";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Navigate } from "react-router-dom";
import { UserInfo } from "@/utils/type";

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const userInfo = useSelector((state: RootState) => state.user.userInfo);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.getAllUsers();
      if (Array.isArray(response.data.users)) {
        setUsers(response.data.users);
      } else {
        console.error("API response is not an array:", response.data);
        message.error("Failed to fetch users: Invalid data format");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  const showUserDetails = (user: UserInfo) => {
    setSelectedUser(user);
    setIsModalVisible(true);
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
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: UserInfo) => (
        <Button onClick={() => showUserDetails(record)}>View Details</Button>
      ),
    },
  ];

  if (!userInfo || userInfo.role !== "admin") {
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
        title="User Details"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        {selectedUser && (
          <div>
            <p>
              <strong>Username:</strong> {selectedUser.username}
            </p>
            <p>
              <strong>Email:</strong> {selectedUser.email}
            </p>
            <p>
              <strong>Role:</strong> {selectedUser.role}
            </p>
            <img
              src={selectedUser.avatar}
              alt="User Avatar"
              style={{ maxWidth: "100px" }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;
