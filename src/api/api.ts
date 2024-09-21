import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4001";

export const api = {
  getChannels: () => axios.get(`${API_BASE_URL}/api/channel`),
};
