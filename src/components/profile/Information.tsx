import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "@/redux/store";
import { api } from "@/api/api";
import { useTranslation } from "react-i18next";
import { message, Modal, Switch } from "antd";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { subYears, format } from "date-fns";
import { DailyDuration } from "@/utils/type";
import { motion } from "framer-motion";
import { USER_PLAN, USER_ROLE } from "@/utils/const";
import { ScrollableContainer } from "@/components/dictation/video/Widget";
import { formatTimestamp, localStorageCleanup } from "../../utils/util";
import { clearUser, setLanguage, setUser } from "@/redux/userSlice";
import { supabase } from "@/utils/supabaseClient";
import { useLanguageToggle } from "@/hooks/useLanguageToggle";

interface InformationProps {
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
}

const Information: React.FC<InformationProps> = ({
  isDarkMode,
  toggleDarkMode,
}) => {
  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [totalDuration, setTotalDuration] = useState<number | null>(null);
  const [dailyDurations, setDailyDurations] = useState<DailyDuration[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { t } = useTranslation();
  const { toggleLanguage, currentLanguage } = useLanguageToggle();

  // Check if dark mode props are provided, otherwise use local state
  const [localDarkMode, setLocalDarkMode] = useState(() => {
    if (isDarkMode !== undefined) return isDarkMode;
    return document.documentElement.classList.contains("dark");
  });

  const isLocalDarkMode = isDarkMode !== undefined ? isDarkMode : localDarkMode;
  const handleToggleDarkMode =
    toggleDarkMode ||
    (() => {
      const newDarkMode = !localDarkMode;
      setLocalDarkMode(newDarkMode);
      if (newDarkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem("darkMode", JSON.stringify(newDarkMode));
    });

  // Scroll state for dynamic header
  const [headerHeight, setHeaderHeight] = useState(120);
  const [headerOpacity, setHeaderOpacity] = useState(1);
  const [titleFontSize, setTitleFontSize] = useState(24);
  const [adminTagFontSize, setAdminTagFontSize] = useState(11);
  const [adminTagPadding, setAdminTagPadding] = useState(8);
  const [adminTagBorderRadius, setAdminTagBorderRadius] = useState(12);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.getUserDuration();
        setTotalDuration(response.data.totalDuration);
        const durationsArray = Object.entries(response.data.dailyDurations).map(
          ([dateKey, duration]) => {
            // Convert UTC timestamp key to local date string for CalendarHeatmap
            // Backend now returns UTC millisecond timestamps as keys
            const date = /^\d+$/.test(dateKey)
              ? new Date(parseInt(dateKey)).toLocaleDateString("en-CA") // YYYY-MM-DD format in local timezone
              : dateKey; // Legacy format support (should not happen anymore)
            return {
              date,
              count: duration as number,
            };
          }
        );
        setDailyDurations(durationsArray);
      } catch (error) {
        console.error("Error fetching user duration:", error);
      }
      if (userInfo) {
        setLoading(false);
      }
    };

    fetchData();
  }, [userInfo]);

  // Handle scroll for dynamic header sizing
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const scrollOffset = scrollContainerRef.current.scrollTop;
    const maxScroll = 80;
    const minHeaderHeight = 80;
    const maxHeaderHeight = 120;
    const minTitleSize = 18;
    const maxTitleSize = 24;

    const clampedOffset = Math.min(Math.max(scrollOffset, 0), maxScroll);
    const progress = clampedOffset / maxScroll;

    setHeaderHeight(
      maxHeaderHeight - (maxHeaderHeight - minHeaderHeight) * progress
    );
    setHeaderOpacity(1.0 - progress * 0.2);
    setTitleFontSize(maxTitleSize - (maxTitleSize - minTitleSize) * progress);
    setAdminTagFontSize(11.0 - (11.0 - 9.0) * progress);
    setAdminTagPadding(8.0 - (8.0 - 6.0) * progress);
    setAdminTagBorderRadius(12.0 - (12.0 - 8.0) * progress);
  };

  // Refresh heatmap data only
  const refreshHeatmapData = async () => {
    setRefreshing(true);
    try {
      const response = await api.getUserDuration();
      setTotalDuration(response.data.totalDuration);
      const durationsArray = Object.entries(response.data.dailyDurations).map(
        ([dateKey, duration]) => {
          const date = /^\d+$/.test(dateKey)
            ? new Date(parseInt(dateKey)).toLocaleDateString("en-CA")
            : dateKey;
          return {
            date,
            count: duration as number,
          };
        }
      );
      setDailyDurations(durationsArray);
    } catch (error) {
      console.error("Error refreshing heatmap data:", error);
    }
    setRefreshing(false);
  };

  // Logout function
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await api.logout();
      if (response.status === 200) {
        message.success(t("logoutSuccessful"));
      } else {
        message.error(t("logoutFailed"));
      }
    } catch {
      message.error(t("logoutFailed"));
    } finally {
      dispatch(clearUser());
      localStorageCleanup();
      await supabase.auth.signOut();
      setIsLoggingOut(false);
      navigate("/dictation");
    }
  };

  // Show logout confirmation dialog
  const showLogoutDialog = () => {
    Modal.confirm({
      title: (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 text-red-500">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </div>
          <span className="text-gray-900 dark:text-white">{t("signOut")}</span>
        </div>
      ),
      content: (
        <span className="text-gray-700 dark:text-gray-300">
          {t("areYouSureSignOut")}
        </span>
      ),
      okText: t("signOut"),
      cancelText: t("cancel"),
      okType: "danger",
      onOk: handleLogout,
      className: "dark:bg-gray-800",
    });
  };

  // Language change handler
  const handleLanguageChange = (lang: string) => {
    toggleLanguage(lang);
    dispatch(setLanguage(lang));
    if (userInfo) {
      const updatedUserInfo = { ...userInfo, language: lang };
      dispatch(setUser(updatedUserInfo));
      api.saveUserConfig({ language: lang });
    }
  };

  // Language options
  const languageOptions = [
    { label: "English", value: "en" },
    { label: "简体中文", value: "zh" },
    { label: "繁體中文", value: "zhTraditional" },
    { label: "日本語", value: "ja" },
    { label: "한국어", value: "ko" },
  ];

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return [hours, minutes, remainingSeconds]
      .map((val) => val.toString().padStart(2, "0"))
      .join(":");
  };

  const getColor = (value: DailyDuration | null): string => {
    if (!value || value.count === 0) return "color-empty";
    if (value.count < 1800) return "color-scale-1";
    if (value.count < 3600) return "color-scale-2";
    if (value.count < 7200) return "color-scale-3";
    return "color-scale-4";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const InfoCard: React.FC<{ icon: string; title: string; value: string }> = ({
    icon,
    title,
    value,
  }) => (
    <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-3 flex items-center">
      <span className="text-2xl mr-3">{icon}</span>
      <div>
        <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300">
          {title}
        </h3>
        <p className="text-sm font-medium text-gray-800 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );

  const PlanBadge = ({ planName }: { planName: string }) => (
    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-orange-900 dark:text-orange-300">
      {planName}
    </span>
  );

  // 大屏幕渲染函数
  const renderDesktopView = () => (
    <ScrollableContainer className="h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-center min-h-full p-6">
        <div className="max-w-5xl w-full space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-blue-500 to-purple-600
           dark:bg-gradient-to-r dark:from-orange-600 dark:to-gray-800 rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="relative h-40 flex items-center justify-center">
              <img
                src={userInfo?.avatar}
                alt="User Avatar"
                className="w-24 h-24 rounded-full border-4 shadow-lg absolute
                border-purple-300 shadow-purple-600
                dark:border-orange-500 dark:shadow-orange-500"
              />
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 relative z-10">
              <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-4 flex items-center justify-center">
                {userInfo?.username}
                {userInfo?.role === USER_ROLE.ADMIN ? (
                  <PlanBadge planName={userInfo?.role || ""} />
                ) : userInfo?.plan?.name ? (
                  <PlanBadge planName={userInfo?.plan?.name} />
                ) : (
                  <PlanBadge planName={USER_PLAN.FREE} />
                )}
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <InfoCard
                  icon="📧"
                  title={t("email")}
                  value={userInfo?.email || ""}
                />
                <InfoCard
                  icon="🎭"
                  title={t("plan")}
                  value={userInfo?.plan?.name || USER_PLAN.FREE}
                />
                <InfoCard
                  icon="⏳"
                  title={
                    userInfo?.plan?.nextPaymentTime
                      ? t("nextPayment")
                      : t("expireTime")
                  }
                  value={
                    userInfo?.plan?.nextPaymentTime
                      ? formatTimestamp(userInfo.plan.nextPaymentTime)
                      : userInfo?.plan?.expireTime
                      ? formatTimestamp(userInfo.plan.expireTime)
                      : t("noLimit")
                  }
                />
                <InfoCard
                  icon="⏱️"
                  title={t("totalDictationTime")}
                  value={
                    totalDuration !== null
                      ? formatDuration(totalDuration)
                      : t("loading")
                  }
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
          >
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
              {t("dictationActivities")}
            </h2>
            <div className="overflow-x-auto">
              <CalendarHeatmap
                startDate={subYears(new Date(), 1)}
                endDate={new Date()}
                values={dailyDurations}
                showWeekdayLabels={true}
                classForValue={(value) =>
                  getColor(value as DailyDuration | null)
                }
                titleForValue={(value) =>
                  value
                    ? `${format(
                        new Date(value.date),
                        "yyyy-MM-dd"
                      )} ${formatDuration(value.count)}`
                    : t("noData")
                }
              />
            </div>
            <div className="flex justify-end items-center mt-4">
              <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                {t("less")}
              </span>
              <div className="flex">
                {[
                  "color-empty",
                  "color-scale-1",
                  "color-scale-2",
                  "color-scale-3",
                  "color-scale-4",
                ].map((color) => (
                  <div
                    key={color}
                    className={`w-3 h-3 ${color} rounded-sm mr-1`}
                  ></div>
                ))}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                {t("more")}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </ScrollableContainer>
  );

  // 小屏幕渲染函数（参考Flutter设计）
  const renderMobileView = () => (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* 顶部动态Header - 参考Flutter设计 */}
      <div
        className="bg-gray-50 dark:bg-gray-900 shadow-sm transition-all duration-100 ease-out"
        style={{
          height: `${headerHeight}px`,
          opacity: headerOpacity,
          paddingTop: "16px",
          paddingLeft: "24px",
          paddingRight: "24px",
          paddingBottom: "16px",
        }}
      >
        <div className="flex items-center justify-start h-full">
          <h1
            className="font-bold text-gray-900 dark:text-white mr-2 flex-shrink-0"
            style={{
              fontSize: `${titleFontSize}px`,
              fontWeight: 700,
              letterSpacing: "-0.8px",
            }}
          >
            {userInfo?.username}
          </h1>
          {userInfo?.role === USER_ROLE.ADMIN && (
            <span
              className="bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold border border-blue-300 dark:border-blue-600/40"
              style={{
                fontSize: `${adminTagFontSize}px`,
                padding: `${adminTagPadding * 0.5}px ${adminTagPadding}px`,
                borderRadius: `${adminTagBorderRadius}px`,
                letterSpacing: "0.5px",
              }}
            >
              ADMIN
            </span>
          )}
        </div>
      </div>

      {/* 主要内容区域 */}
      <div
        className="flex-1 overflow-y-auto"
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        <div className="p-5 space-y-6">
          {/* 信息卡片区域 - 简化设计参考Flutter */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200/10 dark:border-gray-700/10">
            {/* 第一行 - Email和Plan */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="text-center">
                <div className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                  {t("email")}
                </div>
                <div
                  className="text-sm font-semibold text-gray-900 dark:text-white truncate"
                  title={userInfo?.email}
                >
                  {userInfo?.email || ""}
                </div>
              </div>
              <div className="text-center">
                <div className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                  {t("plan")}
                </div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {userInfo?.plan?.name || USER_PLAN.FREE}
                </div>
              </div>
            </div>

            {/* 分隔线 */}
            <div className="border-t border-gray-200/30 dark:border-gray-700/30 mb-8"></div>

            {/* 第二行 - 过期时间和总时长 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                  {userInfo?.plan?.nextPaymentTime
                    ? t("nextPayment")
                    : t("expireTime")}
                </div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {userInfo?.plan?.nextPaymentTime
                    ? formatTimestamp(userInfo.plan.nextPaymentTime, "date")
                    : userInfo?.plan?.expireTime
                    ? formatTimestamp(userInfo.plan.expireTime, "date")
                    : t("noLimit")}
                </div>
              </div>
              <div className="text-center">
                <div className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                  {t("totalDictationTime")}
                </div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {totalDuration !== null
                    ? formatDuration(totalDuration)
                    : t("loading")}
                </div>
              </div>
            </div>
          </div>

          {/* 听写活动热力图 - 简化设计 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200/10 dark:border-gray-700/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {t("dictationActivities")}
                </h3>
              </div>
              <button
                onClick={refreshHeatmapData}
                disabled={refreshing}
                className="p-2 bg-blue-100/70 dark:bg-blue-900/30 rounded-lg hover:bg-blue-200/70 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50"
              >
                <div
                  className={`w-4 h-4 text-blue-600 dark:text-blue-400 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
              </button>
            </div>

            {/* 热力图容器 - 横向滚动 */}
            <div className="overflow-x-auto">
              <div className="min-w-[320px]">
                <CalendarHeatmap
                  startDate={subYears(new Date(), 1)}
                  endDate={new Date()}
                  values={dailyDurations}
                  showWeekdayLabels={false}
                  classForValue={(value) =>
                    getColor(value as DailyDuration | null)
                  }
                  titleForValue={(value) =>
                    value
                      ? `${format(
                          new Date(value.date),
                          "yyyy-MM-dd"
                        )} ${formatDuration(value.count)}`
                      : t("noData")
                  }
                />
              </div>
            </div>

            {/* 图例 */}
            <div className="flex justify-end items-center mt-3 text-xs">
              <span className="text-gray-500 dark:text-gray-400 mr-2">
                {t("less")}
              </span>
              <div className="flex space-x-1">
                {[
                  "color-empty",
                  "color-scale-1",
                  "color-scale-2",
                  "color-scale-3",
                  "color-scale-4",
                ].map((color) => (
                  <div
                    key={color}
                    className={`w-2 h-2 ${color} rounded-sm`}
                  ></div>
                ))}
              </div>
              <span className="text-gray-500 dark:text-gray-400 ml-2">
                {t("more")}
              </span>
            </div>
          </div>

          {/* 移动端菜单选项 - 简化设计 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200/10 dark:border-gray-700/10">
            <div className="flex items-center mb-4">
              <div className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
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
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {t("profileSettings")}
              </h3>
            </div>

            <div className="space-y-2">
              {/* 套餐升级 */}
              <button
                onClick={() => navigate("/profile/upgrade-plan")}
                className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 mr-3 flex items-center justify-center bg-blue-100/70 dark:bg-blue-900/30 rounded-lg">
                    <div className="w-4 h-4 text-blue-600 dark:text-blue-400">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t("upgradePlan")}
                    </div>
                  </div>
                </div>
                <div className="text-gray-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>

              {/* 频道推荐 */}
              <button
                onClick={() => navigate("/profile/channel-recommendation")}
                className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 mr-3 flex items-center justify-center bg-blue-100/70 dark:bg-blue-900/30 rounded-lg">
                    <div className="w-4 h-4 text-blue-600 dark:text-blue-400">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2m-6 4V4a1 1 0 011-1h4a1 1 0 011 1v2M9 12v8a1 1 0 001 1h4a1 1 0 001-1v-8"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t("channelRecommendation")}
                    </div>
                  </div>
                </div>
                <div className="text-gray-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>

              {/* 问题反馈 */}
              <button
                onClick={() => navigate("/profile/feedback")}
                className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 mr-3 flex items-center justify-center bg-blue-100/70 dark:bg-blue-900/30 rounded-lg">
                    <div className="w-4 h-4 text-blue-600 dark:text-blue-400">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t("feedback")}
                    </div>
                  </div>
                </div>
                <div className="text-gray-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>

              {/* 错误报告 */}
              <button
                onClick={() => navigate("/profile/video-error-reports")}
                className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 mr-3 flex items-center justify-center bg-blue-100/70 dark:bg-blue-900/30 rounded-lg">
                    <div className="w-4 h-4 text-blue-600 dark:text-blue-400">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t("videoErrorReports")}
                    </div>
                  </div>
                </div>
                <div className="text-gray-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>

              {/* 赞赏开发者 */}
              <button
                onClick={() => navigate("/profile/reward-developer")}
                className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 mr-3 flex items-center justify-center bg-blue-100/70 dark:bg-blue-900/30 rounded-lg">
                    <div className="w-4 h-4 text-blue-600 dark:text-blue-400">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t("rewardDeveloper")}
                    </div>
                  </div>
                </div>
                <div className="text-gray-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            </div>
          </div>

          {/* 语言和主题设置区域 - 简化设计 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200/10 dark:border-gray-700/10">
            <div className="flex items-center mb-4">
              <div className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                  />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {t("preferences")}
              </h3>
            </div>

            <div className="space-y-3">
              {/* 语言切换 */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 mr-3 flex items-center justify-center bg-blue-100/70 dark:bg-blue-900/30 rounded-lg">
                    <div className="w-4 h-4 text-blue-600 dark:text-blue-400">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t("language")}
                    </div>
                  </div>
                </div>
                <select
                  value={currentLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white text-sm rounded-lg border-none px-3 py-1.5 min-w-[100px]"
                >
                  {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 主题切换 */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 mr-3 flex items-center justify-center bg-blue-100/70 dark:bg-blue-900/30 rounded-lg">
                    <div className="w-4 h-4 text-blue-600 dark:text-blue-400">
                      {isLocalDarkMode ? (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t("theme")}
                    </div>
                  </div>
                </div>
                <Switch
                  checked={isLocalDarkMode}
                  onChange={handleToggleDarkMode}
                  checkedChildren={
                    <MoonOutlined style={{ fontSize: "12px" }} />
                  }
                  unCheckedChildren={
                    <SunOutlined style={{ fontSize: "12px" }} />
                  }
                  className="bg-gray-300 dark:bg-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Logout按钮 - 参考Flutter样式设计 */}
          <div className="pb-8">
            <button
              onClick={showLogoutDialog}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center p-4 bg-white dark:bg-gray-800 border-2 border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-5 h-5 mr-3">
                {isLoggingOut ? (
                  <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                )}
              </div>
              <span className="font-semibold">
                {isLoggingOut ? t("signingOut") : t("signOut")}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 大屏幕版本 - 768px及以上 */}
      <div className="hidden md:block h-full">{renderDesktopView()}</div>

      {/* 小屏幕版本 - 768px以下，参考Flutter设计 */}
      <div className="block md:hidden h-full">{renderMobileView()}</div>
    </>
  );
};

export default Information;
