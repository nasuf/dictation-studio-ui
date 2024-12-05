import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ShortcutKeys, UserInfo } from "@/utils/type";

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
    setMissedWords: (state, action: PayloadAction<string[]>) => {
      if (state.userInfo) {
        state.userInfo.missed_words = [...action.payload];
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
  setIsLoginModalVisible,
  setCurrentMissedWords,
} = userSlice.actions;
export default userSlice.reducer;
