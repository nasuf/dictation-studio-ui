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
import { useParams, useNavigate } from "react-router-dom";
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
  areWordsEquivalent,
} from "@/utils/languageUtils";
import {
  VideoPlaybackController,
  VideoPlaybackState,
  TranscriptSegment,
  YOUTUBE_PLAYER_STATE,
} from "@/utils/videoPlaybackUtils";

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
  notifyQuota: boolean;
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
  const [playbackController, setPlaybackController] =
    useState<VideoPlaybackController | null>(null);
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
        prev: "ControlLeft",
        next: "Enter",
      }
  );
  const [lastSavedTotalTime, setLastSavedTotalTime] = useState<number>(0);
  const [isImeComposing, setIsImeComposing] = useState(false);
  const [autoSaveInputCount, setAutoSaveInputCount] = useState(0);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const autoSaveProgressRef = useRef<() => Promise<void>>();
  const [quotaInfo, setQuotaInfo] = useState<QuotaResponse | null>(null);
  const [isCheckingQuota, setIsCheckingQuota] = useState(true);
  const [hasRegisteredVideo, setHasRegisteredVideo] = useState(false);
  const [showTextareaScrollbar, setShowTextareaScrollbar] = useState(false);
  const navigate = useNavigate();

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
    const modal = Modal.info({
      title: t("dictationQuotaExceeded"),
      content: (
        <div className="space-y-4">
          <div className="text-lg">{t("basicPlanLimitMessage")}</div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg dark:bg-gray-800/30 dark:border-blue-400">
            <div className="font-medium">
              {t("freeUserQuotaHeader", {
                used: quotaData.used,
                limit: quotaData.limit,
              })}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t("quotaRenewalInfo", {
                endDate: quotaData.endDate
                  ? new Date(quotaData.endDate).toLocaleDateString()
                  : "",
              })}
            </div>
          </div>
        </div>
      ),
      footer: (
        <div className="flex justify-end space-x-2 mt-4">
          <Button
            onClick={() => {
              modal.destroy();
              navigate(-1);
            }}
          >
            {t("iKnow")}
          </Button>
          <Button
            type="primary"
            onClick={() => {
              modal.destroy();
              navigate("/profile/upgrade-plan");
            }}
          >
            {t("upgradeNow")}
          </Button>
        </div>
      ),
    });
  };

  // Add this new function to show quota confirmation modal
  const showQuotaConfirmationModal = (quotaData: QuotaResponse) => {
    if (!quotaData.notifyQuota) {
      return;
    }

    // Only show confirmation if:
    // 1. Modal hasn't been shown before
    // 2. User is on free plan
    // 3. Video hasn't been registered (not in this month's quota)
    // 4. User still has available quota
    if (!hasRegisteredVideo && quotaData.notifyQuota) {
      Modal.confirm({
        title: t("quotaConfirmation"),
        content: (
          <div>
            <p>
              {t("currentQuotaStatus", {
                used: quotaData.used,
                limit: quotaData.limit,
              })}
            </p>
            <p>
              {t("quotaRenewalInfo", {
                endDate: new Date(quotaData.endDate!).toLocaleDateString(),
              })}
            </p>
            <p>{t("proceedWithDictation")}</p>
          </div>
        ),
        okText: t("proceed"),
        cancelText: t("goBack"),
        onOk: async () => {
          try {
            // Register video to quota
            await api.registerDictationVideo(channelId!, videoId!);
            setHasRegisteredVideo(true);

            // Update quota information
            const newQuotaData = await checkQuota();
            if (newQuotaData) {
              setQuotaInfo(newQuotaData);
            }
          } catch (error) {
            console.error("Error registering video:", error);
            message.error(t("failedToRegisterVideo"));
            navigate(-1);
          }
        },
        onCancel() {
          navigate(-1);
        },
      });
    } else if (!quotaData.canProceed) {
      handleQuotaExceeded(quotaData);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingTranscript(true);
      setIsCheckingQuota(true);

      try {
        // Check quota first
        const quotaData = await checkQuota();
        if (quotaData) {
          if (!quotaData.canProceed) {
            handleQuotaExceeded(quotaData);
            return;
          } else {
            // Show confirmation modal for free users
            showQuotaConfirmationModal(quotaData);
          }
        }

        // 获取视频字幕和用户进度
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

    // 恢复进度后清除未保存标记，因为恢复的数据已经是保存过的
    setHasUnsavedChanges(false);
    // 恢复进度时，Timer从0开始计时
    setTotalTime(0);
    setLastSavedTotalTime(0);
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
    // 重置进度时，重置计时器相关状态
    setTotalTime(0);
    setLastSavedTotalTime(0);
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

    // Initialize playback controller
    const controller = new VideoPlaybackController(playerRef.current, {
      playbackSpeed: playbackSpeed,
      onStateChange: (state: VideoPlaybackState) => {
        // Handle state changes if needed
        console.log("Playback state changed:", state);
      },
    });
    setPlaybackController(controller);

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

  // Update playback controller when speed changes
  useEffect(() => {
    if (playbackController) {
      playbackController.setPlaybackSpeed(playbackSpeed);
    }
  }, [playbackSpeed, playbackController]);

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
      timerIntervalRef.current = setInterval(() => {
        setTotalTime((prev) => prev + 1);
        // 更新最后活跃时间
        lastActivityRef.current = Date.now();
      }, 1000);
    }
  }, [isTimerRunning]);

  const stopCurrentSentence = useCallback(() => {
    if (playbackController) {
      playbackController.stop();
    }
  }, [playbackController]);

  const playSentence = useCallback(
    async (sentence: TranscriptItem, onComplete?: () => void) => {
      if (!playbackController) return;

      const segment: TranscriptSegment = {
        start: sentence.start,
        end: sentence.end,
        transcript: sentence.transcript,
      };

      try {
        await playbackController.playSegment(segment, onComplete);
      } catch (error) {
        console.error("Playback failed:", error);
        if (onComplete) {
          setTimeout(onComplete, 100);
        }
      }
    },
    [playbackController]
  );

  const playCurrentSentence = useCallback(() => {
    if (!playbackController || transcript.length === 0) return;
    const currentSentence = transcript[currentSentenceIndex];
    if (autoRepeat > 0) {
      repeatSentence(currentSentence);
    } else {
      playSentence(currentSentence);
    }
    lastActivityRef.current = Date.now();
  }, [
    playbackController,
    currentSentenceIndex,
    playSentence,
    transcript,
    autoRepeat,
  ]);

  const playNextSentence = useCallback(() => {
    if (!playbackController || transcript.length === 0) return;
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
  }, [
    transcript,
    currentSentenceIndex,
    playbackController,
    playSentence,
    autoRepeat,
    onComplete,
  ]);

  const playPreviousSentence = useCallback(() => {
    if (!playbackController || transcript.length === 0) return;
    if (currentSentenceIndex === 0) return;

    const prevIndex = currentSentenceIndex - 1;
    setCurrentSentenceIndex(prevIndex);
    const prevSentence = transcript[prevIndex];
    if (autoRepeat > 0) {
      repeatSentence(prevSentence);
    } else {
      playSentence(prevSentence);
    }
    lastActivityRef.current = Date.now();
  }, [
    transcript,
    currentSentenceIndex,
    playbackController,
    playSentence,
    autoRepeat,
  ]);

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

      // 标记有未保存的更改
      setHasUnsavedChanges(true);

      // 增加自动保存输入计数
      setAutoSaveInputCount((prev) => {
        const newCount = prev + 1;
        console.log(
          `Auto-save input count: ${newCount}/5 (current: ${autoSaveInputCount})`
        );
        // 每5次输入后自动保存
        if (newCount >= 5) {
          setTimeout(() => {
            autoSaveProgress();
          }, 100); // 稍微延迟确保状态更新完成
          return 0; // 重置计数
        }
        return newCount;
      });
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
    // Normalize all types of apostrophes to standard ASCII apostrophe for consistent comparison
    const normalizedInput = input.replace(/['’‘`´]/g, "'");
    const normalizedTranscript = transcript.replace(/['’‘`´]/g, "'");

    const language = detectLanguage(normalizedTranscript);

    const cleanedInput = cleanString(normalizedInput, language);
    const cleanedTranscript = cleanString(normalizedTranscript, language);

    const inputWords = splitWords(cleanedInput, language);
    const transcriptWords = splitWords(cleanedTranscript, language);
    const originalTranscriptWords = splitWords(normalizedTranscript, language);
    const originalInputWords = splitWords(normalizedInput, language);

    // Debug logging for development
    const isDebugMode = process.env.NODE_ENV === "development";
    if (
      isDebugMode &&
      (normalizedInput.includes("they") || normalizedInput.includes("up")) &&
      (normalizedTranscript.includes("they") ||
        normalizedTranscript.includes("up"))
    ) {
      console.log("🔍 Position-Weighted Matching Debug:");
      console.log("Input:", normalizedInput);
      console.log("Transcript:", normalizedTranscript);
      console.log("Input words:", inputWords);
      console.log("Transcript words:", transcriptWords);
    }

    // Calculate position weight for better matching
    const calculatePositionWeight = (
      inputIndex: number,
      transcriptIndex: number
    ) => {
      const inputLength = inputWords.length;
      const transcriptLength = transcriptWords.length;

      if (inputLength === 0 || transcriptLength === 0) return 0;

      const inputRatio = inputIndex / Math.max(inputLength - 1, 1);
      const transcriptRatio =
        transcriptIndex / Math.max(transcriptLength - 1, 1);

      // Position weight: closer positions get higher weight
      const positionDiff = Math.abs(inputRatio - transcriptRatio);
      const weight = Math.max(0, 1 - positionDiff);

      if (
        isDebugMode &&
        (normalizedInput.includes("they") || normalizedInput.includes("up")) &&
        (normalizedTranscript.includes("they") ||
          normalizedTranscript.includes("up"))
      ) {
        console.log(
          `Position weight for input[${inputIndex}] -> transcript[${transcriptIndex}]: ${weight.toFixed(
            3
          )}`
        );
      }

      return weight;
    };

    // Create mapping from cleaned transcript indices to original transcript indices
    const cleanedToOriginalTranscriptMap = new Map<number, number>();
    let cleanedIndex = 0;

    originalTranscriptWords.forEach((originalWord, originalIndex) => {
      const cleanedWord = cleanString(originalWord, language);
      if (cleanedWord.trim() !== "") {
        cleanedToOriginalTranscriptMap.set(cleanedIndex, originalIndex);
        cleanedIndex++;
      }
    });

    // Find optimal matching using global optimization (Hungarian algorithm approach)
    const findOptimalMatching = () => {
      const inputResult: Array<{
        word: string;
        color: string;
        isCorrect: boolean;
        similarity?: number;
      }> = [];

      if (["zh", "ja", "ko"].includes(language)) {
        // For CJK languages: use similarity-based matching with position weight
        const usedIndices = new Set<number>();

        inputWords.forEach((word, inputIndex) => {
          const similarityThreshold = word.length === 1 ? 0.6 : 0.8;
          let bestMatchIndex = -1;
          let bestScore = 0;

          transcriptWords.forEach((transcriptWord, transcriptIndex) => {
            if (!usedIndices.has(transcriptIndex)) {
              const similarity = calculateSimilarity(word, transcriptWord);
              if (similarity > similarityThreshold) {
                const positionWeight = calculatePositionWeight(
                  inputIndex,
                  transcriptIndex
                );
                const combinedScore = similarity * 0.7 + positionWeight * 0.3;

                if (combinedScore > bestScore) {
                  bestMatchIndex = transcriptIndex;
                  bestScore = combinedScore;
                }
              }
            }
          });

          if (bestMatchIndex !== -1) {
            usedIndices.add(bestMatchIndex);
            inputResult.push({
              word: originalTranscriptWords[bestMatchIndex],
              color: "#00827F",
              isCorrect: true,
              similarity: bestScore,
            });
          } else {
            inputResult.push({
              word,
              color: "#C41E3A",
              isCorrect: false,
              similarity: 0,
            });
          }
        });

        // For CJK languages, create a simple matchMap based on usedIndices
        const matchMap = new Map<number, number>();
        let matchIndex = 0;
        usedIndices.forEach((transcriptIndex) => {
          if (matchIndex < inputWords.length) {
            matchMap.set(matchIndex, transcriptIndex);
            matchIndex++;
          }
        });

        return { inputResult, usedIndices, matchMap };
      } else {
        // For English and other languages: use global optimization for exact matches

        // Step 1: Build cost matrix for all possible matches
        const costMatrix: number[][] = [];
        const matchCandidates: Array<{
          inputIndex: number;
          transcriptIndex: number;
          word: string;
        }> = [];

        inputWords.forEach((inputWord, inputIndex) => {
          const rowCosts: number[] = [];
          transcriptWords.forEach((transcriptWord, transcriptIndex) => {
            if (areWordsEquivalent(inputWord, transcriptWord, language)) {
              const positionWeight = calculatePositionWeight(
                inputIndex,
                transcriptIndex
              );
              // Use negative cost for maximization (Hungarian algorithm minimizes)
              const cost = -positionWeight;
              rowCosts.push(cost);
              matchCandidates.push({
                inputIndex,
                transcriptIndex,
                word: inputWord,
              });
            } else {
              rowCosts.push(1000); // High cost for non-matches
            }
          });
          costMatrix.push(rowCosts);
        });

        if (
          isDebugMode &&
          (normalizedInput.includes("they") ||
            normalizedInput.includes("up")) &&
          (normalizedTranscript.includes("they") ||
            normalizedTranscript.includes("up"))
        ) {
          console.log("Cost matrix:", costMatrix);
          console.log("Match candidates:", matchCandidates);
        }

        // Step 2: Use greedy approach with global consideration
        // Sort all possible matches by their position weight (descending)
        const allMatches: Array<{
          inputIndex: number;
          transcriptIndex: number;
          word: string;
          score: number;
        }> = [];

        inputWords.forEach((inputWord, inputIndex) => {
          transcriptWords.forEach((transcriptWord, transcriptIndex) => {
            if (areWordsEquivalent(inputWord, transcriptWord, language)) {
              const positionWeight = calculatePositionWeight(
                inputIndex,
                transcriptIndex
              );
              allMatches.push({
                inputIndex,
                transcriptIndex,
                word: inputWord,
                score: positionWeight,
              });
            }
          });
        });

        // Sort by score (highest first)
        allMatches.sort((a, b) => b.score - a.score);

        if (
          isDebugMode &&
          (normalizedInput.includes("they") ||
            normalizedInput.includes("up")) &&
          (normalizedTranscript.includes("they") ||
            normalizedTranscript.includes("up"))
        ) {
          console.log("All possible matches sorted by score:", allMatches);
        }

        // Step 3: Greedily assign matches, avoiding conflicts
        const usedInputIndices = new Set<number>();
        const usedTranscriptIndices = new Set<number>();
        const finalMatches: Array<{
          inputIndex: number;
          transcriptIndex: number;
          word: string;
        }> = [];

        for (const match of allMatches) {
          if (
            !usedInputIndices.has(match.inputIndex) &&
            !usedTranscriptIndices.has(match.transcriptIndex)
          ) {
            finalMatches.push(match);
            usedInputIndices.add(match.inputIndex);
            usedTranscriptIndices.add(match.transcriptIndex);
          }
        }

        if (
          isDebugMode &&
          (normalizedInput.includes("they") ||
            normalizedInput.includes("up")) &&
          (normalizedTranscript.includes("they") ||
            normalizedTranscript.includes("up"))
        ) {
          console.log("Final matches:", finalMatches);
        }

        // Step 4: Build result arrays
        const matchMap = new Map<number, number>(); // inputIndex -> transcriptIndex
        finalMatches.forEach((match) => {
          matchMap.set(match.inputIndex, match.transcriptIndex);
        });

        inputWords.forEach((word, inputIndex) => {
          if (matchMap.has(inputIndex)) {
            const cleanedTranscriptIndex = matchMap.get(inputIndex)!;
            // Map cleaned transcript index to original transcript index
            const originalTranscriptIndex = cleanedToOriginalTranscriptMap.get(
              cleanedTranscriptIndex
            );
            if (originalTranscriptIndex !== undefined) {
              inputResult.push({
                word: originalTranscriptWords[originalTranscriptIndex],
                color: "#00827F",
                isCorrect: true,
              });
            } else {
              inputResult.push({
                word,
                color: "#C41E3A",
                isCorrect: false,
              });
            }
          } else {
            inputResult.push({
              word,
              color: "#C41E3A",
              isCorrect: false,
            });
          }
        });

        const usedIndices = new Set(Array.from(matchMap.values()));
        return { inputResult, usedIndices, matchMap: matchMap };
      }
    };

    const { inputResult, usedIndices, matchMap } = findOptimalMatching();

    // Map usedIndices (which are cleaned indices) to original indices
    const usedOriginalIndices = new Set<number>();
    usedIndices.forEach((cleanedIdx) => {
      const originalIdx = cleanedToOriginalTranscriptMap.get(cleanedIdx);
      if (originalIdx !== undefined) {
        usedOriginalIndices.add(originalIdx);
      }
    });

    // Helper function to check if a word is pure punctuation
    const isPunctuation = (word: string): boolean => {
      // Remove all punctuation and check if anything remains
      const withoutPunctuation = word.replace(/[^\w\s]/g, "");
      return withoutPunctuation.trim() === "";
    };

    const transcriptResult = originalTranscriptWords.map((word, index) => {
      // Pure punctuation should be marked as correct by default
      // since dictation doesn't require users to input punctuation
      const isMatched = usedOriginalIndices.has(index);
      const isPurePunctuation = isPunctuation(word);
      const isCorrect = isMatched || isPurePunctuation;

      return {
        word,
        highlight: isCorrect ? "#7CEECE" : "#FFAAA5",
        isCorrect: isCorrect,
      };
    });

    // Create originalInputResult that shows the user's original input with correct coloring
    const originalInputResult = originalInputWords.map(
      (originalWord, originalIndex) => {
        // Find the corresponding cleaned input word index
        let cleanedInputIndex = -1;
        let currentCleanedIndex = 0;

        for (let i = 0; i <= originalIndex; i++) {
          const cleanedWord = cleanString(originalInputWords[i], language);
          if (cleanedWord.trim() !== "") {
            if (i === originalIndex) {
              cleanedInputIndex = currentCleanedIndex;
              break;
            }
            currentCleanedIndex++;
          }
        }

        // Check if this cleaned input word was matched correctly
        let isCorrect = false;
        if (
          cleanedInputIndex >= 0 &&
          matchMap &&
          matchMap.has(cleanedInputIndex)
        ) {
          isCorrect = true;
        }

        // For user input, pure punctuation should also be marked as correct
        // since it's valid for users to include punctuation in their input
        const isPurePunctuation = isPunctuation(originalWord);
        if (isPurePunctuation) {
          isCorrect = true;
        }

        return {
          word: originalWord,
          isCorrect: isCorrect,
        };
      }
    );

    const correctWords = inputResult.filter((word) => word.isCorrect).length;
    const completionPercentage = (correctWords / transcriptWords.length) * 100;

    return {
      inputResult,
      transcriptResult,
      completionPercentage,
      originalInputResult,
    };
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
    // 计算自上次保存以来的实际活跃时间（基于totalTime）
    return totalTime - lastSavedTotalTime;
  };

  const resetLastSaveTime = () => {
    // 记录当前的totalTime作为基准
    setLastSavedTotalTime(totalTime);
    // 同时更新最后活跃时间
    lastActivityRef.current = Date.now();
  };

  // 自动保存函数（无提示框）
  const autoSaveProgress = useCallback(async () => {
    console.log(
      "autoSaveProgress called, hasUnsavedChanges:",
      hasUnsavedChanges
    );
    // 如果没有未保存的更改，不进行保存
    if (!hasUnsavedChanges) {
      console.log("No unsaved changes, skipping auto-save");
      return;
    }

    const userInputJson: { [key: number]: string } = {};
    transcript.forEach((item, index) => {
      if (item.userInput && item.userInput.trim() !== "") {
        userInputJson[index] = item.userInput.trim();
      }
    });

    // 如果没有任何输入，不进行保存
    if (Object.keys(userInputJson).length === 0) {
      setHasUnsavedChanges(false); // 清除未保存标记
      return;
    }

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
      // 自动保存成功后清除未保存标记
      setHasUnsavedChanges(false);
      console.log("Auto-saved progress");
    } catch (error) {
      console.error("Auto-save failed:", error);
      // 自动保存失败也不显示错误提示，避免打扰用户
      // 保持 hasUnsavedChanges 为 true，下次继续尝试保存
    } finally {
      dispatch(setIsSavingProgress(false));
    }
  }, [
    channelId,
    videoId,
    transcript,
    overallCompletion,
    totalTime,
    lastSavedTotalTime,
    hasUnsavedChanges,
  ]);

  // 保存最新的 autoSaveProgress 函数引用
  useEffect(() => {
    autoSaveProgressRef.current = autoSaveProgress;
    console.log("autoSaveProgressRef updated");
  }, [autoSaveProgress]);

  // 手动保存函数（有提示框）
  const saveProgress = useCallback(async () => {
    if (!hasUnsavedChanges) {
      console.log("No unsaved changes, skipping auto-save");
      return;
    }
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
      // 手动保存成功后清除未保存标记
      setHasUnsavedChanges(false);
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
    lastSavedTotalTime,
  ]);

  const removeMissedWord = (word: string) => {
    setMissedWords((prev) => prev.filter((w) => w !== word));
  };

  useImperativeHandle(ref, () => ({
    saveProgress, // 这里使用手动保存函数，会显示提示框
    getMissedWords: () => missedWords,
    removeMissedWord,
    resetProgress,
  }));

  const handleUserInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setUserInput(newValue);

    // Check if content exceeds 3 lines to show/hide scrollbar
    const textarea = e.target;

    const lineHeight = 1.6; // em
    const fontSize = 16; // px
    const padding = 32; // py-4 = 1rem * 2 = 32px (consistent padding)
    const maxHeightFor3Lines = lineHeight * fontSize * 3 + padding;

    // Reset height to auto to get accurate scrollHeight
    textarea.style.height = "auto";
    const scrollHeight = textarea.scrollHeight;

    // Determine if scrollbar should be shown (only when content exceeds 3 lines)
    const needsScrollbar = scrollHeight > maxHeightFor3Lines;
    setShowTextareaScrollbar(needsScrollbar);

    resetUserTypingTimer();
    // 更新最后活跃时间
    lastActivityRef.current = Date.now();
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
          playerState === YOUTUBE_PLAYER_STATE.PAUSED ||
          playerState === YOUTUBE_PLAYER_STATE.ENDED
        ) {
          stopTimer();
        }
      }
    }, 5000);
  }, [stopTimer]);

  const onVideoStateChange = useCallback(
    (event: { data: number }) => {
      if (event.data === YOUTUBE_PLAYER_STATE.PLAYING) {
        if (!isTimerRunning) {
          startTimer();
        }
      } else if (
        event.data === YOUTUBE_PLAYER_STATE.PAUSED ||
        event.data === YOUTUBE_PLAYER_STATE.ENDED
      ) {
        resetUserTypingTimer();
      }
    },
    [isTimerRunning, startTimer, resetUserTypingTimer]
  );

  // 30秒自动保存定时器
  useEffect(() => {
    console.log("Setting up auto-save timer");

    const intervalId = setInterval(() => {
      console.log("10s timer triggered, checking for unsaved changes...");
      console.log("Current timestamp:", new Date().toLocaleTimeString());
      console.log(
        "autoSaveProgressRef.current exists:",
        !!autoSaveProgressRef.current
      );

      if (autoSaveProgressRef.current) {
        console.log("Calling autoSaveProgressRef.current()...");
        autoSaveProgressRef.current();
      } else {
        console.warn("autoSaveProgressRef.current is not available");
      }
    }, 30000);

    autoSaveTimerRef.current = intervalId;
    console.log("Auto-save timer started with interval ID:", intervalId);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        console.log("Auto-save timer cleared");
      }
    };
  }, []); // 移除依赖，只在组件挂载时启动一次

  useEffect(() => {
    return () => {
      stopTimer();
      if (userTypingTimerRef.current) {
        clearTimeout(userTypingTimerRef.current);
      }
      // Remove auto-save timer cleanup from here - it's handled in the timer setup useEffect
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
      if (playbackController) {
        playbackController.setPlaybackSpeed(newSpeed);
      }
    },
    [playerRef, playbackController]
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
          // 更新活跃时间
          lastActivityRef.current = Date.now();

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
      settingShortcut={settingShortcut}
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
    if (!isLoadingTranscript) {
      checkQuota();
    }
  }, [isLoadingTranscript]);

  return (
    <>
      <style>
        {`
          .dictation-textarea {
            line-height: 1.6;
            min-height: calc(1.6em * 2 + 2rem); /* 2 lines + padding for consistent height */
            max-height: calc(1.6em * 3 + 2rem); /* 3 lines + padding */
          }
          .dictation-textarea::-webkit-scrollbar {
            width: 6px;
          }
          .dictation-textarea::-webkit-scrollbar-track {
            background: transparent;
          }
          .dictation-textarea::-webkit-scrollbar-thumb {
            background: rgba(156, 163, 175, 0.5);
            border-radius: 3px;
          }
          .dictation-textarea::-webkit-scrollbar-thumb:hover {
            background: rgba(156, 163, 175, 0.7);
          }
          .dictation-textarea::placeholder {
            text-align: center;
            opacity: 0.6;
          }
          .dictation-textarea.hide-scrollbar {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .dictation-textarea.hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
      <div className="flex justify-center items-start h-full w-full p-5">
        <div className="flex justify-between w-full max-w-7xl h-full">
          <div className="flex-1 flex flex-col justify-center pr-5 pt-10 max-w-2xl h-full overflow-y-auto hide-scrollbar">
            <div className="w-full max-w-xl mb-4">
              {/* Group quota info into a single line display */}
              {quotaInfo &&
                quotaInfo.limit !== -1 &&
                (!userInfo?.plan || !userInfo?.plan?.name) && (
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
                  onClick={() => {
                    lastActivityRef.current = Date.now();
                    playPreviousSentence();
                  }}
                  disabled={currentSentenceIndex === 0}
                  className="p-3 w-12 h-12 rounded-full bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:disabled:bg-gray-800 dark:text-gray-300 transition duration-300 ease-in-out shadow-md flex items-center justify-center"
                >
                  <StepBackwardOutlined className="text-lg" />
                </button>
                <button
                  onClick={() => {
                    lastActivityRef.current = Date.now();
                    playCurrentSentence();
                  }}
                  className="p-3 w-12 h-12 rounded-full bg-gray-300 hover:bg-gray-400 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 transition duration-300 ease-in-out shadow-md flex items-center justify-center"
                >
                  <RedoOutlined className="text-lg" />
                </button>
                <button
                  onClick={() => {
                    lastActivityRef.current = Date.now();
                    playNextSentence();
                  }}
                  disabled={currentSentenceIndex === transcript.length - 1}
                  className="p-3 w-12 h-12 rounded-full bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:disabled:bg-gray-800 dark:text-gray-300 transition duration-300 ease-in-out shadow-md flex items-center justify-center"
                >
                  <StepForwardOutlined className="text-lg" />
                </button>
              </div>
              <textarea
                value={userInput}
                onChange={handleUserInput}
                onCompositionStart={handleCompositionStart}
                onCompositionEnd={handleCompositionEnd}
                placeholder={t("inputPlaceHolder")}
                className={`dictation-textarea w-full text-base leading-relaxed text-center px-4 py-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-0 dark:focus:outline-none dark:focus:border-gray-800 transition-all duration-300 ease-in-out resize-none whitespace-pre-wrap break-words overflow-auto ${
                  showTextareaScrollbar ? "" : "hide-scrollbar"
                }`}
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
                                    ).transcriptResult.map(
                                      (word, wordIndex) => (
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
                                      )
                                    )}
                                  </p>
                                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                                    <Tag color="blue">{t("yourInput")}</Tag>{" "}
                                    {item.userInput &&
                                      compareInputWithTranscript(
                                        item.userInput,
                                        item.transcript
                                      ).originalInputResult.map(
                                        (word, wordIndex) => (
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
                                        )
                                      )}
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
    </>
  );
};

export default forwardRef(VideoMain);
