import { DataTelegramModal } from "../app/(admin)/telegram/page";
import { buildSearchParams } from "../utils/buildQueryParams";
import { apiClient } from "./base_api";

export const getListTelegram = async (
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
    const res = await apiClient.get(`/group-chat-api/find`, {
      params,
    });
    return res.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};

export const addTelegram = async (tele: DataTelegramModal) => {
  try {
    const res = await apiClient.post(`/group-chat-api/add-or-update`, tele, {
      timeout: 30000,
    });
    return res.data;
  } catch (error) {
    console.error("Error adding or updating:", error);
    throw error;
  }
};

export const deleteTelegram = async (ids: number[]) => {
  try {
    const res = await apiClient.post(`/group-chat-api/delete`, ids);
    return res.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};

export const getTransType = async (
  bankAccountId: number,
  groupId: number,
  id?: number
) => {
  try {
    const res = await apiClient.get(`/group-chat-api/map/get-trans-type`, {
      params: { bankAccountId, groupId, id },
    });
    return res.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};
