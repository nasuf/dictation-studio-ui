import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
} from "react";
import { message, Modal, Popover, Button, Tag, Spin } from "antd";
import {
  StepBackwardOutlined,
  StepForwardOutlined,
  RedoOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import YouTube, { YouTubePlayer } from "react-youtube";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "@/api/api";
import {
  ProgressCircle,
  DualProgressBar,
} from "@/components/dictation/video/Widget";
import {
  DictationConfig,
  ProgressData,
  ShortcutKeys,
  TranscriptItem,
} from "@/utils/type";
import { useDispatch, useSelector } from "react-redux";
import {
  increaseRepeatCount,
  resetRepeatCount,
  setDictationAutoRepeat,
  setDictationPlaybackSpeed,
  setDictationShortcutKeys,
  setIsDictationStarted,
  setIsSavingProgress,
} from "@/redux/userSlice";
import Timer from "./Timer";
import { RootState } from "@/redux/store";
import { store } from "@/redux/store";
import Settings from "./Settings";
import {
  cleanString,
  splitWords,
  calculateSimilarity,
  normalizeWord,
  detectLanguage,
} from "@/utils/languageUtils";

interface VideoMainProps {
  onComplete: () => void;
}

export interface VideoMainRef {
  saveProgress: () => Promise<void>;
  getMissedWords: () => string[];
  removeMissedWord: (word: string) => void;
  resetProgress: (transcriptData?: TranscriptItem[]) => void;
}

// Add new interface for video dictation quota
interface QuotaResponse {
  used: number;
  limit: number;
  canProceed: boolean;
  startDate?: string;
  endDate?: string;
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
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(true);
  const [videoTitle, setVideoTitle] = useState("");
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [revealedSentences, setRevealedSentences] = useState<number[]>([]);
  const [overallCompletion, setOverallCompletion] = useState(0);
  const [overallAccuracy, setOverallAccuracy] = useState(0);
  const dispatch = useDispatch();
  const [isFirstEnterAfterRestore, setIsFirstEnterAfterRestore] =
    useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [missedWords, setMissedWords] = useState<string[]>([]);
  const [currentInterval, setCurrentInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const [isUserTyping, setIsUserTyping] = useState(false);
  const userTypingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [settingShortcut, setSettingShortcut] = useState<string | null>(null);
  const [configChanged, setConfigChanged] = useState(false);
  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const [isSavingDictationConfig, setIsSavingDictationConfig] = useState(false);
  // settings
  const autoRepeat = useSelector(
    (state: RootState) => state.user.userInfo?.dictation_config.auto_repeat || 0
  );
  const playbackSpeed = useSelector(
    (state: RootState) =>
      state.user.userInfo?.dictation_config.playback_speed || 1
  );
  const shortcuts: ShortcutKeys = useSelector(
    (state: RootState) =>
      state.user.userInfo?.dictation_config.shortcuts || {
        repeat: "Tab",
        prev: "Shift",
        next: "Enter",
      }
  );
  const [lastSaveTime, setLastSaveTime] = useState<number>(Date.now());
  const [isImeComposing, setIsImeComposing] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState<QuotaResponse | null>(null);
  const [isCheckingQuota, setIsCheckingQuota] = useState(true);
  const [hasRegisteredVideo, setHasRegisteredVideo] = useState(false);

  // 更新播放器选项
  const youtubeOpts = {
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
      cc_load_policy: 3,
      hl: "en",
      cc_lang_pref: "en",
      // 强制不显示字幕
      cc: 0,
    },
  };

  // Check user's dictation quota
  const checkQuota = async () => {
    try {
      const quotaResponse = await api.checkDictationQuota(channelId!, videoId!);
      if (quotaResponse.data) {
        setQuotaInfo(quotaResponse.data);
        return quotaResponse.data;
      }
      return null;
    } catch (error) {
      console.error("Error checking quota:", error);
      return null;
    }
  };

  // If user cannot proceed (exceeded quota), show prompt and don't load content
  const handleQuotaExceeded = (quotaData: QuotaResponse) => {
    Modal.info({
      title: t("dictationQuotaExceeded"),
      content: (
        <div>
          <p>{t("basicPlanLimitMessage")}</p>
          <p>
            {t("usedQuota", {
              used: quotaData.used,
              limit: quotaData.limit,
              startDate: quotaData.startDate
                ? new Date(quotaData.startDate).toLocaleDateString()
                : "",
              endDate: quotaData.endDate
                ? new Date(quotaData.endDate).toLocaleDateString()
                : "",
            })}
          </p>
          <Button
            type="primary"
            onClick={() => (window.location.href = "/profile/upgrade-plan")}
            style={{ marginTop: 16 }}
          >
            {t("upgradePlan")}
          </Button>
        </div>
      ),
      okText: t("iKnow"),
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingTranscript(true);
      setIsCheckingQuota(true);

      try {
        // If user can proceed, load data normally
        const quotaData = await checkQuota();
        if (quotaData && !quotaData.canProceed) {
          handleQuotaExceeded(quotaData);
          // We still load progress to let user see what they've done before
        }

        const [transcriptResponse, progressResponse] = await Promise.all([
          api.getVideoTranscript(channelId!, videoId!),
          api.getUserProgress(channelId!, videoId!),
        ]);

        setTranscript(transcriptResponse.data.transcript);
        setVideoTitle(transcriptResponse.data.title);

        if (
          progressResponse.data &&
          progressResponse.data.userInput &&
          Object.keys(progressResponse.data.userInput).length > 0
        ) {
          // Already has progress, already counted in quota
          setHasRegisteredVideo(true);
          restoreUserProgress(
            progressResponse.data,
            transcriptResponse.data.transcript
          );
        } else {
          // New video, not yet counted in quota
          setCurrentSentenceIndex(0);
          dispatch(setIsDictationStarted(false));
        }
      } catch (error) {
        // Even if quota check fails, we allow proceeding to avoid blocking main functionality
        console.error("Error fetching progress:", error);
      } finally {
        setIsLoadingTranscript(false);
        setIsCheckingQuota(false);
      }
    };

    const loadDictationConfig = async () => {
      const dictationConfig = userInfo?.dictation_config;
      if (dictationConfig) {
        dispatch(setDictationAutoRepeat(dictationConfig.auto_repeat));
        dispatch(setDictationPlaybackSpeed(dictationConfig.playback_speed));
        dispatch(
          setDictationShortcutKeys({
            repeat: dictationConfig.shortcuts.repeat,
            prev: dictationConfig.shortcuts.prev,
            next: dictationConfig.shortcuts.next,
          })
        );
      }
    };

    fetchData();
    loadDictationConfig();
  }, [videoId, channelId]);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setPlaybackRate(playbackSpeed);
    }
  }, [playbackSpeed]);

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
    setCurrentSentenceIndex(lastInputIndex);

    setRevealedSentences(Object.keys(progress.userInput).map(Number));

    if (playerRef.current && transcriptData[lastInputIndex]) {
      playerRef.current.seekTo(transcriptData[lastInputIndex].start, true);
    }

    setIsFirstEnterAfterRestore(true);
    updateOverallProgress();

    dispatch(setIsDictationStarted(true));

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
            resetProgress(transcriptData);
          },
          onCancel() {},
        });
      }
    }
    setIsInitialLoad(false);
    playerRef.current?.pauseVideo();
  };

  const resetProgress = (transcriptData?: TranscriptItem[]) => {
    if (transcriptData) {
      setTranscript(transcriptData.map((item) => ({ ...item, userInput: "" })));
    } else {
      setTranscript(transcript.map((item) => ({ ...item, userInput: "" })));
    }
    setRevealedSentences([]);
    setCurrentSentenceIndex(0);
    setOverallCompletion(0);
    setOverallAccuracy(0);
    setIsCompleted(false);
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
    }, 1000);
    return () => clearTimeout(timer);
  }, [currentSentenceIndex, scrollToCurrentSentence]);

  const onVideoReady = (event: { target: YouTubePlayer }) => {
    playerRef.current = event.target;
    playerRef.current.setPlaybackRate(playbackSpeed);

    // 强制关闭字幕
    try {
      // 方法1: 通过API禁用字幕轨道
      const tracks = playerRef.current.getOption("captions", "tracklist") || [];
      if (tracks.length > 0) {
        playerRef.current.unloadModule("captions");
      }

      // 方法2: 设置字幕可见性为隐藏
      playerRef.current.setOption("captions", "track", {});
    } catch (e) {
      console.log("Error disabling captions:", e);
    }
  };

  const clearIntervalIfExists = () => {
    if (currentInterval) {
      clearInterval(currentInterval);
      setCurrentInterval(null);
    }
  };

  const stopTimer = useCallback(() => {
    if (isTimerRunning) {
      setIsTimerRunning(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  }, [isTimerRunning]);

  const startTimer = useCallback(() => {
    if (!isTimerRunning) {
      setIsTimerRunning(true);
      setLastSaveTime(Date.now());
      timerIntervalRef.current = setInterval(() => {
        setTotalTime((prev) => prev + 1);
      }, 1000);
    }
  }, [isTimerRunning]);

  const stopCurrentSentence = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.pauseVideo();
    }
    clearIntervalIfExists();
  }, [clearIntervalIfExists]);

  const playSentence = useCallback(
    (sentence: TranscriptItem, onComplete?: () => void) => {
      clearIntervalIfExists();
      playerRef.current.pauseVideo();
      playerRef.current.seekTo(sentence.start, true);

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
        const duration = playbackSpeed * (sentence.end - sentence.start) * 1000;
        const startTime = Date.now();
        let hasEnded = false;

        const checkInterval = setInterval(() => {
          if (playerRef.current && !hasEnded) {
            const currentTime = playerRef.current.getCurrentTime();
            const elapsedTime = Date.now() - startTime;
            if (currentTime >= sentence.end - 0.1 || elapsedTime >= duration) {
              playerRef.current.pauseVideo();
              clearInterval(checkInterval);
              setCurrentInterval(null);
              hasEnded = true;
              if (onComplete) {
                onComplete();
              }
            }
          }
        }, 50);

        setCurrentInterval(checkInterval);
      });
    },
    [clearIntervalIfExists]
  );

  const playCurrentSentence = useCallback(() => {
    if (!playerRef.current || transcript.length === 0) return;
    clearIntervalIfExists();
    const currentSentence = transcript[currentSentenceIndex];
    if (autoRepeat > 0) {
      repeatSentence(currentSentence);
    } else {
      playSentence(currentSentence);
    }
    lastActivityRef.current = Date.now();
  }, [clearIntervalIfExists, currentSentenceIndex, playSentence, transcript]);

  const playNextSentence = useCallback(() => {
    if (!playerRef.current || transcript.length === 0) return;
    clearIntervalIfExists();
    const nextIndex = (currentSentenceIndex + 1) % transcript.length;
    if (nextIndex === 0) {
      setIsCompleted(true);
      onComplete();
    } else {
      setCurrentSentenceIndex(nextIndex);
      const nextSentence = transcript[nextIndex];
      if (autoRepeat > 0) {
        repeatSentence(nextSentence);
      } else {
        playSentence(nextSentence);
      }
      lastActivityRef.current = Date.now();
    }
  }, [transcript, currentSentenceIndex, clearIntervalIfExists, playSentence]);

  const playPreviousSentence = useCallback(() => {
    if (!playerRef.current || transcript.length === 0) return;
    if (currentSentenceIndex === 0) return;

    clearIntervalIfExists();
    const prevIndex = currentSentenceIndex - 1;
    setCurrentSentenceIndex(prevIndex);
    const prevSentence = transcript[prevIndex];
    if (autoRepeat > 0) {
      repeatSentence(prevSentence);
    } else {
      playSentence(prevSentence);
    }
    lastActivityRef.current = Date.now();
  }, [transcript, currentSentenceIndex, clearIntervalIfExists, playSentence]);

  const repeatSentence = useCallback(
    (transcriptItem: TranscriptItem) => {
      dispatch(resetRepeatCount());
      const repeat = () => {
        const currentRepeatCount = (store.getState() as RootState).user
          .repeatCount;
        if (currentRepeatCount <= autoRepeat) {
          playSentence(transcriptItem, () => {
            dispatch(increaseRepeatCount());
            setTimeout(() => {
              repeat();
            }, 1000);
          });
        }
      };
      repeat();
    },
    [autoRepeat, playSentence]
  );

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
    lastActivityRef.current = Date.now();
  };

  const revealCurrentSentence = () => {
    setRevealedSentences((prev) => [...prev, currentSentenceIndex]);
  };

  const compareInputWithTranscript = (input: string, transcript: string) => {
    const language = detectLanguage(transcript);

    const cleanedInput = cleanString(input, language);
    const cleanedTranscript = cleanString(transcript, language);

    const inputWords = splitWords(cleanedInput, language);
    const transcriptWords = splitWords(cleanedTranscript, language);
    const originalTranscriptWords = splitWords(transcript, language);

    const usedIndices = new Set<number>();

    const inputResult = inputWords.map((word) => {
      if (["zh", "ja", "ko"].includes(language)) {
        const similarityThreshold = word.length === 1 ? 0.6 : 0.8;

        let bestMatchIndex = -1;
        let bestMatchScore = 0;

        transcriptWords.forEach((transcriptWord, i) => {
          if (!usedIndices.has(i)) {
            const similarity = calculateSimilarity(word, transcriptWord);
            if (
              similarity > similarityThreshold &&
              similarity > bestMatchScore
            ) {
              bestMatchIndex = i;
              bestMatchScore = similarity;
            }
          }
        });

        if (bestMatchIndex !== -1) {
          usedIndices.add(bestMatchIndex);
          return {
            word: originalTranscriptWords[bestMatchIndex],
            color: "#00827F",
            isCorrect: true,
            similarity: bestMatchScore,
          };
        }

        return {
          word,
          color: "#C41E3A",
          isCorrect: false,
          similarity: 0,
        };
      } else {
        const index = transcriptWords.findIndex(
          (w, i) => w === word && !usedIndices.has(i)
        );

        if (index !== -1) {
          usedIndices.add(index);
          return {
            word: originalTranscriptWords[index],
            color: "#00827F",
            isCorrect: true,
          };
        }

        return {
          word,
          color: "#C41E3A",
          isCorrect: false,
        };
      }
    });

    const transcriptResult = originalTranscriptWords.map((word, index) => {
      return {
        word,
        highlight: usedIndices.has(index) ? "#7CEECE" : "#FFAAA5",
        isCorrect: usedIndices.has(index),
      };
    });

    const correctWords = inputResult.filter((word) => word.isCorrect).length;
    const completionPercentage = (correctWords / transcriptWords.length) * 100;

    return { inputResult, transcriptResult, completionPercentage };
  };

  const populateMissedWords = () => {
    const removePunctuation = (word: string) => {
      const language = detectLanguage(word);
      return cleanString(word, language);
    };

    const normalizeWordWithLanguage = (word: string) => {
      const language = detectLanguage(word);

      return normalizeWord(word, language);
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
          .map(normalizeWordWithLanguage)
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
      if (revealedSentences.includes(index)) {
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

    if (
      newOverallCompletion === 100 &&
      !isCompleted &&
      !isInitialLoad &&
      !isFirstEnterAfterRestore
    ) {
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

  const getTimeSinceLastSave = () => {
    return Math.floor((Date.now() - lastSaveTime) / 1000);
  };

  const resetLastSaveTime = () => {
    setLastSaveTime(Date.now());
  };

  const saveProgress = useCallback(async () => {
    const userInputJson: { [key: number]: string } = {};
    transcript.forEach((item, index) => {
      if (item.userInput && item.userInput.trim() !== "") {
        userInputJson[index] = item.userInput.trim();
      }
    });
    const timeSinceLastSave = getTimeSinceLastSave();
    resetLastSaveTime();

    const progressData: ProgressData = {
      channelId: channelId!,
      videoId: videoId!,
      userInput: userInputJson,
      currentTime: new Date().getTime(),
      overallCompletion: Number(overallCompletion.toFixed(2)),
      duration: timeSinceLastSave,
    };

    try {
      dispatch(setIsSavingProgress(true));
      await api.saveProgress(progressData);
      message.success(t("progressSaved"));
    } catch (error) {
      message.error(t("progressSaveFailed"));
    } finally {
      dispatch(setIsSavingProgress(false));
    }
  }, [
    channelId,
    videoId,
    transcript,
    overallCompletion,
    t,
    totalTime,
    lastSaveTime,
  ]);

  const removeMissedWord = (word: string) => {
    setMissedWords((prev) => prev.filter((w) => w !== word));
  };

  useImperativeHandle(ref, () => ({
    saveProgress,
    getMissedWords: () => missedWords,
    removeMissedWord,
    resetProgress,
  }));

  const handleUserInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
    resetUserTypingTimer();
    if (!isTimerRunning) {
      startTimer();
    }
  };

  const resetUserTypingTimer = useCallback(() => {
    if (userTypingTimerRef.current) {
      clearTimeout(userTypingTimerRef.current);
    }
    setIsUserTyping(true);
    userTypingTimerRef.current = setTimeout(() => {
      setIsUserTyping(false);
      if (playerRef.current) {
        const playerState = playerRef.current.getPlayerState();
        if (
          playerState === YouTube.PlayerState.PAUSED ||
          playerState === YouTube.PlayerState.ENDED
        ) {
          stopTimer();
        }
      }
    }, 30000);
  }, [stopTimer]);

  const onVideoStateChange = useCallback(
    (event: { data: number }) => {
      if (event.data === YouTube.PlayerState.PLAYING) {
        if (!isTimerRunning) {
          startTimer();
        }
      } else if (
        event.data === YouTube.PlayerState.PAUSED ||
        event.data === YouTube.PlayerState.ENDED
      ) {
        resetUserTypingTimer();
      }
    },
    [isTimerRunning, isUserTyping, startTimer, stopTimer]
  );

  useEffect(() => {
    return () => {
      stopTimer();
      if (userTypingTimerRef.current) {
        clearTimeout(userTypingTimerRef.current);
      }
    };
  }, [stopTimer]);

  const handleSaveSettings = async () => {
    const config: DictationConfig = {
      playback_speed: playbackSpeed,
      auto_repeat: autoRepeat,
      shortcuts: {
        repeat: shortcuts.repeat,
        prev: shortcuts.prev,
        next: shortcuts.next,
      },
    };

    try {
      setIsSavingDictationConfig(true);
      await api.saveUserConfig({ dictation_config: config });
      message.success(t("dictationConfigUpdated"));
      setConfigChanged(false);
    } catch (e) {
      message.error(t("dictationConfigUpdateFailed"));
    } finally {
      setIsSavingDictationConfig(false);
    }
  };

  const handlePopoverVisibleChange = (visible: boolean) => {
    if (!visible && configChanged) {
      setConfigChanged(false);
      handleSaveSettings();
    }
  };

  const handleSpeedChange = useCallback(
    (newSpeed: number) => {
      dispatch(setDictationPlaybackSpeed(newSpeed));
      setConfigChanged(true);
      if (playerRef.current) {
        playerRef.current.setPlaybackRate(newSpeed);
      }
    },
    [playerRef, playbackSpeed]
  );

  const handleAutoRepeatChange = useCallback(
    (value: number) => {
      dispatch(setDictationAutoRepeat(value));
      setConfigChanged(true);
    },
    [autoRepeat]
  );

  const handleShortcutSet = useCallback(
    (key: string) => {
      setSettingShortcut(key);
      setConfigChanged(true);
    },
    [shortcuts]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!playerRef.current || transcript.length === 0) return;

      // Check if the current focus is on the input field and whether IME is composing
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "TEXTAREA";

      if (settingShortcut) {
        e.preventDefault();
        dispatch(
          setDictationShortcutKeys({
            ...userInfo?.dictation_config.shortcuts,
            [settingShortcut]: e.code || "",
          })
        );
        setSettingShortcut(null);
      } else {
        // Only trigger shortcuts in the following cases:
        // 1. Not focused in input field, or
        // 2. In input field but not in IME composition state, or
        // 3. Pressed Enter key (allow submission)
        if (
          !isInputFocused ||
          (!isImeComposing && isInputFocused) ||
          e.code === shortcuts?.next
        ) {
          switch (e.code) {
            case shortcuts?.repeat:
              e.preventDefault();
              playCurrentSentence();
              break;
            case shortcuts?.prev:
              e.preventDefault();
              playPreviousSentence();
              break;
            case shortcuts?.next:
              e.preventDefault();
              saveUserInput();
              revealCurrentSentence();
              updateOverallProgress();

              if (isFirstEnterAfterRestore) {
                setIsFirstEnterAfterRestore(false);
              }

              stopCurrentSentence();
              requestAnimationFrame(() => {
                playNextSentence();
              });
              break;
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    userInput,
    currentSentenceIndex,
    isFirstEnterAfterRestore,
    transcript,
    autoRepeat,
    stopCurrentSentence,
    playNextSentence,
    playCurrentSentence,
    playPreviousSentence,
    saveUserInput,
    isImeComposing,
  ]);

  const handleCompositionStart = () => {
    setIsImeComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsImeComposing(false);
  };

  const settingsContent = (
    <Settings
      playbackSpeed={playbackSpeed}
      autoRepeat={autoRepeat}
      shortcuts={shortcuts}
      handleSpeedChange={handleSpeedChange}
      handleAutoRepeatChange={handleAutoRepeatChange}
      handleShortcutSet={handleShortcutSet}
    />
  );

  // Add listener for user's first input to register video to quota
  useEffect(() => {
    // Only register when user starts typing and the video hasn't been registered yet
    if (
      userInput &&
      userInput.length > 0 &&
      !hasRegisteredVideo &&
      quotaInfo?.canProceed
    ) {
      const registerVideo = async () => {
        try {
          await api.registerDictationVideo(channelId!, videoId!);
          setHasRegisteredVideo(true);

          // Update quota information
          checkQuota();
        } catch (error) {
          console.error("Error registering video:", error);
        }
      };

      registerVideo();
    }
  }, [userInput, hasRegisteredVideo, channelId, videoId, quotaInfo]);

  // Add periodic refresh of quota information
  useEffect(() => {
    // Refresh quota information every 30 seconds to ensure UI shows the latest data
    const intervalId = setInterval(() => {
      if (!isLoadingTranscript) {
        checkQuota();
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, [isLoadingTranscript]);

  return (
    <div className="flex justify-center items-start h-full w-full p-5">
      <div className="flex justify-between w-full max-w-7xl h-full">
        <div className="flex-1 flex flex-col justify-center pr-5 pt-10 max-w-2xl h-full overflow-y-auto hide-scrollbar">
          <div className="w-full max-w-xl mb-4">
            {/* Group quota info into a single line display */}
            {quotaInfo && (!userInfo?.plan || !userInfo?.plan?.name) && (
              <div className="mb-4 bg-blue-50 border-l-4 border-blue-500 p-3 rounded-md shadow-sm dark:bg-blue-900/30 dark:border-blue-400">
                <p className="text-md text-blue-700 dark:text-blue-300">
                  {t("freeUserQuotaHeader", {
                    used: quotaInfo.used,
                    limit: quotaInfo.limit === -1 ? "∞" : quotaInfo.limit,
                  })}
                  <span className="mx-1">•</span>
                  <span className="text-sm text-blue-600 dark:text-blue-200">
                    {t("freeUserQuotaRenewal", {
                      endDate: quotaInfo.endDate,
                    })}
                  </span>
                </p>
              </div>
            )}

            {videoTitle && (
              <h1 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-200 line-clamp-2">
                {videoTitle}
              </h1>
            )}

            <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full z-10" />
              <YouTube
                videoId={videoId}
                opts={youtubeOpts}
                onReady={onVideoReady}
                onStateChange={onVideoStateChange}
                className="absolute top-0 left-0 w-full h-full"
              />
              <Popover
                content={settingsContent}
                trigger="click"
                placement="bottomLeft"
                overlayClassName="custom-popover"
                onOpenChange={handlePopoverVisibleChange}
              >
                <Button
                  icon={
                    isSavingDictationConfig ? <Spin /> : <SettingOutlined />
                  }
                  className="absolute top-2 left-2 z-20 bg-opacity-50 hover:bg-opacity-75 transition-all duration-300"
                />
              </Popover>
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
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              placeholder={t("inputPlaceHolder")}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-gray-500 dark:focus:border-gray-500 transition duration-300 ease-in-out"
            />
            <div
              className="bg-gradient-to-r from-blue-300 to-gray-100 border-blue-500 text-blue-700 p-4
              dark:bg-gradient-to-r dark:from-orange-900 dark:to-gray-800 dark:border-blue-400 dark:text-orange-300 rounded-md"
            >
              <p className="font-bold">
                {t("videoDictationKeyboardInstructions")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col h-full max-w-2xl">
          {isLoadingTranscript || isCheckingQuota ? (
            <div className="flex items-center justify-center h-full">
              <Spin size="large" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex-grow mr-4">
                  <DualProgressBar
                    completionPercentage={overallCompletion}
                    accuracyPercentage={overallAccuracy}
                    isCompleted={isCompleted}
                  />
                </div>
                <Timer
                  time={totalTime}
                  isRunning={isTimerRunning && isUserTyping}
                />
              </div>
              <div className="flex-grow mt-4 flex flex-col subtitle-container overflow-hidden">
                <div
                  ref={subtitlesRef}
                  className="flex-grow overflow-y-auto hide-scrollbar"
                >
                  <div className="p-4 pb-20">
                    {transcript.map((item, index) => (
                      <div
                        key={index}
                        className={`subtitle-item ${
                          revealedSentences.includes(index) ? "revealed" : ""
                        } ${
                          !revealedSentences.includes(index) ? "blurred" : ""
                        } ${index === currentSentenceIndex ? "current" : ""}`}
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
                                        word.isCorrect
                                          ? "bg-green-200 dark:bg-green-700"
                                          : "bg-red-200 dark:bg-red-700"
                                      } px-1 py-0.5 rounded`}
                                    >
                                      {word.word}{" "}
                                    </span>
                                  ))}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                                  <Tag color="blue">{t("yourInput")}</Tag>{" "}
                                  {item.userInput &&
                                    compareInputWithTranscript(
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
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default forwardRef(VideoMain);
