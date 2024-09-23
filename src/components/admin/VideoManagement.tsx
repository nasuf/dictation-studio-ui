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
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { api } from "@/api/api";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Navigate } from "react-router-dom";

const { Option } = Select;

interface Channel {
  id: string;
  name: string;
}

interface Video {
  video_id: string;
  link: string;
  title: string;
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
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Row gutter={24}>
        <Col span={12}>
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
        <Col span={12}>
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
    </div>
  );
};

export default VideoManagement;
