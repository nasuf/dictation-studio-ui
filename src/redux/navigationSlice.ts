import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LANGUAGES } from "@/utils/const";

interface NavigationState {
  channelName: string;
  videoName: string;
  selectedLanguage: string;
}

const initialState: NavigationState = {
  channelName: "",
  videoName: "",
  selectedLanguage: LANGUAGES.All,
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
    setSelectedLanguage: (state, action: PayloadAction<string>) => {
      state.selectedLanguage = action.payload;
    },
    resetNavigation: (state) => {
      state.channelName = "";
      state.videoName = "";
      // Keep selected language unchanged when resetting navigation
    },
  },
});

export const {
  setChannelName,
  setVideoName,
  setSelectedLanguage,
  resetNavigation,
} = navigationSlice.actions;
export default navigationSlice.reducer;
