import React from "react";
import { Layout } from "antd";
import AppHeader from "@/components/Header";
import AppContent from "@/components/Content";
import AppFooter from "@/components/Footer";
import "../global.css";

const App: React.FC = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppHeader />
      <AppContent />
      <AppFooter />
    </Layout>
  );
};

export default App;
