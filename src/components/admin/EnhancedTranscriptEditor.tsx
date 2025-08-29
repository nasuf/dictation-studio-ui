import React, { useState, useEffect } from "react";
import {
  Button,
  Select,
  Space,
  Typography,
  Tag,
  Modal,
  message,
  Form,
  Input,
} from "antd";
import {
  EditOutlined,
  PlusOutlined,
  UndoOutlined,
  CloudDownloadOutlined,
  MergeCellsOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  CaretRightOutlined,
  StopOutlined,
  StepForwardOutlined,
  RollbackOutlined,
  MinusCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import YouTube, { YouTubePlayer } from "react-youtube";
import {
  VideoPlaybackController,
  VideoPlaybackState,
  TranscriptSegment,
} from "@/utils/videoPlaybackUtils";
import { Video, TranscriptItem } from "@/utils/type";

const { Option } = Select;

// Utility function to format video time
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
};

export interface EnhancedTranscriptEditorState {
  isVisible: boolean;
  isLoading: boolean;
  transcriptItems: TranscriptItem[];
  hasUnsavedChanges: boolean;
  video: Video | undefined;
  currentPlayingIndex: number | undefined;
  isVideoPlaying: boolean;
  currentVideoTime: number;
  playbackSpeed: number;
  isSelectionMode: boolean;
  selectedSegments: Set<number>;
  // Enhanced functionality
  filters: string[];
  selectedText: string;
  transcriptHistory: TranscriptItem[][];
  selectedRows: TranscriptItem[];
  timeRecords: {
    [key: string]: {
      start?: number;
      end?: number;
      userRecordedStart?: boolean;
      userRecordedEnd?: boolean;
    };
  };
  editingKey: string;
  isVideoRefined: boolean;
  currentVideoVisibility: string;
}

interface EnhancedTranscriptEditorProps {
  state: EnhancedTranscriptEditorState;
  onStateChange: (changes: Partial<EnhancedTranscriptEditorState>) => void;
  onSave: () => Promise<void>;
  onClose: () => void;
  isMobile: boolean;
}

// Enhanced Transcript Item Component
const TranscriptItemCard: React.FC<{
  item: TranscriptItem;
  index: number;
  isEditing: boolean;
  isPlaying: boolean;
  isPlayerReady: boolean;
  isSelected: boolean;
  timeRecord: {
    start?: number;
    end?: number;
    userRecordedStart?: boolean;
    userRecordedEnd?: boolean;
  };
  onEdit: () => void;
  onSave: (transcript: string) => void;
  onCancel: () => void;
  onPlay: () => void;
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

  const formatTimeDisplay = (seconds: number) => {
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
      } ${isPlaying ? "ring-2 ring-blue-500 ring-opacity-50" : ""}`}
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
          {isPlaying && (
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
              Playing
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-1">
          <Button
            size="small"
            type="text"
            icon={isPlaying ? <StopOutlined /> : <CaretRightOutlined />}
            onClick={onPlay}
            disabled={!isPlayerReady}
            className="text-blue-600 dark:text-blue-400"
          />
          <Button
            size="small"
            type="text"
            icon={<StepForwardOutlined />}
            onClick={onPlayFromHere}
            disabled={!isPlayerReady}
            className="text-green-600 dark:text-green-400"
          />
          <Button
            size="small"
            type="text"
            icon={<EditOutlined />}
            onClick={onEdit}
            className="text-orange-600 dark:text-orange-400"
          />
          <Button
            size="small"
            type="text"
            icon={<PlusOutlined />}
            onClick={onAddRow}
            className="text-purple-600 dark:text-purple-400"
          />
          <Button
            size="small"
            type="text"
            icon={<MinusCircleOutlined />}
            onClick={onDeleteRow}
            className="text-red-600 dark:text-red-400"
          />
        </div>
      </div>

      {/* Time controls */}
      <div className="grid grid-cols-12 gap-2 mb-3">
        {/* Start time */}
        <div className="col-span-5">
          <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                Start
              </span>
              <div className="flex items-center space-x-1">
                <Button
                  size="small"
                  type="text"
                  className={`p-0 w-5 h-5 ${
                    timeRecord.userRecordedStart
                      ? "text-green-600 dark:text-green-400"
                      : "text-blue-600 dark:text-blue-400"
                  }`}
                  onClick={onRecordStart}
                >
                  <div className="w-2 h-2 bg-current rounded-full"></div>
                </Button>
                <Button
                  size="small"
                  type="text"
                  icon={<RollbackOutlined />}
                  onClick={onUndoStart}
                  className="text-gray-600 dark:text-gray-400 p-0 w-4 h-4"
                />
              </div>
            </div>
            <div className="font-mono text-sm font-bold text-gray-900 dark:text-gray-100">
              {formatTimeDisplay(
                timeRecord.start !== undefined ? timeRecord.start : item.start
              )}
            </div>
            <div className="flex items-center justify-between mt-1">
              <Button
                size="small"
                type="text"
                onClick={onSeekToStart}
                disabled={!isPlayerReady}
                className="text-xs text-blue-600 dark:text-blue-400"
              >
                Go
              </Button>
              <div className="flex space-x-1">
                <Button
                  size="small"
                  type="text"
                  onClick={() => onFineTuneStart(-0.05)}
                  className="text-xs px-1 py-0 h-5 text-red-600 dark:text-red-400"
                >
                  -0.05
                </Button>
                <Button
                  size="small"
                  type="text"
                  onClick={() => onFineTuneStart(0.05)}
                  className="text-xs px-1 py-0 h-5 text-green-600 dark:text-green-400"
                >
                  +0.05
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* End time */}
        <div className="col-span-5">
          <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                End
              </span>
              <div className="flex items-center space-x-1">
                <Button
                  size="small"
                  type="text"
                  className={`p-0 w-5 h-5 ${
                    timeRecord.userRecordedEnd
                      ? "text-green-600 dark:text-green-400"
                      : "text-blue-600 dark:text-blue-400"
                  }`}
                  onClick={onRecordEnd}
                >
                  <div className="w-2 h-2 bg-current rounded-full"></div>
                </Button>
                <Button
                  size="small"
                  type="text"
                  icon={<RollbackOutlined />}
                  onClick={onUndoEnd}
                  className="text-gray-600 dark:text-gray-400 p-0 w-4 h-4"
                />
              </div>
            </div>
            <div className="font-mono text-sm font-bold text-gray-900 dark:text-gray-100">
              {formatTimeDisplay(
                timeRecord.end !== undefined ? timeRecord.end : item.end
              )}
            </div>
            <div className="flex items-center justify-between mt-1">
              <Button
                size="small"
                type="text"
                onClick={onSeekToEnd}
                disabled={!isPlayerReady}
                className="text-xs text-blue-600 dark:text-blue-400"
              >
                Go
              </Button>
              <div className="flex space-x-1">
                <Button
                  size="small"
                  type="text"
                  onClick={() => onFineTuneEnd(-0.05)}
                  className="text-xs px-1 py-0 h-5 text-red-600 dark:text-red-400"
                >
                  -0.05
                </Button>
                <Button
                  size="small"
                  type="text"
                  onClick={() => onFineTuneEnd(0.05)}
                  className="text-xs px-1 py-0 h-5 text-green-600 dark:text-green-400"
                >
                  +0.05
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transcript text */}
      <div className="mb-2">
        {isEditing ? (
          <div className="space-y-2">
            <Input.TextArea
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              autoSize={{ minRows: 2, maxRows: 8 }}
              className="border border-blue-300 dark:border-blue-600"
            />
            <div className="flex justify-end space-x-2">
              <Button size="small" onClick={onCancel}>
                Cancel
              </Button>
              <Button size="small" type="primary" onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="p-3 bg-gray-50 dark:bg-gray-700 rounded border cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
            onDoubleClick={handleDoubleClick}
          >
            <p className="text-gray-900 dark:text-gray-100 leading-relaxed">
              {item.transcript || (
                <span className="text-gray-400 dark:text-gray-500 italic">
                  Double-click to edit transcript
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const EnhancedTranscriptEditor: React.FC<EnhancedTranscriptEditorProps> = ({
  state,
  onStateChange,
  onSave,
  onClose,
  isMobile,
}) => {
  const [youtubePlayer, setYoutubePlayer] = useState<YouTubePlayer | null>(
    null
  );
  const [playbackController, setPlaybackController] =
    useState<VideoPlaybackController | null>(null);
  const [form] = Form.useForm();

  // YouTube Player Functions
  const onYouTubeReady = (event: { target: YouTubePlayer }) => {
    const player = event.target;
    setYoutubePlayer(player);

    const controller = new VideoPlaybackController(player as any, {
      playbackSpeed: state.playbackSpeed,
      onStateChange: (playbackState: VideoPlaybackState) => {
        onStateChange({
          isVideoPlaying: playbackState.isPlaying,
          currentVideoTime: getCurrentVideoTime(),
          currentPlayingIndex: playbackState.isPlaying
            ? state.currentPlayingIndex
            : undefined,
        });
      },
    });

    setPlaybackController(controller);
  };

  const extractVideoId = (url: string): string => {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    );
    return match ? match[1] : "";
  };

  const getCurrentVideoTime = (): number => {
    return youtubePlayer?.getCurrentTime() || 0;
  };

  // Enhanced functions for all the missing operations
  const playTranscriptSegment = async (item: TranscriptItem, index: number) => {
    if (!playbackController) return;

    try {
      onStateChange({ currentPlayingIndex: index, isVideoPlaying: true });

      const segmentKey = `${item.start}-${item.end}`;
      const timeRecord = state.timeRecords[segmentKey] || {};

      const segment: TranscriptSegment = {
        start: timeRecord.start !== undefined ? timeRecord.start : item.start,
        end: timeRecord.end !== undefined ? timeRecord.end : item.end,
        transcript: item.transcript,
      };

      await playbackController.playSegment(segment, () => {
        onStateChange({
          currentPlayingIndex: undefined,
          isVideoPlaying: false,
        });
      });
    } catch (error) {
      console.error("Error playing segment:", error);
      message.error("Failed to play segment");
    }
  };

  const stopPlayback = () => {
    if (playbackController) {
      playbackController.stop();
    }
    onStateChange({ currentPlayingIndex: undefined, isVideoPlaying: false });
  };

  // All the missing functions need to be implemented here
  const isEditing = (item: TranscriptItem): boolean => {
    return state.editingKey === `${item.start}-${item.end}`;
  };

  const edit = (item: TranscriptItem) => {
    const segmentKey = `${item.start}-${item.end}`;
    onStateChange({ editingKey: segmentKey });
  };

  const cancel = () => {
    onStateChange({ editingKey: "" });
  };

  const isItemSelected = (item: TranscriptItem): boolean => {
    const index = state.transcriptItems.indexOf(item);
    return state.selectedSegments.has(index);
  };

  const handleTranscriptSelection = (
    item: TranscriptItem,
    selected: boolean
  ) => {
    const index = state.transcriptItems.indexOf(item);
    const newSelected = new Set(state.selectedSegments);

    if (selected) {
      newSelected.add(index);
    } else {
      newSelected.delete(index);
    }

    onStateChange({
      selectedSegments: newSelected,
      selectedRows: state.transcriptItems.filter((_, i) => newSelected.has(i)),
    });
  };

  // Placeholder implementations for all the missing functions
  const seekToTime = (time: number) => {
    if (youtubePlayer) {
      youtubePlayer.seekTo(time, true);
    }
  };

  const playFromHere = (index: number) => {
    if (state.transcriptItems[index]) {
      playTranscriptSegment(state.transcriptItems[index], index);
    }
  };

  const startTimeRecording = (segmentKey: string) => {
    const currentTime = getCurrentVideoTime();
    const newTimeRecords = {
      ...state.timeRecords,
      [segmentKey]: {
        ...state.timeRecords[segmentKey],
        start: currentTime,
        userRecordedStart: true,
      },
    };
    onStateChange({ timeRecords: newTimeRecords, hasUnsavedChanges: true });
  };

  const endTimeRecording = (segmentKey: string) => {
    const currentTime = getCurrentVideoTime();
    const newTimeRecords = {
      ...state.timeRecords,
      [segmentKey]: {
        ...state.timeRecords[segmentKey],
        end: currentTime,
        userRecordedEnd: true,
      },
    };
    onStateChange({ timeRecords: newTimeRecords, hasUnsavedChanges: true });
  };

  const undoTimeRecording = (segmentKey: string, type: "start" | "end") => {
    const newTimeRecords = { ...state.timeRecords };
    if (type === "start") {
      delete newTimeRecords[segmentKey]?.start;
      if (newTimeRecords[segmentKey]) {
        newTimeRecords[segmentKey].userRecordedStart = false;
      }
    } else {
      delete newTimeRecords[segmentKey]?.end;
      if (newTimeRecords[segmentKey]) {
        newTimeRecords[segmentKey].userRecordedEnd = false;
      }
    }
    onStateChange({ timeRecords: newTimeRecords, hasUnsavedChanges: true });
  };

  const fineTuneStartTime = (segmentKey: string, delta: number) => {
    const record = state.timeRecords[segmentKey];
    const currentStart =
      record?.start !== undefined
        ? record.start
        : state.transcriptItems.find(
            (item) => `${item.start}-${item.end}` === segmentKey
          )?.start || 0;

    const newTimeRecords = {
      ...state.timeRecords,
      [segmentKey]: {
        ...state.timeRecords[segmentKey],
        start: Math.max(0, currentStart + delta),
        userRecordedStart: true,
      },
    };
    onStateChange({ timeRecords: newTimeRecords, hasUnsavedChanges: true });
  };

  const fineTuneEndTime = (segmentKey: string, delta: number) => {
    const record = state.timeRecords[segmentKey];
    const currentEnd =
      record?.end !== undefined
        ? record.end
        : state.transcriptItems.find(
            (item) => `${item.start}-${item.end}` === segmentKey
          )?.end || 0;

    const newTimeRecords = {
      ...state.timeRecords,
      [segmentKey]: {
        ...state.timeRecords[segmentKey],
        end: Math.max(0, currentEnd + delta),
        userRecordedEnd: true,
      },
    };
    onStateChange({ timeRecords: newTimeRecords, hasUnsavedChanges: true });
  };

  const addNewRowBelow = (item: TranscriptItem) => {
    const index = state.transcriptItems.indexOf(item);
    const newItem: TranscriptItem = {
      start: item.end,
      end: item.end + 5, // 5 seconds default
      transcript: "",
    };

    const newItems = [...state.transcriptItems];
    newItems.splice(index + 1, 0, newItem);
    onStateChange({ transcriptItems: newItems, hasUnsavedChanges: true });
  };

  const deleteCurrentRow = (item: TranscriptItem) => {
    const newItems = state.transcriptItems.filter((i) => i !== item);
    onStateChange({ transcriptItems: newItems, hasUnsavedChanges: true });
  };

  const handlePlaybackSpeedChange = (speed: number) => {
    onStateChange({ playbackSpeed: speed });
    if (playbackController) {
      playbackController.setPlaybackSpeed(speed);
    }
    if (youtubePlayer) {
      youtubePlayer.setPlaybackRate(speed);
    }
  };

  // Placeholder functions for operations
  const loadOriginalTranscript = () => {
    message.info("Load original transcript functionality to be implemented");
  };

  const undoMerge = () => {
    message.info("Undo merge functionality to be implemented");
  };

  const autoMergeTranscripts = () => {
    message.info("Auto merge functionality to be implemented");
  };

  const mergeTranscripts = () => {
    message.info("Merge selected functionality to be implemented");
  };

  const addToFilters = () => {
    message.info("Add to filter functionality to be implemented");
  };

  const saveFilters = () => {
    message.info("Save filters functionality to be implemented");
  };

  const applyAllFilters = () => {
    message.info("Apply filters functionality to be implemented");
  };

  const trimSpaces = () => {
    message.info("Trim spaces functionality to be implemented");
  };

  const toggleVideoRefinedStatus = () => {
    message.info("Toggle refined status functionality to be implemented");
  };

  const toggleVideoVisibility = () => {
    message.info("Toggle visibility functionality to be implemented");
  };

  const updateFullTranscript = () => {
    onSave();
  };

  const removeFilter = (filter: string) => {
    const newFilters = state.filters.filter((f) => f !== filter);
    onStateChange({ filters: newFilters });
  };

  const renderContent = () => (
    <div className="h-full flex flex-col">
      {/* Top Section: Player + Controls */}
      <div className={`flex-shrink-0 border-b border-gray-200 dark:border-gray-600 ${isMobile ? 'p-2' : 'p-4'}`}>
        <div className={`grid grid-cols-1 gap-2 ${isMobile ? '' : 'lg:grid-cols-2 gap-4'}`}>
          {/* Left Column: YouTube Player */}
          {state.video && (
            <div className={`bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg ${isMobile ? 'p-2' : 'p-3'}`}>
              <div className="mb-2 flex justify-between items-center">
                {isMobile ? (
                  <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={onClose}
                    className="text-gray-900 dark:text-white font-medium"
                  ></Button>
                ) : (
                  <Typography.Text
                    strong
                    className="text-gray-900 dark:text-white text-sm"
                  >
                    Video Player
                  </Typography.Text>
                )}
                <Space size="small">
                  {/* Transcript Count Display */}
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs">
                      {state.transcriptItems.length} items
                    </span>
                    {state.selectedRows.length > 0 && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded text-xs">
                        {state.selectedRows.length} selected
                      </span>
                    )}
                  </div>

                  <Typography.Text className="text-gray-700 dark:text-gray-300 text-xs">
                    Speed:
                  </Typography.Text>
                  <Select
                    value={state.playbackSpeed}
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
              <div className={`relative w-full overflow-hidden rounded-lg ${isMobile ? 'h-[120px]' : 'h-[180px]'}`}>
                <YouTube
                  videoId={extractVideoId(state.video.link)}
                  onReady={onYouTubeReady}
                  opts={{
                    width: "100%",
                    height: isMobile ? "120" : "180",
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

          {/* Right Column: Filters and Controls - Hidden on mobile */}
          {!isMobile && (
          <div className="space-y-3">
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
                  {state.selectedText || "None"}
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
                  ({state.filters.length} filters)
                </Typography.Text>
              </div>

              <div className="max-h-16 overflow-y-auto">
                {state.filters.length > 0 ? (
                  state.filters.map((filter, index) => (
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
          )}
        </div>

        {/* Action Buttons */}
        <div className={`flex flex-wrap justify-between items-center ${isMobile ? 'mt-2 gap-1' : 'mt-4 gap-2'}`}>
          {/* Left Side: Transcript Operations */}
          <Space wrap size={isMobile ? "small" : "middle"}>
            <Button
              onClick={loadOriginalTranscript}
              icon={<CloudDownloadOutlined />}
              size="small"
            >
              Restore
            </Button>
            <Button
              onClick={undoMerge}
              disabled={state.transcriptHistory.length === 0}
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
              disabled={state.selectedRows.length < 2}
              icon={<MergeCellsOutlined />}
              size="small"
            >
              Merge Selected
            </Button>
          </Space>

          {/* Right Side: Filter Operations & Update */}
          <Space wrap size={isMobile ? "small" : "middle"}>
            <Button
              onClick={addToFilters}
              disabled={!state.selectedText}
              size="small"
            >
              Add to Filter
            </Button>
            <Button
              onClick={saveFilters}
              disabled={state.filters.length === 0}
              size="small"
            >
              Save Filters ({state.filters.length})
            </Button>
            <Button
              onClick={applyAllFilters}
              disabled={state.filters.length === 0}
              size="small"
            >
              Apply Filters ({state.filters.length})
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
              type={state.isVideoRefined ? "default" : "primary"}
              size="small"
              style={{
                backgroundColor: state.isVideoRefined ? "#52c41a" : undefined,
                borderColor: state.isVideoRefined ? "#52c41a" : undefined,
                color: state.isVideoRefined ? "white" : undefined,
              }}
            >
              {state.isVideoRefined ? "Refined ✓" : "Mark as Refined"}
            </Button>
            <Button
              onClick={toggleVideoVisibility}
              type={
                state.currentVideoVisibility === "public"
                  ? "default"
                  : "primary"
              }
              size="small"
              icon={
                state.currentVideoVisibility === "public" ? (
                  <EyeOutlined />
                ) : (
                  <EyeInvisibleOutlined />
                )
              }
              style={{
                backgroundColor:
                  state.currentVideoVisibility === "public"
                    ? "#52c41a"
                    : "#ff4d4f",
                borderColor:
                  state.currentVideoVisibility === "public"
                    ? "#52c41a"
                    : "#ff4d4f",
                color: "white",
              }}
            >
              {state.currentVideoVisibility === "public" ? "Public" : "Private"}
            </Button>
            <Button
              loading={state.isLoading}
              onClick={updateFullTranscript}
              type="primary"
              size="small"
            >
              Update
            </Button>
          </Space>
        </div>
      </div>

      {/* Bottom Section: Transcript List */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Form form={form} component={false} className="flex-1 flex flex-col">
          {/* Card-Based Transcript Editor */}
          <div
            className={`flex-1 overflow-y-auto py-2 space-y-4 ${isMobile ? 'px-2' : 'px-4'}`}
            style={{
              maxHeight: isMobile
                ? "calc(100vh - 220px)"
                : "calc(85vh - 320px)",
            }}
          >
            {state.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Loading transcript...
                  </p>
                </div>
              </div>
            ) : state.transcriptItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No transcript segments available
              </div>
            ) : (
              state.transcriptItems.map((item, index) => {
                const segmentKey = `${item.start}-${item.end}`;
                const timeRecord = state.timeRecords[segmentKey] || {};
                const isItemEditing = isEditing(item);
                const isItemPlaying = state.currentPlayingIndex === index;

                return (
                  <TranscriptItemCard
                    key={segmentKey}
                    item={item}
                    index={index}
                    isEditing={isItemEditing}
                    isPlaying={isItemPlaying}
                    isPlayerReady={!!youtubePlayer}
                    isSelected={isItemSelected(item)}
                    timeRecord={timeRecord}
                    onEdit={() => edit(item)}
                    onSave={(transcript) => {
                      // Update the form field value and save
                      form.setFieldsValue({ transcript });

                      // Manually update the transcript instead of using the original saveTranscript
                      const newData = [...state.transcriptItems];
                      const segmentIndex = newData.findIndex(
                        (segment) =>
                          `${segment.start}-${segment.end}` === segmentKey
                      );
                      if (segmentIndex > -1) {
                        newData[segmentIndex] = {
                          ...newData[segmentIndex],
                          transcript,
                        };
                        onStateChange({
                          transcriptItems: newData,
                          editingKey: "",
                          hasUnsavedChanges: true,
                        });
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
                        timeRecord.end !== undefined ? timeRecord.end : item.end
                      )
                    }
                    onRecordStart={() => startTimeRecording(segmentKey)}
                    onRecordEnd={() => endTimeRecording(segmentKey)}
                    onUndoStart={() => undoTimeRecording(segmentKey, "start")}
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
  );

  if (isMobile) {
    if (!state.isVisible) return null;
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900">
        {renderContent()}
      </div>
    );
  } else {
    return (
      <Modal
        title={
          <div className="flex items-center">
            <EditOutlined className="mr-2 text-purple-600" />
            <span>Edit Transcript - {state.video?.title}</span>
          </div>
        }
        open={state.isVisible}
        onCancel={onClose}
        footer={null}
        width="95%"
        className="max-w-4xl"
        style={{
          top: 10,
        }}
        bodyStyle={{
          height: "85vh",
          padding: 0,
          overflow: "hidden",
        }}
        maskClosable={false}
        destroyOnClose
      >
        {renderContent()}
      </Modal>
    );
  }
};

export default EnhancedTranscriptEditor;
