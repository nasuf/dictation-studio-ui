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
  addEventListener(event: string, listener: (event: any) => void): void;
  removeEventListener(event: string, listener: (event: any) => void): void;
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
): Promise<void> => {
  // Add parameter validation for debugging
  if (!segment || typeof segment !== "object") {
    const error = new Error(
      `Invalid segment parameter: ${JSON.stringify(segment)}`
    );
    console.error("playTranscriptSegment error:", error);
    return Promise.reject(error);
  }

  if (typeof segment.start !== "number" || typeof segment.end !== "number") {
    const error = new Error(
      `Invalid segment times: start=${segment.start}, end=${segment.end}`
    );
    console.error("playTranscriptSegment error:", error);
    return Promise.reject(error);
  }

  const {
    playbackSpeed = 1,
    timeAccuracy = 0.05,
    checkInterval = 25,
    playbackTimeout = 5000,
    bufferTolerance = 0.3,
    onComplete,
    onError,
    onStateChange,
  } = config;

  return new Promise<void>((resolve, reject) => {
    // First pause and seek to start position
    player.pauseVideo();
    player.seekTo(segment.start, true);

    const playPromise = new Promise<void>((playResolve, playReject) => {
      let timeoutId: NodeJS.Timeout;
      let resolved = false;

      // Check if player is ready and start playback
      const startPlayback = () => {
        try {
          player.playVideo();

          // Wait a moment for playback to actually start
          const checkPlaybackStarted = () => {
            const playerState = player.getPlayerState();
            if (playerState === YOUTUBE_PLAYER_STATE.PLAYING && !resolved) {
              resolved = true;
              clearTimeout(timeoutId);
              playResolve();
            } else if (playerState === YOUTUBE_PLAYER_STATE.BUFFERING) {
              // Still buffering, check again shortly
              setTimeout(checkPlaybackStarted, 100);
            } else if (!resolved) {
              // Try to start playback again
              setTimeout(() => {
                if (!resolved) {
                  player.playVideo();
                  setTimeout(checkPlaybackStarted, 100);
                }
              }, 200);
            }
          };

          // Start checking playback status
          setTimeout(checkPlaybackStarted, 100);
        } catch (error) {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeoutId);
            playReject(error);
          }
        }
      };

      // Add timeout handling to prevent player unresponsiveness
      timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          playReject(new Error("Video playback timeout"));
        }
      }, playbackTimeout);

      startPlayback();
    });

    playPromise
      .then(() => {
        // Record actual start time and calculate duration
        const actualStartTime = player.getCurrentTime() || segment.start;
        const actualDuration = (segment.end - actualStartTime) * 1000;
        const adjustedDuration = actualDuration / playbackSpeed;
        const startTime = Date.now();
        let hasEnded = false;

        // Update playback state
        const currentState: VideoPlaybackState = {
          isPlaying: true,
          targetEndTime: segment.end,
          actualStartTime: actualStartTime,
        };

        if (onStateChange) {
          onStateChange(currentState);
        }

        const checkInterval_id = setInterval(() => {
          if (!hasEnded) {
            const currentTime = player.getCurrentTime();
            const elapsedTime = Date.now() - startTime;
            const playerState = player.getPlayerState();

            // Playback precision monitoring (optional, for debugging)
            const expectedTime =
              actualStartTime + (elapsedTime / 1000) * playbackSpeed;
            const timeDrift = Math.abs(currentTime - expectedTime);

            if (timeDrift > 0.2) {
              console.warn(
                `Playback drift detected: ${timeDrift.toFixed(
                  3
                )}s at ${currentTime.toFixed(
                  3
                )}s, target: ${segment.end.toFixed(3)}s`
              );
            }

            // Multiple check conditions for improved accuracy
            const timeBasedStop = currentTime >= segment.end - timeAccuracy;
            const durationBasedStop = elapsedTime >= adjustedDuration;
            const bufferOverrun = currentTime > segment.end + bufferTolerance;
            const playerPaused =
              playerState === YOUTUBE_PLAYER_STATE.PAUSED ||
              playerState === YOUTUBE_PLAYER_STATE.ENDED;

            if (
              timeBasedStop ||
              durationBasedStop ||
              bufferOverrun ||
              playerPaused
            ) {
              if (!playerPaused) {
                player.pauseVideo();
              }
              clearInterval(checkInterval_id);
              hasEnded = true;

              // Update final state
              const finalState: VideoPlaybackState = {
                isPlaying: false,
                targetEndTime: 0,
                actualStartTime: 0,
              };

              if (onStateChange) {
                onStateChange(finalState);
              }

              // Delay callback execution to ensure playback fully stops
              setTimeout(() => {
                if (onComplete) {
                  onComplete();
                }
                resolve();
              }, 50);
            }
          }
        }, checkInterval);

        // Store interval ID for cleanup (if needed externally)
        // Note: checkInterval_id is a number, so we don't store segment info on it
      })
      .catch((error) => {
        console.error("Playback failed:", error);

        // Update error state
        const errorState: VideoPlaybackState = {
          isPlaying: false,
          targetEndTime: 0,
          actualStartTime: 0,
        };

        if (onStateChange) {
          onStateChange(errorState);
        }

        if (onError) {
          onError(error);
        }

        // Execute callback even on failure
        setTimeout(() => {
          if (onComplete) {
            onComplete();
          }
          reject(error);
        }, 100);
      });
  });
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
  private playbackState: VideoPlaybackState = {
    isPlaying: false,
    targetEndTime: 0,
    actualStartTime: 0,
  };
  private config: PlaybackControlConfig;

  constructor(
    player: VideoPlayer,
    config: Partial<PlaybackControlConfig> = {}
  ) {
    this.player = player;
    this.config = {
      playbackSpeed: 1,
      timeAccuracy: 0.05,
      checkInterval: 25,
      playbackTimeout: 5000,
      bufferTolerance: 0.3,
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
    this.stop(); // Stop any current playback

    const segmentConfig = {
      ...this.config,
      onComplete: onComplete,
      onStateChange: (state: VideoPlaybackState) => {
        this.playbackState = state;
        if (this.config.onStateChange) {
          this.config.onStateChange(state);
        }
      },
    };

    return playTranscriptSegment(this.player, segment, segmentConfig);
  }

  /**
   * Stop current playback
   */
  stop(): void {
    if (this.currentInterval) {
      clearInterval(this.currentInterval);
      this.currentInterval = null;
    }

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
