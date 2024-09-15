import { Menu, theme } from "antd";
import Sider from "antd/es/layout/Sider";
import {
  BookTwoTone,
  CustomerServiceTwoTone,
  NotificationTwoTone,
} from "@ant-design/icons";
import React from "react";
import { MenuInfo } from "rc-menu/lib/interface";
import styles from "@/lib/styles/Sider.module.css";

interface AppSiderProps {
  onPathChange: (path: string[]) => void;
}

const AppSider: React.FC<AppSiderProps> = ({ onPathChange }) => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const siderItems = [
    {
      key: "Dictation",
      icon: React.createElement(CustomerServiceTwoTone),
      label: "听写",
      children: [
        {
          key: "ArticalDictation",
          label: "文章听写",
        },
        {
          key: "SentenceDictation",
          label: "句子听写",
        },
        {
          key: "WordDictation",
          label: "单词听写",
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
        },
        {
          key: "SentenceCollection",
          label: "句子收藏",
        },
        {
          key: "WordCollection",
          label: "单词收藏",
        },
      ],
    },
    {
      key: "FM",
      icon: React.createElement(NotificationTwoTone),
      label: "FM 广播",
    },
  ];

  const handleMenuSelect = (info: MenuInfo) => {
    const { keyPath } = info;
    const path = keyPath
      .map((key) => {
        const item =
          siderItems.find((i) => i.key === key) ||
          siderItems
            .flatMap((i) => i.children || [])
            .find((c) => c.key === key);
        return item ? item.label : key;
      })
      .reverse();
    onPathChange(["Home", ...path]);
  };

  return (
    <Sider style={{ background: colorBgContainer }} width={200}>
      <Menu
        mode="inline"
        defaultSelectedKeys={["ArticalDictation"]}
        defaultOpenKeys={["Dictation"]}
        style={{ height: "100%" }}
        items={siderItems}
        onSelect={handleMenuSelect}
        className={styles.siderMenu}
      />
    </Sider>
  );
};

export default AppSider;
