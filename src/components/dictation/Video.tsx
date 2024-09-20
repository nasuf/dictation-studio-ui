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
  height: calc(100vh - 64px);
  align-items: center;
  justify-content: center;
`;

const VideoColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 640px;
  max-height: 80vh;
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
  aspect-ratio: 16 / 9;
  background-color: black;
  overflow: hidden;
  position: relative;
`;

const ScrollingSubtitles = styled.div`
  height: calc(80vh - 100px);
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
  margin: 20px 0;
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

const getTextColor = (backgroundColor: string) => {
  const hex = backgroundColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#000000" : "#FFFFFF";
};

const ProgressBarBase = styled.div`
  width: 100%;
  height: 20px;
  background: #f0f0f0;
  margin-bottom: 10px;
  position: relative;
  border-radius: 10px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div<{ width: number; color: string }>`
  width: ${(props) => props.width}%;
  height: 100%;
  background: ${(props) => props.color};
  position: absolute;
  left: 0;
  top: 0;
  transition: width 0.5s ease-in-out;
`;

const ProgressBarText = styled.div<{ color: string }>`
  position: absolute;
  left: 5px;
  top: 2px;
  color: ${(props) => props.color};
  font-size: 12px;
  z-index: 1;
  width: 100%;
  text-align: left;
  padding: 0 5px;
  box-sizing: border-box;
  text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff,
    1px 1px 0 #fff;
`;

const DualProgressBar: React.FC<{
  completionPercentage: number;
  accuracyPercentage: number;
}> = ({ completionPercentage, accuracyPercentage }) => {
  const { t } = useTranslation();
  const completionColor = "#1890ff";
  const accuracyColor = "#52c41a";
  const backgroundColor = "#f0f0f0";

  const textColor =
    completionPercentage > 10
      ? getTextColor(completionColor)
      : getTextColor(backgroundColor);

  return (
    <ProgressBarBase>
      <ProgressBarFill width={completionPercentage} color={completionColor} />
      <ProgressBarFill
        width={accuracyPercentage}
        color={accuracyColor}
        style={{ opacity: 0.7 }}
      />
      <ProgressBarText color={textColor}>
        {`${t("completionRate")}: ${Math.round(completionPercentage)}% ${t(
          "accuracyRate"
        )}: ${Math.round(accuracyPercentage)}%`}
      </ProgressBarText>
    </ProgressBarBase>
  );
};

const Video: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const { t } = useTranslation();
  const playerRef = useRef<YouTubePlayer | null>(null);
  const subtitlesRef = useRef<HTMLDivElement>(null);
  const [userInput, setUserInput] = useState("");
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [revealedSentences, setRevealedSentences] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [overallCompletion, setOverallCompletion] = useState(0);
  const [overallAccuracy, setOverallAccuracy] = useState(0);

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  useEffect(() => {
    fetchTranscript();
  }, [videoId]);

  const fetchTranscript = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:4001/api/transcript",
        { url: videoUrl }
      );
      setTranscript(response.data);
    } catch (error) {
      console.error("Error fetching transcript:", error);
    } finally {
      setIsLoading(false);
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
    setIsVideoReady(true);
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
        return { word, highlight: "lightcoral" };
      }
    });

    const correctWords = transcriptResult.filter(
      (word) => word.highlight === "lightgreen"
    ).length;
    const completionPercentage = (correctWords / transcriptWords.length) * 100;

    return { inputResult, transcriptResult, completionPercentage };
  };

  const updateOverallProgress = () => {
    const totalWords = transcript.reduce(
      (sum, item) => sum + item.transcript.split(/\s+/).length,
      0
    );
    const completedWords = revealedSentences.reduce(
      (sum, index) => sum + transcript[index].transcript.split(/\s+/).length,
      0
    );
    const correctWords = revealedSentences.reduce((sum, index) => {
      const { completionPercentage } = compareInputWithTranscript(
        transcript[index].userInput || "",
        transcript[index].transcript
      );
      return (
        sum +
        (transcript[index].transcript.split(/\s+/).length *
          completionPercentage) /
          100
      );
    }, 0);

    setOverallCompletion((completedWords / totalWords) * 100);
    setOverallAccuracy(
      completedWords > 0 ? (correctWords / completedWords) * 100 : 0
    );
  };

  useEffect(() => {
    updateOverallProgress();
  }, [revealedSentences, transcript]);

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
          <>
            <DualProgressBar
              completionPercentage={overallCompletion}
              accuracyPercentage={overallAccuracy}
            />
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
          </>
        )}
      </SubtitlesColumn>
    </VideoContainer>
  );
};

export default Video;
