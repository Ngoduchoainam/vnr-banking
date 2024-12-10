import { apiClient } from "./base_api";
import { BankAccounts } from "../component/modal/modalBankAccount";
import axios from "axios";
import { buildSearchParams } from "../utils/buildQueryParams";

// Hàm để lấy danh sách tài khoản ngân hàng
export const fetchBankAccounts = async (
  pageIndex: number,
  pageSize: number,
  globalTerm?: string,
  searchTerms: Array<{ Name: string; Value: string }> = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
  try {
    const params = await buildSearchParams(searchTerms, {
      pageIndex,
      pageSize,
      globalTerm: globalTerm || undefined,
    });
    const response = await apiClient.get(`/bank-account-api/find`, {
      params,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Error fetching bank accounts:",
        error.response?.data || error.message
      );
    } else {
      console.error("Unexpected error:", (error as Error).message);
    }
    throw error;
  }
};

// API thêm mới, cập nhật tài khoản ngân hàng
export const addBankAccounts = async (accountData: BankAccounts) => {
  try {
    const res = await apiClient.post(
      `/bank-account-api/add-or-update`,
      accountData
    );
    return res.data;
  } catch (error) {
    console.error("Error adding or updating bank account:", error);
    throw error;
  }
};

export const getBank = async (
  pageIndex: number,
  pageSize: number,
  searchTerms: Array<{ Name: string; Value: string }> = []
) => {
  try {
    const params = buildSearchParams(searchTerms, {
      pageIndex,
      pageSize,
      // globalTerm: globalTerm || undefined,
    });
    const res = await apiClient.get(`/bank-api/find`, {
      params,
    });
    return res.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};

export const deleteBankAccount = async (ids: number[]) => {
  try {
    const res = await apiClient.post(`/bank-account-api/delete`, ids);
    return res.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    throw error;
  }
};

export const getTypeAsset = async (params: {
  cdType: string;
  cdName: string;
}) => {
  try {
    const res = await apiClient.get(`/allcode-api/find`, {
      params: {
        cdType: params.cdType,
        cdName: params.cdName,
      },
    });
    return res.data.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
  }
};
