import React from "react";
import { Layout, Menu, Space, Dropdown } from "antd";
import { GlobalOutlined, DownOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useLanguageToggle } from "@/hooks/useLanguageToggle";

const { Header } = Layout;

const AppHeader: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { toggleLanguage, currentLanguage } = useLanguageToggle();

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
        <Menu
          theme="dark"
          mode="horizontal"
          style={{ background: "transparent" }}
        >
          <Menu.Item key="signin">{t("signIn")}</Menu.Item>
          <Menu.Item key="signup">{t("signUp")}</Menu.Item>
        </Menu>
      </Space>
    </Header>
  );
};

export default AppHeader;
