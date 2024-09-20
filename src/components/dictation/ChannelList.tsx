import React from "react";
import { Link } from "react-router-dom";
import { Card, Avatar } from "antd";

const channels = [
  {
    id: "bbc_ideas",
    name: "BBC Ideas",
    icon: "https://yt3.googleusercontent.com/c2koPSeUB_VQtn1CcB739_CWhf002oMYCuPAHzRKUrQPJoVmAzE_dyMhtiVWDxmOpjFw770yy6c=s160-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "ted",
    name: "TED",
    icon: "https://yt3.googleusercontent.com/ytc/AIdro_l_fFETDQgTAl5rWb38pxJww-4kszJH_n0G4fKP1BdK-jc=s160-c-k-c0x00ffffff-no-rj",
  },
];

const ChannelList: React.FC = () => {
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
                  src={channel.icon}
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
