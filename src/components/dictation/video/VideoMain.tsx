import React, { useEffect, useRef, useState } from "react";
import { Alert, Input, Spin } from "antd";
import YouTube, { YouTubePlayer } from "react-youtube";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "@/api/api";
import {
  BlurredText,
  ComparisonText,
  HighlightedText,
  LoadingContainer,
  ProgressCircleWrapper,
  ScrollingSubtitles,
  SubtitleContent,
  SubtitleRow,
  SubtitlesColumn,
  SubtitlesContainer,
  TranscriptItem,
  VideoColumn,
  VideoContainer,
  YouTubeWrapper,
  ProgressCircle,
  DualProgressBar,
} from "@/components/dictation/video/Widget";

export const VideoMain: React.FC = () => {
  const { videoId, channelId } = useParams<{
    videoId: string;
    channelId: string;
  }>();
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

  useEffect(() => {
    fetchTranscript();
  }, [videoId, channelId]);

  const fetchTranscript = async () => {
    setIsLoading(true);
    try {
      const response = await api.getVideoTranscript(channelId!, videoId!);
      setTranscript(response.data.transcript);
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
    const cleanString = (str: string) => {
      return str
        .toLowerCase()
        .replace(/[^\w\s]|_/g, "")
        .replace(/\s+/g, " ")
        .trim();
    };

    const cleanInput = cleanString(input);
    const cleanTranscript = cleanString(transcript);

    const inputWords = cleanInput.split(/\s+/);
    const transcriptWords = cleanTranscript.split(/\s+/);

    const originalInputWords = input.split(/\s+/);
    const originalTranscriptWords = transcript.split(/\s+/);

    const inputResult = originalInputWords.map((word) => {
      const cleanWord = cleanString(word);
      if (transcriptWords.includes(cleanWord)) {
        return { word, color: "green", isCorrect: true };
      } else {
        return { word, color: "red", isCorrect: false };
      }
    });

    const transcriptResult = originalTranscriptWords.map((word) => {
      const cleanWord = cleanString(word);
      if (inputWords.includes(cleanWord)) {
        return { word, highlight: "lightgreen", isCorrect: true };
      } else {
        return { word, highlight: "lightcoral", isCorrect: false };
      }
    });

    const correctWords = transcriptResult.filter(
      (word) => word.isCorrect
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
                                {t("yourInput")}:{" "}
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
