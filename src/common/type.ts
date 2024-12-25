/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

export interface DataAseet {
  cashTotal: number;
  goldTotal: number;
  realEstateTotal: number;
  id: number;
  isDelete: boolean;
  createdBy: Date | null;
  createdDate: Date | null;
  modifiedBy: null;
  modifiedDate: Date | null;
}
export interface ResponsiveData<T> {
  success: boolean;
  message: string | null;
  messageCode: string | null;
  msgParams: string | null;
  code: 200;
  errors: string | null;
  data: T;
}
export interface ItemAssetType {
  title: string;
  quantity: number;
  type: number;
}

export interface AssetType {
  title: string;
  quantity?: number;
  type: number;
  handleClick?: (type: number) => void;
  active: number;
  isTitle?: boolean;
}

export interface QuantityType {
  quantity_in: number;
  quantity_out: number;
  remaining_balance: number;
}

export type Transaction1Props = {
  className?: string;
  color?: string;
} & React.SVGProps<SVGSVGElement>;

export interface ModalAddNewType {
  isAddModalOpen: boolean;
  onCancel: () => void;
  fetchData: ({ }) => void;
}

export interface AssetInventory {
  value: string;
  quantity: number;
  price: number | null;
  name: string;
}

export interface DataDetail {
  bankAccountId?: string | null;
  transType: string;
  purposeTrans?: string;
  type?: string;
  addedBy: string;
  managerBy: string;
  departmentManager: string;
  totalAmount?: number;
  price?: number | null;
  bankAccountNumber?: string | null;
  bankCode?: string | null;
  transDate: string; // ISO date format
  groupSystemId?: string | null;
  groupBranchId?: string | null;
  groupTeamId?: string | null;
  unit?: string | null;
  quantity?: number | null;
  amount?: number | null;
  assetInventories: AssetInventory[];
  descriptionTransType?: string;
  descriptionType?: string;
  descriptionPurposeTrans?: string;
  id: number;
  isDelete?: boolean;
  createdBy?: string | null;
  createdDate?: string; // ISO date format
  modifiedBy?: string | null;
  modifiedDate?: string; // ISO date format
  note?: string | null;
  descriptionPaymentType?: string | null;
}
export interface ModalDetailType {
  isShowDetail: boolean;
  onCancel: () => void;
  dataDetail?: DataDetail;
}

export interface FormMoneyType {
  onCancel: () => void;
  fetchData: ({ }) => void;
  banks?: any;
}

export interface FaceValueType {
  cdName: string;
  cdType: string;
  cdVal: string;
  createdBy: Date | null;
  createdDate: Date | null;
  id: number;
  isDelete: boolean;
  modifiedBy: Date | null;
  modifiedDate: Date | null;
  vnContent: string;
}
export interface ItemFaceValueType {
  value: string;
  label: string;
}

export interface ItemFaceValueChooseType {
  value: string;
  label?: string;
  quantity: number;
  price: number;
}

export interface TypeAsset {
  key: string;
  value: number;
  amount?: number;
}

export interface ChartAssetType {
  cashChart: TypeAsset[] | null;
  goldChart: TypeAsset[] | null;
  realEstateChart: TypeAsset[] | null;
}

export interface TransactionType {
  totalAmountOut: number;
  totalAmountIn: number;
  balance: number;
  month: number;
}

export interface AssetInventory {
  value: string;
  quantity: number;
  price: number | null;
  name: string;
}

export interface DataTransactionType {
  bankAccountId: number;
  transType: string;
  purposeTrans: string;
  type: string;
  addedBy: string;
  managerBy: string;
  departmentManager: string;
  totalAmount: number;
  price: number | null;
  bankAccountNumber: string | null;
  bankCode: string;
  transDate: string; // ISO string format
  groupSystemId: number | null;
  groupBranchId: number | null;
  groupTeamId: number | null;
  unit: string | null;
  quantity: number | null;
  amount: number | null;
  assetInventories: AssetInventory[];
  id: number;
  isDelete: boolean;
  createdBy: string | null;
  createdDate: string; // ISO string format
  modifiedBy: string | null;
  modifiedDate: string; // ISO string format
}

export interface DataRoleType {
  key: string | null;
  value: number | null;
  accountId: number | null;
  groupSystemId: number | null;
  groupBranchId: number | null;
  groupTeamId: number | null;
  groupSystemName: string | null;
  groupBranchName: string | null;
  groupTeamName: string | null;
  isAdmin: boolean;
  groupTeamNamegroupBranchName: string | null;
}

export interface RoleContextType {
  dataRole: {
    key: string | null;
    value: number | null;
    accountId: number | null;
    groupSystemId: number | null;
    groupBranchId: number | null;
    groupTeamId: number | null;
    groupSystemName: string | null;
    groupTeamNamegroupBranchName: string | null;
    groupTeamName: string | null;
    isAdmin: boolean;
    groupBranchName: string | null;
  };
  getRoleByAccount: () => void;
}
