import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import navigationReducer from "./navigationSlice";
import channelReducer from "./channelSlice";
import videoReducer from "./videoSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    navigation: navigationReducer,
    channel: channelReducer,
    video: videoReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
