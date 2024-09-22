import React, { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Layout, message } from "antd";
import { I18nextProvider } from "react-i18next";
import { GoogleOAuthProvider } from "@react-oauth/google";
import i18n from "./i18n";
import AppHeader from "@/components/Header";
import AppContent from "@/components/Content";
import AppFooter from "@/components/Footer";
import LoginModal from "@/components/LoginModal";
import { api } from "@/api/api";
import "../global.css";

const { Header, Content, Footer } = Layout;

interface UserInfo {
  name: string;
  email: string;
  picture: string;
  user_id: string;
}

const App: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await api.checkLogin();
        if (response.status === 200) {
          setUserInfo(response.data.user);
        } else {
          setUserInfo(null);
          localStorage.removeItem("jwt_token");
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        setUserInfo(null);
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
  }, []);

  const handleGoogleLogin = async (tokenResponse: any) => {
    try {
      const response = await api.verifyGoogleToken(tokenResponse.access_token);
      localStorage.setItem("jwt_token", response.data.jwt_token);
      setUserInfo(response.data);
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
    <GoogleOAuthProvider clientId="107650640585-tnqr7jl8i7gnqgbil128pj6c6h8l0g36.apps.googleusercontent.com">
      <I18nextProvider i18n={i18n}>
        <Router>
          <Layout style={{ height: "100vh", overflow: "hidden" }}>
            <Header style={{ padding: 0, overflow: "hidden" }}>
              <AppHeader 
                userInfo={userInfo} 
                setUserInfo={setUserInfo}
                showLoginModal={() => setIsLoginModalVisible(true)}
              />
            </Header>
            <Content style={{ padding: 0, overflow: "hidden" }}>
              <AppContent />
            </Content>
            <Footer style={{ padding: 0, overflow: "hidden" }}>
              <AppFooter />
            </Footer>
          </Layout>
          <LoginModal
            visible={isLoginModalVisible}
            onClose={() => setIsLoginModalVisible(false)}
            onGoogleLogin={handleGoogleLogin}
          />
        </Router>
      </I18nextProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
