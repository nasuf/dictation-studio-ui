import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, Avatar } from "antd";
import { api } from "../../api/api";

interface Channel {
  id: string;
  name: string;
  image_url: string;
}

const ChannelList: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await api.getChannels();
        setChannels(response.data);
      } catch (error) {
        console.error("Error fetching channels:", error);
      }
    };

    fetchChannels();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {channels.map((channel) => (
          <Link
            key={channel.id}
            to={`/dictation/video/${channel.id}`}
            state={{ name: channel.name }}
          >
            <Card
              hoverable
              style={{ width: 240, textAlign: "center" }}
              cover={
                <Avatar
                  size={200}
                  src={channel.image_url}
                  style={{
                    margin: "20px auto",
                  }}
                />
              }
            >
              <Card.Meta title={channel.name} />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ChannelList;
