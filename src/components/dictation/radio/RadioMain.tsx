import React, { useState, useEffect } from "react";
import { Card, Button, message } from "antd";
import axios from "axios";

interface Station {
  name: string;
  url: string;
}

const Radio: React.FC<{ style: React.CSSProperties }> = ({ style }) => {
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);

  const initStations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://de1.api.radio-browser.info/json/stations/search",
        {
          params: {
            limit: 1,
            order: "random",
          },
        }
      );
      if (response.data && response.data.length > 0) {
        setStations(response.data);
      }
    } catch (error) {
      console.error("Error fetching radio station:", error);
      message.error("无法加载广播站，请重试");
    } finally {
      setLoading(false);
    }
  };

  const fetchRandomStation = () => {
    if (stations.length > 0) {
      const randomIndex = Math.floor(Math.random() * stations.length);
      setCurrentStation(stations[randomIndex]);
    }
  };

  useEffect(() => {
    initStations();
  }, []);

  return (
    <Card title="FM 随机广播" style={style}>
      {currentStation ? (
        <>
          <h3>{currentStation.name}</h3>
          <audio controls src={currentStation.url}>
            Your browser does not support the audio element.
          </audio>
        </>
      ) : (
        <p>{loading ? "加载中..." : "无法加载广播站"}</p>
      )}
      <Button
        onClick={fetchRandomStation}
        style={{ marginTop: 16 }}
        loading={loading}
      >
        换台
      </Button>
    </Card>
  );
};

export default Radio;
