import React from "react";
import { Layout, Menu, Button } from "antd";

const { Header } = Layout;

const AppHeader: React.FC = () => {
  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 8,
        padding: "0 16px",
        marginBottom: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <div className="demo-logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={["1"]}
          items={[{ key: "1", label: "nav 1" }]}
          style={{ background: "transparent" }}
        />
      </div>
      <Button type="primary">Login</Button>
    </Header>
  );
};

export default AppHeader;
