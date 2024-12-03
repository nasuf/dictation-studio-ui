import React, { useEffect, useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Layout, message } from "antd";
import { I18nextProvider, useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { setUser, setIsLoginModalVisible } from "./redux/userSlice";
import i18n from "./utils/i18n";
import AppHeader from "@/components/Header";
import AppContent from "@/components/Content";
import AppFooter from "@/components/Footer";
import LoginModal from "@/components/LoginModal";
import { api } from "@/api/api";
import "../global.css";
import HomePage from "@/components/HomePage";
import { RootState } from "@/redux/store";
import { DEFAULT_LANGUAGE, USER_KEY } from "@/utils/const";
import { supabase } from "@/utils/supabaseClient";

const { Header, Content, Footer } = Layout;

const App: React.FC = () => {
  const isLoginModalVisible = useSelector(
    (state: RootState) => state.user.isLoginModalVisible
  );
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const language = useSelector(
    (state: RootState) => state.user.userInfo?.language ?? DEFAULT_LANGUAGE
  );

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          const user_metadata = session.user.user_metadata;
          const app_metadata = session.user.app_metadata;
          const provider = app_metadata.provider;
          const emailVerified = localStorage.getItem("emailVerified");
          const userInfo = {
            email: user_metadata.email,
            avatar: user_metadata.avatar_url,
            username: user_metadata.full_name,
          };

          const storedUserInfo = JSON.parse(
            localStorage.getItem(USER_KEY) || "{}"
          );

          if (
            (userInfo.email !== storedUserInfo.email ||
              userInfo.avatar !== storedUserInfo.avatar ||
              userInfo.username !== storedUserInfo.username) &&
            (provider === "google" || (provider === "email" && emailVerified))
          ) {
            try {
              const response = await api.updateUserInfo(userInfo);
              if (response.status === 200) {
                const user = response.data.user;
                dispatch(setUser(user));
              } else {
                throw new Error("Failed to update user info");
              }
            } catch (error) {
              message.error(t("loginFailed"));
            }
          } else {
            dispatch(setUser(storedUserInfo));
          }
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className={`${isDarkMode ? "dark" : ""} h-screen flex flex-col`}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup-confirmation" element={<HomePage />} />
        <Route path="/signup-success" element={<HomePage />} />
        <Route
          path="*"
          element={
            <Layout className="flex flex-col h-full bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
              <Header className="flex-shrink-0 p-0 h-auto leading-normal bg-transparent">
                <AppHeader
                  showLoginModal={() => dispatch(setIsLoginModalVisible(true))}
                  isDarkMode={isDarkMode}
                  toggleDarkMode={toggleDarkMode}
                  language={language}
                />
              </Header>
              <Content className="flex-grow overflow-hidden bg-transparent">
                <AppContent />
              </Content>
              <Footer className="flex-shrink-0 p-0 bg-transparent">
                <AppFooter />
              </Footer>
              <LoginModal
                visible={isLoginModalVisible}
                onClose={() => dispatch(setIsLoginModalVisible(false))}
              />
            </Layout>
          }
        />
      </Routes>
      {/* <ChatBox /> */}
    </div>
  );
};

const AppWithProviders: React.FC = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <Router>
        <App />
      </Router>
    </I18nextProvider>
  );
};

export default AppWithProviders;
