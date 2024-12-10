import { ListTelegramIntegration } from "../app/(admin)/telegram_integration/page";
import { buildSearchParams } from "../utils/buildQueryParams";
import { apiClient } from "./base_api";

export const getListTelegramIntergration = async (
  pageIndex: number,
  pageSize: number,
  globalTerm?: string,
  searchTerms: Array<{ Name: string; Value: string }> = []
) => {
  try {
    const params = buildSearchParams(searchTerms, {
      pageIndex,
      pageSize,
      globalTerm: globalTerm || undefined,
    });
    const res = await apiClient.get(`/group-chat-api/map/find`, {
      params,
    });
    return res.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};

export const addTelegramIntergration = async (
  tele: ListTelegramIntegration
) => {
  try {
    const res = await apiClient.post(`/group-chat-api/map/add-or-update`, tele);
    return res.data;
  } catch (error) {
    console.error("Error adding or updating:", error);
    throw error;
  }
};

export const deleteTelegramIntergration = async (ids: number[]) => {
  try {
    const res = await apiClient.post(`/group-chat-api/map/delete`, ids);
    return res.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};
