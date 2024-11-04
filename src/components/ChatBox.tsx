// src/components/feedback/ChatBox.tsx
import React, { useState, useRef, useEffect } from "react";
import { Input, Upload, Avatar } from "antd";
import {
  SendOutlined,
  PictureOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useTranslation } from "react-i18next";
import { Message } from "@/utils/type";

const ChatBox: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const userInfo = useSelector((state: RootState) => state.user.userInfo);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      type: "text",
      sender: "user",
      timestamp: Date.now(),
    };

    setMessages([...messages, newMessage]);
    setInputValue("");
  };

  const handleImageUpload = (info: any) => {
    if (info.file.status === "done") {
      const newMessage: Message = {
        id: Date.now().toString(),
        content: info.file.response.url,
        type: "image",
        sender: "user",
        timestamp: Date.now(),
      };
      setMessages([...messages, newMessage]);
    }
  };

  return (
    <>
      <motion.button
        className="chat-trigger-button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <SendOutlined />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chat-box"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
          >
            <div className="chat-header">
              <h3>{t("feedback")}</h3>
              <CloseOutlined onClick={() => setIsOpen(false)} />
            </div>

            <div className="chat-messages">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${
                    message.sender === "user" ? "message-user" : "message-admin"
                  }`}
                >
                  <Avatar
                    src={
                      message.sender === "user"
                        ? userInfo?.avatar
                        : "/admin-avatar.png"
                    }
                    className="message-avatar"
                  />
                  <div className="message-content">
                    {message.type === "text" ? (
                      <p>{message.content}</p>
                    ) : (
                      <img src={message.content} alt="uploaded" />
                    )}
                    <span className="message-time">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onPressEnter={handleSend}
                placeholder={t("typeMessage")}
              />
              <Upload
                name="image"
                action="/api/upload"
                showUploadList={false}
                onChange={handleImageUpload}
              >
                <button className="upload-button">
                  <PictureOutlined />
                </button>
              </Upload>
              <button
                className="send-button"
                onClick={handleSend}
                disabled={!inputValue.trim()}
              >
                <SendOutlined />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBox;
