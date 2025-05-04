import React from "react";
import { Link } from "react-router-dom";
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
import { setChannelName } from "@/redux/navigationSlice";
import { useTranslation } from "react-i18next";
import { Empty } from "antd";

interface ChannelListProps {
  channels: Channel[];
  isLoading: boolean;
}

const ChannelList: React.FC<ChannelListProps> = ({ channels, isLoading }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 频道列表 */}
      <ScrollableContainer>
        {channels.length === 0 ? (
          <div className="flex justify-center items-center h-full w-full">
            <Empty description={t("noChannelsFound")} />
          </div>
        ) : (
          <ChannelGrid>
            {channels
              .sort((a, b) => a.language.localeCompare(b.language))
              .map((channel) => (
                <Link
                  key={channel.id}
                  to={`/dictation/video/${channel.id}`}
                  onClick={() => dispatch(setChannelName(channel.name))}
                  state={{ name: channel.name }}
                >
                  <ChannelCard
                    hoverable
                    cover={
                      <ChannelImage
                        alt={channel.name}
                        src={channel.image_url}
                        onError={(e) => {
                          e.currentTarget.src = "/404.jpg";
                        }}
                      />
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
        )}
      </ScrollableContainer>
    </div>
  );
};

export default ChannelList;
