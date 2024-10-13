import React, { useEffect, useState, useLayoutEffect } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Layout, message } from "antd";
import { I18nextProvider, useTranslation } from "react-i18next";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser, setDarkMode } from "./redux/userSlice";
import i18n from "./utils/i18n";
import AppHeader from "@/components/Header";
import AppContent from "@/components/Content";
import AppFooter from "@/components/Footer";
import LoginModal from "@/components/LoginModal";
import { api } from "@/api/api";
import "../global.css";
import HomePage from "@/components/HomePage";
import { RootState } from "@/redux/store";
import {
  DARK_THEME_CLASS_NAME,
  DEFAULT_DARK_MODE,
  DEFAULT_LANGUAGE,
} from "@/utils/const";

const { Header, Content, Footer } = Layout;

const App: React.FC = () => {
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const isDarkMode = useSelector(
    (state: RootState) => state.user.userInfo?.darkMode ?? DEFAULT_DARK_MODE
  );
  const language = useSelector(
    (state: RootState) => state.user.userInfo?.language ?? DEFAULT_LANGUAGE
  );

  useLayoutEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add(DARK_THEME_CLASS_NAME);
    } else {
      document.documentElement.classList.remove(DARK_THEME_CLASS_NAME);
    }
    i18n.changeLanguage(language);
  }, [isDarkMode, language]);

  const toggleDarkMode = () => {
    if (isDarkMode !== undefined) {
      dispatch(setDarkMode(!isDarkMode));
    }
  };

  useEffect(() => {
    const refreshLoginStatus = async () => {
      try {
        const response = await api.refreshLoginStatus();
        if (response.status === 200) {
          dispatch(setUser(response.data.user));
          localStorage.setItem("user", JSON.stringify(response.data.user));
        } else {
          dispatch(clearUser());
          localStorage.removeItem("jwt_token");
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        dispatch(clearUser());
        localStorage.removeItem("jwt_token");
      }
    };

    // refresh login status every 30 minutes
    refreshLoginStatus();
    setInterval(refreshLoginStatus, 30 * 60 * 1000);

    const handleUnauthorized = () => {
      setIsLoginModalVisible(true);
    };

    window.addEventListener("unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("unauthorized", handleUnauthorized);
    };
  }, [dispatch]);

  const handleGoogleLogin = async (tokenResponse: any) => {
    try {
      const response = await api.verifyGoogleToken(tokenResponse.access_token);
      localStorage.setItem("jwt_token", response.data.jwt_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      dispatch(setUser(response.data.user));
      setIsLoginModalVisible(false);
      message.success(t("loginSuccessful"));
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Login failed:", error);
      message.error(t("loginFailed"));
    }
  };

  return (
    <div className={`${isDarkMode ? "dark" : ""} h-screen flex flex-col`}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="*"
          element={
            <Layout className="flex flex-col h-full bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
              <Header className="flex-shrink-0 p-0 h-auto leading-normal bg-transparent">
                <AppHeader
                  showLoginModal={() => setIsLoginModalVisible(true)}
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
                onClose={() => setIsLoginModalVisible(false)}
                onGoogleLogin={handleGoogleLogin}
              />
            </Layout>
          }
        />
      </Routes>
    </div>
  );
};

const AppWithProviders: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId="107650640585-tnqr7jl8i7gnqgbil128pj6c6h8l0g36.apps.googleusercontent.com">
      <I18nextProvider i18n={i18n}>
        <Router>
          <App />
        </Router>
      </I18nextProvider>
    </GoogleOAuthProvider>
  );
};

export default AppWithProviders;
