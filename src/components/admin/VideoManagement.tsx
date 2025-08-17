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
  SearchOutlined,
  LoadingOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  ReloadOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  FieldTimeOutlined,
  RollbackOutlined,
  CloseOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import { api } from "@/api/api";
import getYoutubeId from "get-youtube-id";
import {
  Channel,
  TranscriptItem,
  TranscriptSummaryItem,
  Video,
} from "@/utils/type";
import { LANGUAGES, VISIBILITY_OPTIONS } from "@/utils/const";
import axios from "axios";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { autoMergeTranscriptItems, formatTimestamp } from "@/utils/util";
import YouTube, { YouTubePlayer } from "react-youtube";
import {
  VideoPlaybackController,
  VideoPlaybackState,
  TranscriptSegment,
} from "@/utils/videoPlaybackUtils";

const { Option } = Select;

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
  setSrtFiles: React.Dispatch<React.SetStateAction<{ [key: string]: File }>>;
}> = ({
  onFinish,
  isLoading,
  form,
  handleSrtUpload,
  srtFiles,
  setSrtFiles,
}) => {
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
      const videoId = extractVideoId(videoLink);
      if (!videoId) {
        message.error(t("invalidYoutubeLink"));
        return;
      }

      setUploadStatus((prev) => ({ ...prev, [videoId]: "loading" }));

      handleSrtUpload(videoLink, file);

      setTimeout(() => {
        setUploadStatus((prev) => ({ ...prev, [videoId]: "success" }));
        message.success(t("fileUploadSuccess", { filename: file.name }));
      }, 500);
    } catch (error) {
      console.error("Error uploading SRT:", error);
      const videoId = extractVideoId(videoLink);
      if (videoId) {
        setUploadStatus((prev) => ({ ...prev, [videoId]: "error" }));
      }
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
                        const newVideoLink = e.target.value;
                        const newVideoId = newVideoLink
                          ? extractVideoId(newVideoLink)
                          : null;

                        // Clear upload status for the old video ID if it exists
                        const oldVideoLink = form.getFieldValue([
                          "video_links",
                          name,
                          "link",
                        ]);
                        const oldVideoId = oldVideoLink
                          ? extractVideoId(oldVideoLink)
                          : null;

                        if (oldVideoId && oldVideoId !== newVideoId) {
                          setUploadStatus((prev) => {
                            const newStatus = { ...prev };
                            delete newStatus[oldVideoId];
                            return newStatus;
                          });
                          // Also clear the SRT file for the old video ID
                          setSrtFiles((prev) => {
                            const newFiles = { ...prev };
                            delete newFiles[oldVideoId];
                            return newFiles;
                          });
                        }

                        debouncedFetchTitle(newVideoLink, name);
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
                        loading={(() => {
                          const videoLink = form.getFieldValue([
                            "video_links",
                            name,
                            "link",
                          ]);
                          const videoId = videoLink
                            ? extractVideoId(videoLink)
                            : null;
                          return Boolean(
                            videoId && uploadStatus[videoId] === "loading"
                          );
                        })()}
                      >
                        {t("uploadSubtitle")} (Required)
                      </Button>
                    </Upload>
                  </Form.Item>

                  {/* Upload status icons and file name */}
                  {(() => {
                    const videoLink = form.getFieldValue([
                      "video_links",
                      name,
                      "link",
                    ]);
                    const videoId = videoLink
                      ? extractVideoId(videoLink)
                      : null;
                    const fileName = videoId ? srtFiles[videoId]?.name : null;

                    if (
                      videoId &&
                      uploadStatus[videoId] === "success" &&
                      fileName
                    ) {
                      return (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginRight: 8,
                          }}
                        >
                          <CheckOutlined
                            style={{
                              color: "#52c41a",
                              fontSize: "16px",
                              marginRight: 4,
                            }}
                          />
                          <span style={{ color: "#52c41a", fontSize: "12px" }}>
                            {fileName}
                          </span>
                        </div>
                      );
                    }

                    if (videoId && uploadStatus[videoId] === "success") {
                      return (
                        <CheckOutlined
                          style={{
                            color: "#52c41a",
                            fontSize: "20px",
                            marginRight: 8,
                          }}
                        />
                      );
                    }

                    if (videoId && uploadStatus[videoId] === "error") {
                      return (
                        <CloseCircleOutlined
                          style={{
                            color: "#ff4d4f",
                            fontSize: "20px",
                            marginRight: 8,
                          }}
                        />
                      );
                    }

                    return null;
                  })()}

                  {/* Delete button */}
                  <Button
                    type="text"
                    icon={<MinusCircleOutlined />}
                    onClick={() => {
                      // Clear upload status when removing video
                      const videoLink = form.getFieldValue([
                        "video_links",
                        name,
                        "link",
                      ]);
                      const videoId = videoLink
                        ? extractVideoId(videoLink)
                        : null;
                      if (videoId) {
                        setUploadStatus((prev) => {
                          const newStatus = { ...prev };
                          delete newStatus[videoId];
                          return newStatus;
                        });
                        // Also clear the SRT file for this video ID
                        setSrtFiles((prev) => {
                          const newFiles = { ...prev };
                          delete newFiles[videoId];
                          return newFiles;
                        });
                      }
                      remove(name);
                    }}
                    style={{ marginLeft: "auto" }}
                  />
                </div>
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

// Enhanced Transcript Item Component with Double-Click Editing
const TranscriptItemCard: React.FC<{
  item: TranscriptItem;
  index: number;
  isEditing: boolean;
  isPlaying: boolean;
  isPlayerReady: boolean;
  isSelected: boolean;
  timeRecord: { start?: number; end?: number };
  onEdit: () => void;
  onSave: (transcript: string) => void;
  onCancel: () => void;
  onPlay: () => void;
  onStop: () => void;
  onPlayFromHere: () => void;
  onSeekToStart: () => void;
  onSeekToEnd: () => void;
  onRecordStart: () => void;
  onRecordEnd: () => void;
  onUndoStart: () => void;
  onUndoEnd: () => void;
  onFineTuneStart: (delta: number) => void;
  onFineTuneEnd: (delta: number) => void;
  onAddRow: () => void;
  onDeleteRow: () => void;
  onSelect: (selected: boolean) => void;
}> = ({
  item,
  index,
  isEditing,
  isPlaying,
  isPlayerReady,
  isSelected,
  timeRecord,
  onEdit,
  onSave,
  onCancel,
  onPlay,
  onStop,
  onPlayFromHere,
  onSeekToStart,
  onSeekToEnd,
  onRecordStart,
  onRecordEnd,
  onUndoStart,
  onUndoEnd,
  onFineTuneStart,
  onFineTuneEnd,
  onAddRow,
  onDeleteRow,
  onSelect,
}) => {
  const [editingText, setEditingText] = useState(item.transcript);

  useEffect(() => {
    setEditingText(item.transcript);
  }, [item.transcript, isEditing]);

  const handleSave = () => {
    onSave(editingText);
  };

  const handleDoubleClick = () => {
    if (!isEditing) {
      onEdit();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border p-4 mb-4 transition-all duration-200 hover:shadow-md ${
        isSelected
          ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      {/* Header with selection checkbox and index */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            #{index + 1}
          </span>
        </div>
        {isSelected && (
          <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded">
            Selected
          </span>
        )}
      </div>

      {/* Time Controls Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Start Time Section */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Start Time:
            </span>
            <span className="text-lg font-mono text-green-600 dark:text-green-400">
              {timeRecord.start !== undefined
                ? formatTime(timeRecord.start)
                : formatTime(item.start)}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={onRecordStart}
              disabled={!isPlayerReady}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                timeRecord.start !== undefined
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <FieldTimeOutlined className="mr-1" />
              Record
            </button>
            {timeRecord.start !== undefined && (
              <button
                onClick={onUndoStart}
                className="px-2 py-1 text-xs rounded bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
              >
                <RollbackOutlined className="mr-1" />
                Undo
              </button>
            )}
            <button
              onClick={onSeekToStart}
              disabled={!isPlayerReady}
              className="px-2 py-1 text-xs rounded bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300 hover:bg-green-300 dark:hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Go
            </button>
          </div>
          {/* Fine-tune buttons for start time */}
          <div className="flex gap-1">
            <button
              onClick={() => onFineTuneStart(-0.05)}
              className="px-2 py-1 text-xs rounded bg-orange-200 dark:bg-orange-800 text-orange-700 dark:text-orange-300 hover:bg-orange-300 dark:hover:bg-orange-700 transition-colors"
            >
              -0.05s
            </button>
            <button
              onClick={() => onFineTuneStart(0.05)}
              className="px-2 py-1 text-xs rounded bg-orange-200 dark:bg-orange-800 text-orange-700 dark:text-orange-300 hover:bg-orange-300 dark:hover:bg-orange-700 transition-colors"
            >
              +0.05s
            </button>
          </div>
        </div>

        {/* End Time Section */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              End Time:
            </span>
            <span className="text-lg font-mono text-green-600 dark:text-green-400">
              {timeRecord.end !== undefined
                ? formatTime(timeRecord.end)
                : formatTime(item.end)}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={onRecordEnd}
              disabled={!isPlayerReady}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                timeRecord.end !== undefined
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <FieldTimeOutlined className="mr-1" />
              Record
            </button>
            {timeRecord.end !== undefined && (
              <button
                onClick={onUndoEnd}
                className="px-2 py-1 text-xs rounded bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
              >
                <RollbackOutlined className="mr-1" />
                Undo
              </button>
            )}
            <button
              onClick={onSeekToEnd}
              disabled={!isPlayerReady}
              className="px-2 py-1 text-xs rounded bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300 hover:bg-green-300 dark:hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Go
            </button>
          </div>
          {/* Fine-tune buttons for end time */}
          <div className="flex gap-1">
            <button
              onClick={() => onFineTuneEnd(-0.05)}
              className="px-2 py-1 text-xs rounded bg-orange-200 dark:bg-orange-800 text-orange-700 dark:text-orange-300 hover:bg-orange-300 dark:hover:bg-orange-700 transition-colors"
            >
              -0.05s
            </button>
            <button
              onClick={() => onFineTuneEnd(0.05)}
              className="px-2 py-1 text-xs rounded bg-orange-200 dark:bg-orange-800 text-orange-700 dark:text-orange-300 hover:bg-orange-300 dark:hover:bg-orange-700 transition-colors"
            >
              +0.05s
            </button>
          </div>
        </div>
      </div>

      {/* Transcript Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Transcript
          </span>
        </div>

        {/* Transcript Text with Double-Click Editing */}
        <div
          onDoubleClick={handleDoubleClick}
          className={`min-h-[80px] p-3 rounded border transition-all duration-200 ${
            isEditing
              ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
          }`}
        >
          {isEditing ? (
            <textarea
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              className="w-full h-20 p-2 border-none outline-none resize-none bg-transparent text-gray-900 dark:text-gray-100"
              placeholder="Enter transcript text..."
              autoFocus
            />
          ) : (
            <div className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
              {item.transcript || (
                <span className="text-gray-400 italic">
                  Double-click to edit transcript
                </span>
              )}
            </div>
          )}
        </div>

        {/* Consolidated Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="px-3 py-1 text-sm rounded bg-green-500 text-white hover:bg-green-600 transition-colors"
              >
                <CheckOutlined className="mr-1" />
                Save
              </button>
              <button
                onClick={onCancel}
                className="px-3 py-1 text-sm rounded bg-gray-500 text-white hover:bg-gray-600 transition-colors"
              >
                <CloseOutlined className="mr-1" />
                Cancel
              </button>
            </>
          ) : (
            <>
              {/* Playback Controls */}
              <button
                onClick={isPlaying ? onStop : onPlay}
                disabled={!isPlayerReady}
                className={`px-3 py-1 text-sm rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isPlaying
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {isPlaying ? (
                  <PauseCircleOutlined className="mr-1" />
                ) : (
                  <PlayCircleOutlined className="mr-1" />
                )}
                {isPlaying ? "Stop" : "Play"}
              </button>
              <button
                onClick={onPlayFromHere}
                disabled={!isPlayerReady}
                className="px-3 py-1 text-sm rounded bg-purple-500 text-white hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlayCircleOutlined className="mr-1" />
                Play From Here
              </button>

              {/* Editing Controls */}
              <button
                onClick={onEdit}
                className="px-3 py-1 text-sm rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                <EditOutlined className="mr-1" />
                Edit
              </button>
              <button
                onClick={onAddRow}
                className="px-3 py-1 text-sm rounded bg-green-500 text-white hover:bg-green-600 transition-colors"
              >
                <PlusOutlined className="mr-1" />
                Add Row
              </button>
              <button
                onClick={onDeleteRow}
                className="px-3 py-1 text-sm rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                <MinusCircleOutlined className="mr-1" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// EditableCell component removed as we now use the card-based design

const VideoManagement: React.FC = () => {
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
  const [currentVideoTitle, setCurrentVideoTitle] = useState<string | null>(
    null
  );
  const [selectedRows, setSelectedRows] = useState<TranscriptItem[]>([]);
  const [transcriptHistory, setTranscriptHistory] = useState<
    TranscriptItem[][]
  >([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm(); // New form for edit modal
  const [srtFiles, setSrtFiles] = useState<{ [key: string]: File }>({});
  const [isUpdatingTranscript, setIsUpdatingTranscript] = useState(false);
  const [isBatchMerging, setIsBatchMerging] = useState(false);

  // New state for edit modal
  const [isEditVideoModalVisible, setIsEditVideoModalVisible] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [isUpdatingVideo, setIsUpdatingVideo] = useState(false);

  // YouTube Player related states
  const [youtubePlayer, setYoutubePlayer] = useState<YouTubePlayer | null>(
    null
  );
  const [playbackController, setPlaybackController] =
    useState<VideoPlaybackController | null>(null);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState<number | null>(
    null
  );
  const [isContinuousPlay, setIsContinuousPlay] = useState(false);
  const [continuousPlayStartIndex, setContinuousPlayStartIndex] = useState<
    number | null
  >(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [currentVideoLink, setCurrentVideoLink] = useState<string>("");
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  const [timeRecords, setTimeRecords] = useState<{
    [key: string]: {
      start?: number;
      end?: number;
      userRecordedStart?: boolean;
      userRecordedEnd?: boolean;
      autoUpdatedStart?: boolean;
      autoUpdatedEnd?: boolean;
      segmentIndex?: number; // Add segment index for better tracking
      originalStart?: number; // Store original times for easier restoration
      originalEnd?: number;
    };
  }>({});

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
    Array<TranscriptSummaryItem>
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

  // Video refined status related state
  const [isVideoRefined, setIsVideoRefined] = useState<boolean>(false);
  const [isMarkingRefined, setIsMarkingRefined] = useState(false);
  // Video visibility related state
  const [currentVideoVisibility, setCurrentVideoVisibility] =
    useState<string>("private");
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);

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
    console.log(`Frontend extractVideoId: '${videoId}' from URL: ${videoLink}`);
    if (!videoId) {
      message.error(
        "Invalid YouTube URL. Please enter a valid URL before uploading SRT."
      );
      return;
    }
    // Keep the original filename but map it to the video ID
    const newFile = new File([file], `${videoId}.srt`, { type: file.type });
    console.log(
      `Created file with name: ${newFile.name} for videoId: ${videoId}`
    );
    setSrtFiles((prev) => ({ ...prev, [videoId]: newFile }));
    message.success(`SRT file uploaded for video ${videoId}`);
  };

  const showTranscript = async (
    channelId: string,
    videoId: string,
    videoTitle: string
  ) => {
    setIsTranscriptLoading(true);
    setIsModalVisible(true);
    setCurrentVideoId(videoId);
    setSelectedChannel(channelId);
    setCurrentVideoTitle(videoTitle);

    // Find the video to get its link and visibility
    const video = videos.find((v) => v.video_id === videoId);
    if (video) {
      setCurrentVideoLink(video.link);
      setCurrentVideoVisibility(video.visibility || "private");
    }

    try {
      const [transcriptResponse, refinedStatusResponse] = await Promise.all([
        api.getVideoTranscript(channelId, videoId),
        api.getVideoRefinedStatus(channelId, videoId),
      ]);

      setCurrentTranscript(transcriptResponse.data.transcript);
      setIsVideoRefined(refinedStatusResponse.is_refined || false);

      // Don't call loadFilters here - let useEffect handle it
    } catch (error) {
      console.error("Error fetching transcript:", error);
      message.error("Failed to fetch transcript");
    } finally {
      setIsTranscriptLoading(false);
    }
  };

  // YouTube Player Functions
  const onYouTubeReady = (event: { target: YouTubePlayer }) => {
    const player = event.target;
    setYoutubePlayer(player);
    setIsPlayerReady(true);

    // Initialize playback controller
    const controller = new VideoPlaybackController(player, {
      playbackSpeed: playbackSpeed,
      onStateChange: (state: VideoPlaybackState) => {
        console.log("Playback state changed:", state);
      },
    });
    setPlaybackController(controller);

    // Set initial playback speed
    try {
      player.setPlaybackRate(playbackSpeed);
    } catch (e) {
      console.log("Error setting playback rate:", e);
    }

    // Disable captions
    try {
      const tracks = player.getOption("captions", "tracklist") || [];
      if (tracks.length > 0) {
        player.unloadModule("captions");
      }
      player.setOption("captions", "track", {});
    } catch (e) {
      console.log("Error disabling captions:", e);
    }
  };

  const playTranscriptSegment = useCallback(
    async (segment: TranscriptItem, index: number) => {
      if (!playbackController || !youtubePlayer) {
        message.warning("Player not ready");
        return;
      }

      try {
        console.log("playTranscriptSegment called with:", { segment, index });
        setCurrentPlayingIndex(index);

        // Validate segment parameter
        if (!segment || typeof segment !== "object") {
          throw new Error(
            `Invalid segment parameter: ${JSON.stringify(segment)}`
          );
        }

        if (
          typeof segment.start !== "number" ||
          typeof segment.end !== "number"
        ) {
          throw new Error(
            `Invalid segment times: start=${segment.start}, end=${segment.end}`
          );
        }

        const transcriptSegment: TranscriptSegment = {
          start: segment.start,
          end: segment.end,
          transcript: segment.transcript,
        };

        console.log(
          "Calling playbackController.playSegment with:",
          transcriptSegment
        );
        await playbackController.playSegment(transcriptSegment, () => {
          setCurrentPlayingIndex(null);
        });
      } catch (error) {
        console.error("Error playing segment:", error);
        message.error("Failed to play segment");
        setCurrentPlayingIndex(null);
      }
    },
    [playbackController, youtubePlayer]
  );

  const stopPlayback = useCallback(() => {
    if (playbackController) {
      playbackController.stop();
      setCurrentPlayingIndex(null);
      setIsContinuousPlay(false);
      setContinuousPlayStartIndex(null);
    }
  }, [playbackController]);

  // 连续播放功能：从指定索引开始播放直到最后
  const playFromHere = useCallback(
    async (startIndex: number) => {
      if (!playbackController || !youtubePlayer || !currentTranscript.length) {
        message.warning("Player not ready");
        return;
      }

      try {
        setIsContinuousPlay(true);
        setContinuousPlayStartIndex(startIndex);
        setCurrentPlayingIndex(startIndex);

        const playNext = async (index: number) => {
          if (index >= currentTranscript.length) {
            // 播放完成
            setCurrentPlayingIndex(null);
            setIsContinuousPlay(false);
            setContinuousPlayStartIndex(null);
            return;
          }

          const segment = currentTranscript[index];
          const transcriptSegment: TranscriptSegment = {
            start: segment.start,
            end: segment.end,
            transcript: segment.transcript,
          };

          setCurrentPlayingIndex(index);
          await playbackController.playSegment(transcriptSegment, () => {
            // 当前段播放完成，播放下一段
            if (isContinuousPlay) {
              playNext(index + 1);
            }
          });
        };

        await playNext(startIndex);
      } catch (error) {
        console.error("Error in continuous playback:", error);
        message.error("Failed to start continuous playback");
        setCurrentPlayingIndex(null);
        setIsContinuousPlay(false);
        setContinuousPlayStartIndex(null);
      }
    },
    [playbackController, youtubePlayer, currentTranscript, isContinuousPlay]
  );

  const handlePlaybackSpeedChange = useCallback(
    (speed: number) => {
      setPlaybackSpeed(speed);
      if (playbackController) {
        playbackController.setPlaybackSpeed(speed);
      }
      if (youtubePlayer) {
        youtubePlayer.setPlaybackRate(speed);
      }
    },
    [playbackController, youtubePlayer]
  );

  // Time Recording Functions
  const startTimeRecording = useCallback(
    (segmentKey: string) => {
      if (!youtubePlayer) {
        message.warning("Player not ready");
        return;
      }

      const currentTime = youtubePlayer.getCurrentTime();

      // Find the current segment index
      const currentIndex = currentTranscript.findIndex(
        (segment) => `${segment.start}-${segment.end}` === segmentKey
      );

      if (currentIndex !== -1) {
        const newTranscript = [...currentTranscript];

        // Update current segment's start time
        newTranscript[currentIndex] = {
          ...newTranscript[currentIndex],
          start: currentTime,
        };

        // Auto-update previous segment's end time
        if (currentIndex > 0) {
          newTranscript[currentIndex - 1] = {
            ...newTranscript[currentIndex - 1],
            end: currentTime,
          };
        }

        setCurrentTranscript(newTranscript);

        // Save to history for undo functionality
        setTranscriptHistory([...transcriptHistory, currentTranscript]);

        // Update timeRecords with new key
        // Use the actual end time from the updated transcript (might have been recorded earlier)
        const actualEndTime = newTranscript[currentIndex].end;
        const newSegmentKey = `${currentTime}-${actualEndTime}`;
        const originalStartTime = currentTranscript[currentIndex].start; // Store original time

        setTimeRecords((prev) => {
          const newRecords = { ...prev };
          // Remove old key if it exists
          if (prev[segmentKey]) {
            delete newRecords[segmentKey];
          }
          // Add new key with recorded time, preserving any existing end time record
          newRecords[newSegmentKey] = {
            ...prev[segmentKey],
            start: currentTime,
            userRecordedStart: true, // Mark as user-recorded
            originalStart: originalStartTime, // Store original time for undo
            segmentIndex: currentIndex,
          };

          // Also create a record for the previous segment if it was auto-updated
          if (currentIndex > 0) {
            const prevSegment = newTranscript[currentIndex - 1];
            const prevSegmentKey = `${prevSegment.start}-${currentTime}`;
            const originalPrevEndTime = currentTranscript[currentIndex - 1].end; // Store original time

            // Only create if it doesn't already exist
            if (!newRecords[prevSegmentKey]) {
              newRecords[prevSegmentKey] = {
                end: currentTime,
                autoUpdatedEnd: true, // Mark as auto-updated
                originalEnd: originalPrevEndTime, // Store original time for undo
                segmentIndex: currentIndex - 1,
              };
            } else {
              // Update existing record
              newRecords[prevSegmentKey] = {
                ...newRecords[prevSegmentKey],
                end: currentTime,
                autoUpdatedEnd: true, // Mark as auto-updated
                originalEnd: originalPrevEndTime, // Store original time for undo
                segmentIndex: currentIndex - 1,
              };
            }
          }

          return newRecords;
        });
      } else {
        // Still keep the record for visual feedback if segment not found
        setTimeRecords((prev) => ({
          ...prev,
          [segmentKey]: {
            ...prev[segmentKey],
            start: currentTime,
          },
        }));
      }

      message.success(
        `Start time recorded and applied: ${formatTime(currentTime)}`
      );
    },
    [youtubePlayer, currentTranscript, transcriptHistory]
  );

  const endTimeRecording = useCallback(
    (segmentKey: string) => {
      if (!youtubePlayer) {
        message.warning("Player not ready");
        return;
      }

      const currentTime = youtubePlayer.getCurrentTime();

      // Find the current segment index
      const currentIndex = currentTranscript.findIndex(
        (segment) => `${segment.start}-${segment.end}` === segmentKey
      );

      if (currentIndex !== -1) {
        const newTranscript = [...currentTranscript];

        // Update current segment's end time
        newTranscript[currentIndex] = {
          ...newTranscript[currentIndex],
          end: currentTime,
        };

        // Auto-update next segment's start time
        if (currentIndex < newTranscript.length - 1) {
          newTranscript[currentIndex + 1] = {
            ...newTranscript[currentIndex + 1],
            start: currentTime,
          };
        }

        setCurrentTranscript(newTranscript);

        // Save to history for undo functionality
        setTranscriptHistory([...transcriptHistory, currentTranscript]);

        // Update timeRecords with new key
        // Use the actual start time from the updated transcript (might have been recorded earlier)
        const actualStartTime = newTranscript[currentIndex].start;
        const newSegmentKey = `${actualStartTime}-${currentTime}`;
        const originalEndTime = currentTranscript[currentIndex].end; // Store original time

        setTimeRecords((prev) => {
          const newRecords = { ...prev };
          // Remove old key if it exists
          if (prev[segmentKey]) {
            delete newRecords[segmentKey];
          }
          // Add new key with recorded time, preserving any existing start time record
          newRecords[newSegmentKey] = {
            ...prev[segmentKey],
            end: currentTime,
            userRecordedEnd: true, // Mark as user-recorded
            originalEnd: originalEndTime, // Store original time for undo
            segmentIndex: currentIndex,
          };

          // Also create a record for the next segment if it was auto-updated
          if (currentIndex < newTranscript.length - 1) {
            const nextSegment = newTranscript[currentIndex + 1];
            const nextSegmentKey = `${currentTime}-${nextSegment.end}`;
            const originalNextStartTime =
              currentTranscript[currentIndex + 1].start; // Store original time

            // Only create if it doesn't already exist
            if (!newRecords[nextSegmentKey]) {
              newRecords[nextSegmentKey] = {
                start: currentTime,
                autoUpdatedStart: true, // Mark as auto-updated
                originalStart: originalNextStartTime, // Store original time for undo
                segmentIndex: currentIndex + 1,
              };
            } else {
              // Update existing record
              newRecords[nextSegmentKey] = {
                ...newRecords[nextSegmentKey],
                start: currentTime,
                autoUpdatedStart: true, // Mark as auto-updated
                originalStart: originalNextStartTime, // Store original time for undo
                segmentIndex: currentIndex + 1,
              };
            }
          }

          return newRecords;
        });
      } else {
        // Still keep the record for visual feedback if segment not found
        setTimeRecords((prev) => ({
          ...prev,
          [segmentKey]: {
            ...prev[segmentKey],
            end: currentTime,
          },
        }));
      }

      message.success(
        `End time recorded and applied: ${formatTime(currentTime)}`
      );
    },
    [youtubePlayer, currentTranscript, transcriptHistory]
  );

  const undoTimeRecording = useCallback(
    (segmentKey: string, type: "start" | "end") => {
      // Find the time record for this segment
      const timeRecord = timeRecords[segmentKey];
      if (!timeRecord) {
        message.error("Time record not found");
        return;
      }

      // Find the segment index by looking for the segment that has the recorded time
      let currentIndex = -1;
      if (type === "start" && timeRecord.start !== undefined) {
        if (timeRecord.userRecordedStart || timeRecord.autoUpdatedStart) {
          currentIndex = currentTranscript.findIndex(
            (segment) => segment.start === timeRecord.start
          );
        }
      } else if (type === "end" && timeRecord.end !== undefined) {
        if (timeRecord.userRecordedEnd || timeRecord.autoUpdatedEnd) {
          currentIndex = currentTranscript.findIndex(
            (segment) => segment.end === timeRecord.end
          );
        }
      }

      if (currentIndex === -1) {
        message.error("Segment not found in current transcript");
        return;
      }

      // Save current state to history before making changes
      setTranscriptHistory([...transcriptHistory, [...currentTranscript]]);

      const newTranscript = [...currentTranscript];

      // Handle different undo scenarios
      if (type === "start") {
        if (timeRecord.userRecordedStart) {
          // User recorded start - restore original and remove auto-updated end from previous segment
          if (timeRecord.originalStart !== undefined) {
            newTranscript[currentIndex].start = timeRecord.originalStart;
          }

          // If there was an auto-updated end in the previous segment, restore it too
          if (currentIndex > 0) {
            // Find the previous segment's time record that has auto-updated end
            Object.values(timeRecords).forEach((record) => {
              if (
                record.autoUpdatedEnd &&
                record.end === timeRecord.start &&
                record.originalEnd !== undefined
              ) {
                newTranscript[currentIndex - 1].end = record.originalEnd;
              }
            });
          }
        } else if (timeRecord.autoUpdatedStart) {
          // Auto-updated start - restore original and remove user recorded end from previous segment
          if (timeRecord.originalStart !== undefined) {
            newTranscript[currentIndex].start = timeRecord.originalStart;
          }

          // Find and restore the previous segment's user recorded end time
          if (currentIndex > 0) {
            // Find the previous segment's time record that has user recorded end
            Object.values(timeRecords).forEach((record) => {
              if (
                record.userRecordedEnd &&
                record.end === timeRecord.start &&
                record.originalEnd !== undefined
              ) {
                newTranscript[currentIndex - 1].end = record.originalEnd;
              }
            });
          }
        }
      } else if (type === "end") {
        if (timeRecord.userRecordedEnd) {
          // User recorded end - restore original and remove auto-updated start from next segment
          if (timeRecord.originalEnd !== undefined) {
            newTranscript[currentIndex].end = timeRecord.originalEnd;
          }

          // If there was an auto-updated start in the next segment, restore it too
          if (currentIndex < newTranscript.length - 1) {
            // Find the next segment's time record that has auto-updated start
            Object.values(timeRecords).forEach((record) => {
              if (
                record.autoUpdatedStart &&
                record.start === timeRecord.end &&
                record.originalStart !== undefined
              ) {
                newTranscript[currentIndex + 1].start = record.originalStart;
              }
            });
          }
        } else if (timeRecord.autoUpdatedEnd) {
          // Auto-updated end - restore original and remove user recorded start from next segment
          if (timeRecord.originalEnd !== undefined) {
            newTranscript[currentIndex].end = timeRecord.originalEnd;
          }

          // Find and restore the next segment's user recorded start time
          if (currentIndex < newTranscript.length - 1) {
            // Find the next segment's time record that has user recorded start
            Object.values(timeRecords).forEach((record) => {
              if (
                record.userRecordedStart &&
                record.start === timeRecord.end &&
                record.originalStart !== undefined
              ) {
                newTranscript[currentIndex + 1].start = record.originalStart;
              }
            });
          }
        }
      }

      setCurrentTranscript(newTranscript);

      // Update timeRecords - handle the key change after transcript restoration
      setTimeRecords((prev) => {
        const newRecords = { ...prev };

        if (type === "start") {
          // After restoring start time, the segmentKey changes
          const restoredStart =
            timeRecord.originalStart !== undefined
              ? timeRecord.originalStart
              : newTranscript[currentIndex].start;
          const currentEnd = newTranscript[currentIndex].end;
          const newKey = `${restoredStart}-${currentEnd}`;

          // If segmentKey is different from newKey, we need to migrate the record
          if (segmentKey !== newKey && newRecords[segmentKey]) {
            const currentRecord = { ...newRecords[segmentKey] };
            delete newRecords[segmentKey];

            // Remove start-related fields from the record
            delete currentRecord.userRecordedStart;
            delete currentRecord.autoUpdatedStart;
            delete currentRecord.originalStart;
            delete currentRecord.start;

            // If there are remaining fields (like end data), create new record
            const remainingKeys = Object.keys(currentRecord).filter(
              (key) => !["segmentIndex"].includes(key)
            );
            if (remainingKeys.length > 0) {
              newRecords[newKey] = currentRecord;
            }
          } else if (newRecords[segmentKey]) {
            // Same key, just remove start-related fields
            delete newRecords[segmentKey].userRecordedStart;
            delete newRecords[segmentKey].autoUpdatedStart;
            delete newRecords[segmentKey].originalStart;
            delete newRecords[segmentKey].start;

            // Check if record is now empty
            const remainingKeys = Object.keys(newRecords[segmentKey]).filter(
              (key) => !["segmentIndex"].includes(key)
            );
            if (remainingKeys.length === 0) {
              delete newRecords[segmentKey];
            }
          }
        } else if (type === "end") {
          // After restoring end time, the segmentKey changes
          const currentStart = newTranscript[currentIndex].start;
          const restoredEnd =
            timeRecord.originalEnd !== undefined
              ? timeRecord.originalEnd
              : newTranscript[currentIndex].end;
          const newKey = `${currentStart}-${restoredEnd}`;

          // If segmentKey is different from newKey, we need to migrate the record
          if (segmentKey !== newKey && newRecords[segmentKey]) {
            const currentRecord = { ...newRecords[segmentKey] };
            delete newRecords[segmentKey];

            // Remove end-related fields from the record
            delete currentRecord.userRecordedEnd;
            delete currentRecord.autoUpdatedEnd;
            delete currentRecord.originalEnd;
            delete currentRecord.end;

            // If there are remaining fields (like start data), create new record
            const remainingKeys = Object.keys(currentRecord).filter(
              (key) => !["segmentIndex"].includes(key)
            );
            if (remainingKeys.length > 0) {
              newRecords[newKey] = currentRecord;
            }
          } else if (newRecords[segmentKey]) {
            // Same key, just remove end-related fields
            delete newRecords[segmentKey].userRecordedEnd;
            delete newRecords[segmentKey].autoUpdatedEnd;
            delete newRecords[segmentKey].originalEnd;
            delete newRecords[segmentKey].end;

            // Check if record is now empty
            const remainingKeys = Object.keys(newRecords[segmentKey]).filter(
              (key) => !["segmentIndex"].includes(key)
            );
            if (remainingKeys.length === 0) {
              delete newRecords[segmentKey];
            }
          }
        }

        return newRecords;
      });

      message.success(
        `${type === "start" ? "Start" : "End"} time recording undone`
      );
    },
    [currentTranscript, transcriptHistory, timeRecords]
  );

  // Fine-tuning functions for start and end times
  const fineTuneStartTime = useCallback(
    (segmentKey: string, delta: number) => {
      const segmentIndex = currentTranscript.findIndex(
        (segment) => `${segment.start}-${segment.end}` === segmentKey
      );

      if (segmentIndex === -1) {
        message.error("Segment not found");
        return;
      }

      // Save current state to history before making changes
      setTranscriptHistory([...transcriptHistory, [...currentTranscript]]);

      const newTranscript = [...currentTranscript];
      const currentSegment = newTranscript[segmentIndex];
      const timeRecord = timeRecords[segmentKey];

      // Determine the current start time (recorded or original)
      const currentStartTime = timeRecord?.start ?? currentSegment.start;
      const newStartTime = Math.max(0, currentStartTime + delta);

      // Update the segment
      newTranscript[segmentIndex].start = newStartTime;

      // Update time records
      const newKey = `${newStartTime}-${currentSegment.end}`;
      setTimeRecords((prev) => {
        const newRecords = { ...prev };
        if (segmentKey !== newKey && newRecords[segmentKey]) {
          // Migrate the record to new key
          newRecords[newKey] = { ...newRecords[segmentKey] };
          delete newRecords[segmentKey];
        } else if (!newRecords[newKey]) {
          newRecords[newKey] = { segmentIndex };
        }

        // Update the time record
        newRecords[newKey] = {
          ...newRecords[newKey],
          start: newStartTime,
          userRecordedStart: true,
          originalStart: timeRecord?.originalStart ?? currentSegment.start,
        };

        return newRecords;
      });

      setCurrentTranscript(newTranscript);
      message.success(
        `Start time adjusted by ${delta > 0 ? "+" : ""}${delta}s`
      );
    },
    [currentTranscript, transcriptHistory, timeRecords]
  );

  const fineTuneEndTime = useCallback(
    (segmentKey: string, delta: number) => {
      const segmentIndex = currentTranscript.findIndex(
        (segment) => `${segment.start}-${segment.end}` === segmentKey
      );

      if (segmentIndex === -1) {
        message.error("Segment not found");
        return;
      }

      // Save current state to history before making changes
      setTranscriptHistory([...transcriptHistory, [...currentTranscript]]);

      const newTranscript = [...currentTranscript];
      const currentSegment = newTranscript[segmentIndex];
      const timeRecord = timeRecords[segmentKey];

      // Determine the current end time (recorded or original)
      const currentEndTime = timeRecord?.end ?? currentSegment.end;
      const newEndTime = Math.max(
        currentSegment.start + 0.1,
        currentEndTime + delta
      );

      // Update the current segment's end time
      newTranscript[segmentIndex].end = newEndTime;

      // Update the next segment's start time to match (if exists)
      if (segmentIndex + 1 < newTranscript.length) {
        newTranscript[segmentIndex + 1].start = newEndTime;
      }

      // Update time records for current segment
      const newKey = `${currentSegment.start}-${newEndTime}`;
      setTimeRecords((prev) => {
        const newRecords = { ...prev };

        // Handle current segment time record
        if (segmentKey !== newKey && newRecords[segmentKey]) {
          // Migrate the record to new key
          newRecords[newKey] = { ...newRecords[segmentKey] };
          delete newRecords[segmentKey];
        } else if (!newRecords[newKey]) {
          newRecords[newKey] = { segmentIndex };
        }

        // Update the current segment time record
        newRecords[newKey] = {
          ...newRecords[newKey],
          end: newEndTime,
          userRecordedEnd: true,
          originalEnd: timeRecord?.originalEnd ?? currentSegment.end,
        };

        // Handle next segment time record (if exists)
        if (segmentIndex + 1 < newTranscript.length) {
          const nextSegment = newTranscript[segmentIndex + 1];
          const oldNextKey = `${nextSegment.start}-${nextSegment.end}`;
          const newNextKey = `${newEndTime}-${nextSegment.end}`;

          if (newRecords[oldNextKey]) {
            // Migrate next segment record
            newRecords[newNextKey] = {
              ...newRecords[oldNextKey],
              start: newEndTime,
              userRecordedStart: true,
              originalStart:
                newRecords[oldNextKey].originalStart ?? nextSegment.start,
            };
            delete newRecords[oldNextKey];
          } else {
            // Create new record for next segment
            newRecords[newNextKey] = {
              segmentIndex: segmentIndex + 1,
              start: newEndTime,
              userRecordedStart: true,
              originalStart: nextSegment.start,
            };
          }
        }

        return newRecords;
      });

      setCurrentTranscript(newTranscript);
      message.success(
        `End time adjusted by ${delta > 0 ? "+" : ""}${delta}s ${
          segmentIndex + 1 < newTranscript.length
            ? "(next segment start updated)"
            : ""
        }`
      );
    },
    [currentTranscript, transcriptHistory, timeRecords]
  );

  const getCurrentVideoTime = useCallback(() => {
    if (!youtubePlayer) return 0;
    return youtubePlayer.getCurrentTime();
  }, [youtubePlayer]);

  const seekToTime = useCallback(
    (time: number) => {
      if (!youtubePlayer) return;
      youtubePlayer.seekTo(time, true);
    },
    [youtubePlayer]
  );

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(2);
    return `${minutes}:${remainingSeconds.padStart(5, "0")}`;
  };

  const formatUnixTimestamp = (timestamp: number) => {
    return formatTimestamp(timestamp, "locale");
  };

  const isEditing = (record: Video | TranscriptItem): boolean => {
    if ("video_id" in record) {
      return record.video_id === editingKey;
    } else {
      return `${record.start}-${record.end}` === editingKey;
    }
  };

  const edit = (record: Video | TranscriptItem) => {
    if ("video_id" in record) {
      setEditingVideo(record);
      editForm.setFieldsValue({ ...record });
      setIsEditVideoModalVisible(true);
    } else {
      form.setFieldsValue({ transcript: record.transcript });
      setEditingKey(`${record.start}-${record.end}`);
    }
  };

  const cancel = () => {
    setEditingKey("");
    setIsEditVideoModalVisible(false);
    setEditingVideo(null);
    editForm.resetFields();
  };

  const saveVideo = async (values: Partial<Video>) => {
    if (!editingVideo) return;

    try {
      setIsUpdatingVideo(true);

      const updatedFields: Partial<Video> = {};
      (Object.keys(values) as Array<keyof Video>).forEach((field) => {
        if (values[field] !== editingVideo[field]) {
          (updatedFields as any)[field] = values[field];
        }
      });

      if (Object.keys(updatedFields).length === 0) {
        message.info("No changes detected");
        cancel();
        return;
      }

      await api.updateVideo(
        selectedChannel!,
        editingVideo.video_id,
        updatedFields
      );

      const newData = [...videos];
      const index = newData.findIndex(
        (item) => editingVideo.video_id === item.video_id
      );
      if (index > -1) {
        newData[index] = {
          ...newData[index],
          ...updatedFields,
        };
        setVideos(newData);
        message.success("Video updated successfully");
      }

      cancel();
    } catch (error) {
      console.error("Error updating video:", error);
      message.error("Failed to update video");
    } finally {
      setIsUpdatingVideo(false);
    }
  };

  // saveTranscript function removed as we now handle saving inline in the card component

  // Add new row below the current row
  const addNewRowBelow = (record: TranscriptItem) => {
    // Save current state to history for undo functionality
    setTranscriptHistory([...transcriptHistory, [...currentTranscript]]);

    const newData = [...currentTranscript];
    const currentIndex = newData.findIndex(
      (item) => item.start === record.start
    );

    if (currentIndex > -1) {
      // Calculate new row times
      const currentRow = newData[currentIndex];
      const nextRow = newData[currentIndex + 1];

      // Calculate reasonable times for the new row
      let newStartTime: number;
      let newEndTime: number;

      if (nextRow) {
        // If there's a next row, split the time gap
        const timeDiff = nextRow.start - currentRow.end;
        if (timeDiff > 1) {
          // If there's more than 1 second gap, use the midpoint
          newStartTime = currentRow.end;
          newEndTime = currentRow.end + timeDiff / 2;

          // Update the next row's start time to be after our new row
          nextRow.start = newEndTime;
        } else {
          // If gap is small, just add a small duration
          newStartTime = currentRow.end;
          newEndTime = currentRow.end + 0.5;

          // Shift the next row slightly
          nextRow.start = newEndTime;
        }
      } else {
        // If no next row, add a reasonable duration (3 seconds)
        newStartTime = currentRow.end;
        newEndTime = currentRow.end + 3;
      }

      // Create new transcript item
      const newRow: TranscriptItem = {
        start: newStartTime,
        end: newEndTime,
        transcript: "", // Empty transcript for user to fill
      };

      // Insert new row after current row
      newData.splice(currentIndex + 1, 0, newRow);

      // Update the current transcript
      setCurrentTranscript(newData);

      message.success(
        `New row added below current row (${formatTime(
          newStartTime
        )} - ${formatTime(newEndTime)})`
      );
    }
  };

  // Delete current row
  const deleteCurrentRow = (record: TranscriptItem) => {
    if (currentTranscript.length <= 1) {
      message.warning("Cannot delete the last remaining row");
      return;
    }

    Modal.confirm({
      title: "Delete Row",
      content:
        "Are you sure you want to delete this transcript row? This action cannot be undone.",
      onOk: () => {
        // Save current state to history for undo functionality
        setTranscriptHistory([...transcriptHistory, [...currentTranscript]]);

        const newData = [...currentTranscript];
        const currentIndex = newData.findIndex(
          (item) => item.start === record.start
        );

        if (currentIndex > -1) {
          // Remove the row
          newData.splice(currentIndex, 1);

          // Update the current transcript
          setCurrentTranscript(newData);

          // Clear any editing state if this row was being edited
          if (editingKey === `${record.start}-${record.end}`) {
            setEditingKey("");
          }

          // Clear any selection if this row was selected
          setSelectedRows(
            selectedRows.filter((row) => row.start !== record.start)
          );
          setSelectedRowKeys(
            selectedRowKeys.filter(
              (key) => key !== `${record.start}-${record.end}`
            )
          );

          message.success("Row deleted successfully");
        }
      },
      onCancel() {
        // Do nothing if user cancels
      },
    });
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

  // Selection logic for transcript cards
  const handleTranscriptSelection = useCallback(
    (item: TranscriptItem, selected: boolean) => {
      const key = `${item.start}-${item.end}`;

      if (selected) {
        setSelectedRowKeys((prev) => [...prev, key]);
        setSelectedRows((prev) => [...prev, item]);
      } else {
        setSelectedRowKeys((prev) => prev.filter((k) => k !== key));
        setSelectedRows((prev) =>
          prev.filter((row) => `${row.start}-${row.end}` !== key)
        );
      }
    },
    []
  );

  // Check if an item is selected
  const isItemSelected = useCallback(
    (item: TranscriptItem) => {
      const key = `${item.start}-${item.end}`;
      return selectedRowKeys.includes(key);
    },
    [selectedRowKeys]
  );

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
      width: "15%",
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: any) => (
        <div
          className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600"
          onKeyDown={(e) => e.stopPropagation()}
        >
          <Input
            placeholder="Search Video ID"
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => confirm()}
            className="mb-3 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-gray-100"
          />
          <Space className="flex justify-between w-full">
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              className="w-20 bg-blue-500 hover:bg-blue-600 border-blue-500"
            >
              Search
            </Button>
            <Button
              onClick={() => clearFilters()}
              size="small"
              className="w-20 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-500"
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered: boolean) => (
        <SearchOutlined
          className={`transition-colors duration-200 ${
            filtered
              ? "text-blue-500 dark:text-blue-400"
              : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          }`}
        />
      ),
      onFilter: (value: any, record: Video) =>
        record.video_id
          ?.toString()
          .toLowerCase()
          .includes(value.toLowerCase()) || false,
      render: (text: string, record: Video) => (
        <span
          className={`font-mono text-sm ${
            record.visibility === "private"
              ? "text-gray-400 dark:text-gray-500"
              : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: "15%",
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: any) => (
        <div
          className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600"
          onKeyDown={(e) => e.stopPropagation()}
        >
          <Input
            placeholder="Search Title"
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => confirm()}
            className="mb-3 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-gray-100"
          />
          <Space className="flex justify-between w-full">
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              className="w-20 bg-blue-500 hover:bg-blue-600 border-blue-500"
            >
              Search
            </Button>
            <Button
              onClick={() => clearFilters()}
              size="small"
              className="w-20 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-500"
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered: boolean) => (
        <SearchOutlined
          className={`transition-colors duration-200 ${
            filtered
              ? "text-blue-500 dark:text-blue-400"
              : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          }`}
        />
      ),
      onFilter: (value: any, record: Video) =>
        record.title?.toString().toLowerCase().includes(value.toLowerCase()) ||
        false,
      render: (text: string, record: Video) => (
        <span
          className={`font-mono text-sm ${
            record.visibility === "private"
              ? "text-gray-400 dark:text-gray-500"
              : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Link",
      dataIndex: "link",
      key: "link",
      width: "15%",
      render: (text: string, record: Video) => (
        <a
          href={text}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:underline ${
            record.visibility === "private"
              ? "text-gray-400 dark:text-gray-500"
              : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {text}
        </a>
      ),
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      width: "15%",
      sorter: (a: Video, b: Video) => (a.created_at || 0) - (b.created_at || 0),
      render: (text: number, record: Video) => (
        <span
          className={`font-mono text-sm ${
            record.visibility === "private"
              ? "text-gray-400 dark:text-gray-500"
              : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {text ? formatUnixTimestamp(text) : ""}
        </span>
      ),
    },
    {
      title: "Updated At",
      dataIndex: "updated_at",
      key: "updated_at",
      width: "15%",
      sorter: (a: Video, b: Video) => (a.updated_at || 0) - (b.updated_at || 0),
      render: (text: number, record: Video) => (
        <span
          className={`font-mono text-sm ${
            record.visibility === "private"
              ? "text-gray-400 dark:text-gray-500"
              : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {text ? formatUnixTimestamp(text) : ""}
        </span>
      ),
    },
    {
      title: `Refined (${videos.filter((video) => video.is_refined).length})`,
      dataIndex: "is_refined",
      key: "is_refined",
      width: "15%",
      render: (refined: boolean) => (
        <Tag color={refined ? "green" : "red"}>{refined ? "Yes" : "No"}</Tag>
      ),
      filters: [
        { text: "Yes", value: true },
        { text: "No", value: false },
      ],
      onFilter: (value: any, record: Video) => record.is_refined === value,
    },
    {
      title: "Refined At",
      dataIndex: "refined_at",
      key: "refined_at",
      width: "15%",
      render: (refined_at: number, record: Video) => (
        <span
          className={`font-mono text-sm ${
            record.visibility === "private"
              ? "text-gray-400 dark:text-gray-500"
              : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {refined_at ? formatUnixTimestamp(refined_at) : ""}
        </span>
      ),
    },
    {
      title: "Visibility",
      dataIndex: "visibility",
      key: "visibility",
      width: "15%",
      filters: Object.entries(VISIBILITY_OPTIONS)
        .filter(([_, value]) => value !== "all")
        .map(([key, value]) => ({
          text: key,
          value: value,
        })),
      onFilter: (value: any, record: Video) => record.visibility === value,
      render: (visibility: string, record: Video) => (
        <Select
          value={visibility}
          style={{ width: 120 }}
          onChange={async (value) => {
            try {
              await api.updateVideo(selectedChannel!, record.video_id, {
                visibility: value,
              });
              const newData = [...videos];
              const index = newData.findIndex(
                (item) => record.video_id === item.video_id
              );
              if (index > -1) {
                newData[index] = { ...newData[index], visibility: value };
                setVideos(newData);
                message.success("Visibility updated successfully");
              }
            } catch (error) {
              console.error("Error updating visibility:", error);
              message.error("Failed to update visibility");
            }
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
      render: (_: string, record: Video) => (
        <Space size="small" className="flex flex-wrap">
          <Button
            onClick={() =>
              showTranscript(selectedChannel!, record.video_id, record.title)
            }
            size="small"
            className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500 hover:border-blue-600"
          >
            View Transcript
          </Button>
          <Button
            onClick={() => edit(record)}
            icon={<EditOutlined />}
            size="small"
            className="bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600"
          >
            Edit
          </Button>
          <Button
            danger
            onClick={() => handleDeleteVideo(selectedChannel!, record.video_id)}
            size="small"
          >
            Delete
          </Button>
        </Space>
      ),
      width: "30%",
    },
  ];

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

  const trimSpaces = () => {
    if (!currentTranscript || currentTranscript.length === 0) {
      message.warning("No transcript available to trim");
      return;
    }
    // Save current state to history before making changes
    setTranscriptHistory([...transcriptHistory, [...currentTranscript]]);

    // Trim spaces from the transcript and replace multiple spaces with a single space
    const trimmedTranscript = currentTranscript.map((item) => ({
      ...item,
      transcript: item.transcript.trim().replace(/\s+/g, " "),
    }));

    // Update transcript state
    setCurrentTranscript(trimmedTranscript);
    message.success(
      `Trimmed transcript and replaced multiple spaces with a single space`
    );
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
        is_refined: summary.is_refined,
        refined_at: summary.refined_at,
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

  // Filter-related functions - handleTextSelection removed as not used in new card design

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

  // Function to toggle video refined status
  const toggleVideoRefinedStatus = async () => {
    if (!selectedChannel || !currentVideoId) {
      message.error("No video or channel selected");
      return;
    }

    setIsMarkingRefined(true);
    try {
      const newRefinedStatus = !isVideoRefined;

      await api.markVideoRefined(
        selectedChannel,
        currentVideoId,
        newRefinedStatus
      );

      setIsVideoRefined(newRefinedStatus);

      const statusText = newRefinedStatus ? "Refined" : "Unrefined";
      message.success(`Video marked as ${statusText}`);
    } catch (error) {
      console.error("Error marking video as refined:", error);
      message.error("Failed to mark video as refined");
    } finally {
      setIsMarkingRefined(false);
    }
  };

  // Function to toggle video visibility
  const toggleVideoVisibility = async () => {
    if (!selectedChannel || !currentVideoId) {
      message.error("No video or channel selected");
      return;
    }

    setIsTogglingVisibility(true);
    try {
      const newVisibility =
        currentVideoVisibility === "public" ? "private" : "public";
      await api.updateVideo(selectedChannel, currentVideoId, {
        visibility: newVisibility,
      });
      setCurrentVideoVisibility(newVisibility);

      // Update the videos list to reflect the change
      setVideos((prevVideos) =>
        prevVideos.map((video) =>
          video.video_id === currentVideoId
            ? { ...video, visibility: newVisibility }
            : video
        )
      );

      message.success(`Video visibility changed to ${newVisibility}`);
    } catch (error) {
      console.error("Error changing video visibility:", error);
      message.error("Failed to change video visibility");
    } finally {
      setIsTogglingVisibility(false);
    }
  };

  // Helper function to create FormData for a batch of videos
  const createBatchFormData = (
    videoBatch: any[],
    batchSrtFiles: { [key: string]: File }
  ) => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(videoBatch));

    // Add SRT files for this batch
    videoBatch.forEach((video) => {
      const videoId = extractVideoId(video.video_link);
      const file = batchSrtFiles[videoId];
      if (file) {
        formData.append("transcript_files", file, file.name);
      }
    });

    return formData;
  };

  // Helper function to upload a single batch
  const uploadBatch = async (
    videoBatch: any[],
    batchIndex: number,
    batchSrtFiles: { [key: string]: File }
  ) => {
    try {
      const formData = createBatchFormData(videoBatch, batchSrtFiles);

      // Update progress: mark batch as processing
      setUploadProgress((prev) => ({
        ...prev,
        processing: prev.processing + videoBatch.length,
        results: prev.results.map((result) => {
          const isInCurrentBatch = videoBatch.some(
            (video) => extractVideoId(video.video_link) === result.video_id
          );
          return isInCurrentBatch
            ? { ...result, status: "processing" as const }
            : result;
        }),
      }));

      const res = await api.uploadVideos(formData);

      // Update progress with batch results
      setUploadProgress((prev) => ({
        ...prev,
        completed: prev.completed + videoBatch.length,
        processing: prev.processing - videoBatch.length,
        results: prev.results.map((result) => {
          const apiResult = res.results?.find(
            (r: any) => r.video_id === result.video_id
          );
          if (apiResult) {
            return {
              ...result,
              status: apiResult.success ? "success" : "error",
              message: apiResult.message || "Upload completed",
            };
          }
          return result;
        }),
      }));

      return res;
    } catch (error) {
      // Update progress: mark batch as error
      setUploadProgress((prev) => ({
        ...prev,
        completed: prev.completed + videoBatch.length,
        processing: prev.processing - videoBatch.length,
        results: prev.results.map((result) => {
          const isInCurrentBatch = videoBatch.some(
            (video) => extractVideoId(video.video_link) === result.video_id
          );
          return isInCurrentBatch
            ? {
                ...result,
                status: "error" as const,
                message: `Batch ${batchIndex + 1} upload failed: ${
                  error instanceof Error ? error.message : "Unknown error"
                }`,
              }
            : result;
        }),
      }));

      throw error;
    }
  };

  const onFinish = async (values: {
    video_links: Array<{ link: string; title: string }>;
  }) => {
    setIsLoading(true);
    try {
      const videoData = values.video_links.map((video) => ({
        channel_id: selectedChannel,
        video_link: video.link,
        title: video.title,
        visibility: VISIBILITY_OPTIONS.Private,
      }));

      // Validate that all videos have SRT files uploaded
      const missingFiles: Array<{
        title: string;
        videoId: string;
        link: string;
      }> = [];
      videoData.forEach((video) => {
        const videoId = extractVideoId(video.video_link);
        const file = srtFiles[videoId];
        if (!file) {
          missingFiles.push({
            title: video.title || "Untitled",
            videoId: videoId,
            link: video.video_link,
          });
        }
      });

      if (missingFiles.length > 0) {
        const errorMessage =
          `Missing SRT files for ${missingFiles.length} video(s):\n` +
          missingFiles
            .map(
              (item, index) =>
                `${index + 1}. ${item.title} (ID: ${item.videoId})`
            )
            .join("\n");

        console.error("Missing SRT files:", missingFiles);
        message.error({
          content: errorMessage,
          duration: 10, // Show for 10 seconds
        });
        setIsLoading(false);
        return;
      }

      // Double-check SRT files before processing
      console.log("SRT files validation:", {
        totalVideos: videoData.length,
        srtFilesCount: Object.keys(srtFiles).length,
        srtFiles: Object.keys(srtFiles),
        videoIds: videoData.map((v) => extractVideoId(v.video_link)),
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

      // Split videos into batches of 5
      const BATCH_SIZE = 5;
      const batches: any[][] = [];
      for (let i = 0; i < videoData.length; i += BATCH_SIZE) {
        batches.push(videoData.slice(i, i + BATCH_SIZE));
      }

      console.log(
        `Processing ${videoData.length} videos in ${batches.length} batches of ${BATCH_SIZE}`
      );

      // Process batches sequentially to avoid overwhelming the server
      const allResults: any[] = [];
      const allDuplicateIds: string[] = [];
      let totalSuccessCount = 0;
      let totalErrorCount = 0;

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(
          `Processing batch ${i + 1}/${batches.length} with ${
            batch.length
          } videos`
        );

        try {
          const batchResult = await uploadBatch(batch, i, srtFiles);

          allResults.push(...(batchResult.results || []));
          if (batchResult.duplicate_video_ids) {
            allDuplicateIds.push(...batchResult.duplicate_video_ids);
          }
          totalSuccessCount += batchResult.success_count || 0;
          totalErrorCount += batchResult.error_count || 0;

          // Small delay between batches to prevent overwhelming the server
          if (i < batches.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(`Batch ${i + 1} failed:`, error);
          totalErrorCount += batch.length;
          // Continue with next batch even if current batch fails
        }
      }

      // Show final results
      if (totalErrorCount === 0) {
        message.success(
          `All ${totalSuccessCount} videos uploaded successfully`
        );
      } else if (totalSuccessCount > 0) {
        message.warning(
          `${totalSuccessCount} videos uploaded successfully, ${totalErrorCount} failed`
        );
      } else {
        message.error("All video uploads failed");
      }

      if (allDuplicateIds.length > 0) {
        message.warning(
          `Duplicate videos skipped: ${allDuplicateIds.join(", ")}`
        );
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
    <div className="p-4 sm:p-6 lg:p-8">
      <Card
        className="dark:bg-gray-800 dark:text-white shadow-md"
        title={
          <div className="text-xl font-semibold dark:text-white">
            Video Management | Total: {videos.length}
          </div>
        }
        extra={
          <div className="w-full">
            {/* Mobile Layout */}
            <div className="block lg:hidden space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm dark:text-white whitespace-nowrap">
                    Language:
                  </span>
                  <Select
                    className="flex-1 min-w-0"
                    placeholder="Select Language"
                    onChange={handleLanguageChange}
                    value={selectedLanguage}
                    size="small"
                  >
                    {Object.entries(LANGUAGES).map(([key, value]) => (
                      <Option key={value} value={value}>
                        {key}
                      </Option>
                    ))}
                  </Select>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm dark:text-white whitespace-nowrap">
                    Channel:
                  </span>
                  <Select
                    className="flex-1 min-w-0"
                    placeholder="Select a channel"
                    onChange={handleChannelChange}
                    value={selectedChannel || undefined}
                    allowClear
                    size="small"
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
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button
                  type="primary"
                  onClick={() => {
                    if (selectedChannelLink)
                      window.open(selectedChannelLink, "_blank");
                  }}
                  disabled={!selectedChannelLink}
                  size="small"
                  className="w-full"
                >
                  Open Channel
                </Button>
                <Button
                  type="primary"
                  onClick={showAddVideoModal}
                  disabled={!selectedChannel}
                  size="small"
                  className="w-full"
                >
                  Add Videos
                </Button>
                <Button
                  type="primary"
                  onClick={() => fetchVideos(selectedChannel!)}
                  className="refresh-button w-full"
                  size="small"
                >
                  Refresh
                </Button>
                <Button
                  type="primary"
                  onClick={showTranscriptManagement}
                  disabled={!selectedChannel || videos.length === 0}
                  icon={<MergeCellsOutlined />}
                  size="small"
                  className="w-full"
                >
                  Transcript
                </Button>
                <Button
                  type="primary"
                  onClick={showBatchVisibilityModal}
                  disabled={!selectedChannel || videos.length === 0}
                  icon={<EditOutlined />}
                  size="small"
                  className="w-full sm:col-span-2"
                >
                  Batch Visibility
                </Button>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:flex items-center gap-1 flex-wrap">
              <span className="text-sm dark:text-white mr-2">Language:</span>
              <Select
                style={{ width: 100 }}
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

              <span className="text-sm dark:text-white mx-2">Channel:</span>
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
                className="ml-2"
              >
                Open Channel
              </Button>
              <Button
                type="primary"
                onClick={showAddVideoModal}
                disabled={!selectedChannel}
                className="ml-2"
              >
                Add Videos
              </Button>
              <Button
                type="primary"
                onClick={() => fetchVideos(selectedChannel!)}
                className="refresh-button ml-2"
              >
                Refresh
              </Button>
              <Button
                type="primary"
                onClick={showTranscriptManagement}
                disabled={!selectedChannel || videos.length === 0}
                icon={<MergeCellsOutlined />}
                className="ml-2"
              >
                Transcript Management
              </Button>
              <Button
                type="primary"
                onClick={showBatchVisibilityModal}
                disabled={!selectedChannel || videos.length === 0}
                icon={<EditOutlined />}
                className="ml-2"
              >
                Batch Visibility Update
              </Button>
            </div>
          </div>
        }
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              dataSource={videos}
              rowKey="video_id"
              loading={isLoading}
              scroll={{
                y: window.innerWidth < 768 ? 400 : 500,
                x: window.innerWidth < 768 ? 800 : 1200,
              }}
              size={window.innerWidth < 768 ? "small" : "middle"}
              className="w-full min-w-full dark:text-white [&_.ant-table]:dark:bg-gray-800 [&_.ant-table-thead>tr>th]:dark:bg-gray-700 [&_.ant-table-thead>tr>th]:dark:text-white [&_.ant-table-tbody>tr>td]:dark:bg-gray-800 [&_.ant-table-tbody>tr>td]:dark:text-white [&_.ant-table-tbody>tr:hover>td]:dark:bg-gray-700 [&_.ant-pagination]:dark:text-white [&_.ant-pagination-item]:dark:bg-gray-700 [&_.ant-pagination-item]:dark:border-gray-600 [&_.ant-pagination-item>a]:dark:text-white [&_.ant-pagination-item-active]:dark:bg-blue-600 [&_.ant-pagination-item-active]:dark:border-blue-600 [&_.ant-select-selector]:dark:bg-gray-700 [&_.ant-select-selector]:dark:border-gray-600 [&_.ant-select-selector]:dark:text-white [&_.ant-checkbox-wrapper]:dark:text-white [&_.ant-checkbox]:dark:border-gray-500 [&_.ant-checkbox-checked_.ant-checkbox-inner]:dark:bg-blue-600 [&_.ant-checkbox-checked_.ant-checkbox-inner]:dark:border-blue-600"
              pagination={{
                showSizeChanger: true,
                showQuickJumper: window.innerWidth >= 768,
                showTotal: (total, range) =>
                  window.innerWidth >= 768
                    ? `${range[0]}-${range[1]} of ${total} items`
                    : `${total} total`,
                responsive: true,
              }}
            />
          </div>
        </div>
      </Card>
      <Modal
        title="Add Videos"
        maskClosable={false}
        open={isAddVideoModalVisible}
        onCancel={() => setIsAddVideoModalVisible(false)}
        footer={null}
        width={window.innerWidth < 768 ? "95%" : 800}
        style={{ top: window.innerWidth < 768 ? 20 : undefined }}
      >
        <AddVideosForm
          onFinish={onFinish}
          isLoading={isLoading}
          form={form}
          handleSrtUpload={handleSrtUpload}
          srtFiles={srtFiles}
          setSrtFiles={setSrtFiles}
        />
      </Modal>
      <Modal
        maskClosable={false}
        title={`Video Transcript - ${currentVideoTitle} [${currentVideoId}]`}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          // Clear filter states and player states when modal closes
          setSelectedText("");
          setCurrentPlayingIndex(null);
          setTimeRecords({});
          setIsVideoRefined(false);
          // Clear selection states
          setSelectedRowKeys([]);
          setSelectedRows([]);
          if (playbackController) {
            playbackController.stop();
          }
        }}
        zIndex={1100}
        footer={null}
        width="95vw"
        style={{
          top: 10,
          maxHeight: "98vh",
        }}
        bodyStyle={{
          height: "calc(98vh - 100px)",
          padding: 0,
          overflow: "hidden",
        }}
        className="transcript-modal"
      >
        <div className="h-full flex flex-col">
          {/* Top Section: Player + Controls */}
          <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left Column: YouTube Player */}
              {currentVideoLink && (
                <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                  <div className="mb-2 flex justify-between items-center">
                    <Typography.Text
                      strong
                      className="text-gray-900 dark:text-white text-sm"
                    >
                      Video Player
                    </Typography.Text>
                    <Space size="small">
                      {/* Transcript Count Display */}
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs">
                          {currentTranscript.length} items
                        </span>
                        {selectedRows.length > 0 && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded text-xs">
                            {selectedRows.length} selected
                          </span>
                        )}
                      </div>
                      
                      <Typography.Text className="text-gray-700 dark:text-gray-300 text-xs">
                        Speed:
                      </Typography.Text>
                      <Select
                        value={playbackSpeed}
                        onChange={handlePlaybackSpeedChange}
                        size="small"
                        style={{ width: 70 }}
                      >
                        <Option value={0.25}>0.25x</Option>
                        <Option value={0.5}>0.5x</Option>
                        <Option value={0.75}>0.75x</Option>
                        <Option value={1}>1x</Option>
                        <Option value={1.25}>1.25x</Option>
                        <Option value={1.5}>1.5x</Option>
                        <Option value={2}>2x</Option>
                      </Select>
                      {youtubePlayer && (
                        <Typography.Text className="text-xs text-gray-600 dark:text-gray-400">
                          {formatTime(getCurrentVideoTime())}
                        </Typography.Text>
                      )}
                    </Space>
                  </div>
                  <div className="relative w-full h-[180px] overflow-hidden rounded-lg">
                    <YouTube
                      videoId={extractVideoId(currentVideoLink)}
                      onReady={onYouTubeReady}
                      opts={{
                        width: "100%",
                        height: "180",
                        playerVars: {
                          autoplay: 0,
                          controls: 1,
                          disablekb: 0,
                          fs: 1,
                          iv_load_policy: 3,
                          modestbranding: 1,
                          rel: 0,
                          showinfo: 0,
                          cc_load_policy: 0,
                        },
                      }}
                      className="absolute top-0 left-0 w-full h-full"
                    />
                  </div>
                </div>
              )}

              {/* Right Column: Filters and Controls */}
              <div className="space-y-3">
                {/* Quick Guide */}
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded">
                  <Typography.Text
                    strong
                    className="text-blue-800 dark:text-blue-200 text-sm"
                  >
                    Quick Guide:
                  </Typography.Text>
                  <Typography.Text className="ml-2 text-xs text-blue-700 dark:text-blue-300">
                    ⏰ Record times • Go = Seek • Play = Preview • Green =
                    Recorded • Apply = Save changes • 🔄 = Undo recording
                  </Typography.Text>
                </div>

                {/* Filter Status */}
                <div className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="mb-2">
                    <Typography.Text
                      strong
                      className="text-gray-900 dark:text-white text-sm"
                    >
                      Selected Text:
                    </Typography.Text>
                    <Typography.Text
                      code
                      className="ml-2 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs"
                    >
                      {selectedText || "None"}
                    </Typography.Text>
                  </div>

                  <div className="mb-2">
                    <Typography.Text
                      strong
                      className="text-gray-900 dark:text-white text-sm"
                    >
                      Filters:
                    </Typography.Text>
                    <Typography.Text className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                      ({filters.length} filters)
                    </Typography.Text>
                  </div>

                  <div className="max-h-16 overflow-y-auto">
                    {filters.length > 0 ? (
                      filters.map((filter, index) => (
                        <Tag
                          key={index}
                          closable
                          onClose={() => removeFilter(filter)}
                          color="blue"
                          className="mb-1 mr-1 text-xs"
                        >
                          {filter}
                        </Tag>
                      ))
                    ) : (
                      <Typography.Text className="text-xs text-gray-500 dark:text-gray-400">
                        No filters found
                      </Typography.Text>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex flex-wrap gap-2 justify-between items-center">
              {/* Left Side: Transcript Operations */}
              <Space wrap>
                <Button
                  onClick={loadOriginalTranscript}
                  icon={<CloudDownloadOutlined />}
                  size="small"
                >
                  Restore
                </Button>
                <Button
                  onClick={undoMerge}
                  disabled={transcriptHistory.length === 0}
                  icon={<UndoOutlined />}
                  size="small"
                >
                  Undo
                </Button>
                <Button
                  onClick={autoMergeTranscripts}
                  icon={<MergeCellsOutlined />}
                  size="small"
                >
                  Auto Merge
                </Button>
                <Button
                  onClick={mergeTranscripts}
                  disabled={selectedRows.length < 2}
                  icon={<MergeCellsOutlined />}
                  size="small"
                >
                  Merge Selected
                </Button>
              </Space>

              {/* Right Side: Filter Operations & Update */}
              <Space wrap>
                <Button
                  onClick={addToFilters}
                  disabled={!selectedText}
                  size="small"
                >
                  Add to Filter
                </Button>
                <Button
                  onClick={saveFilters}
                  loading={isSavingFilters}
                  disabled={filters.length === 0}
                  size="small"
                >
                  Save Filters ({filters.length})
                </Button>
                <Button
                  onClick={applyAllFilters}
                  loading={isApplyingFilters}
                  disabled={filters.length === 0}
                  size="small"
                >
                  Apply Filters ({filters.length})
                </Button>
                <Button
                  onClick={trimSpaces}
                  icon={<MergeCellsOutlined />}
                  size="small"
                >
                  Trim Spaces
                </Button>
                <Button
                  onClick={toggleVideoRefinedStatus}
                  loading={isMarkingRefined}
                  type={isVideoRefined ? "default" : "primary"}
                  size="small"
                  style={{
                    backgroundColor: isVideoRefined ? "#52c41a" : undefined,
                    borderColor: isVideoRefined ? "#52c41a" : undefined,
                    color: isVideoRefined ? "white" : undefined,
                  }}
                >
                  {isVideoRefined ? "Refined ✓" : "Mark as Refined"}
                </Button>
                <Button
                  onClick={toggleVideoVisibility}
                  loading={isTogglingVisibility}
                  type={
                    currentVideoVisibility === "public" ? "default" : "primary"
                  }
                  size="small"
                  icon={
                    currentVideoVisibility === "public" ? (
                      <EyeOutlined />
                    ) : (
                      <EyeInvisibleOutlined />
                    )
                  }
                  style={{
                    backgroundColor:
                      currentVideoVisibility === "public"
                        ? "#52c41a"
                        : "#ff4d4f",
                    borderColor:
                      currentVideoVisibility === "public"
                        ? "#52c41a"
                        : "#ff4d4f",
                    color: "white",
                  }}
                >
                  {currentVideoVisibility === "public" ? "Public" : "Private"}
                </Button>
                <Button
                  loading={isUpdatingTranscript}
                  onClick={updateFullTranscript}
                  type="primary"
                  size="small"
                >
                  Update
                </Button>
              </Space>
            </div>
          </div>

          {/* Bottom Section: Transcript Table */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Form
              form={form}
              component={false}
              className="flex-1 flex flex-col"
            >
              {/* New Card-Based Transcript Editor */}
              <div
                className="flex-1 overflow-y-auto px-4 py-2 space-y-4"
                style={{ maxHeight: "calc(98vh - 480px)" }}
              >
                {isTranscriptLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Loading transcript...
                      </p>
                    </div>
                  </div>
                ) : currentTranscript.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No transcript segments available
                  </div>
                ) : (
                  currentTranscript.map((item, index) => {
                    const segmentKey = `${item.start}-${item.end}`;
                    const timeRecord = timeRecords[segmentKey] || {};
                    const isItemEditing = isEditing(item);
                    const isItemPlaying = currentPlayingIndex === index;

                    return (
                      <TranscriptItemCard
                        key={segmentKey}
                        item={item}
                        index={index}
                        isEditing={isItemEditing}
                        isPlaying={isItemPlaying}
                        isPlayerReady={isPlayerReady}
                        isSelected={isItemSelected(item)}
                        timeRecord={timeRecord}
                        onEdit={() => edit(item)}
                        onSave={(transcript) => {
                          // Update the form field value and save
                          form.setFieldsValue({ transcript });

                          // Manually update the transcript instead of using the original saveTranscript
                          const newData = [...currentTranscript];
                          const segmentIndex = newData.findIndex(
                            (segment) =>
                              `${segment.start}-${segment.end}` === segmentKey
                          );
                          if (segmentIndex > -1) {
                            newData[segmentIndex] = {
                              ...newData[segmentIndex],
                              transcript,
                            };
                            setCurrentTranscript(newData);
                            setEditingKey("");
                          }
                        }}
                        onCancel={cancel}
                        onPlay={() => {
                          if (isItemPlaying) {
                            stopPlayback();
                          } else {
                            playTranscriptSegment(item, index);
                          }
                        }}
                        onStop={stopPlayback}
                        onPlayFromHere={() => playFromHere(index)}
                        onSeekToStart={() =>
                          seekToTime(
                            timeRecord.start !== undefined
                              ? timeRecord.start
                              : item.start
                          )
                        }
                        onSeekToEnd={() =>
                          seekToTime(
                            timeRecord.end !== undefined
                              ? timeRecord.end
                              : item.end
                          )
                        }
                        onRecordStart={() => startTimeRecording(segmentKey)}
                        onRecordEnd={() => endTimeRecording(segmentKey)}
                        onUndoStart={() =>
                          undoTimeRecording(segmentKey, "start")
                        }
                        onUndoEnd={() => undoTimeRecording(segmentKey, "end")}
                        onFineTuneStart={(delta) =>
                          fineTuneStartTime(segmentKey, delta)
                        }
                        onFineTuneEnd={(delta) =>
                          fineTuneEndTime(segmentKey, delta)
                        }
                        onAddRow={() => addNewRowBelow(item)}
                        onDeleteRow={() => deleteCurrentRow(item)}
                        onSelect={(selected) =>
                          handleTranscriptSelection(item, selected)
                        }
                      />
                    );
                  })
                )}
              </div>
            </Form>
          </div>
        </div>
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
            Auto Merge to All (
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
            Apply Filters to All (
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
          size="middle"
          scroll={{ y: 400 }}
          columns={[
            {
              title: "Video ID",
              dataIndex: "video_id",
              key: "video_id",
              width: "15%",
              ellipsis: true,
            },
            {
              title: "Title",
              dataIndex: "title",
              key: "title",
              width: "15%",
              ellipsis: false,
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
              title: "Refined",
              dataIndex: "is_refined",
              key: "is_refined",
              width: "15%",
              align: "center",
              render: (isRefined: boolean) => (
                <Tag color={isRefined ? "green" : "red"}>
                  {isRefined ? "Yes" : "No"}
                </Tag>
              ),
            },
            {
              title: "Refined At",
              dataIndex: "refined_at",
              key: "refined_at",
              width: "15%",
              render: (refined_at: number) =>
                refined_at ? formatUnixTimestamp(refined_at) : "",
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
                    showTranscript(
                      selectedChannel!,
                      record.video_id,
                      record.title
                    )
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

      {/* Edit Video Modal */}
      <Modal
        title={
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit Video - {editingVideo?.video_id}
          </div>
        }
        open={isEditVideoModalVisible}
        onCancel={cancel}
        footer={null}
        width={800}
        className="dark:bg-gray-800"
        maskClosable={false}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg">
          <Form
            form={editForm}
            layout="vertical"
            onFinish={saveVideo}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="video_id"
                label={
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    Video ID
                  </span>
                }
              >
                <Input
                  disabled
                  className="bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                />
              </Form.Item>

              <Form.Item
                name="visibility"
                label={
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    Visibility
                  </span>
                }
                rules={[
                  { required: true, message: "Please select visibility" },
                ]}
              >
                <Select className="dark:bg-gray-700">
                  {Object.entries(VISIBILITY_OPTIONS)
                    .filter(([_, value]) => value !== "all")
                    .map(([key, value]) => (
                      <Option key={value} value={value}>
                        {key}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </div>

            <Form.Item
              name="title"
              label={
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Title
                </span>
              }
              rules={[{ required: true, message: "Please input video title" }]}
            >
              <Input className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100" />
            </Form.Item>

            <Form.Item
              name="link"
              label={
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Link
                </span>
              }
              rules={[
                { required: true, message: "Please input video link" },
                { type: "url", message: "Please input a valid URL" },
              ]}
            >
              <Input className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100" />
            </Form.Item>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
              <Button
                onClick={cancel}
                className="bg-gray-500 hover:bg-gray-600 text-white border-gray-500 hover:border-gray-600"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isUpdatingVideo}
                className="bg-blue-500 hover:bg-blue-600 border-blue-500 hover:border-blue-600"
              >
                <SaveOutlined className="mr-1" />
                Save Changes
              </Button>
            </div>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default VideoManagement;
