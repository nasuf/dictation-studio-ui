import React, { useState } from "react";
import { Layout, Menu, Space, Dropdown, Button, message, Avatar } from "antd";
import { GlobalOutlined, DownOutlined, UserOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useLanguageToggle } from "@/hooks/useLanguageToggle";
import { useGoogleLogin } from "@react-oauth/google";
import { api } from "@/api/api";

const { Header } = Layout;

interface UserInfo {
  name: string;
  email: string;
  picture: string;
  user_id: string;
}

const AppHeader: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { toggleLanguage, currentLanguage } = useLanguageToggle();
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const response = await api.verifyGoogleToken(
          tokenResponse.access_token
        );
        localStorage.setItem("jwt_token", response.data.jwt_token);
        setUserInfo(response.data.user);
        message.success("登录成功");
      } catch (error) {
        console.error("Login failed:", error);
        message.error("登录失败，请重试");
        localStorage.removeItem("jwt_token");
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      console.log("Login Failed");
      message.error("Google 登录失败，请重试");
      localStorage.removeItem("jwt_token");
    },
  });

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
      <Menu.Item
        key="logout"
        onClick={() => {
          setUserInfo(null);
          localStorage.removeItem("jwt_token");
          message.success("已退出登录");
        }}
      >
        退出登录
      </Menu.Item>
    </Menu>
  );

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
                ? "한国어"
                : "Language"}
              <DownOutlined />
            </Space>
          </a>
        </Dropdown>
        {userInfo ? (
          <Dropdown overlay={userMenu} trigger={["click"]}>
            <Avatar src={userInfo.picture} icon={<UserOutlined />} />
          </Dropdown>
        ) : (
          <Button onClick={() => login()} loading={isLoading}>
            Sign in with Google
          </Button>
        )}
      </Space>
    </Header>
  );
};

export default AppHeader;
