import i18n from "i18next";
import { initReactI18next } from "react-i18next";

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
  inputPlaceHolder: "Enter what you hear",
  completionRate: "Completion Rate",
  accuracyRate: "Accuracy Rate",
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
    "按Enter键提交并验证答案。再次按Enter键获取下一个单词。按Tab键或点击卡片重新播放单词发音",
  inputPlaceHolder: "输入你听到的内容",
  completionRate: "完成率",
  accuracyRate: "准确率",
};

const jaTranslations = {
  signIn: "サインイン",
  signUp: "サインアップ",
  dictation: "ディクテーション",
  videoDictation: "ビデオディクテーション",
  wordDictation: "単語ディクテーション",
  collection: "コレクション",
  videoCollection: "ビデオコレクション",
  wordCollection: "単語コレクション",
  fm: "FM",
  videoDictationKeyboardInstructions:
    "Tabキーを押してディクテーションを開始するか現在の文を繰り返し、Enterキーを押して次の文に進みます",
  wordDictationKeyboardInstructions:
    "Enterキーを押して回答を送信し、検証します。もう一度Enterキーを押して次の単語を取得します。Tabキーを押すかカードをクリックして単語の発音を再生します。",
  completionRate: "完了率",
  accuracyRate: "正確率",
};

const koTranslations = {
  signIn: "로그인",
  signUp: "회원가입",
  dictation: "받아쓰기",
  videoDictation: "비디오 받아쓰기",
  wordDictation: "단어 받아쓰기",
  collection: "컬렉션",
  videoCollection: "비디오 컬렉션",
  wordCollection: "단어 컬렉션",
  fm: "FM",
  videoDictationKeyboardInstructions:
    "Tab 키를 눌러 받아쓰기를 시작하거나 현재 문장을 반복하고, Enter 키를 눌러 다음 문장으로 계속합니다",
  wordDictationKeyboardInstructions:
    "Enter 키를 눌러 답변을 제출하고 확인합니다. Enter 키를 다시 눌러 다음 단어를 가져옵니다. Tab 키를 누르거나 카드를 클릭하여 단어 발음을 다시 재생합니다.",
  inputPlaceHolder: "들은 내용을 입력하세요",
  completionRate: "완료율",
  accuracyRate: "정확률",
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslations },
    zh: { translation: zhTranslations },
    ja: { translation: jaTranslations },
    ko: { translation: koTranslations },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
