import React from "react";
import { Progress } from "antd";

// Shared analytics data interface
export interface AnalyticsData {
  channels: Array<{
    channel_id: string;
    channel_name: string;
    video_count: number;
    refined_count: number;
    total_videos: number;
    public_videos: number;
    private_videos: number;
    refined_videos: number;
  }>;
  summary?: {
    total_videos: number;
    public_videos: number;
    private_videos: number;
    refined_videos: number;
    total_channels: number;
    total_duration?: number;
    average_duration?: number;
  };
  timestamp?: string;
}

interface AnalyticsDisplayProps {
  data: AnalyticsData | null;
  isLoading: boolean;
  isMobile?: boolean;
}

const AnalyticsDisplay: React.FC<AnalyticsDisplayProps> = ({
  data,
  isLoading,
  isMobile = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <div className="text-gray-600 dark:text-gray-300 text-sm mt-4">
          Loading analytics...
        </div>
      </div>
    );
  }

  if (!data?.summary) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 dark:text-gray-400">
          No analytics data available
        </div>
      </div>
    );
  }

  const summary = data.summary;

  return (
    <div
      className={`${isMobile ? "p-4" : "p-6"} space-y-6 ${
        isMobile ? "" : "max-h-[70vh] overflow-y-auto custom-scrollbar"
      }`}
    >
      {/* Summary Cards */}
      <div
        className={`grid gap-4 ${
          isMobile ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"
        }`}
      >
        {/* Total Videos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="text-center">
            <div
              className={`${
                isMobile ? "text-2xl" : "text-3xl"
              } font-bold text-blue-600 dark:text-blue-400`}
            >
              {summary.total_videos || 0}
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-sm mt-1">
              Total Videos
            </div>
          </div>
        </div>

        {/* Public Videos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="text-center">
            <div
              className={`${
                isMobile ? "text-2xl" : "text-3xl"
              } font-bold text-green-600 dark:text-green-400`}
            >
              {summary.public_videos || 0}
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-sm mt-1">
              Public Videos
            </div>
          </div>
        </div>

        {/* Private Videos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="text-center">
            <div
              className={`${
                isMobile ? "text-2xl" : "text-3xl"
              } font-bold text-red-600 dark:text-red-400`}
            >
              {summary.private_videos || 0}
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-sm mt-1">
              Private Videos
            </div>
          </div>
        </div>

        {/* Refined Videos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="text-center">
            <div
              className={`${
                isMobile ? "text-2xl" : "text-3xl"
              } font-bold text-purple-600 dark:text-purple-400`}
            >
              {summary.refined_videos || 0}
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-sm mt-1">
              Refined Videos
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-4">
        {/* Refined Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Refined Progress
            </span>
            <span className="text-sm text-purple-600 dark:text-purple-400 font-semibold">
              {summary.refined_videos || 0} / {summary.total_videos || 0}{" "}
              {summary.total_videos > 0
                ? Math.round(
                    (summary.refined_videos / summary.total_videos) * 100
                  )
                : 0}
              %
            </span>
          </div>
          <Progress
            percent={
              summary.total_videos > 0
                ? Math.round(
                    (summary.refined_videos / summary.total_videos) * 100
                  )
                : 0
            }
            strokeColor="#8b5cf6"
            showInfo={false}
            className="mb-1"
          />
        </div>

        {/* Public Visibility */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Public Visibility
            </span>
            <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
              {summary.public_videos || 0} / {summary.total_videos || 0}{" "}
              {summary.total_videos > 0
                ? Math.round(
                    (summary.public_videos / summary.total_videos) * 100
                  )
                : 0}
              %
            </span>
          </div>
          <Progress
            percent={
              summary.total_videos > 0
                ? Math.round(
                    (summary.public_videos / summary.total_videos) * 100
                  )
                : 0
            }
            strokeColor="#10b981"
            showInfo={false}
            className="mb-1"
          />
        </div>
      </div>

      {/* Channel Breakdown Table */}
      {data.channels && data.channels.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Channel Breakdown
            </h3>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Channel
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Public
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Private
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Refined
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data.channels.map((channel, index) => (
                  <tr
                    key={channel.channel_id || index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {channel.channel_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-medium">
                        {channel.total_videos}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs font-medium">
                        {channel.public_videos}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-red-600 dark:text-red-400 rounded text-xs font-medium">
                        {channel.private_videos}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-xs font-medium">
                        {channel.refined_videos}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <div className="w-20 mx-auto">
                        <Progress
                          percent={
                            channel.total_videos > 0
                              ? Math.round(
                                  (channel.refined_videos /
                                    channel.total_videos) *
                                    100
                                )
                              : 0
                          }
                          size="small"
                          strokeColor="#8b5cf6"
                          showInfo={false}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDisplay;
