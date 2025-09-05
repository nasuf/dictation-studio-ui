import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Video, Channel } from "@/utils/type";

interface VideoProgressState {
  videoProgress: { [channelId: string]: { [videoId: string]: number } };
  videos: { [channelId: string]: Video[] };
  channels: Channel[];
}

const initialState: VideoProgressState = {
  videoProgress: {},
  videos: {},
  channels: [],
};

const videoProgressSlice = createSlice({
  name: "videoProgress",
  initialState,
  reducers: {
    setChannelProgress: (
      state,
      action: PayloadAction<{
        channelId: string;
        progress: { [videoId: string]: number };
      }>
    ) => {
      const { channelId, progress } = action.payload;
      state.videoProgress[channelId] = progress;
    },
    setChannelVideos: (
      state,
      action: PayloadAction<{
        channelId: string;
        videos: Video[];
      }>
    ) => {
      const { channelId, videos } = action.payload;
      state.videos[channelId] = videos;
    },
    setChannels: (state, action: PayloadAction<Channel[]>) => {
      state.channels = action.payload;
    },
    setChannelData: (
      state,
      action: PayloadAction<{
        channelId: string;
        videos: Video[];
        progress: { [videoId: string]: number };
      }>
    ) => {
      const { channelId, videos, progress } = action.payload;
      state.videos[channelId] = videos;
      state.videoProgress[channelId] = progress;
    },
    clearChannelData: (state, action: PayloadAction<string>) => {
      const channelId = action.payload;
      delete state.videoProgress[channelId];
      delete state.videos[channelId];
    },
    clearAllData: (state) => {
      state.videoProgress = {};
      state.videos = {};
      state.channels = [];
    },
  },
});

export const {
  setChannelProgress,
  setChannelVideos,
  setChannels,
  setChannelData,
  clearChannelData,
  clearAllData,
} = videoProgressSlice.actions;

export default videoProgressSlice.reducer;