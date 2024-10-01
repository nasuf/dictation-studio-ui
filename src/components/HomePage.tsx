import React from "react";
import { Typography, Button, Space } from "antd";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

const { Title, Paragraph } = Typography;

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh);
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
  color: white;
  text-align: center;
  padding: 20px;
`;

const AnimatedTitle = styled(Title)`
  animation: fadeInDown 1s ease-out;
  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const AnimatedParagraph = styled(Paragraph)`
  animation: fadeIn 1s ease-out 0.5s both;
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const StyledButton = styled(Button)`
  margin: 10px;
  animation: pulse 2s infinite;
  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  }
`;

const HomePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <HomeContainer>
      <AnimatedTitle level={1}>Daily Dictation</AnimatedTitle>
      <AnimatedParagraph>{t("homePageDescription")}</AnimatedParagraph>
      <Space size="large">
        <Link to="/dictation/video">
          <StyledButton type="primary" size="large">
            {t("startDictation")}
          </StyledButton>
        </Link>
      </Space>
    </HomeContainer>
  );
};

export default HomePage;
