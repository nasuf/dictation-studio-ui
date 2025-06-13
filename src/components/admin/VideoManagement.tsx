import React, { useState, useEffect, useCallback } from "react";
import {
  Form,
  Select,
  Input,
  Button,
  message,
  Space,
  Table,
  Card,
  Modal,
  Upload,
  Progress,
  Typography,
  Tag,
} from "antd";
import {
  MinusCircleOutlined,
  PlusOutlined,
  EditOutlined,
  MergeCellsOutlined,
  UndoOutlined,
  CloudDownloadOutlined,
  UploadOutlined,
  CheckOutlined,
  SaveOutlined,
  CloseOutlined,
  SearchOutlined,
  LoadingOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  ReloadOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { api } from "@/api/api";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Navigate } from "react-router-dom";
import getYoutubeId from "get-youtube-id";
import { Channel, TranscriptItem, Video } from "@/utils/type";
import { LANGUAGES, USER_ROLE, VISIBILITY_OPTIONS } from "@/utils/const";
import axios from "axios";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { autoMergeTranscriptItems } from "@/utils/util";

const { Option } = Select;
const { TextArea } = Input;

const extractVideoId = (url: string): string => {
  if (!url) return "";
  try {
    const videoId = getYoutubeId(url);
    if (videoId) {
      return videoId;
    }
  } catch (error) {
    console.error("Error parsing URL:", error);
  }
  return "";
};

const fetchVideoTitle = async (
  videoLink: string,
  fieldIndex: number,
  form: any,
  setLoadingStates?: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >,
  translateFn?: Function
) => {
  if (!videoLink) {
    return;
  }

  const t = translateFn || ((key: string) => key);

  try {
    if (setLoadingStates) {
      setLoadingStates((prev) => ({ ...prev, [videoLink]: true }));
    }

    const loadingMessage = message.loading(t("fetchingVideoTitle"), 0);

    const videoId = extractVideoId(videoLink);
    if (!videoId) {
      loadingMessage();
      message.error(t("invalidYoutubeLink"));
      if (setLoadingStates) {
        setLoadingStates((prev) => ({ ...prev, [videoLink]: false }));
      }
      return;
    }

    const response = await axios.get(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );

    const title = response.data.title;

    const updatedFields = form.getFieldsValue();
    updatedFields.video_links[fieldIndex].title = title;
    form.setFieldsValue(updatedFields);

    loadingMessage();
    message.success(t("videoTitleFetchSuccess"));
  } catch (error) {
    console.error("Error fetching video title:", error);
    message.error(t("videoTitleFetchFailed"));
  } finally {
    if (setLoadingStates) {
      setLoadingStates((prev) => ({ ...prev, [videoLink]: false }));
    }
  }
};

const AddVideosForm: React.FC<{
  onFinish: (values: any) => void;
  isLoading: boolean;
  form: any;
  handleSrtUpload: (videoLink: string, file: File) => void;
  srtFiles: { [key: string]: File };
}> = ({ onFinish, isLoading, form, handleSrtUpload, srtFiles }) => {
  const { t } = useTranslation();
  const [titleLoadingStates, setTitleLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});
  const [uploadStatus, setUploadStatus] = useState<{
    [key: string]: "success" | "error" | "loading" | null;
  }>({});

  const debouncedFetchTitle = useCallback(
    _.debounce((videoLink: string, fieldIndex: number) => {
      if (videoLink) {
        fetchVideoTitle(videoLink, fieldIndex, form, setTitleLoadingStates, t);
      }
    }, 1000),
    [form, t]
  );

  const openSubtitleDownloader = (videoLink: string) => {
    const videoId = extractVideoId(videoLink);
    if (videoId) {
      window.open(
        `https://downsub.com/?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D${videoId}`,
        "_blank"
      );
    } else {
      message.error(t("invalidYoutubeLink"));
    }
  };

  const handleSrtUploadWithStatus = (videoLink: string, file: File) => {
    try {
      setUploadStatus((prev) => ({ ...prev, [videoLink]: "loading" }));

      handleSrtUpload(videoLink, file);

      setTimeout(() => {
        setUploadStatus((prev) => ({ ...prev, [videoLink]: "success" }));
        message.success(t("fileUploadSuccess", { filename: file.name }));
      }, 500);
    } catch (error) {
      console.error("Error uploading SRT:", error);
      setUploadStatus((prev) => ({ ...prev, [videoLink]: "error" }));
      message.error(t("fileUploadFailed", { filename: file.name }));
    }
  };

  const handleManualTitleFetch = (videoLink: string, fieldIndex: number) => {
    fetchVideoTitle(videoLink, fieldIndex, form, setTitleLoadingStates, t);
  };

  return (
    <Form
      form={form}
      name="dynamic_video_form"
      onFinish={onFinish}
      autoComplete="off"
    >
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-900/30 dark:border-blue-700">
        <Typography.Text className="text-blue-700 dark:text-blue-300">
          <strong>Add Videos:</strong> Paste YouTube video links. Video titles
          and SRT subtitle files are both required. Please provide a title and
          upload an SRT file for each video before submitting.
        </Typography.Text>
      </div>

      <Form.List name="video_links">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", marginBottom: 8 }}>
                  {/* Video link input */}
                  <Form.Item
                    {...restField}
                    name={[name, "link"]}
                    rules={[{ required: true, message: t("pleaseInputLink") }]}
                    style={{ flex: "1", marginRight: 8, marginBottom: 0 }}
                  >
                    <Input
                      placeholder={t("videoLink")}
                      onChange={(e) => {
                        const videoLink = e.target.value;
                        debouncedFetchTitle(videoLink, name);
                      }}
                      suffix={
                        titleLoadingStates[
                          form.getFieldValue(["video_links", name, "link"])
                        ] ? (
                          <LoadingOutlined style={{ color: "#1890ff" }} />
                        ) : (
                          <SearchOutlined
                            style={{ cursor: "pointer", color: "#1890ff" }}
                            onClick={() => {
                              const videoLink = form.getFieldValue([
                                "video_links",
                                name,
                                "link",
                              ]);
                              handleManualTitleFetch(videoLink, name);
                            }}
                          />
                        )
                      }
                    />
                  </Form.Item>

                  {/* Video title input */}
                  <Form.Item
                    {...restField}
                    name={[name, "title"]}
                    rules={[
                      {
                        required: true,
                        message: t("pleaseInputTitle"),
                      },
                    ]}
                    style={{ flex: "1", marginRight: 8, marginBottom: 0 }}
                  >
                    <Input placeholder={t("videoTitle") + " (required)"} />
                  </Form.Item>

                  {/* Get subtitles button */}
                  <Button
                    onClick={() => {
                      const videoLink = form.getFieldValue([
                        "video_links",
                        name,
                        "link",
                      ]);
                      openSubtitleDownloader(videoLink);
                    }}
                    style={{ marginRight: 8 }}
                    icon={<DownloadOutlined />}
                  >
                    {t("getSubtitle")}
                  </Button>

                  {/* Upload subtitle button */}
                  <Form.Item
                    style={{ marginBottom: 0, marginRight: 8 }}
                    rules={[
                      {
                        required: true,
                        message: t("pleaseUploadSubtitle"),
                      },
                    ]}
                  >
                    <Upload
                      beforeUpload={(file) => {
                        const videoLink = form.getFieldValue([
                          "video_links",
                          name,
                          "link",
                        ]);
                        handleSrtUploadWithStatus(videoLink, file);
                        return false;
                      }}
                      showUploadList={false}
                    >
                      <Button
                        icon={<UploadOutlined />}
                        loading={
                          uploadStatus[
                            form.getFieldValue(["video_links", name, "link"])
                          ] === "loading"
                        }
                      >
                        {t("uploadSubtitle")} (Required)
                      </Button>
                    </Upload>
                  </Form.Item>

                  {/* Upload status icons */}
                  {uploadStatus[
                    form.getFieldValue(["video_links", name, "link"])
                  ] === "success" && (
                    <CheckOutlined
                      style={{
                        color: "#52c41a",
                        fontSize: "20px",
                        marginRight: 8,
                      }}
                    />
                  )}
                  {uploadStatus[
                    form.getFieldValue(["video_links", name, "link"])
                  ] === "error" && (
                    <CloseCircleOutlined
                      style={{
                        color: "#ff4d4f",
                        fontSize: "20px",
                        marginRight: 8,
                      }}
                    />
                  )}

                  {/* Delete button */}
                  <Button
                    type="text"
                    icon={<MinusCircleOutlined />}
                    onClick={() => remove(name)}
                    style={{ marginLeft: "auto" }}
                  />
                </div>

                {/* Display uploaded file name */}
                {srtFiles[form.getFieldValue(["video_links", name, "link"])]
                  ?.name && (
                  <div
                    style={{
                      marginLeft: "auto",
                      paddingLeft: 8,
                      color: "#52c41a",
                    }}
                  >
                    <CheckOutlined style={{ marginRight: 4 }} />
                    {
                      srtFiles[
                        form.getFieldValue(["video_links", name, "link"])
                      ]?.name
                    }
                  </div>
                )}
              </div>
            ))}

            {/* Add video button */}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
              >
                {t("addVideo")}
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

      {/* Submit button */}
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={isLoading}
          size="large"
        >
          <CloudDownloadOutlined style={{ marginRight: 8 }} />
          Add Videos
        </Button>
      </Form.Item>
    </Form>
  );
};

const VideoManagement: React.FC = () => {
  const userInfo = useSelector((state: RootState) => state.user.userInfo);

  if (!userInfo || userInfo.role !== USER_ROLE.ADMIN) {
    return <Navigate to="/" replace />;
  }

  const [channels, setChannels] = useState<Channel[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<string>("");
  const [selectedChannelLink, setSelectedChannelLink] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    LANGUAGES.All
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddVideoModalVisible, setIsAddVideoModalVisible] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState<TranscriptItem[]>(
    []
  );
  const [isTranscriptLoading, setIsTranscriptLoading] = useState(false);
  const [editingKey, setEditingKey] = useState<string>("");
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<TranscriptItem[]>([]);
  const [transcriptHistory, setTranscriptHistory] = useState<
    TranscriptItem[][]
  >([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [form] = Form.useForm();
  const [srtFiles, setSrtFiles] = useState<{ [key: string]: File }>({});
  const [isUpdatingTranscript, setIsUpdatingTranscript] = useState(false);
  const [isBatchMerging, setIsBatchMerging] = useState(false);
  const [batchProgress, setBatchProgress] = useState({
    isVisible: false,
    total: 0,
    completed: 0,
    processing: 0,
    results: [] as Array<{
      video_id: string;
      title: string;
      status: "pending" | "processing" | "success" | "error";
      message?: string;
      originalCount?: number;
      mergedCount?: number;
    }>,
  });
  const [isTranscriptManagementVisible, setIsTranscriptManagementVisible] =
    useState(false);
  const [transcriptSummary, setTranscriptSummary] = useState<
    Array<{
      video_id: string;
      title: string;
      transcriptCount: number;
      hasOriginal: boolean;
      lastUpdated?: number;
    }>
  >([]);
  const [isLoadingTranscriptSummary, setIsLoadingTranscriptSummary] =
    useState(false);
  const [isBatchRestoring, setIsBatchRestoring] = useState(false);
  const [isBatchUpdatingVisibility, setIsBatchUpdatingVisibility] =
    useState(false);
  const [isBatchVisibilityModalVisible, setIsBatchVisibilityModalVisible] =
    useState(false);
  const [selectedVisibilityOption, setSelectedVisibilityOption] =
    useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<{
    isVisible: boolean;
    total: number;
    completed: number;
    processing: number;
    results: Array<{
      video_id: string;
      title: string;
      status: "pending" | "processing" | "success" | "error";
      message?: string;
    }>;
  }>({
    isVisible: false,
    total: 0,
    completed: 0,
    processing: 0,
    results: [],
  });

  // Filter-related state
  const [filters, setFilters] = useState<string[]>([]);
  const [selectedText, setSelectedText] = useState<string>("");
  const [isSavingFilters, setIsSavingFilters] = useState(false);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const [isBatchApplyingFilters, setIsBatchApplyingFilters] = useState(false);
  const [batchFilterProgress, setBatchFilterProgress] = useState<{
    isVisible: boolean;
    total: number;
    completed: number;
    processing: number;
    results: Array<{
      video_id: string;
      title: string;
      status: "pending" | "processing" | "success" | "error";
      message?: string;
      totalChanges?: number;
      filterStats?: { [filterText: string]: number };
    }>;
  }>({
    isVisible: false,
    total: 0,
    completed: 0,
    processing: 0,
    results: [],
  });

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    if (selectedChannel) {
      fetchVideos(selectedChannel, selectedLanguage);
    }
  }, [selectedChannel, selectedLanguage]);

  // Load filters when modal opens (only one useEffect needed)
  useEffect(() => {
    if (isModalVisible && selectedChannel) {
      loadFilters();
    }
  }, [isModalVisible, selectedChannel]);

  const fetchChannels = async () => {
    try {
      const response = await api.getChannels(
        VISIBILITY_OPTIONS.All,
        LANGUAGES.All
      );
      setChannels(response.data);
      if (response.data.length > 0) {
        const firstChannelId = response.data[0].id;
        setSelectedChannel(firstChannelId);
        setSelectedChannelLink(response.data[0].link);
      }
    } catch (error) {
      console.error("Error fetching channels:", error);
      message.error("Failed to fetch channels");
    }
  };

  const fetchVideos = async (
    channelId: string,
    language: string = LANGUAGES.All
  ) => {
    setIsLoading(true);
    try {
      const response = await api.getVideoList(
        channelId,
        VISIBILITY_OPTIONS.All,
        language
      );
      setVideos(
        response.data.videos.sort((a: Video, b: Video) => {
          if (b.updated_at && !a.updated_at) {
            return 1;
          } else if (!b.updated_at && a.updated_at) {
            return -1;
          }
          if (b.updated_at && a.updated_at) {
            return (
              new Date(b.updated_at).getTime() -
              new Date(a.updated_at).getTime()
            );
          } else {
            return (
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
            );
          }
        })
      );
    } catch (error) {
      console.error("Error fetching videos:", error);
      message.error("Failed to fetch videos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSrtUpload = (videoLink: string, file: File) => {
    const videoId = extractVideoId(videoLink);
    if (!videoId) {
      message.error(
        "Invalid YouTube URL. Please enter a valid URL before uploading SRT."
      );
      return;
    }
    // Keep the original filename but map it to the video ID
    const newFile = new File([file], `${videoId}.srt`, { type: file.type });
    setSrtFiles((prev) => ({ ...prev, [videoId]: newFile }));
    message.success(`SRT file uploaded for video ${videoId}`);
  };

  const showTranscript = async (channelId: string, videoId: string) => {
    setIsTranscriptLoading(true);
    setIsModalVisible(true);
    setCurrentVideoId(videoId);
    setSelectedChannel(channelId);
    try {
      const response = await api.getVideoTranscript(channelId, videoId);
      setCurrentTranscript(response.data.transcript);

      // Don't call loadFilters here - let useEffect handle it
    } catch (error) {
      console.error("Error fetching transcript:", error);
      message.error("Failed to fetch transcript");
    } finally {
      setIsTranscriptLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(2);
    return `${minutes}:${remainingSeconds.padStart(5, "0")}`;
  };

  const formatUnixTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const isEditing = (record: Video | TranscriptItem): boolean => {
    if ("video_id" in record) {
      return record.video_id === editingKey;
    } else {
      return record.start.toString() === editingKey;
    }
  };

  const edit = (record: Video | TranscriptItem) => {
    if ("video_id" in record) {
      form.setFieldsValue({ ...record });
      setEditingKey(record.video_id);
    } else {
      form.setFieldsValue({ transcript: record.transcript });
      setEditingKey(record.start.toString());
    }
  };

  const cancel = () => {
    setEditingKey("");
  };

  const saveVideo = async (key: string, fieldName?: string) => {
    try {
      let updatedFields: Partial<Video>;

      if (fieldName) {
        const value = form.getFieldValue(fieldName);
        updatedFields = { [fieldName]: value } as Partial<Video>;
      } else {
        const currentValues = await form.validateFields();
        const originalVideo = videos.find((v) => v.video_id === key);

        if (!originalVideo) {
          message.error("Video not found");
          return;
        }

        updatedFields = {};
        (Object.keys(currentValues) as Array<keyof Video>).forEach((field) => {
          if (currentValues[field] !== originalVideo[field]) {
            updatedFields[field] = currentValues[field];
          }
        });

        if (Object.keys(updatedFields).length === 0) {
          setEditingKey("");
          return;
        }
      }

      await api.updateVideo(selectedChannel!, key, updatedFields);
      const newData = [...videos];
      const index = newData.findIndex((item) => key === item.video_id);
      if (index > -1) {
        newData[index] = {
          ...newData[index],
          ...updatedFields,
        };
        setVideos(newData);
        if (!fieldName) {
          setEditingKey("");
        }
        message.success("Video updated successfully");
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
      message.error("Failed to update video");
    }
  };

  const saveTranscript = async (key: string) => {
    try {
      const row = await form.validateFields();
      const newData = [...currentTranscript];
      const index = newData.findIndex((item) => key === item.start.toString());
      if (index > -1) {
        const item = newData[index];
        const updatedItem = {
          ...item,
          ...row,
        };
        newData.splice(index, 1, updatedItem);
        setCurrentTranscript(newData);
        setEditingKey("");
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const mergeTranscripts = () => {
    if (selectedRows.length < 2) {
      message.warning("Please select at least two rows to merge");
      return;
    }

    setTranscriptHistory([...transcriptHistory, currentTranscript]);

    const sortedRows = [...selectedRows].sort((a, b) => a.start - b.start);
    const mergedTranscript: TranscriptItem = {
      start: sortedRows[0].start,
      end: sortedRows[sortedRows.length - 1].end,
      transcript: sortedRows.map((row) => row.transcript).join(" "),
    };

    const newTranscript = currentTranscript.filter(
      (item) => !selectedRows.some((row) => row.start === item.start)
    );
    newTranscript.push(mergedTranscript);
    newTranscript.sort((a, b) => a.start - b.start);

    setCurrentTranscript(newTranscript);
    setSelectedRows([]);
    setSelectedRowKeys([]);
  };

  const undoMerge = () => {
    if (transcriptHistory.length > 0) {
      const previousTranscript =
        transcriptHistory[transcriptHistory.length - 1];
      setCurrentTranscript(previousTranscript);
      setTranscriptHistory(transcriptHistory.slice(0, -1));
      setSelectedRows([]);
      setSelectedRowKeys([]);
    } else {
      message.info("No more actions to undo");
    }
  };

  const updateFullTranscript = async () => {
    try {
      setIsUpdatingTranscript(true);
      await api.updateFullTranscript(
        selectedChannel!,
        currentVideoId!,
        currentTranscript
      );
      message.success("Full transcript updated successfully");
    } catch (error) {
      console.error("Error updating full transcript:", error);
      message.error("Failed to update full transcript");
    } finally {
      setIsUpdatingTranscript(false);
    }
  };

  const loadOriginalTranscript = () => {
    if (!currentVideoId || !selectedChannel) {
      message.error("No video or channel selected");
      return;
    }

    Modal.confirm({
      title: "Restore Original Transcript",
      content:
        "Are you sure you want to restore the original transcript? This action will overwrite any changes you've made.",
      onOk: async () => {
        setIsTranscriptLoading(true);
        try {
          const response = await api.restoreTranscript(
            selectedChannel,
            currentVideoId
          );
          setCurrentTranscript(response.data.transcript);
          message.success("Original transcript restored successfully");
        } catch (error) {
          console.error("Error restoring original transcript:", error);
          message.error("Failed to restore original transcript");
        } finally {
          setIsTranscriptLoading(false);
        }
      },
      onCancel() {
        // Do nothing if the user cancels
      },
    });
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (
      selectedRowKeys: React.Key[],
      selectedRows: TranscriptItem[]
    ) => {
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows(selectedRows);
    },
  };

  const transcriptColumns = [
    {
      title: "Start Time",
      dataIndex: "start",
      key: "start",
      render: (text: number) => formatTime(text),
      width: "15%",
    },
    {
      title: "End Time",
      dataIndex: "end",
      key: "end",
      render: (text: number) => formatTime(text),
      width: "15%",
    },
    {
      title: "Transcript",
      dataIndex: "transcript",
      key: "transcript",
      editable: true,
    },
    {
      title: "Action",
      dataIndex: "operation",
      render: (_: any, record: TranscriptItem) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Button
              onClick={() => saveTranscript(record.start.toString())}
              style={{ marginRight: 8 }}
              type="link"
            >
              Save
            </Button>
            <Button onClick={cancel} type="link">
              Cancel
            </Button>
          </span>
        ) : (
          <Button
            disabled={editingKey !== ""}
            onClick={() => edit(record)}
            icon={<EditOutlined />}
          >
            Edit
          </Button>
        );
      },
      width: "15%",
    },
  ];

  const mergedTranscriptColumns = transcriptColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: TranscriptItem) => ({
        record,
        inputType: col.dataIndex === "transcript" ? "textarea" : "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const handleDeleteVideo = async (channelId: string, videoId: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this video?",
      content: "This action cannot be undone.",
      onOk: async () => {
        try {
          await api.deleteVideo(channelId, videoId);
          message.success("Video deleted successfully");
          fetchVideos(channelId);
        } catch (error) {
          console.error("Error deleting video:", error);
          message.error("Failed to delete video");
        }
      },
    });
  };

  const columns = [
    {
      title: "Video ID",
      dataIndex: "video_id",
      key: "video_id",
      editable: false,
      width: "15%",
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      editable: true,
      width: "30%",
    },
    {
      title: "Link",
      dataIndex: "link",
      key: "link",
      editable: false,
      width: "30%",
      render: (text: string) => (
        <a href={text} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ),
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      width: "15%",
      editable: false,
      render: (text: number) => (text ? formatUnixTimestamp(text) : ""),
    },
    {
      title: "Updated At",
      dataIndex: "updated_at",
      key: "updated_at",
      width: "15%",
      editable: false,
      render: (text: number) => (text ? formatUnixTimestamp(text) : ""),
    },
    {
      title: "Visibility",
      dataIndex: "visibility",
      key: "visibility",
      width: "15%",
      editable: false,
      render: (visibility: string, record: Video) => (
        <Select
          value={visibility}
          style={{ width: 120 }}
          onChange={(value) => {
            form.setFieldsValue({ visibility: value });
            saveVideo(record.video_id, "visibility");
          }}
          className="video-visibility-select"
        >
          {Object.entries(VISIBILITY_OPTIONS)
            .filter(([_, value]) => value !== "all")
            .map(([key, value]) => (
              <Option key={value} value={value} className="visibility-option">
                {key}
              </Option>
            ))}
        </Select>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: string, record: Video) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Button
              onClick={() => saveVideo(record.video_id)}
              style={{ marginRight: 8 }}
              icon={<SaveOutlined />}
            >
              Save
            </Button>
            <Button onClick={cancel} icon={<CloseOutlined />}>
              Cancel
            </Button>
          </span>
        ) : (
          <Space>
            <Button
              onClick={() => showTranscript(selectedChannel!, record.video_id)}
            >
              View Transcript
            </Button>
            <Button onClick={() => edit(record)} icon={<EditOutlined />}>
              Edit
            </Button>
            <Button
              danger
              onClick={() =>
                handleDeleteVideo(selectedChannel!, record.video_id)
              }
            >
              Delete
            </Button>
          </Space>
        );
      },
      width: "30%",
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: Video) => ({
        record,
        inputType: col.dataIndex === "link" ? "text" : "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const handleChannelChange = (value: string) => {
    setSelectedChannel(value);
    setSelectedChannelLink(
      channels.find((channel) => channel.id === value)?.link || ""
    );
  };

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    // Check if the current selected channel matches the new language filter
    const currentChannel = channels.find((c) => c.id === selectedChannel);
    if (
      currentChannel &&
      value !== LANGUAGES.All &&
      currentChannel.language !== value
    ) {
      // If the current channel doesn't match the new language filter, reset the channel selection
      setSelectedChannel("");
      setSelectedChannelLink("");
      setVideos([]); // Clear videos as no channel is selected
    }
    // Fetching videos will be handled by the useEffect watching selectedLanguage and selectedChannel
  };

  const showAddVideoModal = () => {
    if (!selectedChannel) {
      message.error("Please select a channel first");
      return;
    }
    setIsAddVideoModalVisible(true);
  };

  // Function to automatically merge transcript items
  const autoMergeTranscripts = () => {
    if (!currentTranscript || currentTranscript.length === 0) {
      message.warning("No transcript available to merge");
      return;
    }

    // Save current state to history before making changes
    setTranscriptHistory([...transcriptHistory, [...currentTranscript]]);

    const originalLength = currentTranscript.length;
    // Use simplified merge function with configurable parameters
    // maxDuration: 10 seconds, toleranceDuration: 2 seconds
    const mergedResult = autoMergeTranscriptItems(
      currentTranscript,
      10 // maxDuration - 10 seconds max per merged item
    );

    // Update transcript state
    setCurrentTranscript(mergedResult);
    message.success(
      `Auto-merged transcript: ${originalLength} items → ${mergedResult.length} items`
    );
  };

  // Function to automatically merge all transcripts in the channel
  const autoMergeAllTranscripts = async () => {
    if (!selectedChannel || videos.length === 0) {
      message.warning("No channel selected or no videos available");
      return;
    }

    if (transcriptSummary.length === 0) {
      message.info(
        "No videos need merging. All videos either have original transcripts (already modified) or no transcripts."
      );
      return;
    }

    const confirmModal = Modal.confirm({
      title: "Auto Merge All Transcripts",
      content: `Are you sure you want to auto-merge transcripts for ${transcriptSummary.length} videos (out of ${videos.length} total)`,
      onOk: async () => {
        // Close the confirm modal immediately
        confirmModal.destroy();

        setIsBatchMerging(true);

        // Initialize progress state - only for videos that need merging
        const initialResults = transcriptSummary.map((summary) => ({
          video_id: summary.video_id,
          title: summary.title,
          status: "pending" as const,
        }));

        setBatchProgress({
          isVisible: true,
          total: transcriptSummary.length,
          completed: 0,
          processing: 0,
          results: initialResults,
        });

        try {
          const videosToUpdate: Array<{
            video_id: string;
            transcript: TranscriptItem[];
          }> = [];
          let processedCount = 0;
          let mergedCount = 0;
          const BATCH_SIZE = 5; // Process 5 videos at a time

          // Process videos in batches - only process videos that need merging
          for (let i = 0; i < transcriptSummary.length; i += BATCH_SIZE) {
            const batch = transcriptSummary.slice(i, i + BATCH_SIZE);

            // Update status to processing for current batch
            setBatchProgress((prev) => ({
              ...prev,
              processing: batch.length,
              results: prev.results.map((result) => {
                const isInCurrentBatch = batch.some(
                  (summary) => summary.video_id === result.video_id
                );
                return isInCurrentBatch && result.status === "pending"
                  ? { ...result, status: "processing" as const }
                  : result;
              }),
            }));

            // Process current batch
            const batchPromises = batch.map(async (summary) => {
              try {
                // Get the current transcript for this video
                const response = await api.getVideoTranscript(
                  selectedChannel,
                  summary.video_id
                );
                const originalTranscript = response.data.transcript;

                if (!originalTranscript || originalTranscript.length === 0) {
                  return {
                    video_id: summary.video_id,
                    needsUpdate: false,
                    message: "No transcript available",
                  };
                }

                // Apply auto-merge to this transcript
                const mergedTranscript = autoMergeTranscriptItems(
                  originalTranscript,
                  10 // maxDuration - 10 seconds max per merged item
                );

                // Check if there was actually a change
                const needsUpdate =
                  mergedTranscript.length !== originalTranscript.length;

                return {
                  video_id: summary.video_id,
                  needsUpdate,
                  originalCount: originalTranscript.length,
                  mergedCount: mergedTranscript.length,
                  transcript: needsUpdate ? mergedTranscript : null,
                  message: needsUpdate
                    ? `Reduced from ${originalTranscript.length} to ${mergedTranscript.length} items`
                    : "No merging needed",
                };
              } catch (error) {
                console.error(
                  `Error processing video ${summary.video_id}:`,
                  error
                );
                return {
                  video_id: summary.video_id,
                  needsUpdate: false,
                  error: true,
                  message: `Error: ${
                    error instanceof Error ? error.message : "Unknown error"
                  }`,
                };
              }
            });

            // Wait for current batch to complete
            const batchResults = await Promise.all(batchPromises);

            // Update progress with batch results
            setBatchProgress((prev) => ({
              ...prev,
              completed: prev.completed + batch.length,
              processing: 0,
              results: prev.results.map((result) => {
                const batchResult = batchResults.find(
                  (br) => br.video_id === result.video_id
                );
                if (batchResult) {
                  return {
                    ...result,
                    status: batchResult.error
                      ? ("error" as const)
                      : ("success" as const),
                    message: batchResult.message,
                    originalCount: batchResult.originalCount,
                    mergedCount: batchResult.mergedCount,
                  };
                }
                return result;
              }),
            }));

            // Collect videos that need updating
            batchResults.forEach((result) => {
              if (result.needsUpdate && result.transcript) {
                videosToUpdate.push({
                  video_id: result.video_id,
                  transcript: result.transcript,
                });
                mergedCount++;
              }
            });

            processedCount += batch.length;

            // Small delay between batches to prevent overwhelming the server
            if (i + BATCH_SIZE < transcriptSummary.length) {
              await new Promise((resolve) => setTimeout(resolve, 500));
            }
          }

          if (videosToUpdate.length === 0) {
            message.info("No transcripts needed merging");
            return;
          }

          // Update progress to show saving phase
          setBatchProgress((prev) => ({
            ...prev,
            results: prev.results.map((result) => {
              const needsUpdate = videosToUpdate.some(
                (v) => v.video_id === result.video_id
              );
              return needsUpdate
                ? {
                    ...result,
                    status: "processing" as const,
                    message: "Saving to server...",
                  }
                : result;
            }),
          }));

          // Batch update all modified transcripts
          const result = await api.batchUpdateTranscripts(
            selectedChannel,
            videosToUpdate
          );

          // Update final status
          setBatchProgress((prev) => ({
            ...prev,
            results: prev.results.map((progressResult) => {
              const updateResult = result.results?.find(
                (r: any) => r.video_id === progressResult.video_id
              );
              const needsUpdate = videosToUpdate.some(
                (v) => v.video_id === progressResult.video_id
              );

              if (needsUpdate) {
                return {
                  ...progressResult,
                  status: updateResult?.success
                    ? ("success" as const)
                    : ("error" as const),
                  message: updateResult?.message || progressResult.message,
                };
              }
              return progressResult;
            }),
          }));

          message.success(
            `Batch auto-merge completed: ${result.success_count} videos updated successfully, ${result.error_count} failed. Total processed: ${processedCount}, merged: ${mergedCount}`
          );

          // Refresh the video list to show updated timestamps
          fetchVideos(selectedChannel);
        } catch (error) {
          console.error("Error in batch auto-merge:", error);
          message.error("Failed to auto-merge all transcripts");

          // Update all processing items to error
          setBatchProgress((prev) => ({
            ...prev,
            results: prev.results.map((result) =>
              result.status === "processing"
                ? {
                    ...result,
                    status: "error" as const,
                    message: "Process failed",
                  }
                : result
            ),
          }));
        } finally {
          setIsBatchMerging(false);
          // Ensure the modal title updates correctly by forcing a re-render
          setTimeout(() => {
            if (batchProgress.isVisible) {
              setBatchProgress((prev) => ({ ...prev }));
            }
          }, 100);
        }
      },
      onCancel() {
        // Do nothing if the user cancels
      },
    });
  };

  // Function to show transcript management modal
  const showTranscriptManagement = async () => {
    if (!selectedChannel || videos.length === 0) {
      message.warning("No channel selected or no videos available");
      return;
    }

    setIsTranscriptManagementVisible(true);
    setIsLoadingTranscriptSummary(true);

    try {
      // Get transcript summary and filters in parallel
      const [summaryResponse, filtersResponse] = await Promise.all([
        api.getTranscriptSummary(selectedChannel),
        api.getTranscriptFilters(selectedChannel),
      ]);

      const summaries = summaryResponse.summaries || [];

      // Transform the data to match our component's expected format
      const transformedSummary = summaries.map((summary: any) => ({
        video_id: summary.video_id,
        title: summary.title,
        transcriptCount: summary.transcript_count,
        hasOriginal: summary.has_original,
        lastUpdated: summary.last_updated,
      }));

      setTranscriptSummary(transformedSummary);
      setFilters(filtersResponse.filters || []);
    } catch (error) {
      console.error("Error loading transcript management data:", error);
      message.error("Failed to load transcript management data");
    } finally {
      setIsLoadingTranscriptSummary(false);
    }
  };

  // Function to restore all transcripts
  const restoreAllTranscripts = async () => {
    if (!selectedChannel || videos.length === 0) {
      message.warning("No channel selected or no videos available");
      return;
    }

    const confirmModal = Modal.confirm({
      title: "Restore All Transcripts",
      content: `Are you sure you want to restore all ${videos.length} transcripts in this channel? This will revert all transcripts to their original state and cannot be undone.`,
      onOk: async () => {
        // Close the confirm modal immediately
        confirmModal.destroy();

        setIsBatchRestoring(true);

        // Initialize progress state
        const initialResults = videos.map((video) => ({
          video_id: video.video_id,
          title: video.title,
          status: "pending" as const,
        }));

        setBatchProgress({
          isVisible: true,
          total: videos.length,
          completed: 0,
          processing: 0,
          results: initialResults,
        });

        try {
          const videosToRestore = videos.map((video) => ({
            video_id: video.video_id,
          }));

          // Update progress to show saving phase
          setBatchProgress((prev) => ({
            ...prev,
            results: prev.results.map((result) => ({
              ...result,
              status: "processing" as const,
              message: "Restoring transcript...",
            })),
          }));

          // Batch restore all transcripts
          const result = await api.batchRestoreTranscripts(
            selectedChannel,
            videosToRestore
          );

          // Update final status
          setBatchProgress((prev) => ({
            ...prev,
            completed: videos.length,
            processing: 0,
            results: prev.results.map((progressResult) => {
              const restoreResult = result.results?.find(
                (r: any) => r.video_id === progressResult.video_id
              );

              if (restoreResult) {
                return {
                  ...progressResult,
                  status: restoreResult.success
                    ? ("success" as const)
                    : ("error" as const),
                  message: restoreResult.message || progressResult.message,
                };
              }
              return progressResult;
            }),
          }));

          message.success(
            `Batch restore completed: ${result.success_count} videos restored successfully, ${result.error_count} failed`
          );

          // Refresh the video list and transcript summary
          fetchVideos(selectedChannel);
          showTranscriptManagement();
        } catch (error) {
          console.error("Error in batch restore:", error);
          message.error("Failed to restore all transcripts");

          // Update all processing items to error
          setBatchProgress((prev) => ({
            ...prev,
            results: prev.results.map((result) =>
              result.status === "processing"
                ? {
                    ...result,
                    status: "error" as const,
                    message: "Process failed",
                  }
                : result
            ),
          }));
        } finally {
          setIsBatchRestoring(false);
          // Ensure the modal title updates correctly by forcing a re-render
          setTimeout(() => {
            if (batchProgress.isVisible) {
              setBatchProgress((prev) => ({ ...prev }));
            }
          }, 100);
        }
      },
      onCancel() {
        // Do nothing if the user cancels
      },
    });
  };

  // Function to batch update visibility for all videos in the channel
  const batchUpdateVisibility = async (visibility: string) => {
    if (!selectedChannel || videos.length === 0) {
      message.warning("No channel selected or no videos available");
      return;
    }

    const confirmModal = Modal.confirm({
      title: "Batch Update Video Visibility",
      content: `Are you sure you want to update visibility to "${visibility}" for all ${videos.length} videos in this channel? This action cannot be undone.`,
      onOk: async () => {
        // Close the confirm modal immediately
        confirmModal.destroy();

        setIsBatchUpdatingVisibility(true);

        // Initialize progress state
        const initialResults = videos.map((video) => ({
          video_id: video.video_id,
          title: video.title,
          status: "pending" as const,
        }));

        setBatchProgress({
          isVisible: true,
          total: videos.length,
          completed: 0,
          processing: 0,
          results: initialResults,
        });

        try {
          // Update progress to show processing phase
          setBatchProgress((prev) => ({
            ...prev,
            results: prev.results.map((result) => ({
              ...result,
              status: "processing" as const,
              message: `Updating visibility to ${visibility}...`,
            })),
          }));

          // Call the batch update API
          const result = await api.batchUpdateVideoVisibility(
            selectedChannel,
            visibility
          );

          // Update final status based on API results
          setBatchProgress((prev) => ({
            ...prev,
            completed: videos.length,
            processing: 0,
            results: prev.results.map((progressResult) => {
              const apiResult = result.results?.find(
                (r: any) => r.video_id === progressResult.video_id
              );

              if (apiResult) {
                return {
                  ...progressResult,
                  status: apiResult.success
                    ? ("success" as const)
                    : ("error" as const),
                  message: apiResult.message || progressResult.message,
                };
              }
              return {
                ...progressResult,
                status: "success" as const,
                message: `Visibility updated to ${visibility}`,
              };
            }),
          }));

          message.success(
            `Batch visibility update completed: ${result.success_count} videos updated successfully, ${result.error_count} failed`
          );

          // Refresh the video list to show updated visibility
          fetchVideos(selectedChannel);
        } catch (error) {
          console.error("Error in batch visibility update:", error);
          message.error("Failed to update video visibility");

          // Update all processing items to error
          setBatchProgress((prev) => ({
            ...prev,
            results: prev.results.map((result) =>
              result.status === "processing"
                ? {
                    ...result,
                    status: "error" as const,
                    message: "Update failed",
                  }
                : result
            ),
          }));
        } finally {
          setIsBatchUpdatingVisibility(false);
          // Ensure the modal title updates correctly by forcing a re-render
          setTimeout(() => {
            if (batchProgress.isVisible) {
              setBatchProgress((prev) => ({ ...prev }));
            }
          }, 100);
        }
      },
      onCancel() {
        // Do nothing if the user cancels
      },
    });
  };

  // Function to show batch visibility update modal
  const showBatchVisibilityModal = () => {
    if (!selectedChannel || videos.length === 0) {
      message.warning("No channel selected or no videos available");
      return;
    }
    setIsBatchVisibilityModalVisible(true);
    setSelectedVisibilityOption("");
  };

  // Filter-related functions
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim());
    }
  };

  const addToFilters = () => {
    if (!selectedText.trim()) {
      message.warning("Please select some text first");
      return;
    }

    if (filters.includes(selectedText)) {
      message.warning("This filter already exists");
      return;
    }

    setFilters([...filters, selectedText]);
    message.success(`Added "${selectedText}" to filters`);
    setSelectedText("");
  };

  const removeFilter = (filter: string) => {
    setFilters(filters.filter((f) => f !== filter));
    message.success(`Removed "${filter}" from filters`);
  };

  const saveFilters = async () => {
    if (filters.length === 0) {
      message.warning("No filters to save");
      return;
    }

    setIsSavingFilters(true);
    try {
      // Save all current filters to Redis
      await api.saveTranscriptFilters(selectedChannel!, filters);

      message.success(`Saved ${filters.length} filters successfully`);
    } catch (error) {
      console.error("Error saving filters:", error);
      message.error("Failed to save filters");
    } finally {
      setIsSavingFilters(false);
    }
  };

  const loadFilters = async () => {
    if (!selectedChannel) {
      return;
    }

    try {
      const response = await api.getTranscriptFilters(selectedChannel);

      // API function already returns response.data, so response = {channel_id: "...", filters: [...]}
      let filtersData = [];
      if (response && Array.isArray(response.filters)) {
        filtersData = response.filters;
      }

      setFilters(filtersData);
    } catch (error) {
      console.error("Error loading filters:", error);
      setFilters([]); // Set empty array on error
    }
  };

  const applyAllFilters = async () => {
    if (filters.length === 0) {
      message.warning("No filters to apply");
      return;
    }

    if (!currentVideoId || !selectedChannel) {
      message.error("No video or channel selected");
      return;
    }

    setIsApplyingFilters(true);

    // Save current state to history before making changes
    setTranscriptHistory([...transcriptHistory, [...currentTranscript]]);

    try {
      // Call backend API to apply filters
      const response = await api.applySingleVideoFilters(
        selectedChannel,
        currentVideoId,
        filters
      );

      // Update transcript with the filtered result from backend
      if (response.transcript) {
        setCurrentTranscript(response.transcript);

        // Show detailed success message
        const totalChanges = response.total_changes || 0;
        if (totalChanges > 0) {
          message.success(
            `Applied ${filters.length} filters to transcript: ${totalChanges} changes made`
          );
        } else {
          message.info(
            `Applied ${filters.length} filters to transcript: No matches found`
          );
        }
      } else {
        message.error("No transcript data received from server");
      }
    } catch (error) {
      console.error("Error applying filters:", error);
      message.error("Failed to apply filters");

      // Restore previous state on error
      if (transcriptHistory.length > 0) {
        const previousState = transcriptHistory[transcriptHistory.length - 1];
        setCurrentTranscript(previousState);
        setTranscriptHistory(transcriptHistory.slice(0, -1));
      }
    } finally {
      setIsApplyingFilters(false);
    }
  };

  // Batch apply filters to all transcripts
  const batchApplyFiltersToAllTranscripts = async () => {
    if (!selectedChannel || transcriptSummary.length === 0) {
      message.warning("No channel selected or no videos available");
      return;
    }

    if (filters.length === 0) {
      message.warning("No filters available to apply");
      return;
    }

    // Filter videos that have transcripts
    const videosWithTranscripts = transcriptSummary.filter(
      (summary) => summary.transcriptCount > 0
    );

    if (videosWithTranscripts.length === 0) {
      message.info("No videos with transcripts found");
      return;
    }

    const confirmModal = Modal.confirm({
      title: "Batch Apply Filters to All Transcripts",
      content: `Are you sure you want to apply ${filters.length} filters to ${videosWithTranscripts.length} videos with transcripts? This action will modify these transcripts and cannot be easily undone.`,
      onOk: async () => {
        confirmModal.destroy();

        setIsBatchApplyingFilters(true);

        // Initialize progress state
        const initialResults = videosWithTranscripts.map((summary) => ({
          video_id: summary.video_id,
          title: summary.title,
          status: "pending" as const,
        }));

        setBatchFilterProgress({
          isVisible: true,
          total: videosWithTranscripts.length,
          completed: 0,
          processing: 0,
          results: initialResults,
        });

        try {
          let processedCount = 0;
          let successCount = 0;
          let errorCount = 0;
          const BATCH_SIZE = 5; // Process 5 videos at a time as requested

          // Process videos in batches
          for (let i = 0; i < videosWithTranscripts.length; i += BATCH_SIZE) {
            const batch = videosWithTranscripts.slice(i, i + BATCH_SIZE);
            const batchVideoIds = batch.map((summary) => summary.video_id);

            // Update status to processing for current batch
            setBatchFilterProgress((prev) => ({
              ...prev,
              processing: batch.length,
              results: prev.results.map((result) => {
                const isInCurrentBatch = batch.some(
                  (summary) => summary.video_id === result.video_id
                );
                return isInCurrentBatch && result.status === "pending"
                  ? { ...result, status: "processing" as const }
                  : result;
              }),
            }));

            try {
              // Call batch apply filters API
              const response = await api.batchApplyFilters(
                selectedChannel,
                batchVideoIds,
                filters
              );

              // Update progress with batch results
              setBatchFilterProgress((prev) => ({
                ...prev,
                completed: prev.completed + batch.length,
                processing: 0,
                results: prev.results.map((progressResult) => {
                  const apiResult = response.results?.find(
                    (r: any) => r.video_id === progressResult.video_id
                  );

                  if (apiResult) {
                    if (apiResult.success) {
                      successCount++;
                    } else {
                      errorCount++;
                    }

                    return {
                      ...progressResult,
                      status: apiResult.success
                        ? ("success" as const)
                        : ("error" as const),
                      message: apiResult.message,
                      totalChanges: apiResult.total_changes,
                      filterStats: apiResult.filter_stats,
                    };
                  }
                  return progressResult;
                }),
              }));

              processedCount += batch.length;

              // Small delay between batches to prevent overwhelming the server
              if (i + BATCH_SIZE < videosWithTranscripts.length) {
                await new Promise((resolve) => setTimeout(resolve, 500));
              }
            } catch (error) {
              console.error(
                `Error processing batch starting at index ${i}:`,
                error
              );

              // Mark all videos in this batch as error
              setBatchFilterProgress((prev) => ({
                ...prev,
                completed: prev.completed + batch.length,
                processing: 0,
                results: prev.results.map((result) => {
                  const isInCurrentBatch = batch.some(
                    (summary) => summary.video_id === result.video_id
                  );
                  if (isInCurrentBatch && result.status === "processing") {
                    errorCount++;
                    return {
                      ...result,
                      status: "error" as const,
                      message: `Batch processing error: ${
                        error instanceof Error ? error.message : "Unknown error"
                      }`,
                    };
                  }
                  return result;
                }),
              }));

              processedCount += batch.length;
            }
          }

          message.success(
            `Batch filter application completed: ${successCount} videos processed successfully, ${errorCount} failed. Applied ${filters.length} filters.`
          );

          // Refresh the transcript summary to show updated counts
          showTranscriptManagement();
        } catch (error) {
          console.error("Error in batch filter application:", error);
          message.error("Failed to apply filters to transcripts");

          // Update all processing items to error
          setBatchFilterProgress((prev) => ({
            ...prev,
            results: prev.results.map((result) =>
              result.status === "processing"
                ? {
                    ...result,
                    status: "error" as const,
                    message: "Process failed",
                  }
                : result
            ),
          }));
        } finally {
          setIsBatchApplyingFilters(false);
        }
      },
      onCancel() {
        // Do nothing if the user cancels
      },
    });
  };

  const onFinish = async (values: {
    video_links: Array<{ link: string; title: string }>;
  }) => {
    setIsLoading(true);
    try {
      const formData = new FormData();

      const videoData = values.video_links.map((video) => ({
        channel_id: selectedChannel,
        video_link: video.link,
        title: video.title,
        visibility: VISIBILITY_OPTIONS.Private,
      }));

      // Validate that all videos have SRT files uploaded
      const missingFiles: string[] = [];
      videoData.forEach((video) => {
        const videoId = extractVideoId(video.video_link);
        const file = srtFiles[videoId];
        if (!file) {
          missingFiles.push(video.title || video.video_link);
        }
      });

      if (missingFiles.length > 0) {
        message.error(
          `Please upload SRT files for the following videos: ${missingFiles.join(
            ", "
          )}`
        );
        setIsLoading(false);
        return;
      }

      formData.append("data", JSON.stringify(videoData));

      // Add SRT files (required)
      videoData.forEach((video) => {
        const videoId = extractVideoId(video.video_link);
        const file = srtFiles[videoId];
        if (file) {
          formData.append("transcript_files", file, file.name);
        }
      });

      // Initialize progress state
      const initialResults = videoData.map((video) => ({
        video_id: extractVideoId(video.video_link),
        title: video.title || video.video_link,
        status: "pending" as const,
      }));

      setUploadProgress({
        isVisible: true,
        total: videoData.length,
        completed: 0,
        processing: 0,
        results: initialResults,
      });

      const res = await api.uploadVideos(formData);

      // Update progress with results
      setUploadProgress((prev) => ({
        ...prev,
        completed: videoData.length,
        processing: 0,
        results: prev.results.map((result) => {
          const apiResult = res.results?.find(
            (r: any) => r.video_id === result.video_id
          );
          return {
            ...result,
            status: apiResult?.success ? "success" : "error",
            message: apiResult?.message || "Upload completed",
          };
        }),
      }));

      if (res.message === "partially success") {
        message.success("Some videos uploaded successfully.");
        if (res.duplicate_video_ids && res.duplicate_video_ids.length > 0) {
          message.warning(
            `Duplicate videos skipped: ${res.duplicate_video_ids.join(", ")}`
          );
        }
      } else {
        message.success("Videos uploaded successfully");
      }

      // Show detailed results if available
      if (res.results && Array.isArray(res.results)) {
        interface VideoUploadResult {
          success?: string;
          transcript_source?: string;
          transcript_count?: number;
        }

        const uploadedCount = res.results.filter(
          (r: VideoUploadResult) => r.transcript_source === "uploaded_srt"
        ).length;

        if (uploadedCount > 0) {
          message.info(
            `${uploadedCount} video(s) processed with uploaded SRT files`
          );
        }
      }

      fetchVideos(selectedChannel!);
      setSrtFiles({});
      setIsAddVideoModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Error uploading videos:", error);
      message.error("Failed to upload videos");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Card title="Video Management">
        <Space style={{ marginBottom: 16 }}>
          <span style={{ marginRight: 8 }}>Language:</span>
          <Select
            style={{ width: 150 }}
            placeholder="Select Language"
            onChange={handleLanguageChange}
            value={selectedLanguage}
          >
            {Object.entries(LANGUAGES).map(([key, value]) => (
              <Option key={value} value={value}>
                {key}
              </Option>
            ))}
          </Select>

          <span style={{ marginLeft: 16, marginRight: 8 }}>Channel:</span>
          <Select
            style={{ width: 250 }}
            placeholder="Select a channel"
            onChange={handleChannelChange}
            value={selectedChannel || undefined}
            allowClear
            onClear={() => {
              setSelectedChannel("");
              setSelectedChannelLink("");
              setVideos([]);
            }}
          >
            {channels
              .filter(
                (channel) =>
                  selectedLanguage === LANGUAGES.All ||
                  channel.language === selectedLanguage
              )
              .sort((a, b) => a.language.localeCompare(b.language))
              .map((channel) => (
                <Option key={channel.id} value={channel.id}>
                  ({channel.language.toUpperCase()}) {channel.name}
                </Option>
              ))}
          </Select>

          <Button
            type="primary"
            onClick={() => {
              if (selectedChannelLink)
                window.open(selectedChannelLink, "_blank");
            }}
            disabled={!selectedChannelLink}
            style={{ marginLeft: 10 }}
          >
            Open Channel
          </Button>
          <Button
            type="primary"
            onClick={showAddVideoModal}
            disabled={!selectedChannel}
            style={{ marginLeft: 10 }}
          >
            Add Videos
          </Button>
          <Button
            type="primary"
            onClick={() => fetchVideos(selectedChannel!)}
            className="refresh-button"
            style={{ marginLeft: 10 }}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            onClick={showTranscriptManagement}
            disabled={!selectedChannel || videos.length === 0}
            icon={<MergeCellsOutlined />}
            style={{ marginLeft: 10 }}
          >
            Transcript Management
          </Button>
          <Button
            type="primary"
            onClick={showBatchVisibilityModal}
            disabled={!selectedChannel || videos.length === 0}
            icon={<EditOutlined />}
            style={{ marginLeft: 10 }}
          >
            Batch Visibility Update
          </Button>
        </Space>
        <Form form={form} component={false}>
          <Table
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            columns={mergedColumns}
            dataSource={videos}
            rowKey="video_id"
            loading={isLoading}
            scroll={{ y: 400 }}
          />
        </Form>
      </Card>
      <Modal
        title="Add Videos"
        maskClosable={false}
        open={isAddVideoModalVisible}
        onCancel={() => setIsAddVideoModalVisible(false)}
        footer={null}
        width={800}
      >
        <AddVideosForm
          onFinish={onFinish}
          isLoading={isLoading}
          form={form}
          handleSrtUpload={handleSrtUpload}
          srtFiles={srtFiles}
        />
      </Modal>
      <Modal
        maskClosable={false}
        title={`Video Transcript - ${currentVideoId}`}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          // Clear filter states when modal closes
          setSelectedText("");
        }}
        zIndex={1100}
        footer={
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* First Row: Transcript & Merge Operations */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Space>
                <Button
                  onClick={loadOriginalTranscript}
                  icon={<CloudDownloadOutlined />}
                  size="middle"
                >
                  Restore
                </Button>
                <Button
                  onClick={undoMerge}
                  disabled={transcriptHistory.length === 0}
                  icon={<UndoOutlined />}
                  size="middle"
                >
                  Undo
                </Button>
                <Button
                  onClick={autoMergeTranscripts}
                  icon={<MergeCellsOutlined />}
                  size="middle"
                >
                  Auto Merge
                </Button>
                <Button
                  onClick={mergeTranscripts}
                  disabled={selectedRows.length < 2}
                  icon={<MergeCellsOutlined />}
                  size="middle"
                >
                  Merge Selected
                </Button>
              </Space>
            </div>

            {/* Second Row: Filter Operations & Update */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Space>
                <Button
                  onClick={addToFilters}
                  disabled={!selectedText}
                  size="middle"
                >
                  Add to Filter
                </Button>
                <Button
                  onClick={saveFilters}
                  loading={isSavingFilters}
                  disabled={filters.length === 0}
                  size="middle"
                >
                  Save Filters ({filters.length})
                </Button>
                <Button
                  onClick={applyAllFilters}
                  loading={isApplyingFilters}
                  disabled={filters.length === 0}
                  size="middle"
                >
                  Apply Filters ({filters.length})
                </Button>
              </Space>

              <Button
                loading={isUpdatingTranscript}
                onClick={updateFullTranscript}
                type="primary"
                size="middle"
              >
                Update
              </Button>
            </div>
          </div>
        }
        width={1000}
        style={{
          maxWidth: "95vw",
        }}
      >
        {isTranscriptLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div>
            {/* Filter Status Section */}
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="mb-2">
                <Typography.Text
                  strong
                  className="text-gray-900 dark:text-white"
                >
                  Selected Text:
                </Typography.Text>
                <Typography.Text
                  code
                  className="ml-2 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
                >
                  {selectedText || "None"}
                </Typography.Text>
              </div>

              <div>
                <Typography.Text
                  strong
                  className="text-gray-900 dark:text-white"
                >
                  Filters:
                </Typography.Text>
                <Typography.Text className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  ({filters.length} filters)
                </Typography.Text>
                <div className="mt-2">
                  {filters.length > 0 ? (
                    filters.map((filter, index) => (
                      <Tag
                        key={index}
                        closable
                        onClose={() => removeFilter(filter)}
                        color="blue"
                        className="mb-1 bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 text-blue-800 dark:text-blue-200"
                      >
                        {filter}
                      </Tag>
                    ))
                  ) : (
                    <Typography.Text className="text-sm text-gray-500 dark:text-gray-400">
                      No filters found
                    </Typography.Text>
                  )}
                </div>
              </div>
            </div>

            <Form form={form} component={false}>
              <Table
                components={{
                  body: {
                    cell: EditableCell,
                  },
                }}
                rowSelection={rowSelection}
                columns={mergedTranscriptColumns}
                dataSource={currentTranscript}
                rowKey={(record) => record.start.toString()}
                pagination={{ pageSize: 10 }}
                scroll={{ y: 400 }}
                onRow={() => ({
                  onMouseUp: handleTextSelection,
                })}
              />
            </Form>
          </div>
        )}
      </Modal>

      {/* Transcript Management Modal */}
      <Modal
        title="Transcript Management"
        open={isTranscriptManagementVisible}
        onCancel={() => setIsTranscriptManagementVisible(false)}
        footer={[
          <Button
            key="auto-merge"
            type="primary"
            onClick={autoMergeAllTranscripts}
            loading={isBatchMerging}
            disabled={isBatchRestoring}
            icon={<MergeCellsOutlined />}
          >
            Auto Merge to All Transcripts (
            {transcriptSummary.filter((s) => s.transcriptCount > 0).length})
          </Button>,
          <Button
            type="primary"
            onClick={batchApplyFiltersToAllTranscripts}
            loading={isBatchApplyingFilters}
            disabled={
              filters.length === 0 ||
              transcriptSummary.filter((s) => s.transcriptCount > 0).length ===
                0
            }
            icon={<FilterOutlined />}
          >
            Apply Filters to All Transcripts (
            {transcriptSummary.filter((s) => s.transcriptCount > 0).length})
          </Button>,
          <Button
            key="restore-all"
            onClick={restoreAllTranscripts}
            loading={isBatchRestoring}
            disabled={isBatchMerging}
            icon={<UndoOutlined />}
          >
            Restore All
          </Button>,
          <Button
            key="refresh"
            onClick={() => {
              fetchVideos(selectedChannel!);
              showTranscriptManagement();
            }}
            icon={<ReloadOutlined />}
          >
            Refresh
          </Button>,
          <Button
            key="close"
            onClick={() => setIsTranscriptManagementVisible(false)}
          >
            Close
          </Button>,
        ]}
        width={1000}
        style={{ maxWidth: "95vw" }}
        className="transcript-management-modal"
        maskClosable={false}
      >
        <div style={{ marginBottom: 16 }}>
          <Typography.Text strong style={{ color: "var(--ant-text-color)" }}>
            Channel: {selectedChannel} ({videos.length} videos)
          </Typography.Text>
        </div>

        {/* Filters Section */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <Typography.Text strong className="text-gray-900 dark:text-white">
              Channel Filters ({filters.length})
            </Typography.Text>
          </div>

          {filters.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {filters.map((filter, index) => (
                <Tag
                  key={index}
                  color="blue"
                  className="bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 text-blue-800 dark:text-blue-200"
                >
                  {filter}
                </Tag>
              ))}
            </div>
          ) : (
            <Typography.Text className="text-gray-600 dark:text-gray-400">
              No filters configured for this channel
            </Typography.Text>
          )}
        </div>

        <Table
          dataSource={transcriptSummary}
          loading={isLoadingTranscriptSummary}
          rowKey="video_id"
          size="small"
          scroll={{ y: 400 }}
          columns={[
            {
              title: "Video ID",
              dataIndex: "video_id",
              key: "video_id",
              width: "18%",
              ellipsis: true,
            },
            {
              title: "Title",
              dataIndex: "title",
              key: "title",
              width: "32%",
              ellipsis: true,
            },
            {
              title: "Transcript Items",
              dataIndex: "transcriptCount",
              key: "transcriptCount",
              width: "15%",
              align: "center",
              render: (count: number) => (
                <Tag color={count > 0 ? "green" : "red"}>{count} items</Tag>
              ),
            },
            {
              title: "Has Original",
              dataIndex: "hasOriginal",
              key: "hasOriginal",
              width: "15%",
              align: "center",
              render: (hasOriginal: boolean) => (
                <Tag color={hasOriginal ? "blue" : "default"}>
                  {hasOriginal ? "Yes" : "No"}
                </Tag>
              ),
            },
            {
              title: "Last Updated",
              dataIndex: "lastUpdated",
              key: "lastUpdated",
              width: "15%",
              render: (timestamp: number) =>
                timestamp ? formatUnixTimestamp(timestamp) : "Never",
            },
            {
              title: "Action",
              key: "action",
              width: "10%",
              align: "center",
              render: (_: any, record: any) => (
                <Button
                  type="primary"
                  size="small"
                  onClick={() =>
                    showTranscript(selectedChannel!, record.video_id)
                  }
                  icon={<EditOutlined />}
                >
                  View
                </Button>
              ),
            },
          ]}
        />
      </Modal>

      {/* Batch Filter Progress Modal */}
      <Modal
        title="Batch Filter Application Progress"
        open={batchFilterProgress.isVisible}
        onCancel={() =>
          setBatchFilterProgress((prev) => ({ ...prev, isVisible: false }))
        }
        footer={[
          <Button
            key="close"
            onClick={() =>
              setBatchFilterProgress((prev) => ({ ...prev, isVisible: false }))
            }
            disabled={isBatchApplyingFilters}
          >
            {isBatchApplyingFilters ? "Processing..." : "Close"}
          </Button>,
        ]}
        width={900}
        style={{ maxWidth: "95vw" }}
        className="batch-filter-progress-modal"
        destroyOnClose={true}
        maskClosable={false}
      >
        <div className="mb-4 text-gray-800 dark:text-gray-200">
          <div className="font-semibold text-gray-900 dark:text-white">
            Progress: {batchFilterProgress.completed} /{" "}
            {batchFilterProgress.total} videos processed
            {batchFilterProgress.processing > 0 && (
              <span className="text-blue-600 dark:text-blue-400">
                {" "}
                (Processing {batchFilterProgress.processing}...)
              </span>
            )}
          </div>
        </div>

        <div className="mb-4">
          <Progress
            percent={
              batchFilterProgress.total > 0
                ? Math.round(
                    (batchFilterProgress.completed /
                      batchFilterProgress.total) *
                      100
                  )
                : 0
            }
            status={isBatchApplyingFilters ? "active" : "normal"}
            showInfo={true}
            strokeColor={{
              "0%": "#108ee9",
              "100%": "#87d068",
            }}
            trailColor="rgba(0, 0, 0, 0.06)"
            format={(percent) => (
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {percent}%
              </span>
            )}
          />
        </div>

        <div
          className="max-h-96 overflow-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md p-2"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgb(156 163 175) rgb(243 244 246)",
          }}
        >
          {batchFilterProgress.results.map((item) => (
            <div
              key={item.video_id}
              className={`p-3 mb-2 rounded-md border ${
                item.status === "success"
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                  : item.status === "error"
                  ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                  : item.status === "processing"
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                  : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white truncate">
                    {item.title}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Video ID: {item.video_id}
                  </div>
                  {item.message && (
                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {item.message}
                    </div>
                  )}
                  {item.totalChanges !== undefined && (
                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      <strong>Total changes: {item.totalChanges}</strong>
                    </div>
                  )}
                  {item.filterStats &&
                    Object.keys(item.filterStats).length > 0 && (
                      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        <div className="font-medium">Filter details:</div>
                        {Object.entries(item.filterStats).map(
                          ([filter, count]) =>
                            count > 0 && (
                              <div key={filter} className="ml-2">
                                • "{filter}": {count} times
                              </div>
                            )
                        )}
                      </div>
                    )}
                </div>
                <div className="ml-4 flex-shrink-0">
                  {item.status === "success" && (
                    <CheckCircleOutlined className="text-green-500 text-lg" />
                  )}
                  {item.status === "error" && (
                    <CloseCircleOutlined className="text-red-500 text-lg" />
                  )}
                  {item.status === "processing" && (
                    <LoadingOutlined className="text-blue-500 text-lg" />
                  )}
                  {item.status === "pending" && (
                    <ClockCircleOutlined className="text-gray-400 text-lg" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Upload Progress Modal */}
      <Modal
        title="Upload Progress"
        open={uploadProgress.isVisible}
        onCancel={() =>
          setUploadProgress((prev) => ({ ...prev, isVisible: false }))
        }
        footer={[
          <Button
            key="close"
            onClick={() =>
              setUploadProgress((prev) => ({ ...prev, isVisible: false }))
            }
            disabled={isLoading}
          >
            {isLoading ? "Uploading..." : "Close"}
          </Button>,
        ]}
        width={800}
        style={{ maxWidth: "95vw" }}
        className="upload-progress-modal"
        destroyOnClose={true}
        maskClosable={false}
      >
        <div className="mb-4 text-gray-800 dark:text-gray-200">
          <div className="font-semibold text-gray-900 dark:text-white">
            Progress: {uploadProgress.completed} / {uploadProgress.total} videos
            processed
          </div>
        </div>

        <div className="mb-4">
          <Progress
            percent={
              uploadProgress.total > 0
                ? Math.round(
                    (uploadProgress.completed / uploadProgress.total) * 100
                  )
                : 0
            }
            status={isLoading ? "active" : "normal"}
            showInfo={true}
            strokeColor={{
              "0%": "#108ee9",
              "100%": "#87d068",
            }}
            trailColor="rgba(0, 0, 0, 0.06)"
            format={(percent) => (
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {percent}%
              </span>
            )}
          />
        </div>

        <div
          className="max-h-96 overflow-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md p-2"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgb(156 163 175) rgb(243 244 246)",
          }}
        >
          {uploadProgress.results.map((item, index) => (
            <div
              key={item.video_id}
              className={`p-3 flex justify-between items-center ${
                index < uploadProgress.results.length - 1
                  ? "border-b border-gray-100 dark:border-gray-700"
                  : ""
              }`}
            >
              <div className="flex-1">
                <div className="text-gray-900 dark:text-white font-semibold mb-1">
                  {item.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {item.video_id}
                </div>
                {item.message && (
                  <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">
                    {item.message}
                  </div>
                )}
              </div>
              <div>
                <Tag
                  color={
                    item.status === "pending"
                      ? "default"
                      : item.status === "processing"
                      ? "blue"
                      : item.status === "success"
                      ? "green"
                      : "red"
                  }
                >
                  {item.status === "pending"
                    ? "Pending"
                    : item.status === "processing"
                    ? "Processing"
                    : item.status === "success"
                    ? "Success"
                    : "Error"}
                </Tag>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Batch Progress Modal */}
      <Modal
        title={
          isBatchMerging
            ? "Auto Merge Progress"
            : isBatchRestoring
            ? "Restore Progress"
            : isBatchUpdatingVisibility
            ? "Visibility Update Progress"
            : "Progress"
        }
        open={batchProgress.isVisible}
        onCancel={() =>
          setBatchProgress((prev) => ({ ...prev, isVisible: false }))
        }
        footer={[
          <Button
            key="close"
            onClick={() =>
              setBatchProgress((prev) => ({ ...prev, isVisible: false }))
            }
            disabled={
              isBatchMerging || isBatchRestoring || isBatchUpdatingVisibility
            }
          >
            {isBatchMerging || isBatchRestoring || isBatchUpdatingVisibility
              ? "Processing..."
              : "Close"}
          </Button>,
        ]}
        width={800}
        style={{ maxWidth: "95vw" }}
        className="batch-progress-modal"
        destroyOnClose={true}
        maskClosable={false}
      >
        <style>
          {`
            .batch-progress-modal .ant-modal-body ::-webkit-scrollbar {
              width: 8px;
            }
            .batch-progress-modal .ant-modal-body ::-webkit-scrollbar-track {
              background: rgb(243 244 246);
            }
            .batch-progress-modal .ant-modal-body ::-webkit-scrollbar-thumb {
              background: rgb(156 163 175);
              border-radius: 4px;
            }
            .batch-progress-modal .ant-modal-body ::-webkit-scrollbar-thumb:hover {
              background: rgb(107 114 128);
            }
            [data-theme="dark"] .batch-progress-modal .ant-modal-body ::-webkit-scrollbar-track {
              background: rgb(31 41 55);
            }
            [data-theme="dark"] .batch-progress-modal .ant-modal-body ::-webkit-scrollbar-thumb {
              background: rgb(75 85 99);
            }
            [data-theme="dark"] .batch-progress-modal .ant-modal-body ::-webkit-scrollbar-thumb:hover {
              background: rgb(107 114 128);
            }
          `}
        </style>
        <div className="mb-4 text-gray-800 dark:text-gray-200">
          <div className="font-semibold text-gray-900 dark:text-white">
            Progress: {batchProgress.completed} / {batchProgress.total} videos
            processed
          </div>
        </div>

        <div className="mb-4">
          <Progress
            percent={
              batchProgress.total > 0
                ? Math.round(
                    (batchProgress.completed / batchProgress.total) * 100
                  )
                : 0
            }
            status={
              isBatchMerging || isBatchRestoring || isBatchUpdatingVisibility
                ? "active"
                : "normal"
            }
            showInfo={true}
            strokeColor={{
              "0%": "#108ee9",
              "100%": "#87d068",
            }}
            trailColor="rgba(0, 0, 0, 0.06)"
            format={(percent) => (
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {percent}%
              </span>
            )}
          />
        </div>

        <div
          className="max-h-96 overflow-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md p-2"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgb(156 163 175) rgb(243 244 246)",
          }}
        >
          {batchProgress.results.map((item, index) => (
            <div
              key={item.video_id}
              className={`p-3 flex justify-between items-center ${
                index < batchProgress.results.length - 1
                  ? "border-b border-gray-100 dark:border-gray-700"
                  : ""
              }`}
            >
              <div className="flex-1">
                <div className="text-gray-900 dark:text-white font-semibold mb-1">
                  {item.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {item.video_id}
                </div>
                {item.message && (
                  <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">
                    {item.message}
                  </div>
                )}
                {item.originalCount && item.mergedCount && (
                  <div className="text-xs text-green-600 dark:text-green-400">
                    {item.originalCount} → {item.mergedCount} items (
                    {item.originalCount - item.mergedCount} reduced)
                  </div>
                )}
              </div>
              <div>
                <Tag
                  color={
                    item.status === "pending"
                      ? "default"
                      : item.status === "processing"
                      ? "blue"
                      : item.status === "success"
                      ? "green"
                      : "red"
                  }
                >
                  {item.status === "pending"
                    ? "Pending"
                    : item.status === "processing"
                    ? "Processing"
                    : item.status === "success"
                    ? "Success"
                    : "Error"}
                </Tag>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Batch Visibility Update Modal */}
      <Modal
        title="Batch Update Video Visibility"
        open={isBatchVisibilityModalVisible}
        onCancel={() => setIsBatchVisibilityModalVisible(false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => setIsBatchVisibilityModalVisible(false)}
          >
            Cancel
          </Button>,
          <Button
            key="update"
            type="primary"
            onClick={() => {
              if (selectedVisibilityOption) {
                batchUpdateVisibility(selectedVisibilityOption);
                setIsBatchVisibilityModalVisible(false);
              } else {
                message.warning("Please select a visibility option");
              }
            }}
            disabled={!selectedVisibilityOption || isBatchUpdatingVisibility}
            loading={isBatchUpdatingVisibility}
          >
            Update All Videos
          </Button>,
        ]}
        width={500}
        maskClosable={false}
      >
        <div className="mb-4">
          <Typography.Text strong className="text-gray-900 dark:text-white">
            Channel: {selectedChannel} ({videos.length} videos)
          </Typography.Text>
        </div>

        <div className="mb-4">
          <Typography.Text className="text-gray-700 dark:text-gray-300">
            Select the new visibility setting for all videos in this channel:
          </Typography.Text>
        </div>

        <Select
          style={{ width: "100%" }}
          placeholder="Select visibility option"
          value={selectedVisibilityOption}
          onChange={setSelectedVisibilityOption}
          size="large"
        >
          {Object.entries(VISIBILITY_OPTIONS)
            .filter(([_, value]) => value !== "all")
            .map(([key, value]) => (
              <Option key={value} value={value}>
                {key}
              </Option>
            ))}
        </Select>

        <div className="mt-4 p-3 bg-orange-50 border-l-4 border-orange-500 rounded-md dark:bg-orange-900/30 dark:border-orange-400">
          <Typography.Text className="text-orange-700 dark:text-orange-300 text-sm">
            <strong>Warning:</strong> This action will update the visibility of
            ALL {videos.length} videos in the selected channel. This operation
            cannot be undone.
          </Typography.Text>
        </div>
      </Modal>
    </div>
  );
};

const EditableCell: React.FC<any> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  if (dataIndex === "visibility") {
    return <td {...restProps}>{children}</td>;
  }

  const inputNode =
    inputType === "textarea" ? (
      <TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
    ) : (
      <Input />
    );

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

export default VideoManagement;
