import { SettingsModal } from "../app/(admin)/settings/page";
import { apiClient } from "./base_api";

export const getSettings = async () => {
  try {
    const res = await apiClient.get(`/site-setting-api/find`);
    return res.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};

export const editSettings = async (settings: SettingsModal) => {
  try {
    const res = await apiClient.post(`/site-setting-api/update`, settings);
    return res.data;
  } catch (error) {
    console.error("Error adding or updating:", error);
    throw error;
  }
};
