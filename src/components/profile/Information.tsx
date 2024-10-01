import React, { useEffect, useState } from "react";
import { Card, Avatar, Typography, Descriptions, Spin } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import styled from "styled-components";

const { Title } = Typography;

const StyledCard = styled(Card)`
  max-width: 600px;
  margin: 20px auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const AvatarContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const StyledAvatar = styled(Avatar)`
  width: 120px;
  height: 120px;
`;

const Information: React.FC = () => {
  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userInfo) {
      setLoading(false);
    }
  }, [userInfo]);

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <StyledCard>
      <AvatarContainer>
        <StyledAvatar src={userInfo?.avatar} icon={<UserOutlined />} />
      </AvatarContainer>
      <Title level={2} style={{ textAlign: "center" }}>
        {userInfo?.username}
      </Title>
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Email">{userInfo?.email}</Descriptions.Item>
        <Descriptions.Item label="Role">{userInfo?.role}</Descriptions.Item>
      </Descriptions>
    </StyledCard>
  );
};

export default Information;
