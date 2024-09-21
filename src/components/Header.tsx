import React, { useState } from "react";
import { Layout, Menu, Space, Dropdown, message, Avatar } from "antd";
import { GlobalOutlined, DownOutlined, UserOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useLanguageToggle } from "@/hooks/useLanguageToggle";
import { useGoogleLogin } from "@react-oauth/google";
import { api } from "@/api/api";
import LoginModal from "./LoginModal"; // 新增：导入登录弹窗组件

const { Header } = Layout;

interface UserInfo {
  name: string;
  email: string;
  picture: string;
  user_id: string;
}

interface AppHeaderProps {
  userInfo: UserInfo | null;
  setUserInfo: React.Dispatch<React.SetStateAction<UserInfo | null>>;
}

const StyledAvatar = styled(Avatar)`
  cursor: pointer;
`;

const AppHeader: React.FC<AppHeaderProps> = ({ userInfo, setUserInfo }) => {
  const { t, i18n } = useTranslation();
  const { toggleLanguage, currentLanguage } = useLanguageToggle();
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await api.verifyGoogleToken(
          tokenResponse.access_token
        );
        localStorage.setItem("jwt_token", response.data.jwt_token);
        setUserInfo(response.data);
        message.success("登录成功");
        setIsLoginModalVisible(false);
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } catch (error) {
        console.error("Login failed:", error);
        message.error("登录失败，请重试");
        localStorage.removeItem("jwt_token");
      }
    },
    onError: () => {
      console.log("Login Failed");
      message.error("Google 登录失败，请重试");
      localStorage.removeItem("jwt_token");
    },
  });

  const logout = async () => {
    try {
      const response = await api.logout();
      if (response.status === 200) {
        setUserInfo(null);
        localStorage.removeItem("jwt_token");
        message.success("已退出登录");
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        message.error("退出登录失败，请重试");
      }
    } catch (error) {
      console.error("Logout failed:", error);
      message.error("退出登录失败，请重试");
    }
  };

  const languageMenu = (
    <Menu
      onClick={({ key }) => toggleLanguage(key)}
      selectedKeys={[currentLanguage]}
    >
      <Menu.Item key="en">English</Menu.Item>
      <Menu.Item key="zh">中文</Menu.Item>
      <Menu.Item key="ja">日本語</Menu.Item>
      <Menu.Item key="ko">한국어</Menu.Item>
    </Menu>
  );

  const userMenu = (
    <Menu>
      <Menu.Item key="profile">个人资料</Menu.Item>
      <Menu.Item key="logout" onClick={logout}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  const getAvatarContent = (name: string) => {
    if (/^[a-zA-Z]/.test(name)) {
      const firstWord = name.split(" ")[0];
      return firstWord.charAt(0).toUpperCase();
    } else {
      return name.charAt(name.length - 1);
    }
  };

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        marginBottom: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <div className="demo-logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={["home"]}
          items={[{ key: "home", label: "Daily Dictation" }]}
          style={{ background: "transparent" }}
        />
      </div>
      <Space>
        <Dropdown overlay={languageMenu} trigger={["click"]}>
          <a onClick={(e) => e.preventDefault()} style={{ color: "white" }}>
            <Space>
              <GlobalOutlined />
              {i18n.language === "en"
                ? "English"
                : i18n.language === "zh"
                ? "中文"
                : i18n.language === "ja"
                ? "日本語"
                : i18n.language === "ko"
                ? "한국어"
                : "Language"}
              <DownOutlined />
            </Space>
          </a>
        </Dropdown>
        {userInfo ? (
          <Dropdown overlay={userMenu} trigger={["click"]}>
            <StyledAvatar
              style={{ backgroundColor: "#f56a00", verticalAlign: "middle" }}
            >
              {getAvatarContent(userInfo.name)}
            </StyledAvatar>
          </Dropdown>
        ) : (
          <a
            onClick={() => setIsLoginModalVisible(true)}
            style={{ color: "white" }}
          >
            <Space>
              <UserOutlined />
              登录
              <DownOutlined />
            </Space>
          </a>
        )}
      </Space>
      <LoginModal
        visible={isLoginModalVisible}
        onClose={() => setIsLoginModalVisible(false)}
        onGoogleLogin={login}
      />
    </Header>
  );
};

export default AppHeader;
