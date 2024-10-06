import axios from "axios";
import { ProgressData, TranscriptItem, Video } from "@/utils/type";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4001";

const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/dictation-studio`,
});

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
  uploadVideos: async (formData: FormData) => {
    const response = await axiosInstance.post("/service/video-list", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  verifyGoogleToken: (token: string) =>
    axiosInstance.post("/auth/verify-google-token", { token }),
  refreshLoginStatus: () => axiosInstance.get("/auth/refresh-login-status"),
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

  getUserProgress: (channelId: string, videoId: string) =>
    axiosInstance.get(
      `/user/progress?channelId=${channelId}&videoId=${videoId}`
    ),
  getChannelProgress: (channelId: string) =>
    axiosInstance.get(`/user/progress/channel?channelId=${channelId}`),

  getAllUsers: () => axiosInstance.get("/user/all"),
  updateTranscript: async (
    channelId: string,
    videoId: string,
    index: number,
    transcriptItem: TranscriptItem
  ) => {
    const response = await axiosInstance.put(
      `/service/${channelId}/${videoId}/transcript`,
      { index, ...transcriptItem }
    );
    return response.data;
  },
  updateUserRole: (email: string, role: string) =>
    axiosInstance.put("/auth/user/role", { email, role }),
  updateFullTranscript: async (
    channelId: string,
    videoId: string,
    transcript: TranscriptItem[]
  ) => {
    const response = await axiosInstance.put(
      `/service/${channelId}/${videoId}/full-transcript`,
      { transcript }
    );
    return response.data;
  },
  getOriginalTranscript: (videoId: string) =>
    axiosInstance.get(`/service/video-transcript/air/${videoId}`),

  deleteVideo: (channelId: string, videoId: string) =>
    axiosInstance.delete(`/service/video-list/${channelId}/${videoId}`),

  updateVideo: (
    channelId: string,
    videoId: string,
    videoData: Partial<Video>
  ) =>
    axiosInstance.put(`/service/video-list/${channelId}/${videoId}`, videoData),

  getAllProgress: () => axiosInstance.get("/user/all-progress"),
  saveDictationTime: (channelId: string, videoId: string, time: number) =>
    axios.post(`/api/dictation/time`, { channelId, videoId, time }),
  saveUserConfig: (config: any) => axiosInstance.post("/user/config", config),
  getUserDuration: () => axiosInstance.get("/user/duration"),
};
