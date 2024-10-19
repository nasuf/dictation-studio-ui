import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { api } from "@/api/api";
import { useTranslation } from "react-i18next";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { subYears, format } from "date-fns";
import { DailyDuration } from "@/utils/type";

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

        // Convert dailyDurations object to array of objects
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

    if (hours > 0) {
      return `${hours} ${t("hours")} ${minutes} ${t(
        "minutes"
      )} ${remainingSeconds} ${t("seconds")}`;
    } else if (minutes > 0) {
      return `${minutes} ${t("minutes")} ${remainingSeconds} ${t("seconds")}`;
    } else {
      return `${remainingSeconds} ${t("seconds")}`;
    }
  };

  const getColor = (value: DailyDuration | null): string => {
    if (!value || value.count === 0) return "color-empty";
    if (value.count < 1800) return "color-scale-1"; // Less than 30 minutes
    if (value.count < 3600) return "color-scale-2"; // 30 minutes to 1 hour
    if (value.count < 7200) return "color-scale-3"; // 1 hour to 2 hours
    return "color-scale-4"; // More than 2 hours
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg">
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
            <div className="w-32 h-32 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg">
              <img
                src={userInfo?.avatar}
                alt="User Avatar"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>
        </div>
        <div className="pt-20 pb-8 px-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            {userInfo?.username}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {userInfo?.role}
          </p>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 px-8 py-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-gray-500 dark:text-gray-400 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                ></path>
              </svg>
              <span className="text-gray-700 dark:text-gray-300">
                {userInfo?.email}
              </span>
            </div>
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-gray-500 dark:text-gray-400 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
              <span className="text-gray-700 dark:text-gray-300">
                {userInfo?.role}
              </span>
            </div>
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-gray-500 dark:text-gray-400 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span className="text-gray-700 dark:text-gray-300">
                {t("total_dictation_time")}:{" "}
                {totalDuration !== null
                  ? formatDuration(totalDuration)
                  : t("loading")}
              </span>
            </div>
          </div>
        </div>

        <div className="border-gray-200 dark:border-gray-700 px-8 py-6">
          <CalendarHeatmap
            startDate={subYears(new Date(), 1)}
            endDate={new Date()}
            values={dailyDurations}
            showWeekdayLabels={true}
            classForValue={(value) => getColor(value as DailyDuration | null)}
            titleForValue={(value) =>
              value
                ? `${format(
                    new Date(value.date),
                    "yyyy-MM-dd"
                  )}: ${formatDuration(value.count)}`
                : "No data"
            }
          />
          <div className="flex justify-end items-center mt-2">
            <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
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
                <div key={color} className={`w-3 h-3 ${color} mr-1`}></div>
              ))}
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              {t("more")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Information;
