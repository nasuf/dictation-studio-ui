import { createSlice } from "@reduxjs/toolkit";

import { TranscriptItem, Video } from "@/utils/type";
import { PayloadAction } from "@reduxjs/toolkit";

interface VideoState {
  videos: { [key: string]: Video[] };
}

const initialState: VideoState = {
  videos: {},
};

const videoSlice = createSlice({
  name: "video",
  initialState,
  reducers: {
    setVideos: (
      state,
      action: PayloadAction<{ channelId: string; videos: Video[] }[]>
    ) => {
      action.payload.forEach(({ channelId, videos }) => {
        state.videos[channelId] = videos;
      });
    },
    setTranscript: (
      state,
      action: PayloadAction<{
        channelId: string;
        videoId: string;
        transcript: TranscriptItem[];
      }>
    ) => {
      state.videos[action.payload.channelId].find(
        (video) => video.video_id === action.payload.videoId
      )!.transcript = action.payload.transcript;
    },
  },
});

export const { setVideos, setTranscript } = videoSlice.actions;
export default videoSlice.reducer;
