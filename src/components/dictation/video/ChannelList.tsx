import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/api";
import {
  ChannelGrid,
  ChannelCard,
  ChannelImage,
  ChannelInfo,
  ChannelName,
  ScrollableContainer,
} from "@/components/dictation/video/Widget";
import { useDispatch, useSelector } from "react-redux";
import { setChannelName, resetNavigation } from "@/redux/navigationSlice";
import { setChannels } from "@/redux/channelSlice";
import { RootState } from "@/redux/store";

const ChannelList: React.FC = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const channels = useSelector((state: RootState) => state.channel.channels);

  useEffect(() => {
    dispatch(resetNavigation());
    const fetchChannels = async () => {
      try {
        if (channels.length === 0) {
          const response = await api.getChannels();
          dispatch(setChannels(response.data));
        }
      } catch (error) {
        console.error("Error fetching channels:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
              styles={{ body: { padding: 0 } }}
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
