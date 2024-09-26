import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/api";
import { Channel } from "@/utils/type";
import {
  ChannelCardGrid,
  CustomHoverCard,
  CenteredCardMeta,
  ScrollableContainer,
} from "@/components/dictation/video/Widget";

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
          <Link key={channel.id} to={`/dictation/video/${channel.id}`}>
            <CustomHoverCard
              hoverable
              cover={<img alt={channel.name} src={channel.image_url} />}
            >
              <CenteredCardMeta
                title={channel.name}
                style={{ height: "23px" }} // Adjust this value to match the height of one line
              />
            </CustomHoverCard>
          </Link>
        ))}
      </ChannelCardGrid>
    </ScrollableContainer>
  );
};

export default ChannelList;
