import React, { useState, useEffect } from "react";
import { Button, Form, Input, Drawer, message, Avatar, Modal } from "antd";
import { GoogleOutlined, UserOutlined, EditOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { useGoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";
import { api } from "@/api/api";
import { encryptPassword } from "@/utils/encryption";
import { useDispatch } from "react-redux";
import { clearUser, setUser } from "@/redux/userSlice";

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
        rules={[
          {
            required: true,
            message: t("loginFormUsernameOrEmailPrompt"),
          },
        ]}
      >
        <Input placeholder={t("loginFormUsernameOrEmailPrompt")} />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[{ required: true, message: t("loginFormPasswordPrompt") }]}
      >
        <Input.Password placeholder={t("loginFormPasswordPrompt")} />
      </Form.Item>
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          style={{ width: "100%" }}
          loading={isLoading}
        >
          {t("loginFormSubmitButtonText")}
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
  const [form] = Form.useForm();

  const checkEmail = async (_: any, value: string) => {
    if (!value) {
      return Promise.resolve();
    }
    try {
      const response = await api.checkEmail(value);
      if (response.data.exists) {
        return Promise.reject(new Error(t("emailAlreadyExists")));
      }
      return Promise.resolve();
    } catch (error) {
      console.error("Error checking email:", error);
      return Promise.reject(new Error(t("emailCheckFailed")));
    }
  };

  return (
    <Form form={form} onFinish={onFinish}>
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
        rules={[{ required: true, message: t("registerFormUsernamePrompt") }]}
      >
        <Input placeholder={t("registerFormUsernamePrompt")} />
      </Form.Item>
      <Form.Item
        name="email"
        rules={[
          { required: true, message: t("registerFormEmailPrompt") },
          { type: "email", message: t("registerFormEmailInvalidPrompt") },
          { validator: checkEmail },
        ]}
      >
        <Input placeholder={t("registerFormEmailPrompt")} />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[
          { required: true, message: t("registerFormPasswordPrompt") },
          { min: 6, message: t("registerFormPasswordInvalidPrompt") },
        ]}
      >
        <Input.Password placeholder={t("registerFormPasswordPrompt")} />
      </Form.Item>
      <Form.Item
        name="confirmPassword"
        dependencies={["password"]}
        rules={[
          { required: true, message: t("registerFormConfirmPasswordPrompt") },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error(t("registerFormConfirmPasswordInvalidPrompt"))
              );
            },
          }),
        ]}
      >
        <Input.Password placeholder={t("registerFormConfirmPasswordPrompt")} />
      </Form.Item>
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          style={{ width: "100%" }}
          loading={isLoading}
        >
          {t("registerFormSubmitButtonText")}
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
  const maxAvatars = 100;
  const initialAvatarCount = 8;
  const { t } = useTranslation();
  const dispatch = useDispatch();

  useEffect(() => {
    setAvatar(
      `https://api.dicebear.com/6.x/adventurer/svg?seed=${Math.random()}`
    );
    const initialAvatars = Array.from(
      { length: initialAvatarCount },
      (_, i) => `https://api.dicebear.com/6.x/adventurer/svg?seed=${i}`
    );
    setAvatarOptions(initialAvatars);
  }, []);

  const handleFinish = async (values: any) => {
    setIsLoading(true);
    try {
      const encryptedPassword = await encryptPassword(values.password);

      if (isRegistering) {
        const response = await api.register(
          values.username,
          values.email,
          encryptedPassword,
          avatar
        );
        if (response.status === 200) {
          message.success(t("registerFormSuccessMessage"));
          setIsRegistering(false);
          dispatch(setUser(response.data));
          localStorage.setItem("jwt_token", response.data.jwt_token);
          onClose();
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        } else {
          dispatch(clearUser());
          message.error(t("registerFormErrorMessage"));
        }
      } else {
        try {
          const response = await api.login(values.username, encryptedPassword);
          if (response.status === 200) {
            localStorage.setItem("jwt_token", response.data.jwt_token);
            dispatch(setUser(response.data));
            message.success(t("loginSuccessful"));
            onClose();
            setTimeout(() => {
              window.location.reload();
            }, 3000);
          } else {
            dispatch(clearUser());
            message.error(t("loginFormErrorMessage"));
          }
        } catch (error) {
          dispatch(clearUser());
          console.error("Login error:", error);
          message.error(t("loginFormErrorMessage"));
        }
      }
    } catch (error) {
      dispatch(clearUser());
      console.error("Operation failed:", error);
      message.error(
        isRegistering
          ? t("registerFormErrorMessage")
          : t("loginFormErrorMessage")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarEdit = () => {
    setIsAvatarModalVisible(true);
  };

  const loadMoreAvatars = () => {
    const newAvatars = Array.from(
      { length: maxAvatars - initialAvatarCount },
      (_, i) =>
        `https://api.dicebear.com/6.x/adventurer/svg?seed=${
          initialAvatarCount + i
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
      message.error(t("loginFailedWithGoogle"));
    },
  });

  return (
    <>
      {visible && <BlurredBackground onClick={onClose} />}
      <StyledDrawer
        title={isRegistering ? t("signUp") : t("signIn")}
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
                {t("signInWithGoogle")}
              </Button>
            )}
            <Button
              type="link"
              onClick={() => setIsRegistering(!isRegistering)}
              style={{ width: "100%" }}
            >
              {isRegistering ? t("haveAnAccount") : t("noAccount")}
            </Button>
          </BottomSection>
        </ContentWrapper>
      </StyledDrawer>
      <Modal
        title={t("chooseAvatar")}
        visible={isAvatarModalVisible}
        onCancel={() => setIsAvatarModalVisible(false)}
        footer={[
          avatarOptions.length === initialAvatarCount && (
            <Button key="load-more" onClick={loadMoreAvatars}>
              {t("loadMore")}
            </Button>
          ),
          <Button key="cancel" onClick={() => setIsAvatarModalVisible(false)}>
            {t("cancel")}
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
