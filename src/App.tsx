import React, { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Layout, message } from "antd";
import { I18nextProvider } from "react-i18next";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store, RootState } from "./redux/store";
import { setUser, clearUser } from "./redux/userSlice";
import i18n from "./i18n";
import AppHeader from "@/components/Header";
import AppContent from "@/components/Content";
import AppFooter from "@/components/Footer";
import LoginModal from "@/components/LoginModal";
import { api } from "@/api/api";
import "../global.css";

const { Header, Content, Footer } = Layout;

const App: React.FC = () => {
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const dispatch = useDispatch();
  const userInfo = useSelector((state: RootState) => state.user.userInfo);

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
      message.success("登录成功");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Login failed:", error);
      message.error("登录失败，请重试");
    }
  };

  return (
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
