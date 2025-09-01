import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Channel } from "@/utils/type";
import {
  ChannelGrid,
  ScrollableContainer,
} from "@/components/dictation/video/Widget";
import { useDispatch } from "react-redux";
import { setChannelName } from "@/redux/navigationSlice";
import { useTranslation } from "react-i18next";
import { Empty } from "antd";
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
                  className="group block transform transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1"
                >
                  <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:border-blue-500/30 dark:group-hover:border-blue-400/30">
                    {/* Main image container */}
                    <div className="relative overflow-hidden" style={{ paddingTop: "56.25%" }}>
                      <img
                        alt={channel.name}
                        src={channel.image_url}
                        onError={(e) => {
                          e.currentTarget.src = "/404.jpg";
                        }}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      
                      {/* Gradient overlay for better text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Modern language tag */}
                      <div className="absolute bottom-3 left-3">
                        <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 text-white text-xs font-semibold shadow-lg">
                          <div 
                            className="w-2 h-2 rounded-full mr-2 animate-pulse" 
                            style={{ backgroundColor: getLanguageColor() }}
                          />
                          {getLanguageDisplay(channel.language)}
                        </div>
                      </div>
                      
                      {/* Hover effect overlay */}
                      <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    
                    {/* Content section with fixed height */}
                    <div className="relative h-20 p-4 bg-gradient-to-b from-transparent to-gray-50/50 dark:to-gray-800/50">
                      {/* Title with fixed height for exactly 2 lines */}
                      <div className="h-10 mb-1 flex items-center justify-center">
                        <h3 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 leading-5 text-center">
                          {channel.name}
                        </h3>
                      </div>
                      
                      {/* Action indicator at bottom-right */}
                      <div className="absolute bottom-3 right-4">
                        <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                          <div className="w-6 h-6 rounded-full bg-blue-500 dark:bg-blue-400 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
          </ChannelGrid>
        )}
      </ScrollableContainer>
    </div>
  );
};

export default ChannelList;
