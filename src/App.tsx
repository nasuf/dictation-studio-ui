import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Layout } from "antd";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import AppHeader from "@/components/Header";
import AppContent from "@/components/Content";
import AppFooter from "@/components/Footer";
import "../global.css";

const { Header, Content, Footer } = Layout;

const App: React.FC = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <Router>
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
      </Router>
    </I18nextProvider>
  );
};

export default App;
