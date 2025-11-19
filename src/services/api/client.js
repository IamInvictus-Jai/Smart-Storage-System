// API client setup with axios
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // If the request payload is FormData, remove the default Content-Type so
  // the browser can set the correct multipart boundary header.
  // This prevents FormData from being sent with 'application/json' which
  // causes the backend to miss the `files` field.
  if (config.data instanceof FormData) {
    // Some environments use lowercase header keys; ensure we delete both.
    if (config.headers["Content-Type"]) delete config.headers["Content-Type"];
    if (config.headers["content-type"]) delete config.headers["content-type"];
  } else {
    // Ensure JSON requests have the right header
    config.headers["Content-Type"] =
      config.headers["Content-Type"] || "application/json";
  }

  return config;
});

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
