import { createSlice } from "@reduxjs/toolkit";

import { Video } from "@/utils/type";
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
  },
});

export const { setVideos } = videoSlice.actions;
export default videoSlice.reducer;
