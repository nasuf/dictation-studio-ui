import React from "react";
import { Layout } from "antd";
import AppHeader from "@/components/Header";
import AppContent from "@/components/Content";
import AppFooter from "@/components/Footer";

const App: React.FC = () => {
  return (
    <Layout>
      <AppHeader />
      <AppContent />
      <AppFooter />
    </Layout>
  );
};

export default App;
