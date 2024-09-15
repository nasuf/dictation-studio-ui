import React from "react";
import { Layout, Menu, Button, Space } from "antd";

const { Header } = Layout;

const AppHeader: React.FC = () => {
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
        <Button type="link">Sign In</Button>
        <Button type="link">Sign Up</Button>
      </Space>
    </Header>
  );
};

export default AppHeader;
