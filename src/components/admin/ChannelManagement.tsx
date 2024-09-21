import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, Space, Table, Spin } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { api } from "@/api/api";

interface Channel {
  name: string;
  id: string;
  image_url: string;
}

const ChannelManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    setIsLoading(true);
    try {
      const response = await api.getChannels();
      setChannels(response.data);
    } catch (error) {
      console.error("Error fetching channels:", error);
      message.error("Failed to fetch channels");
    } finally {
      setIsLoading(false);
    }
  };

  const onFinish = async (values: { channels: Channel[] }) => {
    setIsLoading(true);
    try {
      await api.uploadChannels(values);
      message.success("Channels uploaded successfully");
      form.resetFields();
      fetchChannels(); // Refresh the channel list
    } catch (error) {
      console.error("Error uploading channels:", error);
      message.error("Failed to upload channels");
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Image URL",
      dataIndex: "image_url",
      key: "image_url",
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h1>Channel Management</h1>
      <Form form={form} onFinish={onFinish}>
        <Form.List name="channels">
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
                    name={[name, "name"]}
                    rules={[
                      { required: true, message: "Missing channel name" },
                    ]}
                  >
                    <Input placeholder="Channel Name" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "id"]}
                    rules={[{ required: true, message: "Missing channel ID" }]}
                  >
                    <Input placeholder="Channel ID" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "image_url"]}
                    rules={[{ required: true, message: "Missing image URL" }]}
                  >
                    <Input placeholder="Image URL" />
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
                  Add Channel
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Upload Channels
          </Button>
        </Form.Item>
      </Form>

      <h2>Existing Channels</h2>
      {isLoading ? (
        <Spin size="large" />
      ) : (
        <Table columns={columns} dataSource={channels} rowKey="id" />
      )}
    </div>
  );
};

export default ChannelManagement;
