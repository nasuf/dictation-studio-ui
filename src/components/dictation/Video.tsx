import React, { useEffect, useRef, useState } from "react";
import { Alert, Input, Row, Col } from "antd";
import YouTube, { YouTubePlayer } from "react-youtube";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

interface TranscriptItem {
  start: number;
  end: number;
  transcript: string;
  userInput?: string; // 新增字段，用于存储用户输入
}

const BlurredText = styled.div<{ isBlurred: boolean }>`
  filter: ${(props) => (props.isBlurred ? "blur(5px)" : "none")};
  transition: filter 0.3s ease;
  font-size: 18px;
  text-align: center;
  margin: 10px 0;
`;

const ScrollingSubtitles = styled.div`
  height: 500px;
  overflow-y: auto;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
`;

const SubtitlesContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100%;
`;

const Video: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const { t } = useTranslation();
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [userInput, setUserInput] = useState("");
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [revealedSentences, setRevealedSentences] = useState<number[]>([]);

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  useEffect(() => {
    fetchTranscript();
  }, [videoId]);

  const fetchTranscript = async () => {
    try {
      const response = await axios.post(
        "http://localhost:4001/api/transcript",
        { url: videoUrl }
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
        saveUserInput();
        revealCurrentSentence();
        playNextSentence();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [transcript, currentSentenceIndex, userInput]);

  const onVideoReady = (event: { target: YouTubePlayer }) => {
    playerRef.current = event.target;
  };

  const playCurrentSentence = () => {
    if (!playerRef.current || transcript.length === 0) return;
    const currentSentence = transcript[currentSentenceIndex];
    playerRef.current.seekTo(currentSentence.start, true);
    playerRef.current.playVideo();

    const duration = (currentSentence.end - currentSentence.start) * 1000;
    setTimeout(() => {
      if (playerRef.current) {
        playerRef.current.pauseVideo();
      }
    }, duration);
  };

  const playNextSentence = () => {
    if (!playerRef.current || transcript.length === 0) return;
    const nextIndex = (currentSentenceIndex + 1) % transcript.length;
    setCurrentSentenceIndex(nextIndex);
    const nextSentence = transcript[nextIndex];
    playerRef.current.seekTo(nextSentence.start, true);
    playerRef.current.playVideo();

    const duration = (nextSentence.end - nextSentence.start) * 1000;
    setTimeout(() => {
      if (playerRef.current) {
        playerRef.current.pauseVideo();
      }
    }, duration);
  };

  const saveUserInput = () => {
    setTranscript((prevTranscript) => {
      const newTranscript = [...prevTranscript];
      newTranscript[currentSentenceIndex] = {
        ...newTranscript[currentSentenceIndex],
        userInput: userInput,
      };
      return newTranscript;
    });
    setUserInput(""); // 清空输入框
  };

  const revealCurrentSentence = () => {
    setRevealedSentences((prev) => [...prev, currentSentenceIndex]);
  };

  return (
    <Row gutter={24}>
      <Col span={12}>
        <YouTube
          videoId={videoId}
          opts={{
            height: "390",
            width: "640",
            playerVars: { autoplay: 0 },
          }}
          onReady={onVideoReady}
        />
        <Input
          style={{ marginTop: "20px", width: "640px" }}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={t("inputPlaceHolder")}
        />
        <Alert
          style={{ marginTop: "10px" }}
          message={t("videoDictationKeyboardInstructions")}
          type="info"
          showIcon
        />
      </Col>
      <Col span={12}>
        <ScrollingSubtitles>
          <SubtitlesContainer>
            {transcript.map((item, index) => (
              <BlurredText
                key={index}
                isBlurred={!revealedSentences.includes(index)}
              >
                <p>{item.transcript}</p>
                {revealedSentences.includes(index) && item.userInput && (
                  <p style={{ color: "green" }}>Your input: {item.userInput}</p>
                )}
              </BlurredText>
            ))}
          </SubtitlesContainer>
        </ScrollingSubtitles>
      </Col>
    </Row>
  );
};

export default Video;
