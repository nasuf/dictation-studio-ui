import { Input } from "antd";
import React, { useEffect, useRef, useState } from "react";
import YouTube, { YouTubePlayer } from "react-youtube";

const Video: React.FC<{ style: React.CSSProperties }> = ({ style }) => {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [userInput, setUserInput] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!playerRef.current) return;

      if (event.key === "Tab") {
        event.preventDefault(); // 防止 Tab 键的默认行为
        if (isPlaying) {
          playerRef.current.pauseVideo();
          setIsPlaying(false);
        } else {
          playerRef.current.playVideo();
          setIsPlaying(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isPlaying]);

  const onVideoReady = (event: { target: YouTubePlayer }) => {
    playerRef.current = event.target;
  };
  return (
    <>
      <div style={style}>
        <YouTube
          videoId="7lOJxI-3oqQ" // 替换为你想要的视频ID
          opts={{
            height: "390",
            width: "640",
            playerVars: {
              autoplay: 0,
            },
          }}
          onReady={onVideoReady}
        />
      </div>
      <Input
        style={{ marginTop: "20px", width: "640px" }}
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="输入你听到的内容"
      />
      <p style={{ marginTop: "10px" }}>
        按 Tab 键开始/暂停视频。在句子结束时暂停，然后输入你听到的内容。
      </p>
    </>
  );
};

export default Video;
