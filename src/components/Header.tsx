import React from "react";
import { Layout, Menu, Button, Space } from "antd";
import { GlobalOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useLanguageToggle } from "@/hooks/useLanguageToggle";

const { Header } = Layout;

const AppHeader: React.FC = () => {
  const { t } = useTranslation();
  const { toggleLanguage, currentLanguage } = useLanguageToggle();

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
        <Button
          icon={<GlobalOutlined />}
          onClick={toggleLanguage}
          type="text"
          style={{ color: "white" }}
        >
          {currentLanguage === "en" ? "中文" : "English"}
        </Button>
        <Button type="link">{t("signIn")}</Button>
        <Button type="link">{t("signUp")}</Button>
      </Space>
    </Header>
  );
};

export default AppHeader;
