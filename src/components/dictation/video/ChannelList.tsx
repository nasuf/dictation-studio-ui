import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/api";
import { Channel } from "@/utils/type";
import {
  ChannelGrid,
  ChannelCard,
  ChannelImage,
  ChannelInfo,
  ChannelName,
  ScrollableContainer,
} from "@/components/dictation/video/Widget";
import { useDispatch } from "react-redux";
import { setChannelName, resetNavigation } from "@/redux/navigationSlice";

const ChannelList: React.FC = () => {
  const dispatch = useDispatch();
  const [channels, setChannels] = useState<Channel[]>([]);

  useEffect(() => {
    dispatch(resetNavigation());
    const fetchChannels = async () => {
      try {
        const response = await api.getChannels();
        setChannels(response.data);
      } catch (error) {
        console.error("Error fetching channels:", error);
      }
    };

    fetchChannels();
  }, [dispatch]);

  return (
    <ScrollableContainer>
      <ChannelGrid>
        {channels.map((channel) => (
          <Link
            key={channel.id}
            to={`/dictation/video/${channel.id}`}
            onClick={() => dispatch(setChannelName(channel.name))}
            state={{ name: channel.name }}
          >
            <ChannelCard
              hoverable
              cover={
                <ChannelImage alt={channel.name} src={channel.image_url} />
              }
              bodyStyle={{ padding: 0 }}
            >
              <ChannelInfo>
                <ChannelName level={5}>{channel.name}</ChannelName>
              </ChannelInfo>
            </ChannelCard>
          </Link>
        ))}
      </ChannelGrid>
    </ScrollableContainer>
  );
};

export default ChannelList;
