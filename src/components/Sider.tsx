import { Menu, theme } from "antd";
import Sider from "antd/es/layout/Sider";
import {
  BookTwoTone,
  CustomerServiceTwoTone,
  NotificationTwoTone,
} from "@ant-design/icons";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "@/lib/styles/Sider.module.css";

const AppSider: React.FC = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const location = useLocation();

  const siderItems = [
    {
      key: "Dictation",
      icon: React.createElement(CustomerServiceTwoTone),
      label: "听写",
      children: [
        {
          key: "ArticalDictation",
          label: "文章听写",
          path: "/dictation/essay",
        },
        {
          key: "WordDictation",
          label: "单词听写",
          path: "/dictation/word",
        },
      ],
    },
    {
      key: "Collection",
      icon: React.createElement(BookTwoTone),
      label: "收藏",
      children: [
        {
          key: "ArticalCollection",
          label: "文章收藏",
          path: "/collection/essay",
        },
        {
          key: "WordCollection",
          label: "单词收藏",
          path: "/collection/word",
        },
      ],
    },
    {
      key: "FM",
      icon: React.createElement(NotificationTwoTone),
      label: "FM 广播",
      path: "/radio",
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
