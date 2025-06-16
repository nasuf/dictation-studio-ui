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
} from "antd";
import {
  ExclamationCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { api } from "@/api/api";
import { VideoErrorReport } from "@/utils/type";

const UserVideoErrorReports: React.FC = () => {
  const { t } = useTranslation();
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
        <span className="text-xs">
          {new Date(timestamp).toLocaleDateString()}
        </span>
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

      {/* Detail Modal */}
      <Modal
        title={t("errorReportDetails")}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            {t("closeModal")}
          </Button>,
        ]}
        width={700}
      >
        {selectedReport && (
          <Card>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item
                label={
                  <div className="text-xs dark:text-gray-400 font-bold">
                    {t("reportId")}
                  </div>
                }
                span={2}
              >
                <div className="text-xs dark:text-gray-400">
                  {selectedReport.id}
                </div>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <div className="text-xs dark:text-gray-400 font-bold">
                    {t("channelName")}
                  </div>
                }
                span={2}
              >
                <div className="text-xs dark:text-gray-400">
                  {selectedReport.channelName}
                </div>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <div className="text-xs dark:text-gray-400 font-bold">
                    {t("reportVideoTitle")}
                  </div>
                }
                span={2}
              >
                <div className="text-xs dark:text-gray-400">
                  {selectedReport.videoTitle}
                </div>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <div className="text-xs dark:text-gray-400 font-bold">
                    {t("reportChannelId")}
                  </div>
                }
              >
                <div className="text-xs dark:text-gray-400">
                  {selectedReport.channelId}
                </div>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <div className="text-xs dark:text-gray-400 font-bold">
                    {t("videoId")}
                  </div>
                }
              >
                <div className="text-xs dark:text-gray-400">
                  {selectedReport.videoId}
                </div>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <div className="text-xs dark:text-gray-400 font-bold">
                    {t("errorType")}
                  </div>
                }
              >
                <div className="text-xs dark:text-gray-400">
                  <Tag color="blue">
                    {getErrorTypeLabel(selectedReport.errorType)}
                  </Tag>
                </div>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <div className="text-xs dark:text-gray-400 font-bold">
                    {t("status")}
                  </div>
                }
              >
                <div className="text-xs dark:text-gray-400">
                  <Tag color={getStatusColor(selectedReport.status)}>
                    {t(selectedReport.status)}
                  </Tag>
                </div>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <div className="text-xs dark:text-gray-400 font-bold">
                    {t("reportTime")}
                  </div>
                }
                span={2}
              >
                <div className="text-xs dark:text-gray-400">
                  {new Date(selectedReport.timestamp).toLocaleString()}
                </div>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <div className="text-xs dark:text-gray-400 font-bold">
                    {t("reportDescription")}
                  </div>
                }
                span={2}
              >
                <div className="whitespace-pre-wrap bg-gray-50 p-3 rounded dark:bg-gray-700">
                  <div className="text-xs dark:text-gray-400">
                    {selectedReport.description}
                  </div>
                </div>
              </Descriptions.Item>
              {selectedReport.adminResponse && (
                <Descriptions.Item
                  label={
                    <div className="text-xs dark:text-gray-400 font-bold">
                      {t("adminResponse")}
                    </div>
                  }
                  span={2}
                >
                  <div className="whitespace-pre-wrap bg-blue-50 p-3 rounded dark:bg-blue-900">
                    <div className="text-xs dark:text-gray-400">
                      {selectedReport.adminResponse}
                    </div>
                  </div>
                </Descriptions.Item>
              )}
              {selectedReport.resolvedAt && (
                <Descriptions.Item
                  label={
                    <div className="text-xs dark:text-gray-400 font-bold">
                      {t("resolvedAt")}
                    </div>
                  }
                  span={2}
                >
                  <div className="text-xs dark:text-gray-400">
                    {new Date(selectedReport.resolvedAt).toLocaleString()}
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        )}
      </Modal>
    </div>
  );
};

export default UserVideoErrorReports;
