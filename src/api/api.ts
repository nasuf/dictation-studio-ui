import axios from "axios";
import {
  ProgressData,
  TranscriptItem,
  UserInfo,
  Video,
  Channel,
} from "@/utils/type";
import { JWT_TOKEN_KEY, UNAUTHORIZED_EVENT } from "@/utils/const";

export const UI_HOST = "http://localhost:5173";
export const SERVICE_HOST = "http://localhost:4001";
const SERVICE_BASE_URL = `${SERVICE_HOST}/dictation-studio`;

// export const UI_HOST = "https://www.dictationstudio.com";
// export const SERVICE_HOST = "https://www.dictationstudio.com";
// const SERVICE_BASE_URL = `${SERVICE_HOST}/ds`;

const axiosInstance = axios.create({
  baseURL: `${SERVICE_BASE_URL}`,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(JWT_TOKEN_KEY);
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    const token = response.headers["x-ds-token"];
    if (token) {
      localStorage.setItem(JWT_TOKEN_KEY, token);
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
    }
    return Promise.reject(error);
  }
);

export const api = {
  getChannels: () => axiosInstance.get("/service/channel"),
  uploadChannels: (channels: { channels: Channel[] }) =>
    axiosInstance.post("/service/channel", channels),
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
  loadUserInfo: (email: string) => axiosInstance.get(`/auth/userinfo/${email}`),
  logout: () => axiosInstance.post("/auth/logout"),
  register: (
    username: string,
    email: string,
    password: string,
    avatar: string
  ) =>
    axiosInstance.post("/auth/register", { username, email, password, avatar }),

  login: (email: string, username: string, avatar: string) =>
    axiosInstance.post("/auth/login", { email, username, avatar }),
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
  saveUserConfig: (config: Partial<UserInfo>) =>
    axiosInstance.post("/user/config", config),
  getUserDuration: () => axiosInstance.get("/user/duration"),

  // Add these new methods for channel management
  updateChannel: (channelId: string, channelData: Partial<Channel>) =>
    axiosInstance.put(`/service/channel/${channelId}`, channelData),

  updateChannelVisibility: (channelId: string, visibility: string) =>
    axiosInstance.put(`/service/channel/${channelId}`, { visibility }),
  restoreTranscript: (channelId: string, videoId: string) =>
    axiosInstance.post(`/service/${channelId}/${videoId}/restore-transcript`),
  updateUserInfo: (userInfo: Partial<UserInfo>) => {
    return axiosInstance.post("/auth/userinfo", userInfo);
  },
};
