/**
 * Video playback utilities for precise segment control
 * Extracted from VideoMain.tsx for reusability
 */

// Types for video player interface (compatible with YouTube Player)

// Interface definitions
export interface VideoPlaybackState {
  isPlaying: boolean;
  targetEndTime: number;
  actualStartTime: number;
}

export interface TranscriptSegment {
  start: number;
  end: number;
  transcript?: string;
}

export interface VideoPlayer {
  getCurrentTime(): number;
  getPlayerState(): number;
  seekTo(seconds: number, allowSeekAhead?: boolean): void;
  playVideo(): void;
  pauseVideo(): void;
  setPlaybackRate(rate: number): void;
  addEventListener(event: string, listener: (event: Event) => void): void;
  removeEventListener(event: string, listener: (event: Event) => void): void;
}

export interface PlaybackControlConfig {
  playbackSpeed: number;
  timeAccuracy: number; // seconds, default 0.05
  checkInterval: number; // milliseconds, default 25
  playbackTimeout: number; // milliseconds, default 5000
  bufferTolerance: number; // seconds, default 0.3
  onComplete?: () => void;
  onError?: (error: Error) => void;
  onStateChange?: (state: VideoPlaybackState) => void;
}

// YouTube Player State constants
export const YOUTUBE_PLAYER_STATE = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const;

/**
 * Play a specific segment of video with precise timing control
 * @param player - YouTube player instance
 * @param segment - Segment with start and end times
 * @param config - Playback configuration
 * @returns Promise that resolves when segment playback completes
 */
export const playTranscriptSegment = (
  player: VideoPlayer,
  segment: TranscriptSegment,
  config: PlaybackControlConfig
): { promise: Promise<void>; cancel: () => void } => {
  // Parameter validation
  if (!segment || typeof segment !== "object") {
    return {
      promise: Promise.reject(new Error(`Invalid segment: ${JSON.stringify(segment)}`)),
      cancel: () => {}
    };
  }

  if (typeof segment.start !== "number" || typeof segment.end !== "number") {
    return {
      promise: Promise.reject(new Error(`Invalid times: start=${segment.start}, end=${segment.end}`)),
      cancel: () => {}
    };
  }

  const {
    playbackSpeed = 1,
    timeAccuracy = 0.05,
    checkInterval = 20,
    bufferTolerance = 0.3,
    onComplete,
    onError,
    onStateChange,
  } = config;

  // Set playback speed
  player.setPlaybackRate(playbackSpeed);

  let cancelFn: (() => void) | null = null;

  const promise = new Promise<void>((resolve, reject) => {
    let monitoringInterval: NodeJS.Timeout | null = null;
    let hasEnded = false;
    let isCancelled = false;
    const activeTimeouts: NodeJS.Timeout[] = [];

    const cleanup = () => {
      if (monitoringInterval) {
        clearInterval(monitoringInterval);
        monitoringInterval = null;
      }
      // Clear all active timeouts
      activeTimeouts.forEach(timeout => clearTimeout(timeout));
      activeTimeouts.length = 0;
    };

    // Add cancellation mechanism
    const cancel = () => {
      isCancelled = true;
      hasEnded = true;
      cleanup();
      resolve(); // Resolve immediately when cancelled
    };

    // Expose cancel function
    cancelFn = cancel;

    // Helper to create cancellable timeout
    const setCancellableTimeout = (callback: () => void, delay: number) => {
      if (isCancelled) return;
      const timeout = setTimeout(() => {
        if (!isCancelled) {
          // Remove from active timeouts array
          const index = activeTimeouts.indexOf(timeout);
          if (index > -1) activeTimeouts.splice(index, 1);
          callback();
        }
      }, delay);
      activeTimeouts.push(timeout);
      return timeout;
    };

    const startMonitoring = () => {
      const actualStartTime = player.getCurrentTime();

      // Update state
      if (onStateChange) {
        onStateChange({
          isPlaying: true,
          targetEndTime: segment.end,
          actualStartTime: actualStartTime,
        });
      }

      monitoringInterval = setInterval(() => {
        if (hasEnded || isCancelled) {
          cleanup();
          return;
        }

        const currentTime = player.getCurrentTime();
        const playerState = player.getPlayerState();

        // Check if we should stop
        const shouldStop =
          currentTime >= segment.end - timeAccuracy ||
          currentTime > segment.end + bufferTolerance ||
          playerState === YOUTUBE_PLAYER_STATE.PAUSED ||
          playerState === YOUTUBE_PLAYER_STATE.ENDED;

        if (shouldStop) {
          hasEnded = true;
          cleanup();

          if (
            playerState !== YOUTUBE_PLAYER_STATE.PAUSED &&
            playerState !== YOUTUBE_PLAYER_STATE.ENDED
          ) {
            player.pauseVideo();
          }

          // Update final state
          if (onStateChange && !isCancelled) {
            onStateChange({
              isPlaying: false,
              targetEndTime: 0,
              actualStartTime: 0,
            });
          }

          setCancellableTimeout(() => {
            if (onComplete && !isCancelled) onComplete();
            if (!isCancelled) resolve();
          }, 50);
        }
      }, checkInterval);
    };

    // Enhanced playback sequence with better error handling
    const attemptPlayback = (attemptNumber = 1, maxAttempts = 3) => {
      try {
        // Always pause first to ensure clean state
        if (!isCancelled) {
          player.pauseVideo();
        }

        setCancellableTimeout(() => {
          if (!isCancelled) {
            player.seekTo(segment.start, true);
          }

          setCancellableTimeout(() => {
            if (!isCancelled) {
              player.playVideo();
            }

            // Check playback status with multiple retries
            const checkPlaybackStatus = (checkAttempt = 1, maxChecks = 10) => {
              if (isCancelled) return;

              const state = player.getPlayerState();

              if (
                state === YOUTUBE_PLAYER_STATE.PLAYING ||
                state === YOUTUBE_PLAYER_STATE.BUFFERING
              ) {
                startMonitoring();
              } else if (
                state === YOUTUBE_PLAYER_STATE.UNSTARTED &&
                checkAttempt < maxChecks
              ) {
                // Still unstarted, wait and check again
                setCancellableTimeout(() => {
                  checkPlaybackStatus(checkAttempt + 1, maxChecks);
                }, 200);
              } else if (
                state === YOUTUBE_PLAYER_STATE.PAUSED &&
                checkAttempt < maxChecks
              ) {
                // Paused, try to play again
                if (!isCancelled) {
                  player.playVideo();
                }
                setCancellableTimeout(() => {
                  checkPlaybackStatus(checkAttempt + 1, maxChecks);
                }, 200);
              } else if (attemptNumber < maxAttempts) {
                // This attempt failed, try again
                setCancellableTimeout(() => {
                  if (!isCancelled) {
                    attemptPlayback(attemptNumber + 1, maxAttempts);
                  }
                }, 500);
              } else {
                // All attempts failed
                cleanup();
                let errorMessage = `Playback failed after ${maxAttempts} attempts. Final state: ${getVideoPlayerStateDescription(
                  state
                )}`;

                // Provide helpful error message for common issues
                if (state === YOUTUBE_PLAYER_STATE.UNSTARTED) {
                  errorMessage +=
                    ". This might be due to browser autoplay restrictions. Please try clicking on the video player first.";
                }

                const error = new Error(errorMessage);
                if (onError) onError(error);
                reject(error);
              }
            };

            // Start checking after a short delay
            setCancellableTimeout(() => {
              checkPlaybackStatus();
            }, 300);
          }, 150);
        }, 100);
      } catch (error) {
        if (attemptNumber < maxAttempts) {
          setCancellableTimeout(() => {
            if (!isCancelled) {
              attemptPlayback(attemptNumber + 1, maxAttempts);
            }
          }, 500);
        } else {
          cleanup();
          const errorObj =
            error instanceof Error ? error : new Error(String(error));
          if (onError) onError(errorObj);
          reject(errorObj);
        }
      }
    };

    // Start the playback attempts
    attemptPlayback();
  });
  
  return {
    promise,
    cancel: () => {
      if (cancelFn) {
        cancelFn();
      }
    }
  };
};

/**
 * Stop video playback and clean up
 * @param player - YouTube player instance
 * @param onStateChange - Optional state change callback
 */
export const stopVideoPlayback = (
  player: VideoPlayer,
  onStateChange?: (state: VideoPlaybackState) => void
): void => {
  if (player) {
    player.pauseVideo();
  }

  const finalState: VideoPlaybackState = {
    isPlaying: false,
    targetEndTime: 0,
    actualStartTime: 0,
  };

  if (onStateChange) {
    onStateChange(finalState);
  }
};

/**
 * Check if playback should stop based on current conditions
 * @param player - YouTube player instance
 * @param segment - Current segment
 * @param config - Playback configuration
 * @param startTime - Playback start timestamp
 * @param actualStartTime - Actual video start time
 * @returns Object with stop decision and reason
 */
export const shouldStopPlayback = (
  player: VideoPlayer,
  segment: TranscriptSegment,
  config: PlaybackControlConfig,
  startTime: number,
  actualStartTime: number
): { shouldStop: boolean; reason: string } => {
  const currentTime = player.getCurrentTime();
  const elapsedTime = Date.now() - startTime;
  const playerState = player.getPlayerState();
  const {
    playbackSpeed = 1,
    timeAccuracy = 0.05,
    bufferTolerance = 0.3,
  } = config;

  const actualDuration = (segment.end - actualStartTime) * 1000;
  const adjustedDuration = actualDuration / playbackSpeed;

  // Check conditions
  const timeBasedStop = currentTime >= segment.end - timeAccuracy;
  const durationBasedStop = elapsedTime >= adjustedDuration;
  const bufferOverrun = currentTime > segment.end + bufferTolerance;
  const playerPaused =
    playerState === YOUTUBE_PLAYER_STATE.PAUSED ||
    playerState === YOUTUBE_PLAYER_STATE.ENDED;

  if (timeBasedStop) return { shouldStop: true, reason: "time-based" };
  if (durationBasedStop) return { shouldStop: true, reason: "duration-based" };
  if (bufferOverrun) return { shouldStop: true, reason: "buffer-overrun" };
  if (playerPaused) return { shouldStop: true, reason: "player-paused" };

  return { shouldStop: false, reason: "continue" };
};

/**
 * High-level video playback controller class
 */
export class VideoPlaybackController {
  private player: VideoPlayer;
  private currentInterval: NodeJS.Timeout | null = null;
  private currentPlaybackPromise: Promise<void> | null = null;
  private currentPlaybackCancelFn: (() => void) | null = null;
  private currentTranscriptCancelFn: (() => void) | null = null;
  private currentPlaybackId: number = 0;
  private playbackState: VideoPlaybackState = {
    isPlaying: false,
    targetEndTime: 0,
    actualStartTime: 0,
  };
  private config: PlaybackControlConfig;
  private isStopRequested: boolean = false;

  constructor(
    player: VideoPlayer,
    config: Partial<PlaybackControlConfig> = {}
  ) {
    this.player = player;
    this.config = {
      playbackSpeed: 1,
      timeAccuracy: 0.05,
      checkInterval: 15, // Reduced for better precision
      playbackTimeout: 8000, // Increased for first-time loading
      bufferTolerance: 0.2, // Reduced for more precise stopping
      ...config,
    };
  }

  /**
   * Play a transcript segment
   */
  async playSegment(
    segment: TranscriptSegment,
    onComplete?: () => void
  ): Promise<void> {
    // Stop any current playback immediately (non-blocking)
    this.stop().catch(console.error);

    // Generate unique playback ID
    const playbackId = ++this.currentPlaybackId;

    // Reset stop request flag
    this.isStopRequested = false;

    const segmentConfig = {
      ...this.config,
      onComplete: () => {
        // Only execute if this is still the current playback
        if (playbackId === this.currentPlaybackId) {
          this.currentPlaybackPromise = null;
          this.currentTranscriptCancelFn = null;
          if (onComplete && !this.isStopRequested) {
            onComplete();
          }
        }
      },
      onStateChange: (state: VideoPlaybackState) => {
        // Only update state if this is still the current playback
        if (playbackId === this.currentPlaybackId) {
          this.playbackState = state;
          if (this.config.onStateChange) {
            this.config.onStateChange(state);
          }
        }
      },
    };

    // Start the actual playback with proper cancellation support
    const playbackResult = playTranscriptSegment(this.player, segment, segmentConfig);

    // Store the promise and cancel function
    this.currentPlaybackPromise = playbackResult.promise;
    this.currentTranscriptCancelFn = playbackResult.cancel;

    try {
      await this.currentPlaybackPromise;
    } catch (error) {
      // If playback was stopped, don't propagate the error
      if (!this.isStopRequested) {
        throw error;
      }
    } finally {
      // Only clear if this is still the current playback
      if (playbackId === this.currentPlaybackId) {
        this.currentPlaybackPromise = null;
        this.currentTranscriptCancelFn = null;
      }
    }
  }

  /**
   * Stop current playback
   */
  async stop(): Promise<void> {
    this.isStopRequested = true;
    
    // Cancel current transcript playback monitoring immediately
    if (this.currentTranscriptCancelFn) {
      this.currentTranscriptCancelFn();
      this.currentTranscriptCancelFn = null;
    }
    
    // Cancel current playback monitoring immediately
    if (this.currentPlaybackCancelFn) {
      this.currentPlaybackCancelFn();
      this.currentPlaybackCancelFn = null;
    }
    
    if (this.currentInterval) {
      clearInterval(this.currentInterval);
      this.currentInterval = null;
    }

    // Don't wait for playback promise - just stop immediately
    this.currentPlaybackPromise = null;

    stopVideoPlayback(this.player, (state) => {
      this.playbackState = state;
      if (this.config.onStateChange) {
        this.config.onStateChange(state);
      }
    });
  }

  /**
   * Update playback speed
   */
  setPlaybackSpeed(speed: number): void {
    this.config.playbackSpeed = speed;
    this.player.setPlaybackRate(speed);
  }

  /**
   * Get current playback state
   */
  getPlaybackState(): VideoPlaybackState {
    return { ...this.playbackState };
  }

  /**
   * Check if currently playing
   */
  isPlaying(): boolean {
    return this.playbackState.isPlaying;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<PlaybackControlConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Utility functions for player state checking
export const isVideoPlaying = (player: VideoPlayer): boolean => {
  return player.getPlayerState() === YOUTUBE_PLAYER_STATE.PLAYING;
};

export const isVideoPaused = (player: VideoPlayer): boolean => {
  const state = player.getPlayerState();
  return (
    state === YOUTUBE_PLAYER_STATE.PAUSED ||
    state === YOUTUBE_PLAYER_STATE.ENDED
  );
};

export const getVideoPlayerStateDescription = (state: number): string => {
  switch (state) {
    case YOUTUBE_PLAYER_STATE.UNSTARTED:
      return "UNSTARTED";
    case YOUTUBE_PLAYER_STATE.ENDED:
      return "ENDED";
    case YOUTUBE_PLAYER_STATE.PLAYING:
      return "PLAYING";
    case YOUTUBE_PLAYER_STATE.PAUSED:
      return "PAUSED";
    case YOUTUBE_PLAYER_STATE.BUFFERING:
      return "BUFFERING";
    case YOUTUBE_PLAYER_STATE.CUED:
      return "CUED";
    default:
      return "UNKNOWN";
  }
};
