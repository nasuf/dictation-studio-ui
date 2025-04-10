import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ShortcutKeys, UserInfo, StructuredMissedWords } from "@/utils/type";

interface UserState {
  userInfo: UserInfo | null;
  isDictationStarted: boolean;
  repeatCount: number;
  isSavingProgress: boolean;
  isLoginModalVisible: boolean;
  currentMissedWords: string[];
}

const initialState: UserState = {
  userInfo: null,
  isDictationStarted: false,
  repeatCount: 0,
  isSavingProgress: false,
  isLoginModalVisible: false,
  currentMissedWords: [],
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserInfo | null>) => {
      state.userInfo = action.payload;
    },
    clearUser: (state) => {
      state.userInfo = null;
    },
    setIsDictationStarted: (state, action: PayloadAction<boolean>) => {
      state.isDictationStarted = action.payload;
    },
    setRepeatCount: (state, action: PayloadAction<number>) => {
      state.repeatCount = action.payload;
    },
    resetRepeatCount: (state) => {
      state.repeatCount = 0;
    },
    increaseRepeatCount: (state) => {
      state.repeatCount += 1;
    },
    setDictationShortcutKeys: (
      state,
      action: PayloadAction<Partial<ShortcutKeys>>
    ) => {
      if (state.userInfo) {
        state.userInfo.dictation_config.shortcuts = {
          ...state.userInfo.dictation_config.shortcuts,
          ...action.payload,
        };
      }
    },
    setDictationPlaybackSpeed: (state, action: PayloadAction<number>) => {
      if (state.userInfo && state.userInfo.dictation_config) {
        state.userInfo.dictation_config.playback_speed = action.payload;
      }
    },
    setDictationAutoRepeat: (state, action: PayloadAction<number>) => {
      if (state.userInfo) {
        state.userInfo.dictation_config.auto_repeat = action.payload;
      }
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      if (state.userInfo) {
        state.userInfo.language = action.payload;
      }
    },
    setIsSavingProgress: (state, action: PayloadAction<boolean>) => {
      state.isSavingProgress = action.payload;
    },
    setMissedWords: (state, action: PayloadAction<StructuredMissedWords>) => {
      if (state.userInfo) {
        state.userInfo.missed_words = action.payload;
      }
    },
    addWordToMissedWords: (
      state,
      action: PayloadAction<{ language: string; word: string }>
    ) => {
      if (state.userInfo) {
        const { language, word } = action.payload;

        // 确保missed_words存在且包含对应语言的数组
        if (!state.userInfo.missed_words) {
          state.userInfo.missed_words = {};
        }

        if (!state.userInfo.missed_words[language]) {
          state.userInfo.missed_words[language] = [];
        }

        // 避免重复添加
        if (!state.userInfo.missed_words[language].includes(word)) {
          state.userInfo.missed_words[language].push(word);
        }
      }
    },
    removeWordFromMissedWords: (
      state,
      action: PayloadAction<{ word: string }>
    ) => {
      if (state.userInfo && state.userInfo.missed_words) {
        const { word } = action.payload;

        // 从所有语言类别中移除该词
        Object.keys(state.userInfo.missed_words).forEach((lang) => {
          if (state.userInfo?.missed_words[lang]) {
            state.userInfo.missed_words[lang] = state.userInfo.missed_words[
              lang
            ].filter((w) => w !== word);

            // 如果该语言类别没有单词了，移除该类别
            if (state.userInfo.missed_words[lang].length === 0) {
              delete state.userInfo.missed_words[lang];
            }
          }
        });
      }
    },
    setIsLoginModalVisible: (state, action: PayloadAction<boolean>) => {
      state.isLoginModalVisible = action.payload;
    },
    setCurrentMissedWords: (state, action: PayloadAction<string[]>) => {
      state.currentMissedWords = action.payload;
    },
  },
});

export const {
  setUser,
  clearUser,
  setIsDictationStarted,
  setRepeatCount,
  resetRepeatCount,
  increaseRepeatCount,
  setDictationShortcutKeys,
  setDictationPlaybackSpeed,
  setDictationAutoRepeat,
  setLanguage,
  setIsSavingProgress,
  setMissedWords,
  addWordToMissedWords,
  removeWordFromMissedWords,
  setIsLoginModalVisible,
  setCurrentMissedWords,
} = userSlice.actions;
export default userSlice.reducer;
