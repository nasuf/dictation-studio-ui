import React from "react";
import { Layout } from "antd";
import AppHeader from "@/components/Header";
import AppContent from "@/components/Content";
import AppFooter from "@/components/Footer";
import "../global.css";

const { Header, Content, Footer } = Layout;

const App: React.FC = () => {
  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      <Header style={{ padding: 0, overflow: "hidden" }}>
        <AppHeader />
      </Header>
      <Content style={{ padding: 0, overflow: "hidden" }}>
        <AppContent />
      </Content>
      <Footer style={{ padding: 0, overflow: "hidden" }}>
        <AppFooter />
      </Footer>
    </Layout>
  );
};

export default App;
