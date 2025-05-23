import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
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

const Information: React.FC = () => {
  const userInfo = useSelector((state: RootState) => state.user.userInfo);
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
          ([date, duration]) => ({
            date,
            count: duration as number,
          })
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

  const PlanBadge = ({ planName }: { planName: string }) => (
    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-orange-900 dark:text-orange-300">
      {planName}
    </span>
  );

  return (
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
                    userInfo?.plan?.nextPaymentTime ||
                    userInfo?.plan?.expireTime ||
                    t("noLimit")
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
};

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

export default Information;
