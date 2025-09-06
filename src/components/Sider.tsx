import { Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { setChannelData } from "@/redux/videoProgressSlice";
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
  const dispatch = useDispatch();
  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const videoProgressState = useSelector((state: RootState) => state.videoProgress);
  const [siderItems, setSiderItems] = useState<MenuItem[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isChannelListMode, setIsChannelListMode] = useState(false);
  const [isVideoListMode, setIsVideoListMode] = useState(false);
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [userIsScrolling, setUserIsScrolling] = useState(false);
  const scrollTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const autoScrollTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Loading component for Sider
  const SiderLoading: React.FC = () => (
    <div className="flex items-center justify-center h-32 py-8">
      <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin"></div>
    </div>
  );

  // 滚动到当前选中的项目
  const scrollToSelectedItem = useCallback((selectedKey: string) => {
    if (!selectedKey || !menuRef.current || userIsScrolling) {
      console.log('Auto-scroll skipped:', { selectedKey, hasMenuRef: !!menuRef.current, userIsScrolling });
      return;
    }
    
    // 清除之前的自动滚动定时器
    if (autoScrollTimeoutRef.current) {
      clearTimeout(autoScrollTimeoutRef.current);
    }
    
    const scrollToElement = () => {
      if (!menuRef.current || userIsScrolling) return;
      
      console.log('Attempting to scroll to:', selectedKey);
      
      // 尝试找到选中的菜单项
      const allMenuItems = menuRef.current.querySelectorAll('li.ant-menu-item');
      console.log('Total menu items found:', allMenuItems.length);
      
      let selectedElement: HTMLElement | null = null;
      
      // 方法1: 查找包含选中样式的元素
      selectedElement = menuRef.current.querySelector('li.ant-menu-item-selected') as HTMLElement;
      
      // 方法2: 如果没找到，通过 key 属性查找
      if (!selectedElement) {
        allMenuItems.forEach((item) => {
          const itemKey = item.getAttribute('data-key') || item.getAttribute('key');
          if (itemKey === selectedKey) {
            selectedElement = item as HTMLElement;
          }
        });
      }
      
      // 方法3: 如果还是没找到，查找链接内容匹配的元素
      if (!selectedElement) {
        allMenuItems.forEach((item) => {
          const link = item.querySelector('a');
          if (link && link.getAttribute('href')?.includes(selectedKey)) {
            selectedElement = item as HTMLElement;
          }
        });
      }
      
      console.log('Selected element found:', selectedElement);
      
      if (selectedElement && !userIsScrolling) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
        console.log('Scroll initiated for element:', selectedElement);
      }
    };
    
    // 只执行一次，延迟确保DOM更新完成
    autoScrollTimeoutRef.current = setTimeout(scrollToElement, 800);
  }, [userIsScrolling]);

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

  // 获取频道数据 - 优先从Redux获取，如果没有则从API获取
  const fetchChannels = async () => {
    try {
      console.log('Fetching channels');
      setIsLoadingChannels(true);
      
      // 首先尝试从Redux获取数据
      const reduxChannels = videoProgressState.channels;
      
      if (reduxChannels && reduxChannels.length > 0) {
        console.log('Using channels from Redux store');
        setChannels(reduxChannels);
        setIsLoadingChannels(false);
        return;
      }
      
      // 如果Redux中没有数据，则从API获取
      console.log('Redux channels not available, fetching from API');
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
      setChannels([]);
    } finally {
      setIsLoadingChannels(false);
    }
  };

  // 获取视频数据 - 优先从Redux获取，如果没有则从API获取
  const fetchVideos = async (channelId: string) => {
    try {
      console.log('Fetching videos for channel:', channelId);
      setIsLoadingVideos(true);
      
      // 首先尝试从Redux获取数据
      const reduxVideos = videoProgressState.videos[channelId];
      const reduxProgress = videoProgressState.videoProgress[channelId];
      
      if (reduxVideos && reduxProgress) {
        console.log('Using data from Redux store');
        setVideos(reduxVideos);
        setIsLoadingVideos(false);
        return;
      }
      
      // 如果Redux中没有数据，则从API获取
      console.log('Redux data not available, fetching from API');
      const [videoResponse, progressResponse] = await Promise.all([
        api.getVideoList(channelId, VISIBILITY_OPTIONS.Public),
        api.getChannelProgress(channelId),
      ]);
      console.log('Video API response:', videoResponse);
      console.log('Progress API response:', progressResponse);
      
      // Check if response and response.data exist and are valid
      if (videoResponse && videoResponse.data && videoResponse.data.videos && Array.isArray(videoResponse.data.videos)) {
        setVideos(videoResponse.data.videos);
        
        // Store data in Redux for consistent access
        if (progressResponse && progressResponse.data && progressResponse.data.progress) {
          dispatch(setChannelData({
            channelId: channelId,
            videos: videoResponse.data.videos,
            progress: progressResponse.data.progress
          }));
        }
      } else {
        console.warn('Invalid video data received:', videoResponse);
        setVideos([]);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
      setVideos([]);
    } finally {
      setIsLoadingVideos(false);
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
        setIsLoadingChannels(false); // Reset loading state
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
        setIsLoadingVideos(false); // Reset loading state
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
        setIsLoadingChannels(false); // Reset loading states
        setIsLoadingVideos(false);
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

  // 自动滚动到选中项目
  useEffect(() => {
    if (selectedKeys.length > 0) {
      const selectedKey = selectedKeys[0];
      console.log('Auto-scroll effect triggered:', {
        selectedKey,
        isChannelListMode,
        isVideoListMode,
        channelsCount: channels.length,
        videosCount: videos.length
      });
      
      // 只有在有数据时才滚动
      if ((isChannelListMode && channels.length > 0) || (isVideoListMode && videos.length > 0)) {
        console.log('Triggering scroll to:', selectedKey);
        scrollToSelectedItem(selectedKey);
      }
    }
  }, [selectedKeys, channels, videos, isChannelListMode, isVideoListMode, scrollToSelectedItem]);

  // 额外的滚动触发器 - 当模式变化时
  useEffect(() => {
    if (selectedKeys.length > 0) {
      const selectedKey = selectedKeys[0];
      // 延迟更长时间确保渲染完成
      const timer = setTimeout(() => {
        if ((isChannelListMode && channels.length > 0) || (isVideoListMode && videos.length > 0)) {
          console.log('Mode change scroll trigger for:', selectedKey);
          scrollToSelectedItem(selectedKey);
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isChannelListMode, isVideoListMode, selectedKeys, channels.length, videos.length, scrollToSelectedItem]);

  // 用户滚动检测
  useEffect(() => {
    const handleUserScroll = () => {
      setUserIsScrolling(true);
      
      // 清除之前的定时器
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // 2秒后重置用户滚动状态
      scrollTimeoutRef.current = setTimeout(() => {
        setUserIsScrolling(false);
      }, 2000);
    };

    const container = menuRef.current;
    if (container) {
      container.addEventListener('scroll', handleUserScroll);
      container.addEventListener('wheel', handleUserScroll);
      container.addEventListener('touchmove', handleUserScroll);
      
      return () => {
        container.removeEventListener('scroll', handleUserScroll);
        container.removeEventListener('wheel', handleUserScroll);
        container.removeEventListener('touchmove', handleUserScroll);
      };
    }
  }, [isChannelListMode, isVideoListMode]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (autoScrollTimeoutRef.current) {
        clearTimeout(autoScrollTimeoutRef.current);
      }
    };
  }, []);

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
    
    return filteredVideos.map((video) => {
      // 从Redux获取进度数据
      const channelProgress = videoProgressState.videoProgress[currentChannelId] || {};
      const progress = channelProgress[video.video_id] || 0;
      const progressPercentage = Math.min(Math.max(progress, 0), 100);
      
      return (
        <Menu.Item
          key={video.video_id}
          className="modern-menu-item-sider hover:!text-blue-500 [&.ant-menu-item-selected]:!text-blue-500 relative overflow-hidden"
        >
          {/* Progress background */}
          <div 
            className="absolute inset-0 bg-green-200/40 dark:bg-green-600/25 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
          
          <Link to={`/dictation/video/${currentChannelId}/${video.video_id}`} className="hover:!text-blue-500 flex items-center gap-3 relative z-10">
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
      );
    });
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
        ref={menuRef}
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
            ? (isLoadingVideos ? <SiderLoading /> : renderVideoItems())
            : isChannelListMode 
              ? (isLoadingChannels ? <SiderLoading /> : renderChannelItems())
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
