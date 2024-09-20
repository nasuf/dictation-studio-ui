import React, { useEffect, useRef, useState } from "react";
import { Alert, Input, Row, Col, Spin } from "antd";
import YouTube, { YouTubePlayer } from "react-youtube";
import axios from "axios";
import { useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

interface TranscriptItem {
  start: number;
  end: number;
  transcript: string;
  userInput?: string;
}

const VideoContainer = styled.div`
  display: flex;
  gap: 24px;
  padding: 20px;
  height: calc(100vh - 64px); // 假设头部高度为64px，根据实际情况调整
  align-items: center; // 添加这行来实现垂直居中
  justify-content: center; // 添加这行来实现水平居中
`;

const VideoColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 640px;
  max-height: 80vh; // 添加这行来限制最大高度
`;

const SubtitlesColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 640px;
  max-height: 80vh; // 添加这行来限制最大高度
`;

const YouTubeWrapper = styled.div`
  width: 100%;
  max-width: 640px;
`;

const ScrollingSubtitles = styled.div`
  height: calc(80vh - 100px); // 调整这个值，100px 是为了给其他元素留出空间
  overflow-y: auto;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const BlurredText = styled.div<{ isBlurred: boolean; isCurrent: boolean }>`
  filter: ${(props) => (props.isBlurred ? "blur(5px)" : "none")};
  transition: filter 0.3s ease;
  font-size: 18px;
  text-align: center;
  margin: 10px 0;
  opacity: ${(props) => (props.isCurrent ? 1 : 0.5)};
`;

const LoadingContainer = styled.div`
  height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 10px;
`;

const SubtitlesContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
`;

const Video: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const { t } = useTranslation();
  const playerRef = useRef<YouTubePlayer | null>(null);
  const subtitlesRef = useRef<HTMLDivElement>(null);
  const [userInput, setUserInput] = useState("");
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [revealedSentences, setRevealedSentences] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true); // 新增加载状态

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  useEffect(() => {
    fetchTranscript();
  }, [videoId]);

  const fetchTranscript = async () => {
    setIsLoading(true); // 开始加载
    try {
      const response = await axios.post(
        "http://localhost:4001/api/transcript",
        { url: videoUrl }
      );
      setTranscript(response.data);
    } catch (error) {
      console.error("Error fetching transcript:", error);
    } finally {
      setIsLoading(false); // 加载结束
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

  useEffect(() => {
    scrollToCurrentSentence();
  }, [currentSentenceIndex]);

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
    setUserInput("");
  };

  const revealCurrentSentence = () => {
    setRevealedSentences((prev) => [...prev, currentSentenceIndex]);
  };

  const scrollToCurrentSentence = () => {
    if (subtitlesRef.current) {
      const sentenceElements =
        subtitlesRef.current.getElementsByClassName("subtitle-item");
      if (sentenceElements[currentSentenceIndex]) {
        const sentenceElement = sentenceElements[
          currentSentenceIndex
        ] as HTMLElement;
        const containerHeight = subtitlesRef.current.clientHeight;
        const scrollPosition =
          sentenceElement.offsetTop -
          containerHeight / 2 +
          sentenceElement.clientHeight / 2;
        subtitlesRef.current.scrollTo({
          top: scrollPosition,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <VideoContainer>
      <VideoColumn>
        <YouTubeWrapper>
          <YouTube
            videoId={videoId}
            opts={{
              width: "100%",
              height: "360",
              playerVars: { autoplay: 0 },
            }}
            onReady={onVideoReady}
          />
        </YouTubeWrapper>
        <Input
          style={{ marginTop: "20px", width: "100%" }}
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
      </VideoColumn>
      <SubtitlesColumn>
        {isLoading ? (
          <LoadingContainer>
            <Spin size="large" tip="Loading subtitles..." />
          </LoadingContainer>
        ) : (
          <ScrollingSubtitles ref={subtitlesRef}>
            <SubtitlesContainer>
              {transcript.map((item, index) => (
                <BlurredText
                  key={index}
                  className="subtitle-item"
                  isBlurred={!revealedSentences.includes(index)}
                  isCurrent={index === currentSentenceIndex}
                >
                  <p>{item.transcript}</p>
                  {revealedSentences.includes(index) && item.userInput && (
                    <p style={{ color: "green" }}>
                      Your input: {item.userInput}
                    </p>
                  )}
                </BlurredText>
              ))}
            </SubtitlesContainer>
          </ScrollingSubtitles>
        )}
      </SubtitlesColumn>
    </VideoContainer>
  );
};

export default Video;
