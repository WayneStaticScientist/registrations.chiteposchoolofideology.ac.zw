import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:9991/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/login")
    ) {
      originalRequest._retry = true;
      try {
        // Attempt to refresh token
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:9991/api/v1"}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        return api(originalRequest);
      } catch (err) {
        if (typeof window !== "undefined") {
          document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          window.location.href = "/login";
        }
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
