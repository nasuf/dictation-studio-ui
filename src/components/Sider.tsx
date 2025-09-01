import { Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { MenuItem } from "@/utils/type";

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
    const getSiderItems = () => {
      let items: MenuItem[] = [];
      if (location.pathname.includes("/profile")) {
        items = profileSiderItems;
      } else if (location.pathname.includes("/admin")) {
        items = adminSiderItems;
      } else {
        items = mainSiderItems;
      }
      setSiderItems(items);
      const pathSegments = location.pathname.split("/");
      const currentKey =
        items.find((item) => item.path === location.pathname)?.key ||
        pathSegments[2] ||
        "Video Dictation";
      setSelectedKeys([currentKey]);
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
          className="modern-menu-item-sider"
        >
          <Link to={item.path || ""}>{item.label}</Link>
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
      collapsedWidth={isMobile ? 0 : 80}
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

      <div
        className="flex-1 overflow-y-auto custom-scrollbar relative z-10"
        style={{ height: "calc(100% - 2rem)", padding: "1rem 0" }}
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
          className="bg-transparent"
          inlineCollapsed={collapsed}
        >
          {renderMenuItems(siderItems)}
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
