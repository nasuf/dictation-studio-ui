import React, { useState } from "react";
import { Breadcrumb, Layout, theme } from "antd";

import AppSider from "@/components/Sider";
import { Word } from "@/components/dictation/Word";
import Essay from "@/components/dictation/Essay";

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
          {selectedPath.includes("单词听写") ? (
            <Word style={componentStyle} />
          ) : (
            <Essay style={componentStyle} />
          )}
        </Content>
      </Layout>
    </Content>
  );
};

export default AppContent;
