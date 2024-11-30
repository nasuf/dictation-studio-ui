import { DictationConfig } from "@/utils/type";

export const DEFAULT_DARK_MODE = false;
export const DEFAULT_LANGUAGE = "en";
export const USER_PLAN = {
  FREE: "Free",
  BASIC: "Basic",
  PRO: "Pro",
  PREMIUM: "Premium",
};
export const USER_PLAN_DURATION = {
  BASIC: 30,
  PRO: 30,
  PREMIUM: 30,
};
export const USER_ROLE = {
  ADMIN: "Admin",
  USER: "User",
};
export const DARK_THEME_CLASS_NAME = "dark";
export const JWT_ACCESS_TOKEN_KEY = "ds_a_token";
export const JWT_REFRESH_TOKEN_KEY = "ds_r_token";
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

export const PLANS = [
  {
    id: USER_PLAN.FREE,
    title: "freePlan",
    price: 0,
    duration: "unlimitedTime",
    features: [
      { feature: "basicFeatures", included: true },
      { feature: "limitedDictations", included: true },
      { feature: "standardSupport", included: true },
      { feature: "advancedFeatures", included: false },
      { feature: "prioritySupport", included: false },
      { feature: "customFeatures", included: false },
    ],
  },
  {
    id: USER_PLAN.BASIC,
    title: "basicPlan",
    price: 29,
    duration: "oneMonth",
    features: [
      { feature: "allFreeFeatures", included: true },
      { feature: "unlimitedDictations", included: true },
      { feature: "standardSupport", included: true },
      { feature: "advancedFeatures", included: false },
      { feature: "prioritySupport", included: false },
      { feature: "customFeatures", included: false },
    ],
  },
  {
    id: USER_PLAN.PRO,
    title: "proPlan",
    price: 49,
    duration: "threeMonths",
    features: [
      { feature: "allBasicFeatures", included: true },
      { feature: "unlimitedDictations", included: true },
      { feature: "advancedFeatures", included: true },
      { feature: "prioritySupport", included: true },
      { feature: "customFeatures", included: false },
      { feature: "dedicatedSupport", included: false },
    ],
  },
  {
    id: USER_PLAN.PREMIUM,
    title: "premiumPlan",
    price: 99,
    duration: "sixMonths",
    features: [
      { feature: "allProFeatures", included: true },
      { feature: "unlimitedEverything", included: true },
      { feature: "customFeatures", included: true },
      { feature: "dedicatedSupport", included: true },
      { feature: "priorityDevelopment", included: true },
      { feature: "exclusiveContent", included: true },
    ],
  },
];
