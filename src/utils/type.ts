export interface UserInfo {
  username: string;
  email: string;
  avatar: string;
  role: string;
}

export interface Channel {
  id: string;
  name: string;
  image_url: string;
}

export interface Video {
  video_id: string;
  link: string;
  title: string;
}

export interface ProgressData {
  channelId: string;
  videoId: string;
  userInput: { [key: number]: string };
  currentTime: number;
  overallCompletion: number;
  duration: number;
}

export interface UserProgressData {
  channelId: string;
  channelName: string;
  videoId: string;
  videoTitle: string;
  videoLink: string;
  overallCompletion: number;
}

export interface TranscriptItem {
  start: number;
  end: number;
  transcript: string;
  userInput?: string;
}

export interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  path?: string;
  children?: MenuItem[];
}

export interface FilterOption {
  key: string;
  translationKey: string;
  checked: boolean;
}

export interface UserConfig {
  language?: string;
  theme?: string;
  playback_speed?: number;
  auto_repeat?: number;
  shortcuts?: {
    repeat?: string;
    next?: string;
    prev?: string;
  };
}
