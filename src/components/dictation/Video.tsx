import { Alert, Input } from "antd";
import React, { useEffect, useRef, useState } from "react";
import YouTube, { YouTubePlayer } from "react-youtube";
import axios from "axios";
import { useParams } from "react-router-dom";

interface TranscriptItem {
  start: number;
  end: number;
  transcript: string;
}

const Video: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const playerRef = useRef<YouTubePlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [userInput, setUserInput] = useState("");
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  useEffect(() => {
    fetchTranscript();
  }, [videoId]);

  const fetchTranscript = async () => {
    try {
      const response = await axios.post(
        "http://localhost:4001/api/transcript",
        {
          url: videoUrl,
        }
      );
      setTranscript(response.data);
    } catch (error) {
      console.error("Error fetching transcript:", error);
    }
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!playerRef.current || transcript.length === 0) return;

      if (event.key === "Tab") {
        event.preventDefault();
        playCurrentSentence();
      } else if (event.key === "Enter") {
        event.preventDefault();
        playNextSentence();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [transcript, currentSentenceIndex]);

  const onVideoReady = (event: { target: YouTubePlayer }) => {
    playerRef.current = event.target;
  };

  const playCurrentSentence = () => {
    if (!playerRef.current || transcript.length === 0) return;
    const currentSentence = transcript[currentSentenceIndex];
    playerRef.current.seekTo(currentSentence.start, true);
    playerRef.current.playVideo();
    setTimeout(() => {
      playerRef.current?.pauseVideo();
    }, (currentSentence.end - currentSentence.start) * 1000);
  };

  const playNextSentence = () => {
    if (!playerRef.current || transcript.length === 0) return;
    const nextIndex = (currentSentenceIndex + 1) % transcript.length;
    setCurrentSentenceIndex(nextIndex);
    const nextSentence = transcript[nextIndex];
    playerRef.current.seekTo(nextSentence.start, true);
    playerRef.current.playVideo();
    setTimeout(() => {
      playerRef.current?.pauseVideo();
    }, (nextSentence.end - nextSentence.start) * 1000);
  };

  return (
    <>
      <div>
        <YouTube
          videoId={videoId}
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
        <Alert
          message="按 Tab 键重复当前句子，按 Enter 键播放下一句子。"
          type="info"
          showIcon
        />
      </p>
    </>
  );
};

export default Video;
