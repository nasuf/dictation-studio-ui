import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface NavigationState {
  channelName: string;
  videoName: string;
}

const initialState: NavigationState = {
  channelName: "",
  videoName: "",
};

const navigationSlice = createSlice({
  name: "navigation",
  initialState,
  reducers: {
    setChannelName: (state, action: PayloadAction<string>) => {
      state.channelName = action.payload;
    },
    setVideoName: (state, action: PayloadAction<string>) => {
      state.videoName = action.payload;
    },
    resetNavigation: (state) => {
      state.channelName = "";
      state.videoName = "";
    },
  },
});

export const { setChannelName, setVideoName, resetNavigation } =
  navigationSlice.actions;
export default navigationSlice.reducer;
