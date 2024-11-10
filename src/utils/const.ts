import { DictationConfig } from "@/utils/type";

export const DEFAULT_DARK_MODE = false;
export const DEFAULT_LANGUAGE = "en";
export const USER_PLAN = {
  FREE: "Free",
  PRO: "Pro",
  PREMIUM: "Premium",
};
export const USER_PLAN_DURATION = {
  PRO: 30,
  PREMIUM: 90,
};
export const USER_ROLE = {
  ADMIN: "Admin",
  USER: "User",
};
export const DARK_THEME_CLASS_NAME = "dark";
export const JWT_TOKEN_KEY = "ds_tkn";
export const USER_KEY = "user";
export const EMAIL_VERIFIED_KEY = "emailVerified";

export const DEFAULT_DICTATION_CONFIG: DictationConfig = {
  playback_speed: 1,
  auto_repeat: 0,
  shortcuts: {
    repeat: "Tab",
    next: "Enter",
    prev: "Shift",
  },
};

export const UNAUTHORIZED_EVENT = "UNAUTHORIZED";
