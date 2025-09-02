import { Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import React, { useEffect, useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { MenuItem, Channel, Video } from "@/utils/type";
import { api } from "@/api/api";
import { VISIBILITY_OPTIONS, LANGUAGES } from "@/utils/const";
import { SearchOutlined } from "@ant-design/icons";

// Scrolling text component for truncated content
interface ScrollingTextProps {
  text: string;
  className?: string;
  title?: string;
}

const ScrollingText: React.FC<ScrollingTextProps> = ({ text, className = "", title }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [shouldScroll, setShouldScroll] = useState(false);
  const textRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textRef.current && containerRef.current) {
      const isOverflowing = textRef.current.scrollWidth > containerRef.current.clientWidth;
      setShouldScroll(isOverflowing);
    }
  }, [text]);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={title || text}
    >
      <div
        ref={textRef}
        className={`whitespace-nowrap transition-transform duration-[2000ms] ease-linear ${
          !isHovered ? 'truncate' : ''
        }`}
        style={{
          transform: isHovered && shouldScroll 
            ? `translateX(calc(${containerRef.current?.clientWidth || 0}px - 100%))` 
            : 'translateX(0)'
        }}
      >
        {text}
      </div>
    </div>
  );
};

interface AppSiderProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

const AppSider: React.FC<AppSiderProps> = ({
  collapsed = false,
  onCollapse,
}) => {
  const location = useLocation();
  const { t } = useTranslation();
  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const [siderItems, setSiderItems] = useState<MenuItem[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isChannelListMode, setIsChannelListMode] = useState(false);
  const [isVideoListMode, setIsVideoListMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // 检测屏幕尺寸
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768; // md breakpoint
      setIsMobile(mobile);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // 获取频道数据
  const fetchChannels = async () => {
    try {
      console.log('Fetching channels');
      const response = await api.getChannels(
        VISIBILITY_OPTIONS.Public,
        LANGUAGES.All
      );
      console.log('Channel API response:', response);
      
      // Ensure we always set an array
      if (response && response.data && Array.isArray(response.data)) {
        setChannels(response.data);
      } else {
        console.warn('Invalid channel data received:', response);
        setChannels([]);
      }
    } catch (error) {
      console.error("Error fetching channels:", error);
      // Set empty array on error
      setChannels([]);
    }
  };

  // 获取视频数据
  const fetchVideos = async (channelId: string) => {
    try {
      console.log('Fetching videos for channel:', channelId);
      const response = await api.getVideoList(
        channelId,
        VISIBILITY_OPTIONS.Public
      );
      console.log('Video API response:', response);
      
      // Check if response and response.data exist and are valid
      if (response && response.data && response.data.videos && Array.isArray(response.data.videos)) {
        setVideos(response.data.videos);
      } else {
        console.warn('Invalid video data received:', response);
        setVideos([]);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
      // Set empty array on error
      setVideos([]);
    }
  };

  const mainSiderItems: MenuItem[] = [
    {
      key: "Video Dictation",
      // icon: <CustomerServiceOutlined />,
      label: t("videoDictation"),
      path: "/dictation/video",
    },
    // {
    //   key: "Word Collection",
    //   icon: <BookTwoTone />,
    //   label: t("wordCollection"),
    //   path: "/dictation/word",
    // },
    {
      key: "DictationProgress",
      // icon: <HistoryOutlined />,
      label: t("progress"),
      path: "/dictation/progress",
    },
  ];

  const profileSiderItems: MenuItem[] = [
    {
      key: "Information",
      // icon: <IdcardTwoTone />,
      label: t("information"),
      path: "/profile/information",
    },
    // {
    //   key: "DictationProgress",
    //   icon: <CustomerServiceTwoTone />,
    //   label: t("dictationProgress"),
    //   path: "/profile/progress",
    // },
    {
      key: "UpgradePlan",
      // icon: <RocketTwoTone />,
      label: t("upgradePlan"),
      path: "/profile/upgrade-plan",
    },
    {
      key: "ChannelRecommendation",
      // icon: <ContainerTwoTone />,
      label: t("channelRecommendation"),
      path: "/profile/channel-recommendation",
    },
    {
      key: "Feedback",
      // icon: <PlusCircleTwoTone />,
      label: t("feedback"),
      path: "/profile/feedback",
    },
    {
      key: "VideoErrorReports",
      // icon: <ExclamationCircleTwoTone />,
      label: t("videoErrorReports"),
      path: "/profile/video-error-reports",
    },
    {
      key: "SupportDeveloper",
      // icon: <HeartTwoTone />,
      label: t("supportDeveloper"),
      path: "/profile/reward-developer",
    },
  ];

  const adminSiderItems: MenuItem[] = [
    {
      key: "UserManagement",
      label: "User",
      path: "/admin/user",
      icon: <></>,
    },
    {
      key: "ChannelManagement",
      label: "Channel",
      path: "/admin/channel",
      icon: <></>,
    },
    {
      key: "VideoManagement",
      label: "Video",
      path: "/admin/video",
      icon: <></>,
    },
    {
      key: "FeedbackManagement",
      label: "Feedback",
      path: "/admin/feedback",
      icon: <></>,
    },
    {
      key: "VideoErrorReportManagement",
      label: "Video Error Reports",
      path: "/admin/video-error-reports",
      icon: <></>,
    },
  ];

  useEffect(() => {
    const getSiderItems = async () => {
      const pathSegments = location.pathname.split("/");
      const isVideoListPage = pathSegments.length === 4 && 
                              pathSegments[1] === "dictation" && 
                              pathSegments[2] === "video" && 
                              pathSegments[3]; // channelId exists
      const isVideoMainPage = pathSegments.length === 5 && 
                              pathSegments[1] === "dictation" && 
                              pathSegments[2] === "video" && 
                              pathSegments[3] && // channelId exists
                              pathSegments[4]; // videoId exists
      
      if (isVideoMainPage) {
        // 进入视频列表模式
        setIsChannelListMode(false);
        setIsVideoListMode(true);
        setChannels([]); // Clear channels when switching modes
        const currentChannelId = pathSegments[3];
        const currentVideoId = pathSegments[4];
        await fetchVideos(currentChannelId);
        
        // 设置当前选中的视频
        setSelectedKeys([currentVideoId]);
      } else if (isVideoListPage) {
        // 进入频道列表模式
        setIsChannelListMode(true);
        setIsVideoListMode(false);
        setVideos([]); // Clear videos when switching modes
        await fetchChannels();
        
        // 设置当前选中的频道
        const currentChannelId = pathSegments[3];
        setSelectedKeys([currentChannelId]);
      } else {
        // 正常的侧边栏模式
        setIsChannelListMode(false);
        setIsVideoListMode(false);
        setChannels([]); // Clear data when switching to normal mode
        setVideos([]);
        let items: MenuItem[] = [];
        if (location.pathname.includes("/profile")) {
          items = profileSiderItems;
        } else if (location.pathname.includes("/admin")) {
          items = adminSiderItems;
        } else {
          items = mainSiderItems;
        }
        setSiderItems(items);
        const currentKey =
          items.find((item) => item.path === location.pathname)?.key ||
          pathSegments[2] ||
          "Video Dictation";
        setSelectedKeys([currentKey]);
      }
    };
    getSiderItems();
  }, [location.pathname, userInfo, t]);

  const renderMenuItems = (items: MenuItem[]) => {
    return items.map((item) => {
      if (item.children) {
        return (
          <Menu.SubMenu key={item.key} icon={item.icon} title={item.label}>
            {renderMenuItems(item.children)}
          </Menu.SubMenu>
        );
      }
      return (
        <Menu.Item
          key={item.key}
          icon={item.icon}
          className="modern-menu-item-sider hover:!text-blue-500 [&.ant-menu-item-selected]:!text-blue-500"
        >
          <Link to={item.path || ""} className="hover:!text-blue-500 [&.ant-menu-item-selected_&]:!text-blue-500">
          <ScrollingText text={item.label} />
        </Link>
        </Menu.Item>
      );
    });
  };

  // 过滤频道列表
  const filteredChannels = useMemo(() => {
    if (!Array.isArray(channels)) return [];
    if (!searchTerm) return channels;
    
    return channels.filter((channel) =>
      channel.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [channels, searchTerm]);

  const renderChannelItems = () => {
    return filteredChannels.map((channel) => (
      <Menu.Item
        key={channel.id}
        className="modern-menu-item-sider hover:!text-blue-500 [&.ant-menu-item-selected]:!text-blue-500"
      >
        <Link to={`/dictation/video/${channel.id}`} className="hover:!text-blue-500 flex items-center gap-3">
          <img 
            src={channel.image_url} 
            alt={channel.name}
            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
            onError={(e) => {
              // Fallback to a default icon if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0 hidden">
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              {channel.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <ScrollingText text={channel.name} className="flex-1" />
        </Link>
      </Menu.Item>
    ));
  };

  // 过滤视频列表
  const filteredVideos = useMemo(() => {
    if (!Array.isArray(videos)) return [];
    if (!searchTerm) return videos;
    
    return videos.filter((video) =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [videos, searchTerm]);

  const renderVideoItems = () => {
    const pathSegments = location.pathname.split("/");
    const currentChannelId = pathSegments[3]; // Get channelId from current path
    
    return filteredVideos.map((video) => (
      <Menu.Item
        key={video.video_id}
        className="modern-menu-item-sider hover:!text-blue-500 [&.ant-menu-item-selected]:!text-blue-500"
      >
        <Link to={`/dictation/video/${currentChannelId}/${video.video_id}`} className="hover:!text-blue-500 flex items-center gap-3">
          <img 
            src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
            alt={video.title}
            className="w-6 h-6 rounded object-cover flex-shrink-0"
            onError={(e) => {
              // Fallback to a default icon if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="w-6 h-6 rounded bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0 hidden">
            <svg className="w-3 h-3 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 5v10l8-5z"/>
            </svg>
          </div>
          <ScrollingText text={video.title} className="flex-1" title={video.title} />
        </Link>
      </Menu.Item>
    ));
  };

  const defaultOpenKeys = [location.pathname.split("/")[1] || "Dictation"];

  return (
    <Sider
      className={`modern-sider ${
        isMobile
          ? "shadow-xl border-r border-slate-300 dark:border-slate-600"
          : ""
      }`}
      width={200}
      collapsedWidth={0}
      collapsed={collapsed}
      onCollapse={onCollapse}
      collapsible={false}
      trigger={null}
      style={{
        overflow: "hidden",
        height: isMobile ? "calc(100vh - 3rem)" : "100%", // 3rem = h-12 header height
        position: isMobile ? "fixed" : "relative",
        top: isMobile ? "3rem" : "auto", // Align with header bottom
        left: isMobile && collapsed ? -200 : 0,
        zIndex: isMobile ? 1000 : "auto",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Background Pattern */}
      <div className="sider-pattern"></div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="sider-floating-element"
            style={{
              width: `${8 + i * 3}px`,
              height: `${8 + i * 3}px`,
              left: `${20 + i * 50}%`,
              top: `${20 + i * 40}%`,
              animationDelay: `${i * 1.5}s`,
              animationDuration: `${5 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Fixed custom search box at top */}
      {(isChannelListMode || isVideoListMode) && (
        <div className="flex-shrink-0 py-4 border-b border-gray-200/50 dark:border-gray-700/50 relative z-10" style={{ paddingLeft: '12px', paddingRight: '12px' }}>
          <div 
            className="relative group"
            onMouseEnter={() => setSearchFocused(true)}
            onMouseLeave={() => !searchInputRef.current?.matches(':focus') && setSearchFocused(false)}
          >
            {/* Search Icon */}
            <SearchOutlined 
              className={`absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300 transition-all duration-300 ease-out z-10 ${
                searchFocused ? 'translate-x-[-8px] text-blue-500 dark:text-blue-400' : 'translate-x-0'
              }`}
            />
            
            {/* Input Field */}
            <input
              ref={searchInputRef}
              type="text"
              placeholder={isChannelListMode ? t("searchChannels") : t("searchVideos")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={`w-full bg-transparent border-none outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 ease-out ${
                searchFocused ? 'pl-6' : 'pl-8'
              }`}
              autoComplete="off"
            />
            
            {/* Animated Underline */}
            <div className="relative mt-1 h-px">
              {/* Base underline */}
              <div className="absolute inset-0 bg-gray-300 dark:bg-gray-600"></div>
              {/* Animated focus underline */}
              <div 
                className={`absolute inset-0 bg-blue-500 dark:bg-blue-400 transform transition-all duration-300 ease-out origin-left ${
                  searchFocused ? 'scale-x-100' : 'scale-x-0'
                }`}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable content area */}
      <div
        className="flex-1 overflow-y-auto custom-scrollbar relative z-10"
        style={{ 
          height: (isChannelListMode || isVideoListMode) ? "calc(100% - 4rem)" : "calc(100% - 2rem)", 
          padding: "1rem 0" 
        }}
      >
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          defaultOpenKeys={defaultOpenKeys}
          style={{
            background: "transparent",
            border: "none",
            minHeight: "auto",
          }}
          className="bg-transparent [&_.ant-menu-item:hover]:!text-blue-500 [&_.ant-menu-item-selected]:!text-blue-500 [&_.ant-menu-item:hover>a]:!text-blue-500 [&_.ant-menu-item-selected>a]:!text-blue-500 [&_.ant-menu-item:hover_.ant-menu-title-content]:!text-blue-500 [&_.ant-menu-item-selected_.ant-menu-title-content]:!text-blue-500"
          inlineCollapsed={collapsed}
          theme="light"
        >
          {isVideoListMode 
            ? renderVideoItems() 
            : isChannelListMode 
              ? renderChannelItems() 
              : renderMenuItems(siderItems)}
        </Menu>
      </div>

      {/* Mobile overlay to close sider when clicking outside */}
      {isMobile && !collapsed && (
        <div
          className="modern-sider-overlay"
          onClick={() => onCollapse?.(true)}
        />
      )}
    </Sider>
  );
};

export default AppSider;
