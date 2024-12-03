import axios from "axios";
import {
  ProgressData,
  TranscriptItem,
  UserInfo,
  Video,
  Channel,
} from "@/utils/type";
import {
  JWT_ACCESS_TOKEN_KEY,
  JWT_REFRESH_TOKEN_KEY,
  USER_KEY,
} from "@/utils/const";
import { jwtDecode } from "jwt-decode";
import config from "@/config";
import { message } from "antd";
import { setUser } from "@/redux/userSlice";
import { store } from "@/redux/store";

export const UI_HOST = config.UI_HOST;
export const SERVICE_HOST = config.SERVICE_HOST;
const SERVICE_BASE_URL = `${SERVICE_HOST}${config.SERVICE_PATH}`;

const axiosInstance = axios.create({
  baseURL: `${SERVICE_BASE_URL}`,
});

async function refreshToken() {
  const refreshToken = localStorage.getItem(JWT_REFRESH_TOKEN_KEY);
  const response = await fetch(`${SERVICE_BASE_URL}/auth/refresh-token`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
  });
  const userInfo = await response.json();
  localStorage.setItem(USER_KEY, JSON.stringify(userInfo));
  store.dispatch(setUser(userInfo));
  const newAccessToken = response.headers.get("x-ds-access-token");
  if (!newAccessToken) {
    throw new Error("No access token in response headers");
  }
  localStorage.setItem(JWT_ACCESS_TOKEN_KEY, newAccessToken);
  return newAccessToken;
}

axiosInstance.interceptors.request.use(async (config) => {
  const accessToken = localStorage.getItem(JWT_ACCESS_TOKEN_KEY);
  if (accessToken) {
    const decodedToken = jwtDecode(accessToken);
    const currentTime = Date.now() / 1000;
    if (decodedToken.exp && decodedToken.exp - currentTime < 600) {
      message.info("Auto login...");
      const newToken = await refreshToken();
      config.headers["Authorization"] = `Bearer ${newToken}`;
      message.success("Auto login success!");
    } else {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
  }

  return config;
});

axiosInstance.interceptors.response.use((response) => {
  const access_token = response.headers["x-ds-access-token"];
  const refresh_token = response.headers["x-ds-refresh-token"];
  if (access_token) {
    localStorage.setItem(JWT_ACCESS_TOKEN_KEY, access_token);
  }
  if (refresh_token) {
    localStorage.setItem(JWT_REFRESH_TOKEN_KEY, refresh_token);
  }
  return response;
});

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
  updateUserPlan: (emails: string[], plan: string, duration?: number) =>
    axiosInstance.put("/auth/user/plan", { emails, plan, duration }),
  updateUserRole: (emails: string[], role: string) =>
    axiosInstance.put("/auth/user/role", { emails, role }),
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
  createStripeSession: (plan: string, duration: number, isRecurring: boolean) =>
    axiosInstance.post("/payment/create-session", {
      plan,
      duration,
      isRecurring,
    }),
  verifyPaymentSession: (sessionId: string) =>
    axiosInstance.post(`/payment/verify-session/${sessionId}`),
  saveMissedWords: (words: string[]) => {
    return axiosInstance.post("/user/missed-words", { words });
  },
  getMissedWords: () => axiosInstance.get("/user/missed-words"),
  deleteMissedWords: (words: string[]) =>
    axiosInstance.delete("/user/missed-words", { data: { words } }),
  cancelSubscription: () => axiosInstance.post("/payment/cancel-subscription"),
};
