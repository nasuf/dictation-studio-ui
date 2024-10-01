import { Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import {
  BookTwoTone,
  CustomerServiceTwoTone,
  NotificationTwoTone,
  SettingTwoTone,
  IdcardTwoTone,
} from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { MenuItem } from "@/utils/type";

const AppSider: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const [siderItems, setSiderItems] = useState<MenuItem[]>([]);

  const mainSiderItems: MenuItem[] = [
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

  const profileSiderItems: MenuItem[] = [
    {
      key: "Information",
      icon: <IdcardTwoTone />,
      label: t("information"),
      path: "/profile/infomation",
    },
    {
      key: "DictationProgress",
      icon: <CustomerServiceTwoTone />,
      label: t("dictationProgress"),
      path: "/profile/progress",
    },
  ];

  const adminSiderItems: MenuItem[] = [
    {
      key: "Admin",
      icon: <SettingTwoTone />,
      label: t("adminPanel"),
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
        {
          key: "UserManagement",
          label: "User",
          path: "/admin/user",
          icon: <></>,
        },
      ],
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

  const defaultSelectedKeys = [
    location.pathname.split("/")[2] || "ArticalDictation",
  ];
  const defaultOpenKeys = [location.pathname.split("/")[1] || "Dictation"];

  return (
    <Sider className="bg-white dark:bg-gray-800" width={200}>
      <Menu
        mode="inline"
        defaultSelectedKeys={defaultSelectedKeys}
        defaultOpenKeys={defaultOpenKeys}
        style={{ height: "100%" }}
        className="bg-white dark:bg-gray-800"
      >
        {renderMenuItems(siderItems)}
      </Menu>
    </Sider>
  );
};

export default AppSider;
