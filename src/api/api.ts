import axios from "axios";
import { ProgressData } from "@/utils/type";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4001";

// 创建一个 axios 实例
const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/daily-dictation`,
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
  getChannels: () => axiosInstance.get("/service/channel"),
  uploadChannels: (channels: {
    channels: Array<{ name: string; id: string; image_url: string }>;
  }) => axiosInstance.post("/service/channel", channels),
  getVideoList: (channelId: string) =>
    axiosInstance.get(`/service/video-list/${channelId}`),
  getVideoTranscript: (channelId: string, videoId: string) =>
    axiosInstance.get(`/service/video-transcript/${channelId}/${videoId}`),
  uploadVideos: (channelId: string, videoLinks: string[]) =>
    axiosInstance.post("/service/video-list", {
      channel_id: channelId,
      video_links: videoLinks,
    }),
  verifyGoogleToken: (token: string) =>
    axiosInstance.post("/auth/verify-google-token", { token }),
  checkLogin: () => axiosInstance.get("/auth/check-login"),
  logout: () => axiosInstance.post("/auth/logout"),
  register: (
    username: string,
    email: string,
    password: string,
    avatar: string
  ) =>
    axiosInstance.post("/auth/register", { username, email, password, avatar }),

  login: (username_or_email: string, password: string) =>
    axiosInstance.post("/auth/login", { username_or_email, password }),
  checkEmail: (email: string) =>
    axiosInstance.post("/auth/check-email", { email }),

  saveProgress: (progressData: ProgressData) =>
    axiosInstance.post("/user/progress", progressData),
};
