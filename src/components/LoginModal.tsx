import React, { useState, useEffect } from "react";
import { Button, Form, Input, Drawer, message, Avatar, Modal } from "antd";
import {
  GoogleOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  EditOutlined,
  UserOutlined,
} from "@ant-design/icons";
import styled from "styled-components";
import { useGoogleLogin } from "@react-oauth/google";
import { api } from "@/api/api";

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
  onGoogleLogin: (tokenResponse: any) => void;
}

const StyledDrawer = styled(Drawer)`
  .ant-drawer-content-wrapper {
    width: 33.33% !important;
  }
  .ant-drawer-content {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(5px);
  }
`;

const LoginContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  padding: 0 24px;
  position: relative;
  overflow: hidden;
`;

const SlideContainer = styled.div<{ isRegistering: boolean }>`
  display: flex;
  width: 200%;
  transition: transform 0.3s ease-in-out;
  transform: translateX(${(props) => (props.isRegistering ? "-50%" : "0%")});
`;

const FormContainer = styled.div`
  flex: 0 0 50%;
  padding: 0 12px;
`;

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

const AvatarWrapper = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 20px;
`;

const EditIcon = styled(EditOutlined)`
  position: absolute;
  right: 0;
  bottom: 0;
  background-color: #fff;
  border-radius: 50%;
  padding: 5px;
  cursor: pointer;
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
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState<string>("");
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [avatarOptions, setAvatarOptions] = useState<string[]>([]);
  const [avatarPage, setAvatarPage] = useState(1);
  const maxAvatars = 100;

  const loadAllAvatars = () => {
    const newAvatars = Array.from(
      { length: maxAvatars },
      (_, i) => `https://api.dicebear.com/6.x/adventurer/svg?seed=${i}`
    );
    setAvatarOptions(newAvatars);
  };

  useEffect(() => {
    loadAllAvatars();
  }, []);

  const getRandomAvatar = () => {
    if (avatarOptions.length > 0) {
      const randomIndex = Math.floor(Math.random() * avatarOptions.length);
      setAvatar(avatarOptions[randomIndex]);
    }
  };

  const toggleRegistration = () => {
    setIsRegistering(!isRegistering);
    if (!isRegistering) {
      getRandomAvatar();
    }
  };

  const onFinish = async (values: any) => {
    if (isRegistering) {
      setIsLoading(true);
      try {
        await api.register(values.email, values.password, avatar);
        message.success("注册成功，请登录");
        setIsRegistering(false);
        registerForm.resetFields();
      } catch (error) {
        console.error("Registration failed:", error);
        message.error("注册失败，请重试");
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log("Login values:", values);
      // 这里添加登录逻辑
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: onGoogleLogin,
    onError: () => {
      console.log("Login Failed");
      message.error("Google 登录失败，请重试");
    },
  });

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
        <LoginContent>
          <SlideContainer isRegistering={isRegistering}>
            <FormContainer>
              <Form form={loginForm} onFinish={onFinish}>
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
              <Button
                icon={<GoogleOutlined />}
                onClick={() => googleLogin()}
                style={{ width: "100%", marginTop: "16px" }}
              >
                使用 Google 账号登录
              </Button>
            </FormContainer>
            <FormContainer>
              <Form form={registerForm} onFinish={onFinish}>
                <AvatarWrapper>
                  <Avatar size={100} src={avatar} icon={<UserOutlined />} />
                  <EditIcon onClick={() => setIsAvatarModalVisible(true)} />
                </AvatarWrapper>
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
                        return Promise.reject(
                          new Error("两次输入的密码不一致!")
                        );
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
            </FormContainer>
          </SlideContainer>
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <a onClick={toggleRegistration}>
              {isRegistering ? (
                <>
                  <ArrowLeftOutlined /> 已有账号？立即登录
                </>
              ) : (
                <>
                  还没有账号？立即注册 <ArrowRightOutlined />
                </>
              )}
            </a>
          </div>
        </LoginContent>
      </StyledDrawer>
      <Modal
        title="选择头像"
        visible={isAvatarModalVisible}
        onCancel={() => setIsAvatarModalVisible(false)}
        footer={[
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
              onClick={() => {
                setAvatar(avatarUrl);
                setIsAvatarModalVisible(false);
              }}
              style={{ cursor: "pointer" }}
            />
          ))}
        </AvatarGrid>
      </Modal>
    </>
  );
};

export default LoginModal;
