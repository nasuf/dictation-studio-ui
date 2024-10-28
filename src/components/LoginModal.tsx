import React, { useState, useEffect } from "react";
import { Button, Form, Input, message, Avatar, Modal } from "antd";
import { GoogleOutlined, UserOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { api, UI_HOST } from "@/api/api";
import { useDispatch } from "react-redux";
import { clearUser, setUser } from "@/redux/userSlice";
import { EMAIL_VERIFIED_KEY, JWT_TOKEN_KEY, USER_KEY } from "@/utils/const";
import { supabase } from "@/utils/supabaseClient";
import {
  BlurredBackground,
  StyledDrawer,
  LoginContentWrapper,
  FormWrapper,
  BottomSection,
  AvatarGrid,
  EditIcon,
} from "@/components/dictation/video/Widget";

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
}

const LoginForm: React.FC<{
  onFinish: (values: any) => void;
  isLoading: boolean;
}> = ({ onFinish, isLoading }) => {
  const { t } = useTranslation();

  return (
    <Form onFinish={onFinish}>
      <Form.Item
        name="email"
        rules={[
          {
            required: true,
            message: t("loginFormUsernameOrEmailPrompt"),
          },
          { type: "email", message: t("loginFormUsernameOrEmailPrompt") },
        ]}
      >
        <input
          placeholder={t("loginFormUsernameOrEmailPrompt")}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-600 dark:focus:border-blue-600 transition duration-300 ease-in-out"
        />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[{ required: true, message: t("loginFormPasswordPrompt") }]}
      >
        <input
          type="password"
          placeholder={t("loginFormPasswordPrompt")}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-600 dark:focus:border-blue-600 transition duration-300 ease-in-out"
        />
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
        <input
          placeholder={t("registerFormEmailPrompt")}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-600 dark:focus:border-blue-600 transition duration-300 ease-in-out"
        />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[
          { required: true, message: t("registerFormPasswordPrompt") },
          { min: 6, message: t("registerFormPasswordInvalidPrompt") },
        ]}
      >
        <input
          type="password"
          placeholder={t("registerFormPasswordPrompt")}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-600 dark:focus:border-blue-600 transition duration-300 ease-in-out"
        />
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
        <input
          type="password"
          placeholder={t("registerFormConfirmPasswordPrompt")}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-600 dark:focus:border-blue-600 transition duration-300 ease-in-out"
        />
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

const LoginModal: React.FC<LoginModalProps> = ({ visible, onClose }) => {
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

  const handleRegister = async (values: any) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${UI_HOST}/signup-success`,
        data: {
          full_name: values.username,
          avatar_url: avatar,
        },
      },
    });

    if (error) {
      message.error(error.message);
    } else {
      onClose();
      message.success(
        "Registration successful! Please check your email to verify your account."
      );
    }
    setIsLoading(false);
  };

  const handleLogin = async (values: any) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      message.error(error.message);
    } else {
      message.success("Login successful!");
      const user = data.user.user_metadata;
      try {
        const response = await api.login(
          user.email,
          user.full_name,
          user.avatar_url
        );
        if (response.status === 200) {
          userInfoSetup(response.data.user);
          onClose();
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        } else {
          userInfoCleanup();
          message.error(t("loginFormErrorMessage"));
        }
      } catch (error) {
        userInfoCleanup();
        message.error(t("loginFormErrorMessage"));
      }
    }
    setIsLoading(false);
  };

  const userInfoCleanup = () => {
    localStorage.removeItem(JWT_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(EMAIL_VERIFIED_KEY);
    dispatch(clearUser());
  };

  const userInfoSetup = (user: any) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(EMAIL_VERIFIED_KEY, "true");
    dispatch(setUser(user));
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

  const handleGoogleLogin = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      onClose();
    } catch (error) {
      console.error("Google login failed:", error);
      message.error(t("loginFailedWithGoogle"));
    }
  };

  return (
    <>
      {visible && <BlurredBackground onClick={onClose} />}
      <StyledDrawer
        title={isRegistering ? t("signUp") : t("signIn")}
        placement="right"
        className="dark:bg-gray-800 dark:text-gray-200"
        onClose={onClose}
        open={visible}
        mask={false}
      >
        <LoginContentWrapper>
          <FormWrapper>
            {isRegistering ? (
              <RegisterForm
                onFinish={handleRegister}
                isLoading={isLoading}
                avatar={avatar}
                onAvatarEdit={handleAvatarEdit}
              />
            ) : (
              <LoginForm onFinish={handleLogin} isLoading={isLoading} />
            )}
          </FormWrapper>
          <BottomSection>
            {!isRegistering && (
              <Button
                icon={<GoogleOutlined />}
                onClick={() => handleGoogleLogin()}
                style={{ width: "100%", marginBottom: "10px" }}
                className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                {t("signInWithGoogle")}
              </Button>
            )}
            <Button
              type="link"
              onClick={() => setIsRegistering(!isRegistering)}
              style={{ width: "100%" }}
              className="dark:text-blue-400"
            >
              {isRegistering ? t("haveAnAccount") : t("noAccount")}
            </Button>
          </BottomSection>
        </LoginContentWrapper>
      </StyledDrawer>
      <Modal
        title={t("chooseAvatar")}
        open={isAvatarModalVisible}
        onCancel={() => setIsAvatarModalVisible(false)}
        footer={[
          avatarOptions.length === initialAvatarCount && (
            <Button
              key="load-more"
              onClick={loadMoreAvatars}
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              {t("loadMore")}
            </Button>
          ),
          <Button
            key="cancel"
            onClick={() => setIsAvatarModalVisible(false)}
            className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            {t("cancel")}
          </Button>,
        ]}
        className="dark:bg-gray-800 dark:text-gray-200"
      >
        <AvatarGrid className="custom-scrollbar">
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
