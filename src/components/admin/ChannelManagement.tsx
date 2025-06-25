import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  message,
  Space,
  Table,
  Card,
  Image,
  Modal,
  Select,
  List,
  Avatar,
  Tag,
} from "antd";
import {
  MinusCircleOutlined,
  PlusOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  YoutubeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { api } from "@/api/api";
import { Channel, ChannelRecommendationItem } from "@/utils/type";
import { LANGUAGES, VISIBILITY_OPTIONS } from "@/utils/const";

const { Option } = Select;

const AddChannelForm: React.FC<{
  onFinish: (values: any) => void;
  isLoading: boolean;
  form: any;
}> = ({ onFinish, isLoading, form }) => {
  return (
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
                  rules={[{ required: true, message: "Missing channel name" }]}
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
                <Form.Item
                  {...restField}
                  name={[name, "link"]}
                  rules={[{ required: true, message: "Missing channel link" }]}
                >
                  <Input placeholder="Channel Link" />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, "language"]}
                  rules={[
                    { required: true, message: "Missing channel language" },
                  ]}
                >
                  <Select placeholder="Channel Language">
                    <Option value="en">English</Option>
                    <Option value="zh">Chinese</Option>
                    <Option value="ja">Japanese</Option>
                    <Option value="ko">Korean</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, "visibility"]}
                  rules={[
                    { required: true, message: "Missing channel visibility" },
                  ]}
                >
                  <Select placeholder="Channel Visibility">
                    <Option value="public">Public</Option>
                    <Option value="hidden">Hidden</Option>
                  </Select>
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
  );
};

const ManageChannelRecommendations: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<
    ChannelRecommendationItem[]
  >([]);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<ChannelRecommendationItem | null>(null);
  const [approveForm] = Form.useForm();
  const [rejectForm] = Form.useForm();

  // Fetch all channel recommendations
  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await api.getAllChannelRecommendations();
      setRecommendations(response.data);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      message.error("Failed to fetch channel recommendations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  // Handle approve action
  const handleApprove = async (values: {
    channelId: string;
    name: string;
    imageUrl: string;
    visibility: string;
  }) => {
    if (!selectedRecommendation) return;

    try {
      await api.updateChannelRecommendation(selectedRecommendation.id, {
        status: "approved",
        name: values.name,
        link: selectedRecommendation.link,
        language: selectedRecommendation.language,
        imageUrl: values.imageUrl,
        channelId: values.channelId,
        visibility: values.visibility,
      });
      message.success("Channel recommendation approved");
      setApproveModalVisible(false);
      fetchRecommendations();
    } catch (error) {
      console.error("Error approving recommendation:", error);
      message.error("Failed to approve recommendation");
    }
  };

  // Handle reject action
  const handleReject = async (values: { reason: string }) => {
    if (!selectedRecommendation) return;

    try {
      await api.updateChannelRecommendation(selectedRecommendation.id, {
        status: "rejected",
        reason: values.reason,
      });
      message.success("Channel recommendation rejected");
      setRejectModalVisible(false);
      fetchRecommendations();
    } catch (error) {
      console.error("Error rejecting recommendation:", error);
      message.error("Failed to reject recommendation");
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "error";
      default:
        return "warning";
    }
  };

  return (
    <div className="p-4">
      <List
        loading={loading}
        itemLayout="horizontal"
        dataSource={recommendations}
        renderItem={(item) => (
          <List.Item
            actions={
              item.status === "pending"
                ? [
                    <Button
                      key="approve"
                      type="primary"
                      onClick={() => {
                        setSelectedRecommendation(item);
                        approveForm.setFieldsValue({
                          name: item.name,
                          imageUrl: item.imageUrl,
                        });
                        setApproveModalVisible(true);
                      }}
                    >
                      Approve
                    </Button>,
                    <Button
                      key="reject"
                      danger
                      onClick={() => {
                        setSelectedRecommendation(item);
                        setRejectModalVisible(true);
                      }}
                    >
                      Reject
                    </Button>,
                  ]
                : []
            }
          >
            <List.Item.Meta
              avatar={<Avatar src={item.imageUrl} icon={<YoutubeOutlined />} />}
              title={
                <div className="flex items-center gap-2">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {item.name}
                  </a>
                  <Tag color={getStatusColor(item.status)}>
                    {item.status.toUpperCase()}
                  </Tag>
                  <Tag color="blue">{item.language.toUpperCase()}</Tag>
                </div>
              }
              description={
                <div className="text-gray-500">
                  <div>Submitted by: {item.userEmail}</div>
                  <div>
                    Submitted at: {new Date(item.submittedAt).toLocaleString()}
                  </div>
                  {item.status === "rejected" && (
                    <div>Rejected reason: {item.reason}</div>
                  )}
                </div>
              }
            />
          </List.Item>
        )}
      />

      <Modal
        title="Approve Channel Recommendation"
        open={approveModalVisible}
        onCancel={() => setApproveModalVisible(false)}
        footer={null}
        width={600}
        maskClosable={false}
      >
        {selectedRecommendation && (
          <div className="mb-4">
            <div className="text-gray-500 mb-2">Original Information:</div>
            <div className="bg-gray-50 p-4 rounded dark:bg-gray-700">
              <p>
                <strong>Channel Name:</strong> {selectedRecommendation.name}
              </p>
              <p>
                <strong>Channel Link:</strong>{" "}
                <a
                  href={selectedRecommendation.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {selectedRecommendation.link}
                </a>
              </p>
              <p>
                <strong>Language:</strong>{" "}
                {selectedRecommendation.language.toUpperCase()}
              </p>
              <p>
                <strong>Submitted by:</strong>{" "}
                {selectedRecommendation.userEmail}
              </p>
            </div>
          </div>
        )}

        <Form form={approveForm} onFinish={handleApprove} layout="vertical">
          <Form.Item
            name="channelId"
            label="Channel ID"
            rules={[{ required: true, message: "Please input channel ID!" }]}
          >
            <Input placeholder="Enter YouTube channel ID" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Channel Name"
            rules={[{ required: true, message: "Please input channel name!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="imageUrl"
            label="Channel Image URL"
            rules={[{ required: true, message: "Please input image URL!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="visibility"
            label="Channel Visibility"
            rules={[{ required: true, message: "Please select visibility!" }]}
          >
            <Select>
              <Option value="public">Public</Option>
              <Option value="hidden">Hidden</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Confirm Approval
              </Button>
              <Button onClick={() => setApproveModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Reject Channel Recommendation"
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        footer={null}
        width={600}
        maskClosable={false}
      >
        <Form form={rejectForm} onFinish={handleReject} layout="vertical">
          <Form.Item
            name="reason"
            label="Rejected Reason"
            rules={[
              { required: true, message: "Please input rejected reason!" },
            ]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Confirm Rejection
              </Button>
              <Button onClick={() => setRejectModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

const ChannelManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isAddChannelModalVisible, setIsAddChannelModalVisible] =
    useState(false);
  const [editingKey, setEditingKey] = useState<string>("");
  const [
    isChannelRecommendationModalVisible,
    setIsChannelRecommendationModalVisible,
  ] = useState(false);

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async (
    language: string = LANGUAGES.All,
    visibility: string = VISIBILITY_OPTIONS.All
  ) => {
    setIsLoading(true);
    try {
      const response = await api.getChannels(visibility, language);
      // order by videos Count
      const sortedChannels = response.data.sort((a: Channel, b: Channel) => {
        if (a.videos && b.videos) {
          return b.videos.length - a.videos.length;
        } else if (a.videos) {
          return -1;
        } else if (b.videos) {
          return 1;
        }
        return 0;
      });
      setChannels(sortedChannels);
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
      fetchChannels();
      setIsAddChannelModalVisible(false);
    } catch (error) {
      console.error("Error uploading channels:", error);
      message.error("Failed to upload channels");
    } finally {
      setIsLoading(false);
    }
  };

  const isEditing = (record: Channel) => record.id === editingKey;

  const edit = (record: Channel) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.id);
  };

  const cancel = () => {
    setEditingKey("");
  };

  const save = async (key: string) => {
    try {
      const currentValues = await form.validateFields();
      const newData = [...channels];
      const index = newData.findIndex((item) => key === item.id);

      if (index > -1) {
        const originalChannel = channels[index];

        const updatedFields: Partial<Channel> = {};
        (Object.keys(currentValues) as Array<keyof Channel>).forEach(
          (field) => {
            if (currentValues[field] !== originalChannel[field]) {
              updatedFields[field] = currentValues[field];
            }
          }
        );

        if (Object.keys(updatedFields).length === 0) {
          setEditingKey("");
          return;
        }

        await api.updateChannel(key, updatedFields);

        const updatedItem = {
          ...originalChannel,
          ...updatedFields,
        };
        newData.splice(index, 1, updatedItem);
        setChannels(newData);
        setEditingKey("");
        message.success("Channel updated successfully");
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
      message.error("Failed to update channel");
    }
  };

  const updateChannelVisibility = async (
    channelId: string,
    visibility: string
  ) => {
    try {
      await api.updateChannelVisibility(channelId, visibility);
      message.success("Channel visibility updated successfully");
      fetchChannels(); // Refresh the channel list
    } catch (error) {
      console.error("Error updating channel visibility:", error);
      message.error("Failed to update channel visibility");
    }
  };

  const updateChannelLanguage = async (channelId: string, language: string) => {
    try {
      await api.updateChannelLanguage(channelId, language);
      message.success("Channel language updated successfully");
      fetchChannels(); // Refresh the channel list
    } catch (error) {
      console.error("Error updating channel language:", error);
      message.error("Failed to update channel language");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      editable: true,
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
            placeholder="Search Channel Name"
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
      onFilter: (value: any, record: Channel) =>
        record.name?.toString().toLowerCase().includes(value.toLowerCase()) ||
        false,
      render: (text: string, record: Channel) => (
        <span
          className={`channel-name ${
            record.visibility === "hidden" ? "channel-hidden" : ""
          }`}
        >
          {text}
        </span>
      ),
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      editable: true,
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
            placeholder="Search Channel ID"
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
      onFilter: (value: any, record: Channel) =>
        record.id?.toString().toLowerCase().includes(value.toLowerCase()) ||
        false,
      render: (text: string, record: Channel) => (
        <span
          className={`channel-id ${
            record.visibility === "hidden" ? "channel-hidden" : ""
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
      editable: true,
      render: (text: string, record: Channel) => (
        <span
          className={`channel-link ${
            record.visibility === "hidden" ? "channel-hidden" : ""
          }`}
        >
          <a href={text} target="_blank" rel="noopener noreferrer">
            {text}
          </a>
        </span>
      ),
    },
    {
      title: "Image",
      dataIndex: "image_url",
      key: "image",
      editable: true,
      render: (text: string, record: Channel) => (
        <Image
          src={text}
          alt="Channel image"
          width={50}
          height={50}
          className={`channel-image ${
            record.visibility === "hidden" ? "channel-hidden" : ""
          }`}
          style={{
            objectFit: "cover",
            opacity: record.visibility ? 1 : 0.5,
            filter: record.visibility ? "none" : "grayscale(100%)",
          }}
          fallback="data:image/png;base64,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"
        />
      ),
    },
    {
      title: "Videos Count",
      dataIndex: "videos",
      key: "videos",
      render: (videos: string[]) =>
        videos ? <span>{videos.length}</span> : <span>0</span>,
      sorter: (a: Channel, b: Channel) => {
        const aCount = a.videos ? a.videos.length : 0;
        const bCount = b.videos ? b.videos.length : 0;
        return aCount - bCount;
      },
    },
    {
      title: "Visibility",
      dataIndex: "visibility",
      key: "visibility",
      render: (visibility: string, record: Channel) => (
        <Select
          value={visibility}
          style={{ width: 120 }}
          onChange={(value) => updateChannelVisibility(record.id, value)}
          className="channel-visibility-select"
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
      filters: Object.entries(VISIBILITY_OPTIONS)
        .filter(([_, value]) => value !== "all")
        .map(([key, value]) => ({
          text: key,
          value: value,
        })),
      onFilter: (value: any, record: Channel) => record.visibility === value,
    },
    {
      title: "Language",
      dataIndex: "language",
      key: "language",
      render: (language: string, record: Channel) => (
        <Select
          value={language}
          style={{ width: 120 }}
          onChange={(value) => updateChannelLanguage(record.id, value)}
          className="channel-language-select"
        >
          {Object.entries(LANGUAGES)
            .filter(([_, value]) => value !== "all")
            .map(([key, value]) => (
              <Option key={value} value={value} className="language-option">
                {key}
              </Option>
            ))}
        </Select>
      ),
      filters: Object.entries(LANGUAGES)
        .filter(([_, value]) => value !== "all")
        .map(([key, value]) => ({
          text: key,
          value: value,
        })),
      onFilter: (value: any, record: Channel) => record.language === value,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Channel) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Button
              onClick={() => save(record.id)}
              style={{ marginRight: 8 }}
              icon={<SaveOutlined />}
              className="edit-action-button"
            >
              Save
            </Button>
            <Button
              onClick={cancel}
              icon={<CloseOutlined />}
              className="edit-action-button"
            >
              Cancel
            </Button>
          </span>
        ) : (
          <Button
            onClick={() => edit(record)}
            icon={<EditOutlined />}
            className="edit-action-button"
          >
            Edit
          </Button>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: Channel) => ({
        record,
        inputType: col.dataIndex === "image_url" ? "text" : "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <div style={{ padding: "20px" }}>
      <Card
        title={
          <div className="text-xl font-semibold dark:text-white">
            Channel Management | Total: {channels.length}
          </div>
        }
        extra={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="primary"
              onClick={() => setIsAddChannelModalVisible(true)}
              className="add-channel-button"
              style={{ marginLeft: 10 }}
            >
              Add Channel
            </Button>
            <Button
              type="primary"
              onClick={() => fetchChannels()}
              className="refresh-button"
              style={{ marginLeft: 10 }}
            >
              Refresh
            </Button>
            <Button
              type="primary"
              onClick={() => setIsChannelRecommendationModalVisible(true)}
              className="add-channel-button"
              style={{ marginLeft: 10 }}
            >
              Channel Recommendation
            </Button>
          </div>
        }
      >
        <Form form={form} component={false}>
          <Table
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            columns={mergedColumns}
            dataSource={channels}
            rowKey="id"
            loading={isLoading}
            scroll={{ y: 400 }}
          />
        </Form>
      </Card>
      <Modal
        title="Add Channels"
        open={isAddChannelModalVisible}
        onCancel={() => setIsAddChannelModalVisible(false)}
        footer={null}
        width={1000}
        maskClosable={false}
      >
        <AddChannelForm onFinish={onFinish} isLoading={isLoading} form={form} />
      </Modal>
      <Modal
        title="Channel Recommendation"
        open={isChannelRecommendationModalVisible}
        onCancel={() => setIsChannelRecommendationModalVisible(false)}
        footer={null}
        width={600}
        maskClosable={false}
      >
        <ManageChannelRecommendations />
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
  const inputNode = <Input />;

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

export default ChannelManagement;
