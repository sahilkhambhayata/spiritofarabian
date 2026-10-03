import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:1911/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Token if available
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("soa_auth_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Extract data payload & handle errors
api.interceptors.response.use(
  (response) => {
    return response.data?.data !== undefined ? response.data.data : response.data;
  },
  (error: AxiosError<{ message?: string; errors?: any[] }>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Unable to connect to the Maison server. Please try again.";
    
    // Log in development
    if (import.meta.env.DEV) {
      console.warn(`[API Error] ${error.config?.url}:`, message);
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
