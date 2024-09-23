import { Menu, theme } from "antd";
import Sider from "antd/es/layout/Sider";
import {
  BookTwoTone,
  CustomerServiceTwoTone,
  NotificationTwoTone,
  SettingTwoTone,
} from "@ant-design/icons";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "@/lib/styles/Sider.module.css";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  path?: string;
  children?: MenuItem[];
}

const AppSider: React.FC = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const location = useLocation();
  const { t } = useTranslation();
  const userInfo = useSelector((state: RootState) => state.user.userInfo);

  const siderItems: MenuItem[] = [
    {
      key: "Dictation",
      icon: <CustomerServiceTwoTone />,
      label: t("dictation"),
      children: [
        {
          key: "VideoDictation",
          label: t("videoDictation"),
          path: "/dictation/video",
          icon: <></>,
        },
        {
          key: "WordDictation",
          label: t("wordDictation"),
          path: "/dictation/word",
          icon: <></>,
        },
      ],
    },
    {
      key: "Collection",
      icon: <BookTwoTone />,
      label: t("collection"),
      children: [
        {
          key: "VideoCollection",
          label: t("videoCollection"),
          path: "/collection/video",
          icon: <></>,
        },
        {
          key: "WordCollection",
          label: t("wordCollection"),
          path: "/collection/word",
          icon: <></>,
        },
      ],
    },
    {
      key: "FM",
      icon: <NotificationTwoTone />,
      label: t("fm"),
      path: "/radio",
    },
  ];

  if (userInfo && userInfo.role === "admin") {
    siderItems.push({
      key: "Admin",
      icon: <SettingTwoTone />,
      label: "Admin",
      children: [
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
      ],
    });
  }

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

  const defaultSelectedKeys = [
    location.pathname.split("/")[2] || "ArticalDictation",
  ];
  const defaultOpenKeys = [location.pathname.split("/")[1] || "Dictation"];

  return (
    <Sider style={{ background: colorBgContainer }} width={200}>
      <Menu
        mode="inline"
        defaultSelectedKeys={defaultSelectedKeys}
        defaultOpenKeys={defaultOpenKeys}
        style={{ height: "100%" }}
        className={styles.siderMenu}
      >
        {renderMenuItems(siderItems)}
      </Menu>
    </Sider>
  );
};

export default AppSider;
