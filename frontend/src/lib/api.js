import axios from "axios";

export const API_BASE =
  "https://5bec41ab-8071-4f15-8f8e-863807d07b11-00-2a0a15julymht.janeway.replit.dev";

// Create an axios instance
const api = axios.create({
  baseURL: API_BASE,
});

// Add a request interceptor to attach the token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
