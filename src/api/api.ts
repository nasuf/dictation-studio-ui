import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4001";

export const api = {
  getChannels: () => axios.get(`${API_BASE_URL}/api/channel`),
  uploadChannels: (channels: {
    channels: Array<{ name: string; id: string; image_url: string }>;
  }) => axios.post(`${API_BASE_URL}/api/channel`, channels),
  getVideoList: (channelId: string) =>
    axios.get(`${API_BASE_URL}/api/video-list/${channelId}`),
  getVideoTranscript: (channelId: string, videoId: string) =>
    axios.get(`${API_BASE_URL}/api/video-transcript/${channelId}/${videoId}`),
  uploadVideos: (channelId: string, videoLinks: string[]) =>
    axios.post(`${API_BASE_URL}/api/video-list`, {
      channel_id: channelId,
      video_links: videoLinks,
    }),
  verifyGoogleToken: (token: string) =>
    axios.post(`${API_BASE_URL}/api/verify-google-token`, { token }),
};
