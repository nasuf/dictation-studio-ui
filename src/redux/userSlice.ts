import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserInfo } from "@/utils/type";

interface UserState {
  userInfo: UserInfo | null;
  isDictationStarted: boolean;
}

const initialState: UserState = {
  userInfo: null,
  isDictationStarted: false,
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
  },
});

export const { setUser, clearUser, setIsDictationStarted } = userSlice.actions;
export default userSlice.reducer;
