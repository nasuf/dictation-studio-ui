import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import navigationReducer from "./navigationSlice";
import videoProgressReducer from "./videoProgressSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    navigation: navigationReducer,
    videoProgress: videoProgressReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
