import React, { useEffect, useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Layout, message } from "antd";
import { I18nextProvider, useTranslation } from "react-i18next";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser } from "./redux/userSlice";
import i18n from "./utils/i18n";
import AppHeader from "@/components/Header";
import AppContent from "@/components/Content";
import AppFooter from "@/components/Footer";
import LoginModal from "@/components/LoginModal";
import { api } from "@/api/api";
import "../global.css";
import HomePage from "@/components/HomePage";
import { RootState } from "@/redux/store";
import { DEFAULT_LANGUAGE, JWT_TOKEN_KEY } from "@/utils/const";

const { Header, Content, Footer } = Layout;

const App: React.FC = () => {
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
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
    const refreshLoginStatus = async () => {
      try {
        const response = await api.refreshLoginStatus();
        if (response.status === 200) {
          dispatch(setUser(response.data.user));
        } else {
          dispatch(clearUser());
          localStorage.removeItem(JWT_TOKEN_KEY);
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        dispatch(clearUser());
        localStorage.removeItem(JWT_TOKEN_KEY);
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
      localStorage.setItem(JWT_TOKEN_KEY, response.data.jwt_token);
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
