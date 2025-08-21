import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Button,
  Modal,
  message,
  Card,
  Descriptions,
  Empty,
  List,
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  ExclamationCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { api } from "@/api/api";
import { VideoErrorReport } from "@/utils/type";
import { formatTimestamp } from "@/utils/util";

const UserVideoErrorReports: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [reports, setReports] = useState<VideoErrorReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<VideoErrorReport | null>(
    null
  );
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.getVideoErrorReports();
      setReports(response.data);
    } catch (error) {
      console.error("Error fetching video error reports:", error);
      message.error(t("errorFetchingReports"));
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (report: VideoErrorReport) => {
    setSelectedReport(report);
    setDetailModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "orange";
      case "resolved":
        return "green";
      case "rejected":
        return "red";
      default:
        return "default";
    }
  };

  const getErrorTypeLabel = (errorType: string) => {
    const types: Record<string, string> = {
      transcript_error: t("transcriptError"),
      timing_error: t("timingError"),
      missing_content: t("missingContent"),
      other: t("errorTypeOther"),
    };
    return types[errorType] || errorType;
  };

  const columns = [
    {
      title: t("reportId"),
      dataIndex: "id",
      key: "id",
      width: 180,
    },
    {
      title: t("channelName"),
      dataIndex: "channelName",
      key: "channelName",
      width: 180,
    },
    {
      title: t("videoTitle"),
      dataIndex: "videoTitle",
      key: "videoTitle",
      width: 180,
    },
    {
      title: t("errorType"),
      dataIndex: "errorType",
      key: "errorType",
      width: 120,
      render: (errorType: string) => (
        <Tag color="blue" className="text-xs">
          {getErrorTypeLabel(errorType)}
        </Tag>
      ),
    },
    {
      title: t("status"),
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)} className="text-xs">
          {t(status)}
        </Tag>
      ),
    },
    {
      title: t("reportTime"),
      dataIndex: "timestamp",
      key: "timestamp",
      width: 140,
      render: (timestamp: number) => (
        <span className="text-xs">{formatTimestamp(timestamp, "date")}</span>
      ),
    },
    {
      title: t("reportActions"),
      key: "actions",
      width: 80,
      render: (record: VideoErrorReport) => (
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
        >
          {t("viewDetails")}
        </Button>
      ),
    },
  ];

  // 移动端渲染函数
  const renderMobileView = () => {
    if (reports.length === 0 && !loading) {
      return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
          {/* 移动端标题栏 */}
          <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button 
                  onClick={() => navigate(-1)}
                  className="mr-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex items-center">
                  <span className="text-lg mr-2">⚠️</span>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t("videoErrorReports")}
                  </h1>
                </div>
              </div>
              <button
                onClick={fetchReports}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ReloadOutlined className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* 空状态 */}
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <ExclamationCircleOutlined className="text-6xl text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                {t("noVideoErrorReportsYet")}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {t("reportVideoErrorsWhenEncountered")}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* 移动端标题栏 */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => navigate(-1)}
                className="mr-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center">
                <span className="text-lg mr-2">⚠️</span>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t("videoErrorReports")}
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {reports.length} {t("reports")}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={fetchReports}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ReloadOutlined className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* 报告列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200/50 dark:border-gray-700/50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-1">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {report.videoTitle}
                        </h3>
                        <Tag
                          color={getStatusColor(report.status)}
                          className="ml-2 text-xs"
                        >
                          {t(report.status)}
                        </Tag>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                        <div className="flex items-center">
                          <span className="w-16 inline-block">{t("channel")}:</span>
                          <span className="truncate">{report.channelName}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-16 inline-block">{t("type")}:</span>
                          <Tag color="blue" className="text-xs">
                            {getErrorTypeLabel(report.errorType)}
                          </Tag>
                        </div>
                        <div className="flex items-center">
                          <span className="w-16 inline-block">{t("time")}:</span>
                          <span>{formatTimestamp(report.timestamp, "date")}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewDetails(report)}
                      className="ml-3 p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <EyeOutlined />
                    </button>
                  </div>
                  
                  {report.description && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mt-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {report.description}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // 桌面端渲染函数
  const renderDesktopView = () => {
    if (reports.length === 0 && !loading) {
      return (
        <div className="h-full flex flex-col p-4 md:p-6">
          <Card
            className="flex-grow overflow-hidden shadow-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
            title={
              <div className="flex justify-between items-center">
                <span>{t("videoErrorReports")}</span>
                <Button
                  type="primary"
                  onClick={fetchReports}
                  icon={<ReloadOutlined />}
                  loading={loading}
                >
                  {t("refresh")}
                </Button>
              </div>
            }
            bodyStyle={{ height: "calc(100% - 57px)", padding: "24px" }}
          >
            <div className="h-full flex items-center justify-center">
              <Empty
                image={
                  <ExclamationCircleOutlined
                    style={{ fontSize: 64, color: "#d9d9d9" }}
                  />
                }
                description={
                  <span className="text-gray-500 dark:text-gray-400">
                    {t("noVideoErrorReportsYet")}
                  </span>
                }
              />
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col p-4 md:p-6">
        <Card
          className="flex-grow overflow-hidden shadow-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
          title={
            <div className="flex justify-between items-center">
              <span>
                {t("videoErrorReports")} ({reports.length})
              </span>
              <Button
                type="primary"
                onClick={fetchReports}
                icon={<ReloadOutlined />}
                loading={loading}
              >
                {t("refresh")}
              </Button>
            </div>
          }
          bodyStyle={{ height: "calc(100% - 57px)", padding: 0 }}
        >
          <div className="h-full overflow-auto p-4">
            <Table
              columns={columns}
              dataSource={reports}
              rowKey="id"
              loading={loading}
              scroll={{ x: 800 }}
              size="large"
            />
          </div>
        </Card>
      </div>
    );
  };

  return (
    <>
      {/* 大屏幕版本 - 768px及以上 */}
      <div className="hidden md:block h-full">
        {renderDesktopView()}
      </div>
      
      {/* 小屏幕版本 - 768px以下 */}
      <div className="block md:hidden h-full">
        {renderMobileView()}
      </div>

      {/* Detail Modal - 移动端优化 */}
      <Modal
        title={
          <div className="flex items-center">
            <span className="text-lg mr-2">⚠️</span>
            <span>{t("errorReportDetails")}</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button 
            key="close" 
            onClick={() => setDetailModalVisible(false)}
            className="w-full md:w-auto"
            size="large"
          >
            {t("closeModal")}
          </Button>,
        ]}
        width="90%"
        style={{ maxWidth: 700 }}
        className="mobile-modal"
      >
        {selectedReport && (
          <div className="pt-4">
            {/* 移动端优化的详情显示 */}
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  {t("basicInfo")}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t("reportId")}:</span>
                    <span className="text-gray-900 dark:text-white font-mono text-xs">{selectedReport.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t("status")}:</span>
                    <Tag color={getStatusColor(selectedReport.status)} className="text-xs">
                      {t(selectedReport.status)}
                    </Tag>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t("errorType")}:</span>
                    <Tag color="blue" className="text-xs">
                      {getErrorTypeLabel(selectedReport.errorType)}
                    </Tag>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t("reportTime")}:</span>
                    <span className="text-gray-900 dark:text-white text-xs">
                      {formatTimestamp(selectedReport.timestamp, "locale")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  {t("videoInfo")}
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">{t("channelName")}:</span>
                    <p className="text-gray-900 dark:text-white mt-1">{selectedReport.channelName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">{t("videoTitle")}:</span>
                    <p className="text-gray-900 dark:text-white mt-1">{selectedReport.videoTitle}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 text-xs">{t("channelId")}:</span>
                      <p className="text-gray-900 dark:text-white font-mono text-xs mt-1">{selectedReport.channelId}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 text-xs">{t("videoId")}:</span>
                      <p className="text-gray-900 dark:text-white font-mono text-xs mt-1">{selectedReport.videoId}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  {t("reportDescription")}
                </h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                    {selectedReport.description}
                  </p>
                </div>
              </div>

              {selectedReport.adminResponse && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-900 dark:text-blue-400 mb-3">
                    {t("adminResponse")}
                  </h3>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-sm text-blue-900 dark:text-blue-400 whitespace-pre-wrap">
                      {selectedReport.adminResponse}
                    </p>
                  </div>
                </div>
              )}

              {selectedReport.resolvedAt && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-900 dark:text-green-400">
                      {t("resolvedAt")}:
                    </span>
                    <span className="text-sm text-green-900 dark:text-green-400">
                      {formatTimestamp(selectedReport.resolvedAt, "locale")}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default UserVideoErrorReports;
