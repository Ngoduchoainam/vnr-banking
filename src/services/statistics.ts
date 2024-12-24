import { buildSearchParams } from "../utils/buildQueryParams";
import { apiClient } from "./base_api";

export const getListStatistics = async (
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

    console.log(17, params);
    const res = await apiClient.get(`/transaction-api/find-transaction`, {
      params,
    });
    return res.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};

export const getDetailCurentBalance = async (
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
    const res = await apiClient.get(`/transaction-api/find-balance-account`, {
      params,
    });
    return res.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};

export const getDataGenaral = async (
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
    const res = await apiClient.get(`/transaction-api/find-genaral`, {
      params,
    });
    return res.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};

export const getTransactionById = async (id: number) => {
  try {
    const res = await apiClient.get(`/transaction-api/find-by-id?id=${id}`);
    return res.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};

export const resendSheet = async (transId: number, sheetMapId: number) => {
  try {
    const res = await apiClient.get(`/transaction-api/resend-sheet`, {
      params: {
        transId: transId,
        sheetMapId: sheetMapId,
      },
      timeout: 30000,
    });
    return res.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};
