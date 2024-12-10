export interface BankAccounts {
  bankId?: number;
  accountNumber?: string;
  fullName?: string;
  bankName?: string;
  phoneId?: number;
  notes?: string;
  transactionSource?: string;
  typeAccount?: string;
  bank?: {
    fullName?: string;
    code?: string;
    notes?: string;
    id?: number;
  };
  phone?: {
    number?: string;
    com?: string;
    id?: number;
  };
  typeGroupAccount?: [];
  typeGroupAccountString?: string;
  typeAccountDescription?: string;
  id: number;
  selectedAccountGroups?: number[];
  groupSystemId?: number;
  groupBranchId?: number;
  groupTeamId?: number;
  groupSystem: {
    name: string;
    id: number;
  };
  groupBranch: {
    name: string;
    id: number;
  };
  groupTeam: {
    name: string;
    id: number;
  };
}
