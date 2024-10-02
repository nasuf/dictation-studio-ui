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
    <div className="h-full overflow-y-auto custom-scrollbar">
      <ChannelGrid>
        {channels.map((channel) => (
          <Link
            key={channel.id}
            to={`/dictation/video/${channel.id}`}
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
    </div>
  );
};

export default ChannelList;
