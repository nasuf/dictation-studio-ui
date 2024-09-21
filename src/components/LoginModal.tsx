import React, { useState } from "react";
import { Button, Form, Input, Drawer, message } from "antd";
import {
  GoogleOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
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

const LoginModal: React.FC<LoginModalProps> = ({
  visible,
  onClose,
  onGoogleLogin,
}) => {
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onFinish = async (values: any) => {
    if (isRegistering) {
      setIsLoading(true);
      try {
        await api.register(values.email, values.password);
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

  const toggleRegistration = () => {
    setIsRegistering(!isRegistering);
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
    </>
  );
};

export default LoginModal;
