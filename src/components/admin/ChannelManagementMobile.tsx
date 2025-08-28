import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Input,
  Select,
  Button,
  Card,
  Avatar,
  Tag,
  Spin,
  Empty,
  Modal,
  Tabs,
  TabsProps
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FilterOutlined,
  LinkOutlined,
  GlobalOutlined
} from "@ant-design/icons";
import { Channel } from "@/utils/type";
import MobileBackButton from "./MobileBackButton";

const { Option } = Select;
const { Search } = Input;

interface ChannelManagementMobileProps {
  channels: Channel[];
  isLoading: boolean;
  onRefresh: () => void;
  onEditChannel: (channel: Channel) => void;
  onDeleteChannel: (channel: Channel) => void;
  onAddChannel: () => void;
}

const ChannelManagementMobile: React.FC<ChannelManagementMobileProps> = ({
  channels,
  isLoading,
  onEditChannel,
  onDeleteChannel,
  onAddChannel
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [selectedVisibility, setSelectedVisibility] = useState("All");
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Filter channels
  useEffect(() => {
    let filtered = channels.filter((channel) => {
      const channelName = channel.name || "";
      const channelId = channel.id || "";
      const matchesSearch = 
        (typeof channelName === 'string' ? channelName.toLowerCase() : "").includes(searchQuery.toLowerCase()) ||
        (typeof channelId === 'string' ? channelId.toLowerCase() : "").includes(searchQuery.toLowerCase());
      
      const matchesLanguage = selectedLanguage === "All" || channel.language === selectedLanguage;
      const matchesVisibility = selectedVisibility === "All" || channel.visibility === selectedVisibility;
      
      // Tab filtering
      const matchesTab = 
        activeTab === "all" ||
        (activeTab === "public" && channel.visibility === "public") ||
        (activeTab === "private" && channel.visibility === "private");

      return matchesSearch && matchesLanguage && matchesVisibility && matchesTab;
    });

    setFilteredChannels(filtered);
  }, [channels, searchQuery, selectedLanguage, selectedVisibility, activeTab]);

  const getLanguageFlag = (language: string) => {
    switch (language) {
      case "en": return "🇺🇸";
      case "zh": return "🇨🇳";
      case "ja": return "🇯🇵";
      case "ko": return "🇰🇷";
      default: return "🌐";
    }
  };

  const getVisibilityColor = (visibility: string) => {
    return visibility === "public" ? "green" : "orange";
  };

  const handleChannelAction = (channel: Channel, action: string) => {
    switch (action) {
      case "edit":
        onEditChannel(channel);
        break;
      case "delete":
        Modal.confirm({
          title: t("confirmDelete"),
          content: t("confirmDeleteChannel", { name: channel.name }),
          okText: t("delete"),
          okType: "danger",
          cancelText: t("cancel"),
          onOk: () => onDeleteChannel(channel),
        });
        break;
      case "view":
        if (channel.link) {
          window.open(channel.link, "_blank");
        }
        break;
    }
  };

  const renderChannelCard = (channel: Channel) => (
    <Card
      key={channel.id}
      className="mb-3 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
      bodyStyle={{ padding: "16px" }}
    >
      <div className="flex items-start space-x-3">
        <Avatar
          size={48}
          src={channel.image_url}
          className="flex-shrink-0"
        >
          {channel.name?.[0]?.toUpperCase()}
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {channel.name}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-1">
                {channel.id}
              </p>
            </div>
            
            <div className="flex space-x-1">
              {channel.link && (
                <Button
                  type="text"
                  size="small"
                  icon={<LinkOutlined />}
                  onClick={() => handleChannelAction(channel, "view")}
                  className="text-green-600 dark:text-green-400"
                />
              )}
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleChannelAction(channel, "edit")}
                className="text-blue-600 dark:text-blue-400"
              />
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => handleChannelAction(channel, "delete")}
                className="text-red-600 dark:text-red-400"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <Tag color={getVisibilityColor(channel.visibility)}>
              {channel.visibility}
            </Tag>
            <Tag>
              {getLanguageFlag(channel.language)} {channel.language?.toUpperCase()}
            </Tag>
          </div>

          <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <GlobalOutlined className="mr-1" />
              <span>{t("created")}: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  const tabItems: TabsProps['items'] = [
    {
      key: 'all',
      label: `${t("all")} (${channels.length})`,
    },
    {
      key: 'public',
      label: `${t("public")} (${channels.filter(c => c.visibility === 'public').length})`,
    },
    {
      key: 'private',
      label: `${t("private")} (${channels.filter(c => c.visibility === 'private').length})`,
    },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <MobileBackButton title={t("channelManagement")} />

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="small"
          className="px-4"
        />
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <Search
          placeholder={t("searchChannels")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          prefix={<SearchOutlined />}
          allowClear
        />

        <div className="flex items-center justify-between">
          <Button
            type="text"
            icon={<FilterOutlined />}
            onClick={() => setShowFilters(!showFilters)}
            className="text-blue-600 dark:text-blue-400"
          >
            {t("filters")}
          </Button>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredChannels.length} {t("channels")}
          </div>
        </div>

        {showFilters && (
          <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("language")}
              </label>
              <Select
                value={selectedLanguage}
                onChange={setSelectedLanguage}
                className="w-full"
                size="small"
              >
                <Option value="All">{t("allLanguages")}</Option>
                <Option value="en">🇺🇸 English</Option>
                <Option value="zh">🇨🇳 中文</Option>
                <Option value="ja">🇯🇵 日本語</Option>
                <Option value="ko">🇰🇷 한국어</Option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("visibility")}
              </label>
              <Select
                value={selectedVisibility}
                onChange={setSelectedVisibility}
                className="w-full"
                size="small"
              >
                <Option value="All">{t("allVisibility")}</Option>
                <Option value="public">{t("public")}</Option>
                <Option value="private">{t("private")}</Option>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-20">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Spin size="large" />
          </div>
        ) : filteredChannels.length === 0 ? (
          <Empty
            description={t("noChannelsFound")}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <div>
            {filteredChannels.map(renderChannelCard)}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="absolute bottom-6 right-6">
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<PlusOutlined />}
          className="shadow-lg"
          onClick={onAddChannel}
        />
      </div>
    </div>
  );
};

export default ChannelManagementMobile;