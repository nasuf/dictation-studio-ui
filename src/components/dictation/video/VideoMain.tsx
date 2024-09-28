import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Alert, Input, Spin, Button, Space, message } from "antd";
import {
  StepBackwardOutlined,
  StepForwardOutlined,
  RedoOutlined,
} from "@ant-design/icons";
import YouTube, { YouTubePlayer } from "react-youtube";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "@/api/api";
import {
  CenteredContainer,
  ContentWrapper,
  StyledVideoColumn,
  StyledYouTubeWrapper,
  StyledSubtitlesColumn,
  LoadingContainer,
  DualProgressBar,
  ScrollableSubtitles,
  SubtitlesContainer,
  BlurredText,
  SubtitleRow,
  SubtitleContent,
  HighlightedText,
  ComparisonText,
  ProgressCircleWrapper,
  ProgressCircle,
  HideYouTubeControls,
  ButtonContainer,
} from "@/components/dictation/video/Widget";
import { ProgressData, TranscriptItem } from "@/utils/type";
import { useDispatch } from "react-redux";
import { setIsDictationStarted } from "@/redux/userSlice";
export interface VideoMainRef {
  saveProgress: () => Promise<void>;
}

const VideoMain: React.ForwardRefRenderFunction<VideoMainRef, {}> = (
  _,
  ref
) => {
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
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const dispatch = useDispatch();
  const [isFirstEnterAfterRestore, setIsFirstEnterAfterRestore] =
    useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [transcriptResponse, progressResponse] = await Promise.all([
          api.getVideoTranscript(channelId!, videoId!),
          api.getUserProgress(channelId!, videoId!),
        ]);

        setTranscript(transcriptResponse.data.transcript);

        if (progressResponse.data && progressResponse.data.userInput) {
          restoreUserProgress(
            progressResponse.data,
            transcriptResponse.data.transcript
          );
        } else {
          setCurrentSentenceIndex(0);
          dispatch(setIsDictationStarted(false));
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
        if (error.response && error.response.status === 401) {
          setIsUnauthorized(true);
          window.dispatchEvent(new CustomEvent("unauthorized"));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [videoId, channelId, dispatch]);

  const restoreUserProgress = (
    progress: ProgressData,
    transcriptData: TranscriptItem[]
  ) => {
    if (!progress || !progress.userInput || transcriptData.length === 0) return;

    const newTranscript = transcriptData.map((item, index) => ({
      ...item,
      userInput: progress.userInput[index] || "",
    }));
    setTranscript(newTranscript);

    const lastInputIndex = Math.max(
      ...Object.keys(progress.userInput).map(Number)
    );
    setCurrentSentenceIndex(lastInputIndex);

    setRevealedSentences(Object.keys(progress.userInput).map(Number));

    if (playerRef.current && transcriptData[lastInputIndex]) {
      playerRef.current.seekTo(transcriptData[lastInputIndex].start, true);
    }

    updateOverallProgress();

    dispatch(setIsDictationStarted(true));
    setIsFirstEnterAfterRestore(true);

    setTimeout(() => {
      scrollToSentence(lastInputIndex);
    }, 1000);
  };

  const scrollToSentence = (index: number) => {
    if (subtitlesRef.current) {
      const sentenceElements =
        subtitlesRef.current.getElementsByClassName("subtitle-item");
      if (sentenceElements[index]) {
        const sentenceElement = sentenceElements[index] as HTMLElement;
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
        updateOverallProgress();

        if (isFirstEnterAfterRestore) {
          setIsFirstEnterAfterRestore(false);
        }

        // 使用 setTimeout 来确保在 DOM 更新后播放下一句
        setTimeout(() => {
          playNextSentence();
        }, 0);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [transcript, currentSentenceIndex, userInput, isFirstEnterAfterRestore]);

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

    playerRef.current.pauseVideo();
    playerRef.current.seekTo(currentSentence.start, true);

    const playPromise = new Promise<void>((resolve) => {
      const onStateChange = (event: { data: number }) => {
        if (event.data === YouTube.PlayerState.PLAYING) {
          playerRef.current?.removeEventListener(
            "onStateChange",
            onStateChange
          );
          resolve();
        }
      };

      playerRef.current?.addEventListener("onStateChange", onStateChange);
      playerRef.current?.playVideo();
    });

    playPromise.then(() => {
      const duration = (currentSentence.end - currentSentence.start) * 1000;
      const checkInterval = setInterval(() => {
        if (playerRef.current) {
          const currentTime = playerRef.current.getCurrentTime();
          if (currentTime >= currentSentence.end) {
            playerRef.current.pauseVideo();
            clearInterval(checkInterval);
          }
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkInterval);
        if (playerRef.current) {
          playerRef.current.pauseVideo();
        }
      }, duration + 500); // 添加额外的500毫秒作为缓冲
    });
  };

  const playNextSentence = () => {
    if (!playerRef.current || transcript.length === 0) return;
    const nextIndex = (currentSentenceIndex + 1) % transcript.length;
    setCurrentSentenceIndex(nextIndex);
    const nextSentence = transcript[nextIndex];

    playerRef.current.pauseVideo();
    playerRef.current.seekTo(nextSentence.start, true);

    const playPromise = new Promise<void>((resolve) => {
      const onStateChange = (event: { data: number }) => {
        if (event.data === YouTube.PlayerState.PLAYING) {
          playerRef.current?.removeEventListener(
            "onStateChange",
            onStateChange
          );
          resolve();
        }
      };

      playerRef.current?.addEventListener("onStateChange", onStateChange);
      playerRef.current?.playVideo();
    });

    playPromise.then(() => {
      const duration = (nextSentence.end - nextSentence.start) * 1000;
      const checkInterval = setInterval(() => {
        if (playerRef.current) {
          const currentTime = playerRef.current.getCurrentTime();
          if (currentTime >= nextSentence.end) {
            playerRef.current.pauseVideo();
            clearInterval(checkInterval);
          }
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkInterval);
        if (playerRef.current) {
          playerRef.current.pauseVideo();
        }
      }, duration + 500); // 添加额外的500毫秒作为缓冲
    });
  };

  const playPreviousSentence = () => {
    if (!playerRef.current || transcript.length === 0) return;
    const prevIndex =
      (currentSentenceIndex - 1 + transcript.length) % transcript.length;
    setCurrentSentenceIndex(prevIndex);
    const prevSentence = transcript[prevIndex];
    playerRef.current.seekTo(prevSentence.start, true);
    playerRef.current.playVideo();

    const duration = (prevSentence.end - prevSentence.start) * 1000;
    setTimeout(() => {
      if (playerRef.current) {
        playerRef.current.pauseVideo();
      }
    }, duration);
  };

  const saveUserInput = () => {
    if (userInput.trim() !== "") {
      setTranscript((prevTranscript) => {
        const newTranscript = [...prevTranscript];
        newTranscript[currentSentenceIndex] = {
          ...newTranscript[currentSentenceIndex],
          userInput: userInput,
        };
        return newTranscript;
      });
      setRevealedSentences((prev) =>
        prev.includes(currentSentenceIndex)
          ? prev
          : [...prev, currentSentenceIndex]
      );
    }
    setUserInput("");
    dispatch(
      setIsDictationStarted(
        Object.values(transcript).some(
          (item) => item.userInput !== "" && item.userInput !== null
        )
      )
    );
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
        return { word, color: "#00827F", isCorrect: true };
      } else {
        return { word, color: "#C41E3A", isCorrect: false };
      }
    });

    const transcriptResult = originalTranscriptWords.map((word) => {
      const cleanWord = cleanString(word);
      if (inputWords.includes(cleanWord)) {
        return { word, highlight: "#7CEECE", isCorrect: true };
      } else {
        return { word, highlight: "#FFAAA5", isCorrect: false };
      }
    });

    const correctWords = transcriptResult.filter(
      (word) => word.isCorrect
    ).length;
    const completionPercentage = (correctWords / transcriptWords.length) * 100;

    return { inputResult, transcriptResult, completionPercentage };
  };

  const updateOverallProgress = useCallback(() => {
    const totalWords = transcript.reduce(
      (sum, item) => sum + item.transcript.split(/\s+/).length,
      0
    );

    const completedWords = transcript.reduce((sum, item, index) => {
      if (item.userInput && revealedSentences.includes(index)) {
        return sum + item.transcript.split(/\s+/).length;
      }
      return sum;
    }, 0);

    const correctWords = transcript.reduce((sum, item, index) => {
      if (item.userInput && revealedSentences.includes(index)) {
        const { completionPercentage } = compareInputWithTranscript(
          item.userInput,
          item.transcript
        );
        return (
          sum +
          (item.transcript.split(/\s+/).length * completionPercentage) / 100
        );
      }
      return sum;
    }, 0);

    let newOverallCompletion: number;
    if (completedWords === totalWords) {
      newOverallCompletion = 100;
    } else {
      newOverallCompletion = Math.round((completedWords / totalWords) * 100);
    }

    let newOverallAccuracy: number;
    if (completedWords > 0) {
      newOverallAccuracy = Math.round((correctWords / completedWords) * 100);
    } else {
      newOverallAccuracy = 0;
    }

    setOverallCompletion(newOverallCompletion);
    setOverallAccuracy(newOverallAccuracy);
  }, [transcript, revealedSentences]);

  useEffect(() => {
    updateOverallProgress();
  }, [revealedSentences, transcript, updateOverallProgress]);

  const saveProgress = useCallback(async () => {
    const userInputJson: { [key: number]: string } = {};
    transcript.forEach((item, index) => {
      if (item.userInput && item.userInput.trim() !== "") {
        userInputJson[index] = item.userInput.trim();
      }
    });

    const progressData: ProgressData = {
      channelId: channelId!,
      videoId: videoId!,
      userInput: userInputJson,
      currentTime: new Date().getTime(),
      overallCompletion: Number(overallCompletion.toFixed(2)),
    };

    try {
      await api.saveProgress(progressData);
      message.success(t("progressSaved"));
    } catch (error) {
      console.error("Error saving progress:", error);
      message.error(t("progressSaveFailed"));
    }
  }, [channelId, videoId, transcript, overallCompletion, t]);

  useImperativeHandle(ref, () => ({
    saveProgress,
  }));

  if (isUnauthorized) {
    return null;
  }

  return (
    <CenteredContainer>
      <ContentWrapper>
        <StyledVideoColumn>
          <StyledYouTubeWrapper>
            <HideYouTubeControls>
              <YouTube
                videoId={videoId}
                opts={{
                  width: "100%",
                  height: "360",
                  playerVars: {
                    autoplay: 0,
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    controls: 1,
                    disablekb: 1,
                    iv_load_policy: 3,
                    fs: 0,
                  },
                }}
                onReady={onVideoReady}
              />
            </HideYouTubeControls>
          </StyledYouTubeWrapper>
          <ButtonContainer>
            <Space>
              <Button
                icon={<StepBackwardOutlined />}
                onClick={playPreviousSentence}
                disabled={currentSentenceIndex === 0}
              />
              <Button icon={<RedoOutlined />} onClick={playCurrentSentence} />
              <Button
                icon={<StepForwardOutlined />}
                onClick={playNextSentence}
                disabled={currentSentenceIndex === transcript.length - 1}
              />
            </Space>
          </ButtonContainer>
          <Input
            style={{ marginTop: "20px", width: "100%", maxWidth: "640px" }}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={t("inputPlaceHolder")}
          />
          <Alert
            style={{ marginTop: "10px", width: "100%", maxWidth: "640px" }}
            message={t("videoDictationKeyboardInstructions")}
            type="info"
            showIcon
          />
        </StyledVideoColumn>
        <StyledSubtitlesColumn>
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
              <ScrollableSubtitles ref={subtitlesRef}>
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
              </ScrollableSubtitles>
            </>
          )}
        </StyledSubtitlesColumn>
      </ContentWrapper>
    </CenteredContainer>
  );
};

export default forwardRef(VideoMain);
