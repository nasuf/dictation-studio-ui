import React from "react";
import { Layout } from "antd";

const { Footer } = Layout;

const AppFooter: React.FC = () => {
  return (
    <Footer
      style={{ textAlign: "center" }}
      className="bg-gradient-to-r dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 text-gray-600 dark:text-gray-400"
    >
      Daily Dictation ©{new Date().getFullYear()} Created by NASUF
    </Footer>
  );
};

export default AppFooter;
