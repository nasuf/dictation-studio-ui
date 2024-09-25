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
