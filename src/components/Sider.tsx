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

const AppSider: React.FC = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const location = useLocation();
  const { t } = useTranslation();
  const siderItems = [
    {
      key: "Dictation",
      icon: React.createElement(CustomerServiceTwoTone),
      label: t("dictation"),
      children: [
        {
          key: "VideoDictation",
          label: t("videoDictation"),
          path: "/dictation/video",
        },
        {
          key: "WordDictation",
          label: t("wordDictation"),
          path: "/dictation/word",
        },
      ],
    },
    {
      key: "Collection",
      icon: React.createElement(BookTwoTone),
      label: t("collection"),
      children: [
        {
          key: "VideoCollection",
          label: t("videoCollection"),
          path: "/collection/video",
        },
        {
          key: "WordCollection",
          label: t("wordCollection"),
          path: "/collection/word",
        },
      ],
    },
    {
      key: "FM",
      icon: React.createElement(NotificationTwoTone),
      label: t("fm"),
      path: "/radio",
    },
    {
      key: "Admin",
      icon: React.createElement(SettingTwoTone),
      label: "Admin",
      path: "/admin",
      children: [
        {
          key: "ChannelManagement",
          label: "Channel",
          path: "/admin/channel-management",
        },
        {
          key: "VideoManagement",
          label: "Video",
          path: "/admin/video-management",
        },
      ],
    },
  ];

  const renderMenuItems = (items: any) => {
    return items.map((item: any) => {
      if (item.children) {
        return (
          <Menu.SubMenu key={item.key} icon={item.icon} title={item.label}>
            {renderMenuItems(item.children)}
          </Menu.SubMenu>
        );
      }
      return (
        <Menu.Item key={item.key} icon={item.icon}>
          <Link to={item.path}>{item.label}</Link>
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
