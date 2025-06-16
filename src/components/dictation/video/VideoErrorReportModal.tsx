import React, { useState } from "react";
import { Modal, Form, Input, Select, Button, message } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { api } from "@/api/api";

const { TextArea } = Input;
const { Option } = Select;

interface VideoErrorReportModalProps {
  visible: boolean;
  onClose: () => void;
  channelId: string;
  videoId: string;
  videoTitle: string;
  channelName?: string;
  currentTime?: number;
  currentTranscriptIndex?: number;
}

const VideoErrorReportModal: React.FC<VideoErrorReportModalProps> = ({
  visible,
  onClose,
  channelId,
  videoId,
  videoTitle,
  channelName,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const errorTypes = [
    { value: "transcript_error", label: t("transcriptError") },
    { value: "timing_error", label: t("timingError") },
    { value: "missing_content", label: t("missingContent") },
    { value: "other", label: t("errorTypeOther") },
  ];

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);

      const reportData = {
        channelId,
        channelName,
        videoId,
        videoTitle,
        errorType: values.errorType,
        description: values.description,
      };

      await api.submitVideoErrorReport(reportData);
      message.success(t("errorReportSubmitted"));
      form.resetFields();
      onClose();
    } catch (error) {
      console.error("Error submitting video error report:", error);
      message.error(t("errorSubmittingReport"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center">
          <ExclamationCircleOutlined className="text-orange-500 mr-2" />
          {t("reportVideoError")}
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <div className="mb-4 p-3 bg-gray-50 rounded-md dark:bg-gray-800">
        {channelName && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
            <strong>{t("channelName")}:</strong> {channelName}
          </p>
        )}
        <p className="text-sm text-gray-600 dark:text-gray-300">
          <strong>{t("reportVideo")}:</strong> {videoTitle}
        </p>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="errorType"
          label={t("errorType")}
          rules={[{ required: true, message: t("pleaseSelectErrorType") }]}
        >
          <Select placeholder={t("pleaseSelectErrorType")}>
            {errorTypes.map((type) => (
              <Option key={type.value} value={type.value}>
                {type.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="description"
          label={t("errorDescription")}
          rules={[
            { required: true, message: t("pleaseEnterErrorDescription") },
          ]}
        >
          <TextArea
            rows={4}
            placeholder={t("describeErrorInDetail")}
            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          />
        </Form.Item>

        <div className="flex justify-end space-x-2 mt-6">
          <Button onClick={handleCancel}>{t("cancel")}</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            className="bg-red-500 hover:bg-red-600 border-red-500 hover:border-red-600"
          >
            {t("submitReport")}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default VideoErrorReportModal;
