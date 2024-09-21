import React from "react";
import { Button, Form, Input, Drawer } from "antd";
import { GoogleOutlined } from "@ant-design/icons";
import styled from "styled-components";

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
  onGoogleLogin: () => void;
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
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log("Received values of form: ", values);
    // Add email/username password login logic here
  };

  return (
    <>
      {visible && <BlurredBackground onClick={onClose} />}
      <StyledDrawer
        title="登录或注册"
        placement="right"
        onClose={onClose}
        visible={visible}
        mask={false}
      >
        <LoginContent>
          <Form form={form} onFinish={onFinish}>
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
              <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
                登录
              </Button>
            </Form.Item>
          </Form>
          <Button
            icon={<GoogleOutlined />}
            onClick={onGoogleLogin}
            style={{ width: "100%", marginTop: "16px" }}
          >
            使用 Google 账号登录
          </Button>
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <a href="#">还没有账号？立即注册</a>
          </div>
        </LoginContent>
      </StyledDrawer>
    </>
  );
};

export default LoginModal;
