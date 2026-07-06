import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

// Request interceptor: attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    console.log("🔑 Token being sent:", token ? "Yes (present)" : "No (missing)");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If 401 error and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh");
      console.log("🔄 Attempting token refresh...");

      if (refreshToken) {
        try {
          const response = await axios.post(
            "http://127.0.0.1:8000/api/token/refresh/",
            { refresh: refreshToken }
          );

          const newAccessToken = response.data.access;
          localStorage.setItem("access", newAccessToken);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error("❌ Refresh token failed:", refreshError);
          // Refresh token expired or invalid - redirect to login
          localStorage.clear();
          window.location.href = "/";
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available - redirect to login
        console.error("❌ No refresh token available");
        localStorage.clear();
        window.location.href = "/";
        return Promise.reject(error);
      }
    }

    // If error is 401 and we already tried to refresh, redirect to login
    if (error.response?.status === 401) {
      console.error("❌ Unauthorized request (401)");
      // Don't redirect immediately for profile calls during initial load
      // This is handled in AuthContext
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;