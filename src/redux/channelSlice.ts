import { Channel } from "@/utils/type";
import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit";

interface ChannelState {
  channels: Channel[];
}

const initialState: ChannelState = {
  channels: [],
};

const channelSlice = createSlice({
  name: "channel",
  initialState,
  reducers: {
    setChannels: (state, action: PayloadAction<Channel[]>) => {
      state.channels = action.payload;
    },
  },
});

export const { setChannels } = channelSlice.actions;
export default channelSlice.reducer;
