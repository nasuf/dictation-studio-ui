import React, { useState, useEffect } from "react";
import { Button, Form, Input, Drawer, message, Avatar, Modal } from "antd";
import { GoogleOutlined, UserOutlined, EditOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { useGoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";
import { api } from "@/api/api";
import { encryptPassword } from "@/utils/encryption";

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
}> = ({ onFinish, isLoading }) => {
  const { t } = useTranslation();

  return (
    <Form onFinish={onFinish}>
      <Form.Item
        name="username"
        rules={[{ required: true, message: t("请输入用户名或邮箱!") }]}
      >
        <Input placeholder={t("用户名或邮箱")} />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[{ required: true, message: t("请输入密码!") }]}
      >
        <Input.Password placeholder={t("密码")} />
      </Form.Item>
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          style={{ width: "100%" }}
          loading={isLoading}
        >
          {t("登录")}
        </Button>
      </Form.Item>
    </Form>
  );
};

const RegisterForm: React.FC<{
  onFinish: (values: any) => void;
  isLoading: boolean;
  avatar: string;
  onAvatarEdit: () => void;
}> = ({ onFinish, isLoading, avatar, onAvatarEdit }) => {
  const { t } = useTranslation();

  return (
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
        name="username"
        rules={[{ required: true, message: t("请输入用户名!") }]}
      >
        <Input placeholder={t("用户名")} />
      </Form.Item>
      <Form.Item
        name="email"
        rules={[
          { required: true, message: t("请输入邮箱地址!") },
          { type: "email", message: t("请输入有效的邮箱地址!") },
        ]}
      >
        <Input placeholder={t("邮箱地址")} />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[
          { required: true, message: t("请输入密码!") },
          { min: 6, message: t("密码长度不能少于6个字符!") },
        ]}
      >
        <Input.Password placeholder={t("密码")} />
      </Form.Item>
      <Form.Item
        name="confirmPassword"
        dependencies={["password"]}
        rules={[
          { required: true, message: t("请确认密码!") },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error(t("两次输入的密码不一致!")));
            },
          }),
        ]}
      >
        <Input.Password placeholder={t("确认密码")} />
      </Form.Item>
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          style={{ width: "100%" }}
          loading={isLoading}
        >
          {t("注册")}
        </Button>
      </Form.Item>
    </Form>
  );
};

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
  const maxAvatars = 100; // 设置最大头像数量
  const { t } = useTranslation();

  useEffect(() => {
    // 组件加载时生成一个随机头像
    setAvatar(
      `https://api.dicebear.com/6.x/adventurer/svg?seed=${Math.random()}`
    );
    // 初始化头像选项
    const initialAvatars = Array.from(
      { length: 8 },
      (_, i) => `https://api.dicebear.com/6.x/adventurer/svg?seed=${i}`
    );
    setAvatarOptions(initialAvatars);
  }, []);

  const handleFinish = async (values: any) => {
    setIsLoading(true);
    try {
      const encryptedPassword = await encryptPassword(values.password);

      if (isRegistering) {
        await api.register(
          values.username,
          values.email,
          encryptedPassword,
          avatar
        );
        message.success(t("注册成功，请登录"));
        setIsRegistering(false);
      } else {
        try {
          const response = await api.login(values.username, encryptedPassword);
          if (response.status === 200) {
            localStorage.setItem("jwt_token", response.data.jwt_token);
            message.success(t("登录成功"));
            onClose();
            setTimeout(() => {
              window.location.reload();
            }, 3000);
          } else {
            message.error(t("登录失败，请检查用户名和密码"));
          }
        } catch (error) {
          console.error("Login error:", error);
          message.error(t("登录失败，请重试"));
        }
      }
    } catch (error) {
      console.error("Operation failed:", error);
      message.error(
        isRegistering ? t("注册失败，请重试") : t("登录失败，请重试")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarEdit = () => {
    setIsAvatarModalVisible(true);
  };

  const loadMoreAvatars = () => {
    const remainingAvatars = maxAvatars - avatarOptions.length;
    const newAvatars = Array.from(
      { length: Math.min(8, remainingAvatars) }, // 每次最多加载8个新头像
      (_, i) =>
        `https://api.dicebear.com/6.x/adventurer/svg?seed=${
          avatarOptions.length + i
        }`
    );
    setAvatarOptions((prevOptions) => [...prevOptions, ...newAvatars]);
  };

  const handleAvatarSelect = (avatarUrl: string) => {
    setAvatar(avatarUrl);
    setIsAvatarModalVisible(false);
  };

  const googleLogin = useGoogleLogin({
    onSuccess: onGoogleLogin,
    onError: () => {
      console.log("Login Failed");
      message.error(t("Google 登录失败，请重试"));
    },
  });

  return (
    <>
      {visible && <BlurredBackground onClick={onClose} />}
      <StyledDrawer
        title={isRegistering ? t("注册") : t("登录")}
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
                {t("使用 Google 账号登录")}
              </Button>
            )}
            <Button
              type="link"
              onClick={() => setIsRegistering(!isRegistering)}
              style={{ width: "100%" }}
            >
              {isRegistering
                ? t("已有账号？立即登录")
                : t("还没有账号？立即注册")}
            </Button>
          </BottomSection>
        </ContentWrapper>
      </StyledDrawer>
      <Modal
        title={t("选择头像")}
        visible={isAvatarModalVisible}
        onCancel={() => setIsAvatarModalVisible(false)}
        footer={[
          avatarOptions.length < maxAvatars && (
            <Button key="load-more" onClick={loadMoreAvatars}>
              {t("加载更多")}
            </Button>
          ),
          <Button key="cancel" onClick={() => setIsAvatarModalVisible(false)}>
            {t("取消")}
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
