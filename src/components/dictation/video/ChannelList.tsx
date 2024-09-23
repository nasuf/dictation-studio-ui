import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "antd";
import { api } from "@/api/api";
import {
  ChannelCardGrid,
  CustomCardMeta,
  CustomHoverCard,
  ScrollableContainer,
} from "@/components/dictation/video/Widget";
import { Channel } from "@/utils/type";

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
      <ChannelCardGrid>
        {channels.map((channel) => (
          <Link
            key={channel.id}
            to={`/dictation/video/${channel.id}`}
            state={{ channelId: channel.id, channelName: channel.name }}
          >
            <CustomHoverCard
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
              <CustomCardMeta title={channel.name} />
            </CustomHoverCard>
          </Link>
        ))}
      </ChannelCardGrid>
    </ScrollableContainer>
  );
};

export default ChannelList;
