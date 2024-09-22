import React, { useState, useEffect } from "react";
import { Button, Form, Input, Drawer, message, Avatar, Modal } from "antd";
import { GoogleOutlined, UserOutlined, EditOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { useGoogleLogin } from "@react-oauth/google";
import { api } from "@/api/api";

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
  onGoogleLogin: (tokenResponse: any) => void;
}

const BlurredBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  z-index: 1000;
`;

const StyledDrawer = styled(Drawer)`
  .ant-drawer-content-wrapper {
    width: 400px !important;
  }
  .ant-drawer-content {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(5px);
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
`;

const FormWrapper = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px 0;
`;

const BottomSection = styled.div`
  padding: 20px 0;
`;

const LoginForm: React.FC<{
  onFinish: (values: any) => void;
  isLoading: boolean;
}> = ({ onFinish, isLoading }) => (
  <Form onFinish={onFinish}>
    <Form.Item
      name="username"
      rules={[{ required: true, message: "请输入用户名或邮箱!" }]}
    >
      <Input placeholder="用户名或邮箱" />
    </Form.Item>
    <Form.Item
      name="password"
      rules={[{ required: true, message: "请输入密码!" }]}
    >
      <Input.Password placeholder="密码" />
    </Form.Item>
    <Form.Item>
      <Button
        type="primary"
        htmlType="submit"
        style={{ width: "100%" }}
        loading={isLoading}
      >
        登录
      </Button>
    </Form.Item>
  </Form>
);

const RegisterForm: React.FC<{
  onFinish: (values: any) => void;
  isLoading: boolean;
  avatar: string;
  onAvatarEdit: () => void;
}> = ({ onFinish, isLoading, avatar, onAvatarEdit }) => (
  <Form onFinish={onFinish}>
    <Form.Item>
      <Avatar
        size={100}
        src={avatar}
        icon={<UserOutlined />}
        style={{ margin: "0 auto", display: "block" }}
      />
      <EditIcon onClick={onAvatarEdit} />
    </Form.Item>
    <Form.Item
      name="email"
      rules={[
        { required: true, message: "请输入邮箱地址!" },
        { type: "email", message: "请输入有效的邮箱地址!" },
      ]}
    >
      <Input placeholder="邮箱地址" />
    </Form.Item>
    <Form.Item
      name="password"
      rules={[
        { required: true, message: "请输入密码!" },
        { min: 6, message: "密码长度不能少于6个字符!" },
      ]}
    >
      <Input.Password placeholder="密码" />
    </Form.Item>
    <Form.Item
      name="confirmPassword"
      dependencies={["password"]}
      rules={[
        { required: true, message: "请确认密码!" },
        ({ getFieldValue }) => ({
          validator(_, value) {
            if (!value || getFieldValue("password") === value) {
              return Promise.resolve();
            }
            return Promise.reject(new Error("两次输入的密码不一致!"));
          },
        }),
      ]}
    >
      <Input.Password placeholder="确认密码" />
    </Form.Item>
    <Form.Item>
      <Button
        type="primary"
        htmlType="submit"
        style={{ width: "100%" }}
        loading={isLoading}
      >
        注册
      </Button>
    </Form.Item>
  </Form>
);

const EditIcon = styled(EditOutlined)`
  position: absolute;
  right: 50%;
  bottom: -10px;
  transform: translateX(50px);
  background-color: #fff;
  border-radius: 50%;
  padding: 5px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const AvatarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
`;

const LoginModal: React.FC<LoginModalProps> = ({
  visible,
  onClose,
  onGoogleLogin,
}) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState<string>("");
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [avatarOptions, setAvatarOptions] = useState<string[]>([]);
  const [avatarPage, setAvatarPage] = useState(1);
  const maxAvatars = 100;

  useEffect(() => {
    // 初始加载8个头像
    const initialAvatars = Array.from(
      { length: 8 },
      (_, i) => `https://api.dicebear.com/6.x/adventurer/svg?seed=${i}`
    );
    setAvatarOptions(initialAvatars);
  }, []);

  const handleFinish = async (values: any) => {
    setIsLoading(true);
    try {
      if (isRegistering) {
        await api.register(values.email, values.password, avatar);
        message.success("注册成功，请登录");
        setIsRegistering(false);
      } else {
        // 这里添加登录逻辑
        console.log("Login values:", values);
      }
    } catch (error) {
      console.error("Operation failed:", error);
      message.error(isRegistering ? "注册失败，请试" : "登录失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: onGoogleLogin,
    onError: () => {
      console.log("Login Failed");
      message.error("Google 登录失败，请重试");
    },
  });

  const handleAvatarEdit = () => {
    setIsAvatarModalVisible(true);
  };

  const handleAvatarSelect = (selectedAvatar: string) => {
    setAvatar(selectedAvatar);
    setIsAvatarModalVisible(false);
  };

  const loadMoreAvatars = () => {
    const remainingAvatars = maxAvatars - avatarOptions.length;
    const newAvatars = Array.from(
      { length: remainingAvatars },
      (_, i) =>
        `https://api.dicebear.com/6.x/adventurer/svg?seed=${
          avatarOptions.length + i
        }`
    );
    setAvatarOptions((prevOptions) => [...prevOptions, ...newAvatars]);
  };

  return (
    <>
      {visible && <BlurredBackground onClick={onClose} />}
      <StyledDrawer
        title={isRegistering ? "注册" : "登录"}
        placement="right"
        onClose={onClose}
        visible={visible}
        mask={false}
      >
        <ContentWrapper>
          <FormWrapper>
            {isRegistering ? (
              <RegisterForm
                onFinish={handleFinish}
                isLoading={isLoading}
                avatar={avatar}
                onAvatarEdit={handleAvatarEdit}
              />
            ) : (
              <LoginForm onFinish={handleFinish} isLoading={isLoading} />
            )}
          </FormWrapper>
          <BottomSection>
            {!isRegistering && (
              <Button
                icon={<GoogleOutlined />}
                onClick={() => googleLogin()}
                style={{ width: "100%", marginBottom: "10px" }}
              >
                使用 Google 账号登录
              </Button>
            )}
            <Button
              type="link"
              onClick={() => setIsRegistering(!isRegistering)}
              style={{ width: "100%" }}
            >
              {isRegistering ? "已有账号？立即登录" : "还没有账号？立即注册"}
            </Button>
          </BottomSection>
        </ContentWrapper>
      </StyledDrawer>
      <Modal
        title="选择头像"
        visible={isAvatarModalVisible}
        onCancel={() => setIsAvatarModalVisible(false)}
        footer={[
          avatarOptions.length < maxAvatars && (
            <Button key="load-more" onClick={loadMoreAvatars}>
              加载更多
            </Button>
          ),
          <Button key="cancel" onClick={() => setIsAvatarModalVisible(false)}>
            取消
          </Button>,
        ]}
      >
        <AvatarGrid>
          {avatarOptions.map((avatarUrl, index) => (
            <Avatar
              key={index}
              size={64}
              src={avatarUrl}
              onClick={() => handleAvatarSelect(avatarUrl)}
              style={{ cursor: "pointer" }}
            />
          ))}
        </AvatarGrid>
      </Modal>
    </>
  );
};

export default LoginModal;
