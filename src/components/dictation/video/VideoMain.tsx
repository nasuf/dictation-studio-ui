import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
} from "react";
import { Spin, message, Modal } from "antd";
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
  ProgressCircle,
  DualProgressBar,
} from "@/components/dictation/video/Widget";
import { ProgressData, TranscriptItem } from "@/utils/type";
import { useDispatch } from "react-redux";
import { setIsDictationStarted } from "@/redux/userSlice";
import nlp from "compromise";

interface VideoMainProps {
  onComplete: () => void;
}

export interface VideoMainRef {
  saveProgress: () => Promise<void>;
  getMissedWords: () => string[];
  removeMissedWord: (word: string) => void;
}

const VideoMain: React.ForwardRefRenderFunction<
  VideoMainRef,
  VideoMainProps
> = ({ onComplete }, ref) => {
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
  const [isCompleted, setIsCompleted] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [missedWords, setMissedWords] = useState<string[]>([]);
  const [currentInterval, setCurrentInterval] = useState<NodeJS.Timeout | null>(
    null
  );

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

  useEffect(() => {
    populateMissedWords();
  }, [transcript]);

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
    setCurrentSentenceIndex(lastInputIndex + 1);

    setRevealedSentences(Object.keys(progress.userInput).map(Number));

    if (playerRef.current && transcriptData[lastInputIndex]) {
      playerRef.current.seekTo(transcriptData[lastInputIndex].start, true);
    }

    updateOverallProgress();

    dispatch(setIsDictationStarted(true));
    setIsFirstEnterAfterRestore(true);

    setTimeout(() => {
      scrollToCurrentSentence();
    }, 1000);

    if (progress.overallCompletion === 100) {
      populateMissedWords();
      setIsCompleted(true);
      onComplete();
      if (isInitialLoad) {
        Modal.confirm({
          title: t("dictationCompleted"),
          content: t("startOverOrNot"),
          onOk() {
            setTranscript(
              transcriptData.map((item) => ({ ...item, userInput: "" }))
            );
            setRevealedSentences([]);
            setCurrentSentenceIndex(0);
            setOverallCompletion(0);
            setOverallAccuracy(0);
            setIsCompleted(false);
          },
          onCancel() {},
        });
      }
    }
    setIsInitialLoad(false);
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

        requestAnimationFrame(() => {
          playNextSentence();
        });
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [transcript, userInput, currentSentenceIndex, isFirstEnterAfterRestore]);

  const handleUserInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const scrollToCurrentSentence = useCallback(() => {
    if (subtitlesRef.current) {
      const sentenceElements =
        subtitlesRef.current.getElementsByClassName("subtitle-item");
      if (sentenceElements[currentSentenceIndex]) {
        const sentenceElement = sentenceElements[
          currentSentenceIndex
        ] as HTMLElement;
        const containerRect = subtitlesRef.current.getBoundingClientRect();
        const sentenceRect = sentenceElement.getBoundingClientRect();

        const scrollPosition =
          sentenceRect.top +
          subtitlesRef.current.scrollTop -
          containerRect.top -
          containerRect.height / 2 +
          sentenceRect.height / 2;

        subtitlesRef.current.scrollTo({
          top: Math.max(0, scrollPosition),
          behavior: "smooth",
        });
      }
    }
  }, [currentSentenceIndex]);

  useLayoutEffect(() => {
    const timer = setTimeout(() => {
      scrollToCurrentSentence();
    }, 0);
    return () => clearTimeout(timer);
  }, [currentSentenceIndex, scrollToCurrentSentence]);

  const onVideoReady = (event: { target: YouTubePlayer }) => {
    playerRef.current = event.target;
    setIsVideoReady(true);
  };

  const clearIntervalIfExists = () => {
    if (currentInterval) {
      console.log("Clearing interval");
      clearInterval(currentInterval);
      setCurrentInterval(null);
    }
  };

  const playSentence = (sentence: TranscriptItem) => {
    console.log(`Playing sentence: ${sentence.transcript}`);
    clearIntervalIfExists();
    playerRef.current.pauseVideo();
    playerRef.current.seekTo(sentence.start, true);

    const playPromise = new Promise<void>((resolve) => {
      const onStateChange = (event: { data: number }) => {
        console.log("Video event:", event.data);
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
      console.log("Ready to play video");
    });

    playPromise.then(() => {
      console.log("Video started playing");
      const duration = (sentence.end - sentence.start) * 1000;
      const startTime = Date.now();
      let hasEnded = false;

      const checkInterval = setInterval(() => {
        if (playerRef.current && !hasEnded) {
          const currentTime = playerRef.current.getCurrentTime();
          const elapsedTime = Date.now() - startTime;
          console.log(
            `Current time: ${currentTime}, Elapsed time: ${elapsedTime}, End time: ${sentence.end}`
          );

          if (currentTime >= sentence.end - 0.1 || elapsedTime >= duration) {
            console.log("Sentence finished, pausing video");
            playerRef.current.pauseVideo();
            clearInterval(checkInterval);
            setCurrentInterval(null);
            hasEnded = true;
          }
        }
      }, 50);

      setCurrentInterval(checkInterval);

      // 添加一个额外的安全检查，以确保在句子结束时停止播放
      setTimeout(() => {
        if (!hasEnded) {
          console.log("Safety check: pausing video");
          playerRef.current?.pauseVideo();
          clearInterval(checkInterval);
          setCurrentInterval(null);
          hasEnded = true;
        }
      }, duration + 500); // 给予额外的500毫秒作为缓冲
    });
  };

  const playCurrentSentence = () => {
    if (!playerRef.current || transcript.length === 0) return;
    clearIntervalIfExists();
    const currentSentence = transcript[currentSentenceIndex];
    playSentence(currentSentence);
  };

  const playNextSentence = () => {
    if (!playerRef.current || transcript.length === 0) return;
    clearIntervalIfExists();
    const nextIndex = (currentSentenceIndex + 1) % transcript.length;
    setCurrentSentenceIndex(nextIndex);
    const nextSentence = transcript[nextIndex];
    console.log("going to play next sentence: " + nextSentence);
    playerRef.current.pauseVideo();
    setTimeout(() => {
      playSentence(nextSentence);
    }, 100);
  };

  const playPreviousSentence = () => {
    if (!playerRef.current || transcript.length === 0) return;
    clearIntervalIfExists();
    const prevIndex =
      (currentSentenceIndex - 1 + transcript.length) % transcript.length;
    setCurrentSentenceIndex(prevIndex);
    const prevSentence = transcript[prevIndex];
    playSentence(prevSentence);
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

  const populateMissedWords = () => {
    const removePunctuation = (word: string) => {
      return word.replace(/^[^\w\s]+|[^\w\s]+$/g, "");
    };

    const normalizeWord = (word: string) => {
      word = word.replace(/['']s$/, "");

      const doc = nlp(word);
      let normalized = word;

      if (doc.nouns().length > 0) {
        normalized = doc.nouns().toSingular().text();
      }

      if (doc.verbs().length > 0) {
        normalized = doc.verbs().toInfinitive().text();
      }

      return normalized.toLowerCase();
    };

    const missedWords = transcript.flatMap((item, index) => {
      if (item.userInput && revealedSentences.includes(index)) {
        const { transcriptResult } = compareInputWithTranscript(
          item.userInput,
          item.transcript
        );
        return transcriptResult
          .filter((word) => !word.isCorrect)
          .map((word) => removePunctuation(word.word))
          .map(normalizeWord)
          .filter((word) => word.length > 0);
      }
      return [];
    });
    setMissedWords([...new Set(missedWords)]);
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

    if (newOverallCompletion === 100 && !isCompleted && !isInitialLoad) {
      populateMissedWords();
      setIsCompleted(true);
      onComplete();
      Modal.success({
        title: t("dictationCompletedCongratulations"),
        content: t("dictationCompletedCongratulationsContent"),
      });
    }
  }, [
    transcript,
    revealedSentences,
    isCompleted,
    isInitialLoad,
    t,
    onComplete,
  ]);

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
      message.error(t("progressSaveFailed"));
    }
  }, [channelId, videoId, transcript, overallCompletion, t]);

  const removeMissedWord = (word: string) => {
    setMissedWords((prev) => prev.filter((w) => w !== word));
  };

  useImperativeHandle(ref, () => ({
    saveProgress,
    getMissedWords: () => missedWords,
    removeMissedWord,
  }));

  if (isUnauthorized) {
    return null;
  }

  return (
    <div className="flex justify-center items-start h-full w-full p-5">
      <div className="flex justify-between w-full max-w-7xl h-full">
        <div className="flex-1 flex flex-col items-center pr-5 max-w-2xl">
          <div className="w-full max-w-xl mb-4">
            <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full z-10" />
              <YouTube
                videoId={videoId}
                opts={{
                  width: "100%",
                  height: "100%",
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
                className="absolute top-0 left-0 w-full h-full"
              />
            </div>
          </div>
          <div className="w-full max-w-xl space-y-4">
            <div className="flex justify-center space-x-4">
              <button
                onClick={playPreviousSentence}
                disabled={currentSentenceIndex === 0}
                className="p-3 w-12 h-12 rounded-full bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:disabled:bg-gray-800 dark:text-gray-300 transition duration-300 ease-in-out shadow-md flex items-center justify-center"
              >
                <StepBackwardOutlined className="text-lg" />
              </button>
              <button
                onClick={playCurrentSentence}
                className="p-3 w-12 h-12 rounded-full bg-gray-300 hover:bg-gray-400 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 transition duration-300 ease-in-out shadow-md flex items-center justify-center"
              >
                <RedoOutlined className="text-lg" />
              </button>
              <button
                onClick={playNextSentence}
                disabled={currentSentenceIndex === transcript.length - 1}
                className="p-3 w-12 h-12 rounded-full bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:disabled:bg-gray-800 dark:text-gray-300 transition duration-300 ease-in-out shadow-md flex items-center justify-center"
              >
                <StepForwardOutlined className="text-lg" />
              </button>
            </div>
            <input
              value={userInput}
              onChange={handleUserInput}
              placeholder={t("inputPlaceHolder")}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-600 dark:focus:border-blue-600 transition duration-300 ease-in-out"
            />
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 dark:bg-blue-900 dark:border-blue-400 dark:text-blue-200 rounded-md">
              <p className="font-bold">
                {t("videoDictationKeyboardInstructions")}
              </p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col h-full max-w-2xl">
          {isLoading || !isVideoReady ? (
            <div className="flex justify-center items-center h-full bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
              <Spin size="large" tip="Loading subtitles..." />
            </div>
          ) : (
            <>
              <DualProgressBar
                completionPercentage={overallCompletion}
                accuracyPercentage={overallAccuracy}
                isCompleted={isCompleted}
              />
              <div
                ref={subtitlesRef}
                className="flex-1 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mt-4 custom-scrollbar"
              >
                {transcript.map((item, index) => (
                  <div
                    key={index}
                    className={`mb-6 subtitle-item ${
                      !revealedSentences.includes(index)
                        ? "filter blur-sm opacity-50"
                        : ""
                    } ${
                      index === currentSentenceIndex - 1
                        ? "bg-gray-100 dark:bg-gray-700 rounded-lg"
                        : ""
                    }`}
                  >
                    <div className="flex justify-between items-start p-2">
                      <div className="flex-1 mr-4">
                        {revealedSentences.includes(index) ? (
                          <>
                            <p className="text-gray-800 dark:text-gray-200 mb-2">
                              {compareInputWithTranscript(
                                item.userInput || "",
                                item.transcript
                              ).transcriptResult.map((word, wordIndex) => (
                                <span
                                  key={wordIndex}
                                  className={`${
                                    word.highlight === "#7CEECE"
                                      ? "bg-green-200 dark:bg-green-700"
                                      : "bg-red-200 dark:bg-red-700"
                                  } px-1 py-0.5 rounded`}
                                >
                                  {word.word}{" "}
                                </span>
                              ))}
                            </p>
                            {item.userInput && (
                              <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {t("yourInput")}:{" "}
                                {compareInputWithTranscript(
                                  item.userInput,
                                  item.transcript
                                ).inputResult.map((word, wordIndex) => (
                                  <span
                                    key={wordIndex}
                                    className={
                                      word.isCorrect
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-red-600 dark:text-red-400"
                                    }
                                  >
                                    {word.word}{" "}
                                  </span>
                                ))}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-gray-800 dark:text-gray-200">
                            {item.transcript}
                          </p>
                        )}
                      </div>
                      {revealedSentences.includes(index) && (
                        <div className="flex-shrink-0">
                          <ProgressCircle
                            percentage={
                              compareInputWithTranscript(
                                item.userInput || "",
                                item.transcript
                              ).completionPercentage
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default forwardRef(VideoMain);
