import axios from "axios";
import { getSession } from "next-auth/react";
import Cookies from 'js-cookie';

export const apiClient = axios.create({
  baseURL: "https://apisms.bankings.vnrsoftware.vn/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

const CACHE_KEY_SESSION = "sessionCache";

// Thêm interceptor để lấy token động
apiClient.interceptors.request.use(
  async (config) => {
    let session;

    const cache = Cookies.get(CACHE_KEY_SESSION);
    if (cache) {
      const parsedCache = JSON.parse(cache);
      if (Date.now() < parsedCache.expiresAt) {
        session = parsedCache.data;
      }
      else {
        session = await getSession();
      }
    }
    else {
      session = await getSession();
    }

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
  baseURL: "https://apisms.bankings.vnrsoftware.vn/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
