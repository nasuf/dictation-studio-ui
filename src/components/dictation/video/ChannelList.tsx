import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, Avatar } from "antd";
import { api } from "@/api/api";
import { HoverCard } from "@/components/dictation/video/Widget";
import styled from "styled-components";

interface Channel {
  id: string;
  name: string;
  image_url: string;
}

const ScrollableContainer = styled.div`
  height: 100%;
  overflow-y: auto;
  padding: 20px;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  align-content: start;
`;

const ChannelList: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await api.getChannels();
        setChannels(response.data);
      } catch (error) {
        console.error("Error fetching channels:", error);
      }
    };

    fetchChannels();
  }, []);

  return (
    <ScrollableContainer>
      <CardGrid>
        {channels.map((channel) => (
          <Link
            key={channel.id}
            to={`/dictation/video/${channel.id}`}
            state={{ channelId: channel.id, channelName: channel.name }}
          >
            <HoverCard
              hoverable
              style={{ width: "100%", textAlign: "center" }}
              cover={
                <Avatar
                  size={200}
                  src={channel.image_url}
                  style={{
                    margin: "20px auto",
                  }}
                />
              }
            >
              <Card.Meta title={channel.name} />
            </HoverCard>
          </Link>
        ))}
      </CardGrid>
    </ScrollableContainer>
  );
};

export default ChannelList;
