import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Channel } from "@/utils/type";
import {
  ChannelGrid,
  UniversalCard,
  UniversalContentInfo,
  UniversalContentTitle,
  ScrollableContainer,
} from "@/components/dictation/video/Widget";
import { useDispatch } from "react-redux";
import { setChannelName } from "@/redux/navigationSlice";
import { useTranslation } from "react-i18next";
import { Empty, Tag } from "antd";
import MobileHeader from "@/components/MobileHeader";

interface ChannelListProps {
  channels: Channel[];
  isLoading: boolean;
  onRefresh?: () => void;
}

const ChannelList: React.FC<ChannelListProps> = ({
  channels,
  isLoading,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [searchValue, setSearchValue] = useState("");

  // Filter channels based on search
  const filteredChannels = channels.filter((channel) =>
    channel.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Language tag color mapping - all blue
  const getLanguageColor = () => {
    return "#1890ff"; // Blue color for all languages
  };

  // Language display name mapping
  const getLanguageDisplay = (language: string) => {
    const displayMap: { [key: string]: string } = {
      english: "EN",
      chinese: "中文",
      japanese: "日本語",
      korean: "한국어",
    };
    return displayMap[language.toLowerCase()] || language.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 md:h-32 md:w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mobile Header - only visible on small screens */}
      <div className="md:hidden">
        <MobileHeader
          channelCount={channels.length}
          onRefresh={onRefresh}
          onSearch={setSearchValue}
          searchValue={searchValue}
          isLoading={isLoading}
        />
      </div>

      {/* Channel List Content */}
      <ScrollableContainer>
        {filteredChannels.length === 0 ? (
          <div className="flex justify-center items-center h-full w-full">
            <Empty
              description={
                searchValue ? t("noSearchResults") : t("noChannelsFound")
              }
            />
          </div>
        ) : (
          <ChannelGrid>
            {filteredChannels
              .sort((a, b) => a.language.localeCompare(b.language))
              .map((channel) => (
                <Link
                  key={channel.id}
                  to={`/dictation/video/${channel.id}`}
                  onClick={() => dispatch(setChannelName(channel.name))}
                  state={{ name: channel.name }}
                >
                  <UniversalCard
                    contentType="channel"
                    hoverable
                    cover={
                      <div
                        style={{ position: "relative", paddingTop: "56.25%" }}
                      >
                        <img
                          alt={channel.name}
                          src={channel.image_url}
                          onError={(e) => {
                            e.currentTarget.src = "/404.jpg";
                          }}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "8px 8px 0 0",
                          }}
                        />
                        {/* Video count badge in top-right corner */}
                        {/* <div className="absolute top-2 right-2">
                          <div className="bg-black/70 text-white text-xs font-medium px-2 py-1 rounded-lg">
                            {channel.videos?.length || 0}
                          </div>
                        </div> */}
                        {/* Language tag in bottom-left corner */}
                        <div className="absolute bottom-2 left-2">
                          <Tag
                            color={getLanguageColor()}
                            className="text-xs font-medium border-0 shadow-md"
                          >
                            {getLanguageDisplay(channel.language)}
                          </Tag>
                        </div>
                      </div>
                    }
                    styles={{ body: { padding: 0 } }}
                  >
                    <UniversalContentInfo contentType="channel">
                      <UniversalContentTitle level={5} contentType="channel">
                        {channel.name}
                      </UniversalContentTitle>
                    </UniversalContentInfo>
                  </UniversalCard>
                </Link>
              ))}
          </ChannelGrid>
        )}
      </ScrollableContainer>
    </div>
  );
};

export default ChannelList;
