export interface UserInfo {
  username: string;
  email: string;
  avatar: string;
  language: string;
  plan: Plan;
  role: string;
  dictation_config: DictationConfig;
  missed_words: StructuredMissedWords;
}

export interface Plan {
  name: string;
  expireTime?: string;
  isRecurring: boolean;
  status: string;
  nextPaymentTime?: string;
}

export interface DictationConfig {
  playback_speed: number | 1;
  auto_repeat: number | 0;
  shortcuts:
    | ShortcutKeys
    | {
        repeat: "Tab";
        next: "Enter";
        prev: "ControlLeft";
      };
  language?: string; // 'en', 'zh', 'ja', 'ko'
}

export interface ShortcutKeys {
  repeat: string;
  next: string;
  prev: string;
}

export interface Channel {
  name: string;
  id: string;
  image_url: string;
  visibility: string;
  language: string;
  link: string;
}

export interface Video {
  video_id: string;
  title: string;
  link: string;
  visibility: string;
  created_at: number;
  updated_at: number;
}

export interface ProgressData {
  channelId: string;
  videoId: string;
  userInput: { [key: number]: string };
  currentTime: number;
  overallCompletion: number;
  duration: number;
  channelName?: string;
  videoTitle?: string;
  videoLink?: string;
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

export interface DailyDuration {
  date: string;
  count: number;
}

export interface Message {
  id: string;
  content: string;
  type: "text" | "image";
  sender: "user" | "admin";
  timestamp: number;
}

export interface PlanFeature {
  feature: string;
  included: boolean;
  isCurrent?: boolean;
}

export interface PlanProps {
  id: string;
  title: string;
  price: number;
  duration: string;
  features: PlanFeature[];
  isCurrent?: boolean;
  toBeCanceled?: boolean;
  currentPlan?: Plan;
  onSelect: () => void;
  onCancel: () => void;
  onCancelSubscription: () => void;
}

export interface StructuredMissedWords {
  [key: string]: string[]; // language code as key, array of words as value
}

export interface ChannelRecommendationItem {
  id: string;
  name: string;
  link: string;
  imageUrl: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  language: string;
  userEmail: string;
  reason?: string;
}
