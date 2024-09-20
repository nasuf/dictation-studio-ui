import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// 替换为实际的翻译对象
const enTranslations = {
  signIn: "Sign In",
  signUp: "Sign Up",
  dictation: "Dictation",
  videoDictation: "Video Dictation",
  wordDictation: "Word Dictation",
  collection: "Collection",
  videoCollection: "Video Collection",
  wordCollection: "Word Collection",
  fm: "FM",
  videoDictationKeyboardInstructions:
    "Press Tab to start dictation or repeat the current sentence, press Enter to continue to the next sentence",
  wordDictationKeyboardInstructions:
    "Press Enter to submit and validate the answer. Press Enter again to get the next word. Press Tab or click the card to replay the word pronunciation.",
};

const zhTranslations = {
  signIn: "登录",
  signUp: "注册",
  dictation: "听写",
  videoDictation: "视频听写",
  wordDictation: "单词听写",
  collection: "收藏",
  videoCollection: "视频收藏",
  wordCollection: "单词收藏",
  fm: "电台",
  videoDictationKeyboardInstructions:
    "按Tab键开始听写或重复当前语句，按Enter键继续下一句话",
  wordDictationKeyboardInstructions:
    "按Enter键提交并验证答案。再次按Enter键获取下一个单词。按Tab键或点击卡片重新播放单词发音。",
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslations },
    zh: { translation: zhTranslations },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
