import React, { useState, useEffect } from "react";
import {
  Form,
  Select,
  Input,
  Button,
  message,
  Space,
  Table,
  Row,
  Col,
  Card,
  Modal,
} from "antd";
import {
  MinusCircleOutlined,
  PlusOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { api } from "@/api/api";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Navigate } from "react-router-dom";

const { Option } = Select;
const { TextArea } = Input;

interface Channel {
  id: string;
  name: string;
}

interface Video {
  video_id: string;
  link: string;
  title: string;
}

interface TranscriptItem {
  start: number;
  end: number;
  transcript: string;
}

const VideoManagement: React.FC = () => {
  const userInfo = useSelector((state: RootState) => state.user.userInfo);

  if (!userInfo || userInfo.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const [form] = Form.useForm();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState<TranscriptItem[]>(
    []
  );
  const [isTranscriptLoading, setIsTranscriptLoading] = useState(false);
  const [editingKey, setEditingKey] = useState("");

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const response = await api.getChannels();
      setChannels(response.data);
      if (response.data.length > 0) {
        const firstChannelId = response.data[0].id;
        setSelectedChannel(firstChannelId);
        form.setFieldsValue({ channel_id: firstChannelId });
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
      const response = await api.getVideoList(channelId);
      setVideos(response.data.videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      message.error("Failed to fetch videos");
    } finally {
      setIsLoading(false);
    }
  };

  const onChannelChange = (value: string) => {
    setSelectedChannel(value);
    fetchVideos(value);
  };

  const onFinish = async (values: {
    channel_id: string;
    video_links: string[];
  }) => {
    setIsLoading(true);
    try {
      await api.uploadVideos(values.channel_id, values.video_links);
      message.success("Videos uploaded successfully");
      form.resetFields(["video_links"]);
      fetchVideos(values.channel_id);
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

  const isEditing = (record: TranscriptItem) =>
    record.start.toString() === editingKey;

  const edit = (record: TranscriptItem) => {
    form.setFieldsValue({ transcript: record.transcript });
    setEditingKey(record.start.toString());
  };

  const cancel = () => {
    setEditingKey("");
  };

  const save = async (key: React.Key) => {
    try {
      const row = (await form.validateFields()) as TranscriptItem;
      const newData = [...currentTranscript];
      const index = newData.findIndex((item) => key === item.start);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        setCurrentTranscript(newData);
        setEditingKey("");
      } else {
        newData.push(row);
        setCurrentTranscript(newData);
        setEditingKey("");
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
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
              onClick={() => save(record.start)}
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

  const columns = [
    {
      title: "Video ID",
      dataIndex: "video_id",
      key: "video_id",
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Link",
      dataIndex: "link",
      key: "link",
      render: (text: string) => (
        <a href={text} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: string, record: Video) => (
        <Button
          onClick={() => showTranscript(selectedChannel!, record.video_id)}
        >
          View Transcript
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Row gutter={24}>
        <Col span={8}>
          <Card title="Add Videos" style={{ height: "100%" }}>
            <Form form={form} onFinish={onFinish}>
              <Form.Item
                name="channel_id"
                rules={[{ required: true, message: "Please select a channel" }]}
              >
                <Select
                  placeholder="Select a channel"
                  onChange={onChannelChange}
                  value={selectedChannel}
                >
                  {channels.map((channel) => (
                    <Option key={channel.id} value={channel.id}>
                      {channel.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.List name="video_links">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Space
                        key={key}
                        style={{ display: "flex", marginBottom: 8 }}
                        align="baseline"
                      >
                        <Form.Item
                          {...restField}
                          name={name}
                          rules={[
                            { required: true, message: "Missing video link" },
                          ]}
                        >
                          <Input placeholder="YouTube video link" />
                        </Form.Item>
                        <MinusCircleOutlined onClick={() => remove(name)} />
                      </Space>
                    ))}
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                      >
                        Add Video Link
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
          </Card>
        </Col>
        <Col span={16}>
          <Card title="Existing Videos" style={{ height: "100%" }}>
            <Table
              columns={columns}
              dataSource={videos}
              rowKey="video_id"
              loading={isLoading}
              scroll={{ y: 400 }}
            />
          </Card>
        </Col>
      </Row>
      <Modal
        title="Video Transcript"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {isTranscriptLoading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            Loading transcript...
          </div>
        ) : (
          <Form form={form} component={false}>
            <Table
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

export default VideoManagement;
