import React, { useEffect, useRef, useState } from "react";
import { Alert, Input, Spin } from "antd";
import YouTube, { YouTubePlayer } from "react-youtube";
import axios from "axios";
import { useParams } from "react-router-dom";
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

const ComparisonText = styled.span<{ color: string }>`
  color: ${(props) => props.color};
`;

const HighlightedText = styled.span<{ backgroundColor: string }>`
  background-color: ${(props) => props.backgroundColor};
`;

const ProgressCircle: React.FC<{ percentage: number }> = ({ percentage }) => {
  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <svg width="40" height="40" viewBox="0 0 40 40">
      <circle
        cx="20"
        cy="20"
        r={radius}
        fill="transparent"
        stroke="#e6e6e6"
        strokeWidth="5"
      />
      <circle
        cx="20"
        cy="20"
        r={radius}
        fill="transparent"
        stroke="#52c41a"
        strokeWidth="5"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform="rotate(-90 20 20)"
      />
      <text x="20" y="20" textAnchor="middle" dy=".3em" fontSize="12">
        {`${Math.round(percentage)}%`}
      </text>
    </svg>
  );
};

const SubtitleRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const SubtitleContent = styled.div`
  flex: 1;
  margin-right: 20px;
`;

const ProgressCircleWrapper = styled.div`
  flex-shrink: 0;
  width: 40px;
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
  const [isVideoReady, setIsVideoReady] = useState(false); // 新增视频准备状态

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
    setIsVideoReady(true); // 视频准备就绪
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

  const compareInputWithTranscript = (input: string, transcript: string) => {
    const inputWords = input.toLowerCase().split(/\s+/);
    const transcriptWords = transcript.toLowerCase().split(/\s+/);

    const inputResult = inputWords.map((word) => {
      if (transcriptWords.includes(word)) {
        return { word, color: "green" };
      } else {
        return { word, color: "red" };
      }
    });

    const transcriptResult = transcriptWords.map((word) => {
      if (inputWords.includes(word)) {
        return { word, highlight: "lightgreen" };
      } else {
        return { word, highlight: "lightcoral" }; // 改为红色背景
      }
    });

    const correctWords = transcriptResult.filter(
      (word) => word.highlight === "lightgreen"
    ).length;
    const completionPercentage = (correctWords / transcriptWords.length) * 100;

    return { inputResult, transcriptResult, completionPercentage };
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
        {isLoading || !isVideoReady ? (
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
                  <SubtitleRow>
                    <SubtitleContent>
                      {revealedSentences.includes(index) ? (
                        <>
                          <p>
                            {compareInputWithTranscript(
                              item.userInput || "",
                              item.transcript
                            ).transcriptResult.map((word, wordIndex) => (
                              <HighlightedText
                                key={wordIndex}
                                backgroundColor={word.highlight}
                              >
                                {word.word}{" "}
                              </HighlightedText>
                            ))}
                          </p>
                          {item.userInput && (
                            <p>
                              Your input:{" "}
                              {compareInputWithTranscript(
                                item.userInput,
                                item.transcript
                              ).inputResult.map((word, wordIndex) => (
                                <ComparisonText
                                  key={wordIndex}
                                  color={word.color}
                                >
                                  {word.word}{" "}
                                </ComparisonText>
                              ))}
                            </p>
                          )}
                        </>
                      ) : (
                        <p>{item.transcript}</p>
                      )}
                    </SubtitleContent>
                    {revealedSentences.includes(index) && (
                      <ProgressCircleWrapper>
                        <ProgressCircle
                          percentage={
                            compareInputWithTranscript(
                              item.userInput || "",
                              item.transcript
                            ).completionPercentage
                          }
                        />
                      </ProgressCircleWrapper>
                    )}
                  </SubtitleRow>
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
