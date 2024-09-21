import React from "react";
import { Layout } from "antd";

const { Footer } = Layout;

const AppFooter: React.FC = () => {
  return (
    <Footer style={{ textAlign: "center" }}>
      Daily Dictation ©{new Date().getFullYear()} Created by NASUF
    </Footer>
  );
};

export default AppFooter;
