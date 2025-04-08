import axios, { InternalAxiosRequestConfig } from "axios";
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // Ensure this is set in .env.local
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Automatically attach token to all requests
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
