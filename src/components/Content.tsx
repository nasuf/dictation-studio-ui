import React, { useState } from "react";
import { Breadcrumb, Layout, theme } from "antd";

import AppSider from "@/components/Sider";
import { Word } from "@/components/dictation/Word";
import Essay from "@/components/dictation/Essay";
import Radio from "@/components/dictation/Radio";
import { Sentence } from "@/components/dictation/Sentence";

const { Content } = Layout;

const AppContent: React.FC = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [selectedPath, setSelectedPath] = useState<string[]>([
    "Home",
    "听写",
    "文章听写",
  ]);

  const componentStyle = {
    width: "640px",
    height: "390px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const renderContent = () => {
    const lastPath = selectedPath[selectedPath.length - 1];
    switch (lastPath) {
      case "单词听写":
        return <Word style={componentStyle} />;
      case "文章听写":
        return <Essay style={componentStyle} />;
      case "句子听写":
        return <Sentence style={componentStyle} />;
      case "FM 广播":
        return <Radio style={componentStyle} />;
      default:
        return null;
    }
  };

  return (
    <Content style={{ padding: "0 48px" }}>
      <Breadcrumb style={{ margin: "16px 0" }}>
        {selectedPath.map((item, index) => (
          <Breadcrumb.Item key={index}>{item}</Breadcrumb.Item>
        ))}
      </Breadcrumb>
      <Layout
        style={{
          height: "80vh",
          padding: "24px 0",
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
        }}
      >
        <AppSider onPathChange={setSelectedPath} />
        <Content
          style={{
            padding: "0 24px",
            minHeight: 280,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {renderContent()}
        </Content>
      </Layout>
    </Content>
  );
};

export default AppContent;
