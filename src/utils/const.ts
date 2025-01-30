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
  PRO: 90,
  PREMIUM: 180,
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

export const FILTER_OPTIONS = [
  {
    key: "removePrepositions",
    translationKey: "filterPrepositions",
    checked: false,
  },
  { key: "removePronouns", translationKey: "filterPronouns", checked: false },
  {
    key: "removeAuxiliaryVerbs",
    translationKey: "filterAuxiliaryVerbs",
    checked: false,
  },
  { key: "removeNumbers", translationKey: "filterNumbers", checked: false },
  {
    key: "removeArticleOrDeterminer",
    translationKey: "filterArticlesAndDeterminers",
    checked: false,
  },
  {
    key: "removeConjunctions",
    translationKey: "filterConjunctions",
    checked: false,
  },
];

export const COMPONENT_STYLE = {
  width: "640px",
  height: "390px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export const ARTICLES_AND_DETERMINERS = [
  "a",
  "an",
  "the",
  "this",
  "that",
  "these",
  "those",
  "my",
  "your",
  "his",
  "her",
  "its",
  "our",
  "their",
  "some",
  "any",
  "many",
  "much",
  "few",
  "little",
  "several",
  "enough",
  "all",
  "both",
  "each",
  "every",
];

export const VISIBILITY_OPTIONS = {
  Public: "public",
  Private: "private",
  All: "all",
};

export const LANGUAGES = {
  English: "en",
  Chinese: "zh",
  Japanese: "ja",
  Korean: "ko",
  All: "all",
};
