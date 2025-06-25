import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Button,
  Modal,
  Input,
  Select,
  message,
  Space,
  Card,
  Descriptions,
  Tooltip,
} from "antd";
import {
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { api } from "@/api/api";
import { VideoErrorReport } from "@/utils/type";
import { formatTimestamp } from "@/utils/util";

const { TextArea } = Input;
const { Option } = Select;

const VideoErrorReportManagement: React.FC = () => {
  const { t } = useTranslation();
  const [reports, setReports] = useState<VideoErrorReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<VideoErrorReport | null>(
    null
  );
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [responseModalVisible, setResponseModalVisible] = useState(false);
  const [adminResponse, setAdminResponse] = useState("");
  const [newStatus, setNewStatus] = useState<
    "pending" | "resolved" | "rejected"
  >("resolved");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.getAllVideoErrorReports();
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

  const handleUpdateStatus = (report: VideoErrorReport) => {
    setSelectedReport(report);
    setNewStatus(report.status === "pending" ? "resolved" : report.status);
    setAdminResponse("");
    setResponseModalVisible(true);
  };

  const submitStatusUpdate = async () => {
    if (!selectedReport) return;

    try {
      setSubmitting(true);
      await api.updateVideoErrorReportStatus(selectedReport.id, {
        status: newStatus,
        adminResponse: adminResponse.trim() || undefined,
      });
      message.success(t("reportStatusUpdated"));
      setResponseModalVisible(false);
      setSelectedReport(null);
      setAdminResponse("");
      fetchReports();
    } catch (error) {
      console.error("Error updating report status:", error);
      message.error(t("errorUpdatingReportStatus"));
    } finally {
      setSubmitting(false);
    }
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
      title: t("video"),
      key: "video",
      width: 250,
      render: (record: VideoErrorReport) => (
        <div>
          <div className="font-medium truncate text-sm">
            {record.videoTitle}
          </div>
        </div>
      ),
    },
    {
      title: t("reportUser"),
      key: "user",
      width: 150,
      render: (record: VideoErrorReport) => (
        <div>
          <div className="text-sm">{record.userName}</div>
          <div className="text-xs dark:text-gray-400">{record.userEmail}</div>
        </div>
      ),
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
      width: 120,
      render: (record: VideoErrorReport) => (
        <Space size="small">
          <Tooltip title={t("viewDetails")}>
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          {record.status === "pending" && (
            <Tooltip title={t("updateStatus")}>
              <Button
                type="text"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleUpdateStatus(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Card
        title={
          <div className="text-xl font-semibold dark:text-white">
            {t("videoErrorReportManagement")} | Total: {reports.length}
          </div>
        }
        extra={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={fetchReports}
              loading={loading}
              style={{ marginLeft: 10 }}
            >
              {t("refresh")}
            </Button>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={reports}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200, y: 500 }}
          size="large"
        />
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
          selectedReport?.status === "pending" && (
            <Button
              key="update"
              type="primary"
              onClick={() => {
                setDetailModalVisible(false);
                handleUpdateStatus(selectedReport);
              }}
            >
              {t("updateStatus")}
            </Button>
          ),
        ]}
        width={800}
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
                    {t("userName")}
                  </div>
                }
              >
                <div className="text-xs dark:text-gray-400">
                  {selectedReport.userName}
                </div>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <div className="text-xs dark:text-gray-400 font-bold">
                    {t("userEmail")}
                  </div>
                }
              >
                <div className="text-xs dark:text-gray-400">
                  {selectedReport.userEmail}
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
                  {formatTimestamp(selectedReport.timestamp, "locale")}
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

      {/* Response Modal */}
      <Modal
        title={t("updateReportStatus")}
        open={responseModalVisible}
        onCancel={() => setResponseModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setResponseModalVisible(false)}>
            {t("cancel")}
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitting}
            onClick={submitStatusUpdate}
          >
            {t("submit")}
          </Button>,
        ]}
        width={600}
      >
        {selectedReport && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("newStatus")}
              </label>
              <Select
                value={newStatus}
                onChange={setNewStatus}
                style={{ width: "100%" }}
              >
                <Option value="resolved">
                  <CheckCircleOutlined className="text-green-500 mr-2" />
                  {t("resolved")}
                </Option>
                <Option value="rejected">
                  <CloseCircleOutlined className="text-red-500 mr-2" />
                  {t("rejected")}
                </Option>
                <Option value="pending">
                  <ExclamationCircleOutlined className="text-orange-500 mr-2" />
                  {t("pending")}
                </Option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t("adminResponse")} ({t("optional")})
              </label>
              <TextArea
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                rows={4}
                placeholder={t("enterAdminResponse")}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>

            <div className="bg-gray-50 p-3 rounded dark:bg-gray-700">
              <label className="text-xs dark:text-gray-400 font-bold">
                {t("originalReport")}:
              </label>
              <div className="mt-2 whitespace-pre-wrap">
                <div className="text-xs dark:text-gray-400">
                  {selectedReport.description}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VideoErrorReportManagement;
