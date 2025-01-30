import React, { useState, useEffect } from "react";
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
} from "antd";
import {
  MinusCircleOutlined,
  PlusOutlined,
  EditOutlined,
  MergeCellsOutlined,
  UndoOutlined,
  CloudDownloadOutlined,
  DownloadOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  SaveOutlined,
  CloseOutlined,
  LockOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { api } from "@/api/api";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Navigate } from "react-router-dom";
import getYoutubeId from "get-youtube-id";
import { Channel, TranscriptItem, Video } from "@/utils/type";
import { LANGUAGES, USER_ROLE, VISIBILITY_OPTIONS } from "@/utils/const";

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

const customUploadStyles = `
  .ant-upload-list-text {
    display: none !important;
  }
`;

const AddVideosForm: React.FC<{
  onFinish: (values: any) => void;
  isLoading: boolean;
  form: any;
  handleSrtUpload: (videoLink: string, file: File) => void;
  srtFiles: { [key: string]: File };
}> = ({ onFinish, isLoading, form, handleSrtUpload, srtFiles }) => {
  const openSubtitleDownloader = (videoLink: string) => {
    const url = `https://downsub.com/?url=${encodeURIComponent(videoLink)}`;
    window.open(url, "_blank");
  };

  return (
    <>
      <style>{customUploadStyles}</style>
      <Form form={form} onFinish={onFinish}>
        <Form.List name="video_links">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <div key={key} style={{ marginBottom: 16 }}>
                  <Space
                    style={{ display: "flex", marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "link"]}
                      rules={[
                        { required: true, message: "Missing video link" },
                      ]}
                    >
                      <Input placeholder="YouTube video link" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "title"]}
                      rules={[
                        { required: true, message: "Missing video title" },
                      ]}
                    >
                      <Input placeholder="Video title" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                  <Space align="center" style={{ width: "100%" }}>
                    <Button
                      onClick={() =>
                        openSubtitleDownloader(
                          form.getFieldValue(["video_links", name, "link"])
                        )
                      }
                      icon={<DownloadOutlined />}
                    >
                      Get Subtitles
                    </Button>
                    <Upload
                      beforeUpload={(file) => {
                        const videoLink = form.getFieldValue([
                          "video_links",
                          name,
                          "link",
                        ]);
                        handleSrtUpload(videoLink, file);
                        return false;
                      }}
                    >
                      <Button icon={<UploadOutlined />}>Upload SRT</Button>
                    </Upload>
                    {srtFiles[
                      extractVideoId(
                        form.getFieldValue(["video_links", name, "link"])
                      )
                    ] ? (
                      <CheckCircleOutlined
                        style={{ color: "#52c41a", fontSize: "24px" }}
                      />
                    ) : (
                      <></>
                    )}
                  </Space>
                </div>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Video
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Upload Videos
          </Button>
        </Form.Item>
      </Form>
    </>
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

  useEffect(() => {
    fetchChannels();
  }, []);

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
        fetchVideos(firstChannelId);
      }
    } catch (error) {
      console.error("Error fetching channels:", error);
      message.error("Failed to fetch channels");
    }
  };

  const fetchVideos = async (channelId: string) => {
    setIsLoading(true);
    try {
      const response = await api.getVideoList(channelId, true);
      setVideos(response.data.videos);
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
    const newFile = new File([file], `${videoId}.srt`, { type: file.type });
    setSrtFiles((prev) => ({ ...prev, [videoId]: newFile }));
    message.success(`${newFile.name} file uploaded successfully`);
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
        visibility: "hidden",
      }));

      formData.append("data", JSON.stringify(videoData));

      videoData.forEach((video) => {
        const videoId = extractVideoId(video.video_link);
        const file = srtFiles[videoId];
        if (file) {
          formData.append("transcript_files", file, file.name);
        }
      });

      await api.uploadVideos(formData);

      message.success("Videos uploaded successfully");

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

  const showTranscript = async (channelId: string, videoId: string) => {
    setIsTranscriptLoading(true);
    setIsModalVisible(true);
    setCurrentVideoId(videoId);
    try {
      const response = await api.getVideoTranscript(channelId, videoId);
      setCurrentTranscript(response.data.transcript);
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
      render: (text: string, record: TranscriptItem) => {
        const editable = isEditing(record);
        return editable ? (
          <Form.Item
            name="transcript"
            style={{ margin: 0 }}
            rules={[
              { required: true, message: "Please input the transcript!" },
            ]}
          >
            <TextArea
              autoSize={{ minRows: 2, maxRows: 6 }}
              defaultValue={text}
            />
          </Form.Item>
        ) : (
          text
        );
      },
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
      editable: true,
      width: "10%",
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
      editable: true,
      render: (text: string, record: Video) => {
        const editable = isEditing(record);
        return editable ? (
          <Form.Item
            name="link"
            style={{ margin: 0 }}
            rules={[{ required: true, message: "Please input the link!" }]}
          >
            <Input />
          </Form.Item>
        ) : (
          <a href={text} target="_blank" rel="noopener noreferrer">
            {text}
          </a>
        );
      },
      width: "30%",
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
          <Option value="public" className="visibility-option">
            <GlobalOutlined /> Public
          </Option>
          <Option value="hidden" className="visibility-option">
            <LockOutlined /> Hidden
          </Option>
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
    fetchVideos(value);
  };

  const showAddVideoModal = () => {
    if (!selectedChannel) {
      message.error("Please select a channel first");
      return;
    }
    setIsAddVideoModalVisible(true);
  };

  return (
    <div style={{ padding: "20px" }}>
      <Card title="Video Management">
        <Space style={{ marginBottom: 16 }}>
          <Select
            style={{ width: 200 }}
            placeholder="Select a channel"
            onChange={handleChannelChange}
            value={selectedChannel || undefined}
          >
            {channels.map((channel) => (
              <Option key={channel.id} value={channel.id}>
                {channel.name}
              </Option>
            ))}
          </Select>
          <Button type="primary" onClick={showAddVideoModal}>
            Add Videos
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
        title="Video Transcript"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button
            key="loadOriginal"
            onClick={loadOriginalTranscript}
            icon={<CloudDownloadOutlined />}
          >
            Load Original Transcript
          </Button>,
          <Button
            key="undo"
            onClick={undoMerge}
            disabled={transcriptHistory.length === 0}
            icon={<UndoOutlined />}
          >
            Undo
          </Button>,
          <Button
            key="merge"
            onClick={mergeTranscripts}
            disabled={selectedRows.length < 2}
            icon={<MergeCellsOutlined />}
          >
            Merge Selected
          </Button>,
          <Button
            loading={isUpdatingTranscript}
            key="update"
            onClick={updateFullTranscript}
            type="primary"
          >
            Update Full Transcript
          </Button>,
        ]}
        width={800}
      >
        {isTranscriptLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <Form form={form} component={false}>
            <Table
              rowSelection={rowSelection}
              columns={transcriptColumns}
              dataSource={currentTranscript}
              rowKey={(record) => record.start.toString()}
              pagination={{ pageSize: 10 }}
              scroll={{ y: 400 }}
            />
          </Form>
        )}
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
          <Input />
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

export default VideoManagement;
