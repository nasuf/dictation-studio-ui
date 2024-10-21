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
import {
  DEFAULT_LANGUAGE,
  JWT_TOKEN_KEY,
  UNAUTHORIZED_EVENT,
  USER_KEY,
} from "@/utils/const";
import { supabase } from "@/utils/supabaseClient";

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
    // const loadUserInfo = async () => {
    //   const userInfo = localStorage.getItem(USER_KEY);
    //   if (userInfo) {
    //     dispatch(setUser(JSON.parse(userInfo)));
    //   } else {
    //     try {
    //       const response = await api.loadUserInfo();
    //       if (response.status === 200) {
    //         dispatch(setUser(response.data.user));
    //       } else if (response.status === 401) {
    //         dispatch(clearUser());
    //         localStorage.removeItem(JWT_TOKEN_KEY);
    //         localStorage.removeItem(USER_KEY);
    //       }
    //     } catch (error) {
    //       dispatch(clearUser());
    //       localStorage.removeItem(JWT_TOKEN_KEY);
    //       localStorage.removeItem(USER_KEY);
    //     }
    //   }
    // };
    // loadUserInfo();

    const handleUnauthorized = () => {
      setIsLoginModalVisible(true);
    };
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, [dispatch]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          const email = session.user.email;
          if (email) {
            api.loadUserInfo(email).then((response) => {
              if (response.status === 200) {
                const user = response.data.user;
                localStorage.setItem(USER_KEY, JSON.stringify(user));
                dispatch(setUser(user));
              }
            });
          }
          message.success(t("loginSuccessful"));
        } else if (event === "SIGNED_OUT") {
          localStorage.removeItem(USER_KEY);
          dispatch(clearUser());
          message.info(t("loggedOut"));
        }
      }
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [dispatch]);

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
