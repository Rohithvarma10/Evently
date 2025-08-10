import axios from "axios";

export const API_BASE = "http://localhost:3000";

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
