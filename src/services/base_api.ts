import axios from "axios";
import { getSession } from "next-auth/react";

export const apiClient = axios.create({
  baseURL: "https://apiweb.bankings.vnrsoftware.vn",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm interceptor để lấy token động
apiClient.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session?.user?.access_token) {
      config.headers.Authorization = `Bearer ${session.user.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const httpClient = axios.create({
  baseURL: "https://apiweb.bankings.vnrsoftware.vn",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
