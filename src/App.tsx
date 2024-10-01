import React, { useEffect, useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Layout, message } from "antd";
import { I18nextProvider, useTranslation } from "react-i18next";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "./redux/userSlice";
import i18n from "./utils/i18n";
import AppHeader from "@/components/Header";
import AppContent from "@/components/Content";
import AppFooter from "@/components/Footer";
import LoginModal from "@/components/LoginModal";
import { api } from "@/api/api";
import "../global.css";
import HomePage from "@/components/HomePage";

const { Header, Content, Footer } = Layout;

const App: React.FC = () => {
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await api.checkLogin();
        if (response.status === 200) {
          dispatch(setUser(response.data.user));
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

    checkLoginStatus();

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
      dispatch(setUser(response.data));
      setIsLoginModalVisible(false);
      message.success(t("loginSuccessful"));
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Login failed:", error);
      message.error(t("loginFailed"));
    }
  };

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="*"
        element={
          <Layout style={{ height: "100vh", overflow: "hidden" }}>
            <Header style={{ padding: 0, overflow: "hidden" }}>
              <AppHeader showLoginModal={() => setIsLoginModalVisible(true)} />
            </Header>
            <Content style={{ padding: 0, overflow: "hidden" }}>
              <AppContent />
            </Content>
            <Footer style={{ padding: 0, overflow: "hidden" }}>
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
