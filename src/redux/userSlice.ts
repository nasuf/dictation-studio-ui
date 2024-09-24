import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Page, UserInfo } from "@/utils/type";

interface UserState {
  userInfo: UserInfo | null;
  isDictationStarted: boolean;
  page: Page;
}

const initialState: UserState = {
  userInfo: null,
  isDictationStarted: false,
  page: Page.MAIN, // 确保初始值是 Page.MAIN
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
    setPage: (state, action: PayloadAction<Page>) => {
      state.page = action.payload;
    },
  },
});

export const { setUser, clearUser, setIsDictationStarted, setPage } =
  userSlice.actions;
export default userSlice.reducer;
