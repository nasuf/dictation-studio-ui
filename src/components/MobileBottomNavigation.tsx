import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HomeOutlined, UserOutlined } from "@ant-design/icons";

interface MobileBottomNavigationProps {
  className?: string;
}

const MobileBottomNavigation: React.FC<MobileBottomNavigationProps> = ({ className = "" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    {
      key: "home",
      label: t("home"),
      icon: <HomeOutlined className="text-lg" />,
      path: "/dictation",
      activeIcon: <HomeOutlined className="text-lg" />,
    },
    {
      key: "profile",
      label: t("profile"),
      icon: <UserOutlined className="text-lg" />,
      path: "/profile/information",
      activeIcon: <UserOutlined className="text-lg" />,
    },
  ];

  const isActive = (path: string) => {
    if (path === "/dictation") {
      return location.pathname === "/" || location.pathname.startsWith("/dictation");
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className={`bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50 shadow-lg ${className}`}>
      <div className="flex items-center justify-around px-6 py-1 safe-area-inset-bottom">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.key}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center justify-center py-3 px-6 rounded-xl transition-all duration-300 transform ${
                active
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 scale-105 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/30"
              }`}
            >
              <div className={`mb-1 transition-all duration-300 ${
                active ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
              }`}>
                {active ? item.activeIcon : item.icon}
              </div>
              <span className={`text-xs font-medium transition-all duration-300 ${
                active ? "text-blue-600 dark:text-blue-400 font-semibold" : "text-gray-500 dark:text-gray-400"
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNavigation;