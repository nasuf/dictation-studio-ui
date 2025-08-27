import React, { useState, useEffect } from "react";
import { Button, Form, Input, message, Avatar } from "antd";
import {
  GoogleOutlined,
  UserOutlined,
  MailOutlined,
  LockOutlined,
  ArrowRightOutlined,
  AudioOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { api, UI_HOST } from "@/api/api";
import { useDispatch } from "react-redux";
import { clearUser, setUser } from "@/redux/userSlice";
import { EMAIL_VERIFIED_KEY } from "@/utils/const";
import { supabase } from "@/utils/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { localStorageCleanup } from "@/utils/util";
import { encryptPasswordDeterministic } from "@/utils/encryption";

const MobileLoginPage: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState<string>("");
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    setAvatar(
      `https://api.dicebear.com/6.x/adventurer/svg?seed=${Math.random()}`
    );
  }, []);

  const handleBack = () => {
    navigate("/dictation");
  };

  const handleRegister = async (values: any) => {
    setIsLoading(true);
    try {
      const encryptedPassword = await encryptPasswordDeterministic(
        values.password,
        values.email
      );

      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: encryptedPassword,
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
        return;
      }

      message.success(t("registerSuccessful"), 10);
      // Switch to login form after successful registration
      setIsRegistering(false);
    } catch (error) {
      console.error("Registration error:", error);
      message.error(t("registerFormErrorMessage"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (values: any) => {
    setIsLoading(true);
    try {
      let loginSuccess = false;
      let userData = null;

      // Strategy 1: Try encrypted password first
      try {
        const encryptedPassword = await encryptPasswordDeterministic(
          values.password,
          values.email
        );

        const { data, error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: encryptedPassword,
        });

        if (!error && data.user) {
          loginSuccess = true;
          userData = data.user.user_metadata;
        }
      } catch (encryptedLoginError) {
        console.log("Encrypted password login failed, trying original password...");
      }

      // Strategy 2: Try original password for existing users
      if (!loginSuccess) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password,
          });

          if (!error && data.user) {
            loginSuccess = true;
            userData = data.user.user_metadata;
          }
        } catch (originalLoginError) {
          console.log("Original password login also failed");
        }
      }

      if (!loginSuccess) {
        message.error("Invalid email or password");
        setIsLoading(false);
        return;
      }

      if (!userData) {
        message.error("Login data is missing");
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.login(
          userData.email,
          userData.full_name,
          userData.avatar_url
        );

        if (response.status === 200) {
          userInfoSetup(response.data.user);
          message.success(t("loginSuccessful"));
          
          // Navigate to dictation page after successful login
          setTimeout(() => {
            navigate("/dictation");
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
      console.error("Login error:", error);
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

  const handleGoogleLogin = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${UI_HOST}/dictation`,
        },
      });
    } catch (error) {
      console.error("Google login failed:", error);
      message.error(t("loginFailedWithGoogle"));
    }
  };

  const toggleForm = () => {
    setIsRegistering(!isRegistering);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeftOutlined className="text-lg" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isRegistering ? t("signUp") : t("signIn")}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        {/* Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4">
            <AudioOutlined className="text-2xl text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Dictation Studio
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {t("Improve your listening skills")}
          </p>
        </div>

        {/* Form Section */}
        <div className="max-w-sm mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={isRegistering ? "register" : "login"}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {isRegistering ? (
                <Form layout="vertical" onFinish={handleRegister} className="space-y-4">
                  {/* Avatar */}
                  <div className="flex justify-center mb-6">
                    <Avatar 
                      src={avatar} 
                      size={80}
                      className="border-4 border-white dark:border-gray-700 shadow-lg"
                    />
                  </div>

                  <Form.Item
                    name="username"
                    rules={[
                      {
                        required: true,
                        message: t("registerFormUsernamePrompt"),
                      },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined className="text-gray-400" />}
                      placeholder={t("registerFormUsernamePrompt")}
                      className="h-12 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                    <Input
                      prefix={<MailOutlined className="text-gray-400" />}
                      placeholder={t("registerFormEmailPrompt")}
                      className="h-12 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                    <Input.Password
                      prefix={<LockOutlined className="text-gray-400" />}
                      placeholder={t("registerFormPasswordPrompt")}
                      className="h-12 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                            new Error(t("registerFormConfirmPasswordInvalidPrompt"))
                          );
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined className="text-gray-400" />}
                      placeholder={t("registerFormConfirmPasswordPrompt")}
                      className="h-12 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isLoading}
                      icon={<ArrowRightOutlined />}
                      className="w-full h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 border-none text-white font-medium hover:from-blue-600 hover:to-purple-700"
                    >
                      {t("registerFormSubmitButtonText")}
                    </Button>
                  </Form.Item>
                </Form>
              ) : (
                <Form layout="vertical" onFinish={handleEmailLogin} className="space-y-4">
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
                    <Input
                      prefix={<MailOutlined className="text-gray-400" />}
                      placeholder={t("loginFormUsernameOrEmailPrompt")}
                      className="h-12 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                    <Input.Password
                      prefix={<LockOutlined className="text-gray-400" />}
                      placeholder={t("loginFormPasswordPrompt")}
                      className="h-12 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isLoading}
                      icon={<ArrowRightOutlined />}
                      className="w-full h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 border-none text-white font-medium hover:from-blue-600 hover:to-purple-700"
                    >
                      {t("loginFormSubmitButtonText")}
                    </Button>
                  </Form.Item>

                  {/* Divider */}
                  <div className="flex items-center my-6">
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600"></div>
                    <span className="px-4 text-sm text-gray-500 dark:text-gray-400">
                      {t("OR")}
                    </span>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600"></div>
                  </div>

                  {/* Google Login */}
                  <Button
                    icon={<GoogleOutlined />}
                    onClick={handleGoogleLogin}
                    className="w-full h-12 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    {t("signInWithGoogle")}
                  </Button>
                </Form>
              )}

              {/* Switch Form */}
              <div className="text-center mt-6">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {isRegistering ? t("haveAnAccount") : t("noAccount")}
                </span>
                <button
                  onClick={toggleForm}
                  className="ml-1 text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
                >
                  {isRegistering ? t("signIn") : t("signUp")}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MobileLoginPage;