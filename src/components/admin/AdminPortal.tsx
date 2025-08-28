import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { USER_ROLE } from "@/utils/const";

interface AdminPortalProps {
  isDarkMode?: boolean;
}

const AdminPortal: React.FC<AdminPortalProps> = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const userInfo = useSelector((state: RootState) => state.user.userInfo);

  // Check if dark mode props are provided, otherwise use local state
  // const [localDarkMode] = useState(() => {
  //   if (isDarkMode !== undefined) return isDarkMode;
  //   return document.documentElement.classList.contains("dark");
  // });

  // Check if user is admin
  if (!userInfo || userInfo.role !== USER_ROLE.ADMIN) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 text-red-500">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636 5.636 18.364"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t("accessDenied")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t("adminAccessRequired")}
          </p>
        </div>
      </div>
    );
  }

  // const isLocalDarkMode = isDarkMode !== undefined ? isDarkMode : localDarkMode;

  // Admin management modules
  const adminModules = [
    {
      key: "user",
      title: t("userManagement"),
      description: t("manageUsersAndPermissions"),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
          />
        </svg>
      ),
      path: "/admin/user",
    },
    {
      key: "channel",
      title: t("channelManagement"),
      description: t("manageChannelsAndContent"),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2m-6 4V4a1 1 0 011-1h4a1 1 0 011 1v2M9 12v8a1 1 0 001 1h4a1 1 0 001-1v-8"
          />
        </svg>
      ),
      path: "/admin/channel",
    },
    {
      key: "video",
      title: t("videoManagement"),
      description: t("manageVideosAndTranscripts"),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      ),
      path: "/admin/video",
    },
    {
      key: "feedback",
      title: t("feedbackManagement"),
      description: t("manageFeedbackAndSupport"),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
      path: "/admin/feedback",
    },
    {
      key: "error-reports",
      title: t("videoErrorReportManagement"),
      description: t("manageVideoErrorReports"),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
      path: "/admin/video-error-reports",
    },
  ];

  // 统一蓝色调样式，参考Information.tsx
  const iconClasses = {
    bg: "bg-blue-100/70 dark:bg-blue-900/30",
    icon: "text-blue-600 dark:text-blue-400",
    hover: "hover:bg-blue-100 dark:hover:bg-blue-900/50",
  };

  // 大屏幕渲染函数
  const renderDesktopView = () => (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-center min-h-full p-6">
        <div className="max-w-4xl w-full space-y-6">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8 text-center text-white">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-2">{t("adminPortal")}</h1>
              <p className="text-white/90">{t("adminPortalDescription")}</p>
            </div>
          </div>

          {/* Management Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminModules.map((module) => {
              return (
                <button
                  key={module.key}
                  onClick={() => navigate(module.path)}
                  className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50 transition-all duration-200 hover:shadow-xl hover:scale-105 text-left ${iconClasses.hover}`}
                >
                  <div className={`w-12 h-12 mb-4 ${iconClasses.bg} rounded-lg flex items-center justify-center`}>
                    <div className={iconClasses.icon}>
                      <div className="w-6 h-6">
                        {module.icon}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {module.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {module.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // 小屏幕渲染函数（完全参考Information.tsx设计）
  const renderMobileView = () => (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* 顶部Header - 完全匹配Information.tsx的样式 */}
      <div
        className="bg-gray-50 dark:bg-gray-900 shadow-sm"
        style={{
          paddingTop: "16px",
          paddingLeft: "24px",
          paddingRight: "24px",
          paddingBottom: "16px",
        }}
      >
        <div className="flex items-center">
          <div className="w-10 h-10 mr-3 bg-blue-100/70 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <div className="w-6 h-6 text-blue-600 dark:text-blue-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {t("adminPortal")}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t("adminPortalDescription")}
            </p>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 overflow-y-auto px-5 pt-3 pb-20 space-y-3">
        {adminModules.map((module) => {
          return (
            <button
              key={module.key}
              onClick={() => navigate(module.path)}
              className={`w-full flex items-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200/10 dark:border-gray-700/10 shadow-sm ${iconClasses.hover} transition-all duration-200 active:scale-98`}
            >
              <div className={`w-8 h-8 mr-3 ${iconClasses.bg} rounded-lg flex items-center justify-center`}>
                <div className={iconClasses.icon}>
                  {module.icon}
                </div>
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-0.5">
                  {module.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {module.description}
                </p>
              </div>
              <div className="text-gray-400 dark:text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* 大屏幕版本 - 768px及以上 */}
      <div className="hidden md:block h-full">{renderDesktopView()}</div>

      {/* 小屏幕版本 - 768px以下，参考Information.tsx设计 */}
      <div className="block md:hidden h-full">{renderMobileView()}</div>
    </>
  );
};

export default AdminPortal;