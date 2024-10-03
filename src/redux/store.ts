import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import navigationReducer from "./navigationSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    navigation: navigationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
