import { Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import {
  BookTwoTone,
  ContainerTwoTone,
  CustomerServiceTwoTone,
  IdcardTwoTone,
  PlusCircleTwoTone,
  RocketTwoTone,
} from "@ant-design/icons";
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
      icon: <CustomerServiceTwoTone />,
      label: t("videoDictation"),
      path: "/dictation/video",
    },
    {
      key: "Word Collection",
      icon: <BookTwoTone />,
      label: t("wordCollection"),
      path: "/dictation/word",
    },
  ];

  const profileSiderItems: MenuItem[] = [
    {
      key: "Information",
      icon: <IdcardTwoTone />,
      label: t("information"),
      path: "/profile/information",
    },
    {
      key: "DictationProgress",
      icon: <CustomerServiceTwoTone />,
      label: t("dictationProgress"),
      path: "/profile/progress",
    },
    {
      key: "UpgradePlan",
      icon: <RocketTwoTone />,
      label: t("upgradePlan"),
      path: "/profile/upgrade-plan",
    },
    {
      key: "ChannelRecommendation",
      icon: <ContainerTwoTone />,
      label: t("channelRecommendation"),
      path: "/profile/channel-recommendation",
    },
    {
      key: "Feedback",
      icon: <PlusCircleTwoTone />,
      label: t("feedback"),
      path: "/profile/feedback",
    },
  ];

  const adminSiderItems: MenuItem[] = [
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
      key: "UserManagement",
      label: "User",
      path: "/admin/user",
      icon: <></>,
    },
    {
      key: "FeedbackManagement",
      label: "Feedback",
      path: "/admin/feedback",
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
        <Menu.Item key={item.key} icon={item.icon}>
          <Link to={item.path || ""}>{item.label}</Link>
        </Menu.Item>
      );
    });
  };

  const defaultOpenKeys = [location.pathname.split("/")[1] || "Dictation"];

  return (
    <Sider
      className="bg-white dark:bg-gray-800"
      width={200}
      collapsedWidth={isMobile ? 0 : 80}
      collapsed={collapsed}
      onCollapse={onCollapse}
      collapsible={false}
      trigger={null}
      style={{
        overflow: "auto",
        height: "100%",
        position: isMobile ? "fixed" : "relative",
        left: isMobile && collapsed ? -200 : 0,
        zIndex: isMobile ? 1000 : "auto",
        transition: "all 0.2s",
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={selectedKeys}
        defaultOpenKeys={defaultOpenKeys}
        style={{ height: "100%" }}
        className="bg-white dark:bg-gray-800"
        inlineCollapsed={collapsed}
      >
        {renderMenuItems(siderItems)}
      </Menu>
    </Sider>
  );
};

export default AppSider;
