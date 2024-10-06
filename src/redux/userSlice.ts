import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ShortcutKeys, UserInfo } from "@/utils/type";

interface UserState {
  userInfo: UserInfo | null;
  isDictationStarted: boolean;
  repeatCount: number;
}

const initialState: UserState = {
  userInfo: null,
  isDictationStarted: false,
  repeatCount: 0,
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
      if (state.userInfo) {
        state.userInfo.dictation_config.playback_speed = action.payload;
      }
    },
    setDictationAutoRepeat: (state, action: PayloadAction<number>) => {
      if (state.userInfo) {
        state.userInfo.dictation_config.auto_repeat = action.payload;
      }
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
} = userSlice.actions;
export default userSlice.reducer;
