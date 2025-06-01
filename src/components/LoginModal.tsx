import React, { useState, useEffect } from "react";
import { Button, Form, Input, message, Avatar, Modal } from "antd";
import {
  GoogleOutlined,
  UserOutlined,
  MailOutlined,
  LockOutlined,
  ArrowRightOutlined,
  AudioOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { api, UI_HOST } from "@/api/api";
import { useDispatch } from "react-redux";
import { clearUser, setUser } from "@/redux/userSlice";
import { EMAIL_VERIFIED_KEY } from "@/utils/const";
import { supabase } from "@/utils/supabaseClient";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { AvatarGrid, EditIcon } from "@/components/dictation/video/Widget";
import { localStorageCleanup } from "@/utils/util";

// Styled Components
const AuthModal = styled(Modal)`
  .ant-modal-content {
    border-radius: 16px;
    overflow: hidden;
    padding: 0;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  .ant-modal-body {
    padding: 0;
  }

  .ant-modal-close {
    top: 16px;
    right: 16px;
    color: rgba(255, 255, 255, 0.85);
    background: rgba(0, 0, 0, 0.25);
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:hover {
      background: rgba(0, 0, 0, 0.4);
      transform: scale(1.05);
    }
  }
`;

const ModalContainer = styled.div`
  display: flex;
`;

const BrandSection = styled.div`
  flex: 1;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;

  .dark & {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  }
`;

const BrandPatterns = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.1;
  background-image: radial-gradient(
      circle at 25% 25%,
      rgba(255, 255, 255, 0.2) 1%,
      transparent 1%
    ),
    radial-gradient(
      circle at 75% 75%,
      rgba(255, 255, 255, 0.2) 1%,
      transparent 1%
    );
  background-size: 60px 60px;
`;

const BrandContent = styled.div`
  position: relative;
  z-index: 1;
`;

const BrandLogo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const BrandTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
`;

const BrandTagline = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 2rem;
  line-height: 1.5;
`;

const FormSection = styled.div`
  flex: 1;
  background: white;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  overflow: auto;

  .dark & {
    background: #1f2937;
    color: white;
  }
`;

const FormTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 1.5rem;

  .dark & {
    color: white;
  }
`;

const StyledForm = styled(Form)`
  .ant-form-item {
    margin-bottom: 1.5rem;
  }

  .ant-input-affix-wrapper {
    padding: 12px;
    border-radius: 8px;
    transition: all 0.3s;

    &:hover,
    &:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }

    .dark & {
      background: #374151;
      border-color: #4b5563;
      color: white;

      &:hover,
      &:focus {
        border-color: #8b5cf6;
        box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
      }

      input {
        background: transparent;
        color: white;
      }

      .ant-input-prefix {
        color: #9ca3af;
      }
    }
  }
`;

const StyledInput = styled(Input)`
  border-radius: 8px;
  height: 48px;
  font-size: 1rem;
`;

const StyledInputPassword = styled(Input.Password)`
  border-radius: 8px;
  height: 48px;
  font-size: 1rem;
`;

const StyledButton = styled(Button)`
  height: 48px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &.ant-btn-primary {
    background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
    border: none;

    .dark & {
      background: linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%);
    }

    &:hover {
      background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
      border: none;
    }
  }

  &.social-button {
    background: white;
    border: 1px solid #e2e8f0;
    color: #4b5563;
    margin-bottom: 1rem;

    .dark & {
      background: #374151;
      border-color: #4b5563;
      color: white;
    }
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 1.5rem 0;

  &:before,
  &:after {
    content: "";
    flex: 1;
    height: 1px;
    background: #e2e8f0;

    .dark & {
      background: #4b5563;
    }
  }

  span {
    padding: 0 1rem;
    color: #94a3b8;
    font-size: 0.875rem;
  }
`;

const SwitchText = styled.p`
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.95rem;
  color: #6b7280;

  .dark & {
    color: #9ca3af;
  }

  button {
    color: #6366f1;
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    cursor: pointer;
    margin-left: 0.25rem;

    .dark & {
      color: #8b5cf6;
    }

    &:hover {
      text-decoration: underline;
    }
  }
`;

const AvatarContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 0 1.5rem;
  position: relative;
`;

const StyledAvatar = styled(Avatar)`
  width: 120px;
  height: 120px;
  border: 4px solid white;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);

  .dark & {
    border-color: #374151;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
  }
`;

const StyledEditIcon = styled(EditIcon)`
  background-color: #6366f1;
  color: white;
  border: 2px solid white;

  .dark & {
    border-color: #374151;
  }
`;

// Interface definitions
interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
}

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
    try {
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
          t(
            "Registration successful! Please check your email to verify your account."
          )
        );
      }
    } catch (error) {
      message.error(t("registerFormErrorMessage"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (values: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        message.error(error.message);
        setIsLoading(false);
        return;
      }

      const user = data.user.user_metadata;

      try {
        const response = await api.login(
          user.email,
          user.full_name,
          user.avatar_url
        );

        if (response.status === 200) {
          userInfoSetup(response.data.user);
          message.success(t("loginSuccessful"));
          onClose();

          // Delay reload to allow animation to complete
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          userInfoCleanup();
          message.error(t("loginFormErrorMessage"));
        }
      } catch (error) {
        userInfoCleanup();
        message.error(t("loginFormErrorMessage"));
      }
    } catch (error) {
      message.error(t("loginFormErrorMessage"));
    } finally {
      setIsLoading(false);
    }
  };

  const userInfoCleanup = () => {
    localStorageCleanup();
    dispatch(clearUser());
  };

  const userInfoSetup = (user: any) => {
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
        options: {
          redirectTo: `${UI_HOST}/dictation/video`,
        },
      });
      onClose();
    } catch (error) {
      console.error("Google login failed:", error);
      message.error(t("loginFailedWithGoogle"));
    }
  };

  const toggleForm = () => {
    setIsRegistering(!isRegistering);
  };

  return (
    <>
      <AuthModal
        visible={visible}
        onCancel={onClose}
        footer={null}
        width={960}
        centered
        destroyOnClose
      >
        <ModalContainer>
          <BrandSection>
            <BrandPatterns />
            <BrandContent>
              <BrandLogo>
                <AudioOutlined
                  style={{ fontSize: "32px", marginRight: "12px" }}
                />
                <span style={{ fontSize: "24px", fontWeight: "bold" }}>
                  Dictation Studio
                </span>
              </BrandLogo>
              <BrandTitle>{t("Improve your listening skills")}</BrandTitle>
              <BrandTagline>
                {t(
                  "Practice your listening comprehension with interactive dictation exercises from videos, podcasts, and more."
                )}
              </BrandTagline>
              <div style={{ marginTop: "auto" }}>
                <p
                  style={{
                    opacity: 0.7,
                    fontSize: "0.9rem",
                    marginTop: "2rem",
                  }}
                >
                  © {new Date().getFullYear()} Dictation Studio. All rights
                  reserved.
                </p>
              </div>
            </BrandContent>
          </BrandSection>

          <FormSection>
            <AnimatePresence mode="wait">
              <motion.div
                key={isRegistering ? "register" : "login"}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <FormTitle>
                  {isRegistering ? t("signUp") : t("signIn")}
                </FormTitle>

                {isRegistering ? (
                  <StyledForm layout="vertical" onFinish={handleRegister}>
                    <AvatarContainer>
                      <StyledAvatar src={avatar} />
                      <StyledEditIcon onClick={handleAvatarEdit} />
                    </AvatarContainer>

                    <Form.Item
                      name="username"
                      rules={[
                        {
                          required: true,
                          message: t("registerFormUsernamePrompt"),
                        },
                      ]}
                    >
                      <StyledInput
                        prefix={<UserOutlined />}
                        placeholder={t("registerFormUsernamePrompt")}
                      />
                    </Form.Item>

                    <Form.Item
                      name="email"
                      rules={[
                        {
                          required: true,
                          message: t("registerFormEmailPrompt"),
                        },
                        {
                          type: "email",
                          message: t("registerFormEmailInvalidPrompt"),
                        },
                      ]}
                    >
                      <StyledInput
                        prefix={<MailOutlined />}
                        placeholder={t("registerFormEmailPrompt")}
                      />
                    </Form.Item>

                    <Form.Item
                      name="password"
                      rules={[
                        {
                          required: true,
                          message: t("registerFormPasswordPrompt"),
                        },
                        {
                          min: 6,
                          message: t("registerFormPasswordInvalidPrompt"),
                        },
                      ]}
                    >
                      <StyledInputPassword
                        prefix={<LockOutlined />}
                        placeholder={t("registerFormPasswordPrompt")}
                      />
                    </Form.Item>

                    <Form.Item
                      name="confirmPassword"
                      dependencies={["password"]}
                      rules={[
                        {
                          required: true,
                          message: t("registerFormConfirmPasswordPrompt"),
                        },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue("password") === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error(
                                t("registerFormConfirmPasswordInvalidPrompt")
                              )
                            );
                          },
                        }),
                      ]}
                    >
                      <StyledInputPassword
                        prefix={<LockOutlined />}
                        placeholder={t("registerFormConfirmPasswordPrompt")}
                      />
                    </Form.Item>

                    <Form.Item>
                      <StyledButton
                        type="primary"
                        htmlType="submit"
                        loading={isLoading}
                        icon={<ArrowRightOutlined />}
                        block
                      >
                        {t("registerFormSubmitButtonText")}
                      </StyledButton>
                    </Form.Item>
                  </StyledForm>
                ) : (
                  <StyledForm layout="vertical" onFinish={handleEmailLogin}>
                    <Form.Item
                      name="email"
                      rules={[
                        {
                          required: true,
                          message: t("loginFormUsernameOrEmailPrompt"),
                        },
                        {
                          type: "email",
                          message: t("loginFormUsernameOrEmailPrompt"),
                        },
                      ]}
                    >
                      <StyledInput
                        prefix={<MailOutlined />}
                        placeholder={t("loginFormUsernameOrEmailPrompt")}
                      />
                    </Form.Item>

                    <Form.Item
                      name="password"
                      rules={[
                        {
                          required: true,
                          message: t("loginFormPasswordPrompt"),
                        },
                      ]}
                    >
                      <StyledInputPassword
                        prefix={<LockOutlined />}
                        placeholder={t("loginFormPasswordPrompt")}
                      />
                    </Form.Item>

                    <Form.Item>
                      <StyledButton
                        type="primary"
                        htmlType="submit"
                        loading={isLoading}
                        icon={<ArrowRightOutlined />}
                        block
                      >
                        {t("loginFormSubmitButtonText")}
                      </StyledButton>
                    </Form.Item>

                    <Divider>
                      <span>{t("OR")}</span>
                    </Divider>

                    <StyledButton
                      className="social-button"
                      icon={<GoogleOutlined />}
                      onClick={handleGoogleLogin}
                      block
                    >
                      {t("signInWithGoogle")}
                    </StyledButton>
                  </StyledForm>
                )}

                <SwitchText>
                  {isRegistering ? t("haveAnAccount") : t("noAccount")}
                  <button onClick={toggleForm}>
                    {isRegistering ? t("signIn") : t("signUp")}
                  </button>
                </SwitchText>
              </motion.div>
            </AnimatePresence>
          </FormSection>
        </ModalContainer>
      </AuthModal>

      <Modal
        title={t("chooseAvatar")}
        open={isAvatarModalVisible}
        onCancel={() => setIsAvatarModalVisible(false)}
        maskClosable={false}
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
