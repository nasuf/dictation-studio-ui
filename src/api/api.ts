import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4001";

// 创建一个 axios 实例
const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

// 添加请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const api = {
  getChannels: () => axiosInstance.get("/channel"),
  uploadChannels: (channels: {
    channels: Array<{ name: string; id: string; image_url: string }>;
  }) => axiosInstance.post("/channel", channels),
  getVideoList: (channelId: string) =>
    axiosInstance.get(`/video-list/${channelId}`),
  getVideoTranscript: (channelId: string, videoId: string) =>
    axiosInstance.get(`/video-transcript/${channelId}/${videoId}`),
  uploadVideos: (channelId: string, videoLinks: string[]) =>
    axiosInstance.post("/video-list", {
      channel_id: channelId,
      video_links: videoLinks,
    }),
  verifyGoogleToken: (token: string) =>
    axiosInstance.post("/verify-google-token", { token }),
};
