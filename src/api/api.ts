import axios from "axios";
import {
  ProgressData,
  TranscriptItem,
  UserInfo,
  Video,
  Channel,
} from "@/utils/type";
import { JWT_ACCESS_TOKEN_KEY, JWT_REFRESH_TOKEN_KEY } from "@/utils/const";
import { jwtDecode } from "jwt-decode";
import config from "@/config";
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
      const newToken = await refreshToken();
      config.headers["Authorization"] = `Bearer ${newToken}`;
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
  getChannels: (visibility: string, language: string) =>
    axiosInstance.get("/service/channel", { params: { visibility, language } }),
  uploadChannels: (channels: { channels: Channel[] }) =>
    axiosInstance.post("/service/channel", channels),
  getVideoList: (channelId: string, visibility: string, language?: string) =>
    axiosInstance.get(`/service/video-list/${channelId}`, {
      params: { visibility, language },
    }),
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
  batchUpdateTranscripts: async (
    channelId: string,
    videos: Array<{ video_id: string; transcript: TranscriptItem[] }>
  ) => {
    const response = await axiosInstance.put(
      `/service/${channelId}/batch-transcript-update`,
      { videos }
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
    updatedFields: Partial<Video>
  ) =>
    axiosInstance.put(
      `/service/video-list/${channelId}/${videoId}`,
      updatedFields
    ),

  getAllProgress: () => axiosInstance.get("/user/all-progress"),
  saveUserConfig: (config: Partial<UserInfo>) =>
    axiosInstance.post("/user/config", config),
  getUserDuration: () => axiosInstance.get("/user/duration"),

  updateChannel: (channelId: string, updatedFields: Partial<Channel>) =>
    axiosInstance.put(`/service/channel/${channelId}`, updatedFields),

  updateChannelVisibility: (channelId: string, visibility: string) =>
    axiosInstance.put(`/service/channel/${channelId}`, { visibility }),
  updateChannelLanguage: (channelId: string, language: string) =>
    axiosInstance.put(`/service/channel/${channelId}`, { language }),
  restoreTranscript: async (channelId: string, videoId: string) => {
    const response = await axiosInstance.post(
      `/service/${channelId}/${videoId}/restore-transcript`
    );
    return response.data;
  },
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
  generateVerificationCode: (duration: string) => {
    return axiosInstance.post("/payment/generate-code", { duration });
  },
  verifyMembershipCode: (code: string) => {
    return axiosInstance.post("/payment/verify-code", { code });
  },
  getAllVerificationCodes: () => {
    return axiosInstance.get("/payment/verification-codes");
  },
  assignVerificationCode: (code: string, userEmail: string) => {
    return axiosInstance.post("/payment/assign-code", { code, userEmail });
  },
  generateCustomVerificationCode: (days: number) => {
    return axiosInstance.post("/payment/generate-custom-code", { days });
  },

  // ZPAY payment APIs
  createZPayOrder: (plan: string, duration: number, payType: string) =>
    axiosInstance.post("/payment/zpay/create-order", {
      plan,
      duration,
      payType,
    }),
  getZPayOrderStatus: (orderId: string) =>
    axiosInstance.get(`/payment/zpay/order-status/${orderId}`),
  getZPayUserOrders: () => axiosInstance.get("/payment/zpay/orders"),
  updateUserDuration: (emails: string[], duration: number) => {
    return axiosInstance.post("/user/update-duration", { emails, duration });
  },
  checkDictationQuota: (channelId: string, videoId: string) => {
    return axiosInstance.get(`/user/dictation_quota`, {
      params: { channelId, videoId },
    });
  },
  registerDictationVideo: (channelId: string, videoId: string) => {
    return axiosInstance.post(`/user/register_dictation`, {
      channelId,
      videoId,
    });
  },
  getChannelRecommendations: () =>
    axiosInstance.get("/user/channel-recommendations"),

  submitChannelRecommendation: (recommendationData: {
    link: string;
    language: string;
    name: string;
  }) => axiosInstance.post("/user/channel-recommendations", recommendationData),

  getAllChannelRecommendations: () =>
    axiosInstance.get("/user/channel-recommendations/admin"),

  updateChannelRecommendation: (
    recommendationId: string,
    updateData: {
      status?: "pending" | "approved" | "rejected";
      name?: string;
      imageUrl?: string;
      channelId?: string;
      visibility?: string;
      link?: string;
      language?: string;
      reason?: string;
    }
  ) =>
    axiosInstance.put(
      `/user/channel-recommendations/${recommendationId}`,
      updateData
    ),

  // Feedback related APIs
  getFeedbackMessages: (userEmail?: string) =>
    axiosInstance.get("/user/feedback", { params: { userEmail } }),

  submitFeedback: (formData: FormData) =>
    axiosInstance.post("/user/feedback", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  getAllFeedbackUserList: () => axiosInstance.get("/user/feedback/admin/list"),
  replyFeedback: (
    userEmail: string,
    data: { response: string; images?: File }
  ) => {
    const formData = new FormData();
    formData.append("email", userEmail);
    formData.append("response", data.response);
    if (data.images) {
      formData.append("images", data.images);
    }
    return axiosInstance.post(`/user/feedback/admin`, formData);
  },
  getZPayPaymentHistory: () => axiosInstance.get("/payment/zpay/history"),
  batchRestoreTranscripts: async (
    channelId: string,
    videos: Array<{ video_id: string }>
  ) => {
    const response = await axiosInstance.put(
      `/service/${channelId}/batch-restore-transcripts`,
      { videos }
    );
    return response.data;
  },
  getTranscriptSummary: async (channelId: string) => {
    const response = await axiosInstance.get(
      `/service/${channelId}/transcript-summary`
    );
    return response.data;
  },
  batchUpdateVideoVisibility: async (channelId: string, visibility: string) => {
    const response = await axiosInstance.put(
      `/service/${channelId}/batch-visibility-update`,
      { visibility }
    );
    return response.data;
  },

  // Transcript filter related APIs
  saveTranscriptFilters: async (channelId: string, filters: string[]) => {
    const response = await axiosInstance.post(
      `/service/${channelId}/transcript-filters`,
      { filters }
    );
    return response.data;
  },

  getTranscriptFilters: async (channelId: string) => {
    const response = await axiosInstance.get(
      `/service/${channelId}/transcript-filters`
    );
    return response.data;
  },

  batchApplyFilters: async (
    channelId: string,
    videoIds: string[],
    filters: string[]
  ) => {
    const response = await axiosInstance.post(
      `/service/${channelId}/batch-apply-filters`,
      { video_ids: videoIds, filters }
    );
    return response.data;
  },

  // Single video apply filters
  applySingleVideoFilters: async (
    channelId: string,
    videoId: string,
    filters: string[]
  ) => {
    const response = await axiosInstance.post(
      `/service/${channelId}/${videoId}/apply-filters`,
      { filters }
    );
    return response.data;
  },

  // Video error report APIs
  submitVideoErrorReport: (reportData: {
    channelId: string;
    channelName?: string;
    videoId: string;
    videoTitle: string;
    errorType: string;
    description: string;
  }) => axiosInstance.post("/user/video-error-reports", reportData),

  getVideoErrorReports: (channelId?: string, videoId?: string) =>
    axiosInstance.get("/user/video-error-reports", {
      params: { channelId, videoId },
    }),

  getAllVideoErrorReports: () =>
    axiosInstance.get("/user/video-error-reports/admin"),

  updateVideoErrorReportStatus: (
    reportId: string,
    data: {
      status: string;
      adminResponse?: string;
    }
  ) => axiosInstance.put(`/user/video-error-reports/${reportId}`, data),
};
