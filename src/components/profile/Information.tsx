import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "@/redux/store";
import { api } from "@/api/api";
import { useTranslation } from "react-i18next";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { subYears, format } from "date-fns";
import { DailyDuration } from "@/utils/type";
import { motion } from "framer-motion";
import { USER_PLAN, USER_ROLE } from "@/utils/const";
import { ScrollableContainer } from "@/components/dictation/video/Widget";
import { formatTimestamp } from "../../utils/util";

const Information: React.FC = () => {
  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [totalDuration, setTotalDuration] = useState<number | null>(null);
  const [dailyDurations, setDailyDurations] = useState<DailyDuration[]>([]);
  const { t } = useTranslation();

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
      <div className="bg-gradient-to-b from-blue-500 to-purple-600 dark:from-gray-800 dark:to-gray-900 p-4 shadow-lg">
        <div className="flex items-center justify-start">
          <h1 className="text-xl font-bold text-white mr-3">
            {userInfo?.username}
          </h1>
          {userInfo?.role === USER_ROLE.ADMIN ? (
            <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs font-semibold border border-blue-500/40">
              ADMIN
            </span>
          ) : userInfo?.plan?.name ? (
            <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full text-xs font-semibold border border-purple-500/40">
              {userInfo.plan.name}
            </span>
          ) : (
            <span className="bg-gray-500/20 text-gray-300 px-2 py-1 rounded-full text-xs font-semibold border border-gray-500/40">
              {USER_PLAN.FREE}
            </span>
          )}
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* 信息卡片区域 - 2x2网格布局 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200/50 dark:border-gray-700/50">
            {/* 第一行 - Email和Plan */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <span className="text-blue-600 dark:text-blue-400 text-lg">📧</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                  {t("email")}
                </div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={userInfo?.email}>
                  {userInfo?.email || ""}
                </div>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <span className="text-purple-600 dark:text-purple-400 text-lg">🎭</span>
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
            <div className="border-t border-gray-200 dark:border-gray-700 mb-6"></div>

            {/* 第二行 - 过期时间和总时长 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <span className="text-orange-600 dark:text-orange-400 text-lg">⏳</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                  {userInfo?.plan?.nextPaymentTime ? t("nextPayment") : t("expireTime")}
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
                <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <span className="text-green-600 dark:text-green-400 text-lg">⏱️</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                  {t("totalDictationTime")}
                </div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {totalDuration !== null ? formatDuration(totalDuration) : t("loading")}
                </div>
              </div>
            </div>
          </div>

          {/* 听写活动热力图 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-6 h-6 mr-2 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded">
                  <span className="text-blue-600 dark:text-blue-400 text-sm">📅</span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {t("dictationActivities")}
                </h3>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              >
                <span className="text-blue-600 dark:text-blue-400 text-sm">🔄</span>
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
                  classForValue={(value) => getColor(value as DailyDuration | null)}
                  titleForValue={(value) =>
                    value
                      ? `${format(new Date(value.date), "yyyy-MM-dd")} ${formatDuration(value.count)}`
                      : t("noData")
                  }
                />
              </div>
            </div>
            
            {/* 图例 */}
            <div className="flex justify-end items-center mt-3 text-xs">
              <span className="text-gray-500 dark:text-gray-400 mr-2">{t("less")}</span>
              <div className="flex space-x-1">
                {["color-empty", "color-scale-1", "color-scale-2", "color-scale-3", "color-scale-4"].map((color) => (
                  <div key={color} className={`w-2 h-2 ${color} rounded-sm`}></div>
                ))}
              </div>
              <span className="text-gray-500 dark:text-gray-400 ml-2">{t("more")}</span>
            </div>
          </div>

          {/* 移动端菜单选项 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center mb-4">
              <div className="w-6 h-6 mr-2 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30 rounded">
                <span className="text-indigo-600 dark:text-indigo-400 text-sm">⚙️</span>
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {t("profileSettings")}
              </h3>
            </div>

            <div className="space-y-3">
              {/* 套餐升级 */}
              <button
                onClick={() => navigate("/profile/upgrade-plan")}
                className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200/50 dark:border-purple-700/50 hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-900/30 dark:hover:to-indigo-900/30 transition-all duration-200"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 mr-3 flex items-center justify-center bg-purple-100 dark:bg-purple-900/40 rounded-xl">
                    <span className="text-purple-600 dark:text-purple-400 text-lg">💎</span>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t("upgradePlan")}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {t("upgradePlanDesc")}
                    </div>
                  </div>
                </div>
                <div className="text-purple-600 dark:text-purple-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* 频道推荐 */}
              <button
                onClick={() => navigate("/profile/channel-recommendation")}
                className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50 hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-900/30 dark:hover:to-cyan-900/30 transition-all duration-200"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 mr-3 flex items-center justify-center bg-blue-100 dark:bg-blue-900/40 rounded-xl">
                    <span className="text-blue-600 dark:text-blue-400 text-lg">📺</span>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t("channelRecommendation")}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {t("channelRecommendationDesc")}
                    </div>
                  </div>
                </div>
                <div className="text-blue-600 dark:text-blue-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* 问题反馈 */}
              <button
                onClick={() => navigate("/profile/feedback")}
                className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-700/50 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 transition-all duration-200"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 mr-3 flex items-center justify-center bg-green-100 dark:bg-green-900/40 rounded-xl">
                    <span className="text-green-600 dark:text-green-400 text-lg">💬</span>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t("feedback")}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {t("feedbackDesc")}
                    </div>
                  </div>
                </div>
                <div className="text-green-600 dark:text-green-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* 错误报告 */}
              <button
                onClick={() => navigate("/profile/video-error-reports")}
                className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl border border-orange-200/50 dark:border-orange-700/50 hover:from-orange-100 hover:to-yellow-100 dark:hover:from-orange-900/30 dark:hover:to-yellow-900/30 transition-all duration-200"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 mr-3 flex items-center justify-center bg-orange-100 dark:bg-orange-900/40 rounded-xl">
                    <span className="text-orange-600 dark:text-orange-400 text-lg">⚠️</span>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t("videoErrorReports")}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {t("videoErrorReportsDesc")}
                    </div>
                  </div>
                </div>
                <div className="text-orange-600 dark:text-orange-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* 赞赏开发者 */}
              <button
                onClick={() => navigate("/profile/reward-developer")}
                className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl border border-pink-200/50 dark:border-pink-700/50 hover:from-pink-100 hover:to-rose-100 dark:hover:from-pink-900/30 dark:hover:to-rose-900/30 transition-all duration-200"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 mr-3 flex items-center justify-center bg-pink-100 dark:bg-pink-900/40 rounded-xl">
                    <span className="text-pink-600 dark:text-pink-400 text-lg">❤️</span>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t("rewardDeveloper")}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {t("rewardDeveloperDesc")}
                    </div>
                  </div>
                </div>
                <div className="text-pink-600 dark:text-pink-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 大屏幕版本 - 768px及以上 */}
      <div className="hidden md:block h-full">
        {renderDesktopView()}
      </div>
      
      {/* 小屏幕版本 - 768px以下，参考Flutter设计 */}
      <div className="block md:hidden h-full">
        {renderMobileView()}
      </div>
    </>
  );
};


export default Information;
