"use client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as React from "react";
import {
  Button,
  Form,
  Input,
  Select,
  Space,
  Radio,
  Spin
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import BaseModal from "@/src/component/config/BaseModal";
import {
  addBankAccounts,
  deleteBankAccount,
  fetchBankAccounts,
  getBank,
} from "@/src/services/bankAccount";
import { BankAccounts } from "@/src/component/modal/modalBankAccount";
import { getListPhone } from "@/src/services/phone";
import { getAccountGroup } from "@/src/services/accountGroup";
import { getGroupSystem } from "@/src/services/groupSystem";
import { getBranchSystem } from "@/src/services/branchSystem";
import { getGroupTeam } from "@/src/services/groupTeam";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import DeleteModal from "@/src/component/config/modalDelete";
import { RoleContext } from "@/src/component/RoleWapper";
import CustomSelect from "@/src/component/CustomSelect";
import LoadingTable from "@/src/component/LoadingTable";

interface FilterGroupAccount {
  Name: string;
  Value: string;
}

const accountTypeOptions = [
  { value: "1", label: "Tài khoản công ty" },
  { value: "2", label: "Tài khoản marketing" },
];

interface OptionTeam {
  label?: string;
  value?: number;
}

interface Option {
  groupSystemId?: number;
  label?: string;
  value?: number;
}

interface OptionBranch {
  groupBranchId?: number;
  label?: string;
  value?: number;
}

interface OptionAccountGroup {
  selectedAccountGroups?: number;
  label?: string;
  value?: number;
}

interface OptionPhone {
  phoneId?: number;
  label?: string;
  value?: number;
}

interface FilterProducts {
  Name: string;
  Value: any;
}

const Account = () => {
  const [form] = Form.useForm();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<BankAccounts | null>(
    null
  );
  const [selectedAccountType, setSelectedAccountType] = useState("");
  const handleAccountTypeChange = (value: any) => {
    setSelectedAccountType(value);
  };
  const [dataAccount, setDataAccount] = useState<BankAccounts[]>([]);
  const [banks, setBanks] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState<Array<OptionPhone>>([]);
  const [groupSystem, setGroupSystem] = useState<Array<Option>>([]);
  const [branchSystem, setBranchSystem] = useState<Array<OptionBranch>>([]);
  const [groupTeam, setGroupTeam] = useState<Array<OptionTeam>>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(20);
  const [value, setValue] = useState("");
  const [globalTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [, setIsEditMode] = useState(false);
  const [accountGroup, setAccountGroup] = useState<Array<OptionAccountGroup>>([]);
  const [totalRecord, setTotalRecord] = useState(100);
  const [isLoading, setIsLoading] = useState(false);

  const [isAddAccount, setIsAddAccount] = useState<boolean>(false);

  const [bankId, setBankId] = useState();
  const [bankAccountId, setBankAccountId] = useState();

  const { dataRole } = React.useContext(RoleContext);
  const keys = dataRole.key;
  const values = `${dataRole.value}`;
  //
  const groupSystemId = dataRole.groupSystemId;
  //
  const groupBranchId = dataRole.groupBranchId;
  //................................................//
  const defaultGroupSystemId = dataRole.groupSystemId;
  const defaultGroupSystemName = dataRole.groupSystemName;
  //
  const defaultGroupBranchId = dataRole.groupBranchId;
  const defaultGroupBranchName = dataRole.groupBranchName;
  //
  const defaultGroupTeamId = dataRole.groupTeamId;
  const defaultGroupTeamName = dataRole.groupTeamName;

  const isFetchingRef = useRef(false);

  const handleScroll = () => {
    const scrollPosition = window.scrollY + window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollPosition >= documentHeight && !isFetchingRef.current) {
      isFetchingRef.current = true;
      setPageIndex((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (pageIndex > 1 && dataAccount.length < totalRecord) {
      const scrollPositionBeforeFetch = window.scrollY;

      fetchAccounts(bankId, bankAccountId, groupAccountFilter).finally(() => {
        setTimeout(() => {

          window.scrollTo(0, scrollPositionBeforeFetch + scrollPositionBeforeFetch / 10);
          isFetchingRef.current = false;
        }, 0);
      });
    }
  }, [pageIndex]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    handleDataDefault();
  }, []);

  // API để lấy ra dsach tài khoản
  const fetchAccounts = async (
    selectedBankId?: string,
    bankAccountId?: string,
    searchTerms?: string,
    pageIndexFilter?: number
  ) => {
    const arrBankAccount: FilterGroupAccount[] = [];
    const addedParams = new Set();
    if (searchTerms && !addedParams.has("groupAccountId")) {
      arrBankAccount.push({
        Name: "groupAccountId",
        Value: searchTerms,
      });
      addedParams.add("groupAccountId");
    }

    if (selectedBankId && !addedParams.has("bankId")) {
      arrBankAccount.push({
        Name: "bankId",
        Value: selectedBankId,
      });

      addedParams.add("bankId");
    }

    if (Array.isArray(bankAccountId) && bankAccountId.length > 0 && !addedParams.has("bankAccountId")) {
      arrBankAccount.push({
        Name: "id",
        Value: bankAccountId,
      });

      addedParams.add("id");
    }

    arrBankAccount.push({
      Name: keys!,
      Value: values,
    });
    addedParams.add(keys!);
    setLoading(true);
    if (pageIndex > 1) {
      setIsLoading(true)
    }
    try {
      const response = await fetchBankAccounts(
        pageIndexFilter || pageIndex,
        pageSize,
        globalTerm,
        arrBankAccount
      );

      const formattedData =
        response?.data?.source?.map((account: BankAccounts) => ({
          id: account.id,
          bank: account.bank?.code,
          accountNumber: account.accountNumber,
          fullName: account.fullName,
          phone: account.phone?.number,
          phoneId: account.phoneId,
          selectedAccountGroups: account.typeGroupAccount,
          typeAccount: account.typeAccount,
          notes: account.notes,
          bankId: account.bankId,
          groupSystemId: account.groupSystemId,
          groupBranchId: account.groupBranchId,
          groupTeamId: account.groupTeamId,
          transactionSource: account.transactionSource,
          groupSystem: account.groupSystem,
          groupBranch: account.groupBranch,
          groupTeam: account.groupTeam,
          typeAccountDescription: account.typeAccountDescription,
          typeGroupAccountString: account.typeGroupAccountString,
          groupSystemName: account.groupSystem?.name,
          groupBranchName: account.groupBranch?.name,
          groupTeamName: account.groupTeam?.name,
          bankName: account.bank?.fullName,
        })) || [];

      setTotalRecord(response?.data?.totalRecords || 0);

      setDataAccount((prevData) => [...prevData, ...formattedData]);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tài khoản ngân hàng:", error);
      setDataAccount([]);
    } finally {
      setLoading(false);
      setIsLoading(false)
    }
  };

  const fetchBankData = async () => {
    try {
      const bankData = await getBank(1, 100);
      const formattedBanks =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        bankData?.data?.source?.map((bank: any) => ({
          value: bank.id,
          label: bank.code + " - " + bank.fullName || "Không xác định",
        })) || [];
      setBanks(formattedBanks);
    } catch (error) {
      console.error("Error fetching banks:", error);
    }
  };

  const getListPhoneNumber = async () => {
    try {
      const phone = await getListPhone(1, 100);

      const res = phone?.data?.source?.map((x: any) => ({
        value: x.id,
        label: x.number || "Không xác định",
        phoneId: x.id,
      }));
      setPhoneNumber(res);
    } catch (error) {
      console.error(error);
    }
  };

  const getListAccountGroup = async () => {
    const arrAccountGroup: FilterGroupAccount[] = [];
    const addedParams = new Set<string>();
    arrAccountGroup.push({
      Name: keys!,
      Value: values,
    });
    addedParams.add(keys!);
    try {
      const accountGroup = await getAccountGroup(
        1,
        100,
        globalTerm
      );

      const res = accountGroup?.data?.source?.map((x: any) => ({
        value: x.id,
        label: x.fullName || "Không xác định",
        selectedAccountGroups: x.id,
      }));
      console.log(res, "res");

      setAccountGroup(res);
    } catch (error) {
      console.error(error);
    }
  };


  const getGroupSystems = async () => {
    const arrAccountGroup: FilterGroupAccount[] = [];
    const addedParams = new Set<string>();
    arrAccountGroup.push({
      Name: keys!,
      Value: values,
    });
    addedParams.add(keys!);
    try {
      const getSystem = await getGroupSystem(
        1,
        100,
        globalTerm,
        arrAccountGroup
      );

      const res = getSystem?.data?.source?.map((x: any) => ({
        value: x.id,
        label: x.name || "Không xác định",
        groupSystemId: x.id,
      }));
      setGroupSystem(res);
    } catch (error) {
      console.error(error);
    }
  };

  const getBranchSystems = async (groupSystemId?: number) => {
    const arr: any[] = [];
    const addedParams = new Set<string>();
    if (groupSystemId && !addedParams.has("groupSystemId")) {
      arr.push({
        Name: "groupSystemId",
        Value: groupSystemId || 0,
      });
      addedParams.add("groupSystemId");
    }
    arr.push({
      Name: keys!,
      Value: values,
    });
    addedParams.add(keys!);
    try {
      const getBranch = await getBranchSystem(
        1,
        100,
        globalTerm,
        arr
      );

      const res = getBranch?.data?.source?.map((x: any) => ({
        value: x.id,
        label: x.name || "Không xác định",
        groupBranchId: x.id,
      }));
      setBranchSystem(res);
    } catch (error) {
      console.error(error);
    }
  };

  const getGroupTeams = async (groupBranchId?: number) => {
    const arr: any[] = [];
    const addedParams = new Set<string>();
    if (groupBranchId && !addedParams.has("groupBranchId")) {
      arr.push({
        Name: "groupBranchId",
        Value: groupBranchId || 0,
      });
      addedParams.add("groupBranchId");
    }
    arr.push({
      Name: keys!,
      Value: values,
    });
    addedParams.add(keys!);
    try {
      const groupTeams = await getGroupTeam(
        1,
        100,
        globalTerm,
        arr
      );
      const res = groupTeams?.data?.source?.map((x: any) => ({
        value: x.id,
        label: x.name || "Không xác định",
      }));
      setGroupTeam(res);
    } catch (error) {
      console.log(error);
    }
  };

  const defaultModalAdd = () => {
    form.setFieldsValue({
      groupSystemId: defaultGroupSystemId,
      groupBranchId: defaultGroupBranchId,
      groupTeamId: defaultGroupTeamId,
      groupSystemName: defaultGroupSystemName,
      groupBranchName: defaultGroupBranchName,
      groupTeamName: defaultGroupTeamName,
    });
  };

  const ClearFilter = () => {
    setBankId(undefined);
    setBankAccountId(undefined);
    setGroupAccountFilter(undefined);
  }

  const handleAddConfirm = async (isAddAccount: boolean) => {
    const formData = await form.validateFields();

    try {
      await form.validateFields();
      setIsAddAccount(isAddAccount);

      setLoading(true);
      const res = await addBankAccounts({
        id: formData.id,
        bank: formData.bank,
        accountNumber: formData.accountNumber,
        fullName: formData.fullName,
        phoneId: formData.phoneId,
        phone: formData.phone,
        selectedAccountGroups: formData.selectedAccountGroups,
        typeAccount: formData.typeAccount,
        notes: formData.notes,
        transactionSource: formData.transactionSource,
        groupSystemId: Number(saveGroupSystem) || undefined,
        groupBranchId: Number(saveGroupBranch) || undefined,
        groupTeamId:
          selectedAccountType == "1" || !saveGroupTeam
            ? undefined
            : Number(saveGroupTeam),
        bankId: Number(saveBank),
        groupSystem: formData.groupSystem,
        groupBranch: formData.groupBranch,
        groupTeam: formData.groupTeam,
        typeGroupAccountString: formData.typeGroupAccountString,
      });
      if (!res || !res.success) {
        toast.error(res?.message);
      } else {
        setIsAddModalOpen(false);
        form.resetFields();
        setCurrentAccount(null);
        await setPageIndex(1);
        await setDataAccount([]);
        ClearFilter();

        fetchAccounts();
        toast.success("Thêm mới thành công!");
      }
    } catch (error: any) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const responseData = axiosError.response.data as {
          success: boolean;
          message: string;
          code: number;
          errors?: string[];
          errorFields?: Array<{
            name: string[];
            errors: string[];
          }>;
        };
        if (responseData.code === 400 && responseData.errorFields) {
          responseData.errorFields.forEach((field) => {
            field.errors.forEach((err) => {
              toast.error(`Lỗi ở trường ${field.name.join(", ")}: ${err}`);
            });
          });
        } else if (responseData.code === 500) {
          toast.error(responseData.message || "Lỗi server, vui lòng thử lại.");
        } else {
          toast.error(
            responseData.message || "Có lỗi xảy ra, vui lòng thử lại."
          );
        }
      } else {
        toast.error("Vui lòng nhập tất cả các trường bắt buộc để thêm mới!");
      }
    } finally {
      setLoading(false);
      setIsAddAccount(false);
    }
  };

  const handleEditAccount = (account: BankAccounts) => {
    setIsEditMode(true);
    setCurrentAccount(account);
    const type = account.typeAccount;
    const phone = account.transactionSource;
    setSelectedAccountType(type!);
    setValue(phone!);

    const initGroupSystemId = account.groupSystemId
      ? account.groupSystemId.toString()
      : defaultGroupSystemId;
    setSaveGroupSystem(initGroupSystemId ? initGroupSystemId?.toString() : "");

    const initGroupBranchId = account.groupBranchId
      ? account.groupBranchId.toString()
      : defaultGroupBranchId;
    setSaveGroupBranch(initGroupBranchId ? initGroupBranchId!.toString() : "");

    const initGroupTeamId = account.groupTeamId
      ? account.groupTeamId.toString()
      : defaultGroupTeamId;
    setSaveGroupTeam(initGroupTeamId ? initGroupTeamId!.toString() : "");

    const initBankId = account.bankId?.toString();
    setSaveBank(initBankId!);

    const str = account.typeGroupAccountString;
    const arr = str?.split(",").map((item) => item.trim());

    form.setFieldsValue({
      id: account.id,
      bank: account.bank,
      accountNumber: account.accountNumber,
      fullName: account.fullName,
      phoneId: account.phoneId,
      phone: account.phone,
      selectedAccountGroups: account.selectedAccountGroups,
      typeAccount: account.typeAccount,
      notes: account.notes,
      transactionSource: account.transactionSource,
      groupSystemId: account.groupSystemId,
      groupBranchId: account.groupBranchId,
      groupTeamId: account.groupTeamId,
      bankId: account.bankId,
      //
      groupSystemName: account.groupSystem?.name,
      groupBranchName: account.groupBranch?.name,
      groupTeamName: account.groupTeam?.name,
      bankName: account.bankName,
      typeGroupAccountString: arr,
    });
    setIsAddModalOpen(true);
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccounts | null>(
    null
  );

  const handleDeleteAccount = async (x: BankAccounts) => {
    setLoading(true);
    try {
      setIsAddModalOpen(false);
      const response = await deleteBankAccount([x.id]);
      if (response.success === false) {
        toast.error(response.message || "Đã có lỗi xảy ra. Vui lòng thử lại!");
        return;
      }
      toast.success("Xóa thành công tài khoản ngân hàng!");
      await setPageIndex(1);
      await setDataAccount([]);
      ClearFilter();

      fetchAccounts();
    } catch (error: any) {
      console.error("Lỗi khi xóa tài khoản ngân hàng:", error);
      if (error.isAxiosError && error.response) {
        const { status, data } = error.response;
        if (status === 400 && data && data.message) {
          toast.error(data.message || "Đã có lỗi xảy ra. Vui lòng thử lại!");
        } else {
          toast.error(data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại!");
        }
      } else {
        toast.error("Đã có lỗi xảy ra. Vui lòng thử lại!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (accountGroup: BankAccounts) => {
    setSelectedAccount(accountGroup);
    setIsDeleteModalOpen(true);
  };

  const handleCancel = () => {
    setIsDeleteModalOpen(false);
    setSelectedAccount(null);
  };

  const handleConfirmDelete = () => {
    if (selectedAccount) {
      handleDeleteAccount(selectedAccount);
      setIsDeleteModalOpen(false);
    }
  };

  const [accountGroupFilter, setAccountGroupFilter] = useState<
    Array<{ value: string; label: string }>
  >([]);

  const [filterParams, setFilterParams] = useState<{
    groupAccountId?: string;
    groupSystemId?: string;
    groupBranchId?: string;
    groupTeamId?: string;
  }>({});

  const [groupAccountFilter, setGroupAccountFilter] = useState();
  const [groupSystemFilter] = useState();
  const [groupBranchFilter] = useState();
  const [groupTeamFilter] = useState();

  // call api lấy dsach filter nhóm tài khoản
  const handleFilter = async (searchTerms?: string) => {
    const arrAccountGroup: FilterGroupAccount[] = [];
    const groupAccount: FilterGroupAccount = {
      Name: "groupAccountId",
      Value: searchTerms!,
    };
    const obj: FilterGroupAccount = {
      Name: keys!,
      Value: values!,
    };
    arrAccountGroup.push(obj, groupAccount);
    try {
      const fetchBankAccountAPI = await getAccountGroup(
        1,
        100,
        globalTerm
        // arr
      );
      if (
        fetchBankAccountAPI &&
        fetchBankAccountAPI.data &&
        fetchBankAccountAPI.data.source
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = fetchBankAccountAPI.data.source.map((x: any) => ({
          value: x.id,
          label: x.fullName || "Không xác định",
        }));
        setAccountGroupFilter(res);
      } else {
        setAccountGroupFilter([]);
      }
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
    }
  };

  const handleSelectChange = (
    groupAccount?: string,
    groupSystem?: string,
    groupBranch?: string,
    groupTeam?: string
  ) => {
    setFilterParams((prevParams) => {
      if (
        prevParams.groupAccountId !== groupAccount ||
        prevParams.groupSystemId !== groupSystem ||
        prevParams.groupBranchId !== groupBranch ||
        prevParams.groupTeamId !== groupTeam
      ) {
        return {
          ...prevParams,
          groupAccountId: groupAccount,
          groupSystemId: groupSystem,
          groupBranchId: groupBranch,
          groupTeamId: groupTeam,
        };
      }
      return prevParams;
    });
  };

  const handleDataDefault = async () => {
    const arrData = [];
    arrData.push({
      label: localStorage.getItem("groupSystemName")!,
      value: localStorage.getItem("groupSystemId")!,
    });

    const arrDataBranch = [];
    arrDataBranch.push({
      label: localStorage.getItem("groupBranchName")!,
      value: localStorage.getItem("groupBranchId")!,
    });

    const arrDataTeam = [];
    arrDataTeam.push({
      label: localStorage.getItem("groupTeamName")!,
      value: localStorage.getItem("groupTeamId")!,
    });
  };

  const handleFilterSystem = async (groupSystemId?: string) => {
    const arrAccountGroup: FilterGroupAccount[] = [];
    arrAccountGroup.push({
      Name: localStorage.getItem("key")!,
      Value: localStorage.getItem("value")!,
    });
    if (groupSystemId) {
      arrAccountGroup.push({ Name: "groupSystemId", Value: groupSystemId });
    }
    try {
      const fetchBankAccountAPI = await getGroupSystem(
        pageIndex,
        pageSize,
        globalTerm,
        arrAccountGroup
      );

      if (
        fetchBankAccountAPI &&
        fetchBankAccountAPI.data &&
        fetchBankAccountAPI.data.source
      ) {
      } else {
      }
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
    }
  };

  const handleFilterBranch = async (groupBranchId?: string) => {
    const arr: FilterGroupAccount[] = [];
    const branch: FilterGroupAccount = {
      Name: "groupBranchId",
      Value: groupBranchId!,
    };
    const obj: FilterGroupAccount = {
      Name: keys!,
      Value: values!,
    };
    arr.push(obj, branch);
    try {
      const fetchBankAccountAPI = await getBranchSystem(
        pageIndex,
        pageSize,
        globalTerm,
        arr //searchTerms
      );
      if (
        fetchBankAccountAPI &&
        fetchBankAccountAPI.data &&
        fetchBankAccountAPI.data.source
      ) {
      } else {
      }
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
    }
  };

  const handleFilterTeam = async (groupTeamId?: string) => {
    const arr: FilterGroupAccount[] = [];
    const system: FilterGroupAccount = {
      Name: "groupSystemId",
      Value: groupSystemId?.toString(),
    };
    const team: FilterGroupAccount = {
      Name: "groupTeamId",
      Value: groupTeamId!,
    };
    const obj: FilterGroupAccount = {
      Name: keys!,
      Value: values!,
    };
    arr.push(obj, team, system);
    try {
      const fetchBankAccountAPI = await getGroupTeam(
        pageIndex,
        pageSize,
        globalTerm,
        arr //searchTerms
      );

      if (
        fetchBankAccountAPI &&
        fetchBankAccountAPI.data &&
        fetchBankAccountAPI.data.source
      ) {
      } else {
      }
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await handleFilter();
      await handleFilterSystem();
      await handleFilterBranch();
      await handleFilterTeam();
    };
    fetchData();
  }, [filterParams]);

  const handleValueChange = (newValue: any) => {
    setValue(newValue);
  };

  const columns = [
    { title: "id", dataIndex: "id", key: "id", hidden: true },
    { title: "Ngân hàng", dataIndex: "bank", key: "bank" },
    {
      title: "Số tài khoản",
      dataIndex: "accountNumber",
      key: "accountNumber",
    },
    {
      title: "Tên tài khoản",
      dataIndex: "fullName",
      key: "fullName",
    },
    { title: "Số điện thoại", dataIndex: "phone", key: "phone" },
    {
      title: "Nhóm tài khoản",
      dataIndex: "typeGroupAccountString",
      key: "typeGroupAccountString",
    },
    {
      title: "Loại tài khoản",
      dataIndex: "typeAccountDescription",
      key: "typeAccountDescription",
    },
    { title: "Ghi chú", dataIndex: "notes", key: "notes" },
    {
      title: "Chức năng",
      key: "action",
      render: (record: BankAccounts) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              handleEditAccount(record);
            }}
          >
            Chỉnh sửa
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDeleteClick(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const [checkFilter, setCheckFilter] = useState(false);
  const [saveGroupSystem, setSaveGroupSystem] = useState("");
  const [saveGroupBranch, setSaveGroupBranch] = useState("");
  const [saveGroupTeam, setSaveGroupTeam] = useState("");
  const [saveBank, setSaveBank] = useState("");

  useEffect(() => {
    fetchAccounts(
      bankId,
      bankAccountId,
      groupAccountFilter
    );
  }, [checkFilter]);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const dataSource = dataAccount.map((item) => ({
    ...item,
    key: item.id,
  }));

  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleDeletes = async () => {
    setLoading(true);
    try {
      const idsToDelete = selectedRowKeys.map((key) => Number(key));
      const response = await deleteBankAccount(idsToDelete);
      if (!response || !response.success) {
        toast.error(response?.message);
      }
      else {
        toast.success("Xóa các mục thành công!");
        await setPageIndex(1);
        await setDataAccount([]);
        ClearFilter();

        fetchAccounts();
        setSelectedRowKeys([]);
      }

    } catch (error: any) {
      console.error("Lỗi khi xóa:", error);
      if (error.isAxiosError && error.response) {
        const { status, data } = error.response;
        if (status === 400) {
          toast.error(
            data.message || "Yêu cầu không hợp lệ. Không thể xóa các mục."
          );
        } else {
          toast.error("Đã có lỗi xảy ra. Vui lòng thử lại!");
        }
      } else {
        toast.error("Có lỗi xảy ra khi xóa!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDeletes = () => {
    handleDeletes();
    setIsModalVisible(false);
  };

  const handleDeleteConfirmation = () => {
    setIsModalVisible(true);
  };

  const [valueInput, setValueInput] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleInputChange = (e: any) => {
    const inputValue = e.target.value;
    const sanitizedValue = inputValue.replace(/\s+/g, "");
    setValueInput(sanitizedValue);
  };

  const [bankDataFilter, setBankDataFilter] = useState<
    Array<{ value: string; label: string }>
  >([]);

  const filterBankAPI = async () => {
    const arr: FilterProducts[] = [];
    const addedParams = new Set<string>();
    arr.push({
      Name: keys!,
      Value: values,
    });
    addedParams.add(keys!);
    try {
      const fetchBankDataAPI = await getBank(1, 100, arr);

      if (
        fetchBankDataAPI &&
        fetchBankDataAPI.data &&
        fetchBankDataAPI.data.source
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = fetchBankDataAPI.data.source.map((x: any) => ({
          value: x.id,
          label: x.code || "Không xác định",
        }));
        console.log("fetchBankDataAPI", fetchBankDataAPI);

        setBankDataFilter(res);
      } else {
        setBankDataFilter([]);
      }
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
    }
  };

  const [bankAccountFilter, setBankAccountFilter] = useState<
    Array<{ value: string; label: string }>
  >([]);

  const filterBankAccount = async (bankId?: string) => {
    // console.log(352, bankId)
    const arr: FilterProducts[] = [];
    const addedParams = new Set<string>();
    arr.push({
      Name: "bankId",
      Value: bankId,
    });
    arr.push({
      Name: keys!,
      Value: values,
    });
    addedParams.add(keys!);
    try {
      const fetchBankAccountAPI = await fetchBankAccounts(
        1,
        100,
        undefined,
        arr
      );

      if (
        fetchBankAccountAPI &&
        fetchBankAccountAPI.data &&
        fetchBankAccountAPI.data.source
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = fetchBankAccountAPI.data.source.map((x: any) => ({
          value: x.id,
          label: x.fullName + "-" + x.accountNumber || "Không xác định",
        }));

        setBankAccountFilter(res);
      } else {
        setBankAccountFilter([]);
      }
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
    }
  };

  useEffect(() => {
    filterBankAPI();
    filterBankAccount();
  }, []);

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
          <Spin size="large" />
        </div>
      )}
      <div className="px-[30px]">
        <div className="text-[32px] font-bold py-5">Danh sách tài khoản</div>
        <div className="flex justify-between items-center mb-7">
          <div className="flex items-center">
            <Space direction="horizontal" size="middle">
              <Select
                options={bankDataFilter}
                placeholder="Ngân hàng"
                style={{ width: 245 }}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
                onChange={async (value: any) => {
                  await setPageIndex(1);
                  await setDataAccount([])

                  await setBankId(value);
                  filterBankAccount(value);

                  fetchAccounts(value, bankAccountId, groupAccountFilter, 1);
                }}
                value={bankId}
              />

              <CustomSelect
                mode="multiple"
                options={bankAccountFilter}
                placeholder="Tài khoản ngân hàng"
                style={{ width: 245 }}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
                onChange={async (value: any) => {

                  const parsedValue = Array.isArray(value)
                    ? value
                    :
                    value.split(",").map((item: any) => item.trim());

                  await setPageIndex(1);
                  await setDataAccount([])
                  await setBankAccountId(parsedValue);

                  fetchAccounts(bankId, parsedValue, groupAccountFilter, 1);
                }}
                value={bankAccountId}
              />

              <CustomSelect
                mode="multiple"
                options={accountGroupFilter}
                placeholder="Nhóm tài khoản"
                style={{ width: 245 }}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }

                onChange={async (value: any) => {
                  const parsedValue = Array.isArray(value)
                    ? value
                    :
                    value.split(",").map((item: any) => item.trim());

                  await setPageIndex(1);;
                  await setDataAccount([])
                  setGroupAccountFilter(value);
                  if (!parsedValue.length) {
                    handleSelectChange(
                      parsedValue,
                      groupSystemFilter,
                      groupBranchFilter,
                      groupTeamFilter
                    );
                    setCheckFilter(!checkFilter);
                  } else {
                    fetchAccounts(
                      bankId,
                      bankAccountId,
                      parsedValue,
                      1
                    );
                  }
                }}
                value={groupAccountFilter}
              />
            </Space>

          </div>
          <div className="flex">
            {selectedRowKeys.length > 0 && (
              <Button
                className="bg-[#4B5CB8] w-[136px] !h-10 text-white font-medium hover:bg-[#3A4A9D]"
                onClick={handleDeleteConfirmation}
              >
                Xóa nhiều
              </Button>
            )}
            <div className="w-2" />
            <Button
              className="bg-[#4B5CB8] w-[136px] !h-10 text-white font-medium hover:bg-[#3A4A9D]"
              onClick={() => {
                setCurrentAccount(null);
                form.resetFields();
                setIsAddModalOpen(true);
                defaultModalAdd();
              }}
            >
              Thêm mới
            </Button>
          </div>
        </div>
        <LoadingTable
          loading={loading}
          pageIndex={pageIndex}
          dataSource={dataSource}
          columns={columns}
          rowSelection={rowSelection}
        />
      </div>
      <BaseModal
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          form.resetFields();
        }}
        title={currentAccount ? "Chỉnh sửa tài khoản" : "Thêm mới tài khoản"}
        offPadding
      >
        <Form
          form={form}
          layout="vertical"
          className="flex flex-col gap-1 w-full"
        >
          <Form.Item hidden label="id" name="id">
            <Input autoComplete="off" />
          </Form.Item>
          <Form.Item
            label="Chọn loại tài khoản"
            name="typeAccount"
            rules={[
              { required: true, message: "Vui lòng chọn loại tài khoản!" },
            ]}
          >
            <Select
              options={accountTypeOptions}
              placeholder="Chọn loại tài khoản"
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
              onChange={(e) => {
                // console.log(e);
                handleAccountTypeChange(e);
              }}
            />
          </Form.Item>
          <div className="flex justify-between">
            <Form.Item
              className="w-[45%]"
              label="Chọn hệ thống"
              name="groupSystemName"
              rules={[{ required: true, message: "Vui lòng chọn hệ thống!" }]}
            >
              <Select
                allowClear
                disabled={defaultGroupSystemId ? true : false}
                defaultValue={
                  form.getFieldsValue().groupSystemId?.toString().trim()
                    ? {
                      value: form.getFieldsValue().groupSystemId,
                      label: form.getFieldsValue().groupSystemName,
                    }
                    : undefined
                }
                onFocus={() => getGroupSystems()}
                placeholder="Chọn hệ thống"
                options={groupSystem}
                showSearch
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
                onChange={async (e) => {
                  if (!e) {
                    form.setFieldsValue({
                      groupSystemId: undefined,
                      groupBranchName: undefined,
                      groupBranchId: undefined,
                      groupTeamName: undefined,
                      groupTeamId: undefined,
                    });
                    return;
                  }
                  const id = Number(e).toString();
                  setSaveGroupSystem(id);
                  // getBranchSystems();
                  const selectedGroup = await groupSystem.find(
                    (item: any) => item.value === e
                  );
                  if (selectedGroup) {
                    getBranchSystems(selectedGroup.groupSystemId);
                    form.setFieldsValue({
                      groupSystemId: selectedGroup.groupSystemId,
                      groupBranchName: undefined,
                      groupBranchId: undefined,
                      groupTeamName: undefined,
                      groupTeamId: undefined,
                    });
                  }
                }}
              />
            </Form.Item>
            <Form.Item
              hidden
              className="w-[45%]"
              label="Chọn hệ thống"
              name="groupSystemId"
            >
              <Select />
            </Form.Item>
            <Form.Item
              className="w-[45%]"
              label="Chọn chi nhánh"
              name="groupBranchName"
            >
              <Select
                allowClear
                disabled={defaultGroupBranchId ? true : false}
                showSearch
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
                defaultValue={
                  form.getFieldsValue().groupBranchId?.toString().trim()
                    ? {
                      value: form.getFieldsValue().groupBranchId,
                      label: form.getFieldsValue().groupBranchName,
                    }
                    : undefined
                }
                onFocus={() => {
                  // getBranchSystems();
                  const formData = form.getFieldsValue();
                  getBranchSystems(formData.groupSystemId);
                }}
                placeholder="Chọn chi nhánh"
                options={branchSystem}
                onChange={async (e) => {
                  if (!e) {
                    form.setFieldsValue({
                      groupBranchId: undefined,
                      groupTeamName: undefined,
                      groupTeamId: undefined,
                    });
                    return;
                  }
                  const id = Number(e).toString();
                  Number(groupBranchId);
                  setSaveGroupBranch(id);
                  const selectedGroup = await branchSystem.find(
                    (item: any) => item.value === e
                  );
                  if (selectedGroup) {
                    getGroupTeams(selectedGroup.groupBranchId);
                    form.setFieldsValue({
                      groupBranchId: selectedGroup.groupBranchId,
                      groupTeamName: undefined,
                      groupTeamId: undefined,
                    });
                  }
                }}
              />
            </Form.Item>
            <Form.Item
              hidden
              className="w-[45%]"
              label="Chọn chi nhánh"
              name="groupBranchId"
            >
              <Select />
            </Form.Item>
          </div>
          <div className="flex justify-between">
            {selectedAccountType === "2" && (
              <>
                <Form.Item
                  className="w-[45%]"
                  label="Chọn đội nhóm"
                  name="groupTeamName"
                >
                  <Select
                    allowClear
                    disabled={defaultGroupTeamId ? true : false}
                    showSearch
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                    defaultValue={
                      form.getFieldsValue().groupTeamId?.toString().trim()
                        ? {
                          value: form.getFieldsValue().groupTeamId,
                          label: form.getFieldsValue().groupTeamName,
                        }
                        : undefined
                    }
                    onFocus={() => {
                      //  getGroupTeams();
                      const formData = form.getFieldsValue();
                      getGroupTeams(formData.groupBranchId);
                    }}
                    placeholder="Chọn đội nhóm"
                    // onFocus={getGroupTeams}
                    options={groupTeam}
                    onChange={async (e) => {
                      console.log(e);
                      const id = Number(e).toString();
                      setSaveGroupTeam(id);
                    }}
                  />
                </Form.Item>
                <Form.Item
                  hidden
                  className="w-[45%]"
                  label="Chọn đội nhóm"
                  name="groupTeamId"
                >
                  <Select />
                </Form.Item>
              </>
            )}
          </div>
          <Form.Item
            className="w-full"
            label="Chọn ngân hàng"
            name="bankName"
            rules={[{ required: true, message: "Vui lòng chọn ngân hàng!" }]}
          >
            <Select
              allowClear
              defaultValue={
                form.getFieldsValue().bankId?.toString().trim()
                  ? {
                    value: form.getFieldsValue().bankId,
                    label: form.getFieldsValue().bankName,
                  }
                  : undefined
              }
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
              onFocus={() => fetchBankData()}
              placeholder="Chọn ngân hàng"
              options={banks}
              onChange={async (e) => {
                const id = Number(e).toString();
                setSaveBank(id);
              }}
            />
          </Form.Item>
          <Form.Item
            hidden
            className="w-[45%]"
            label="Chọn ngân hàng hidden"
            name="bankId"
          >
            <Select />
          </Form.Item>
          <div className="flex justify-between">
            <Form.Item
              className="w-[45%]"
              label="Số tài khoản"
              name="accountNumber"
              rules={[
                { required: true, message: "Vui lòng nhập số tài khoản!" },
              ]}
            >
              <Input
                placeholder="Nhập số tài khoản"
                autoComplete="off"
                value={valueInput}
                onChange={handleInputChange}
              />
            </Form.Item>
            <Form.Item
              className="w-[45%]"
              label="Nhập tên chủ tài khoản"
              name="fullName"
              rules={[
                { required: true, message: "Vui lòng nhập tên chủ tài khoản!" },
              ]}
            >
              <Input placeholder="Nhập tên chủ tài khoản" autoComplete="off" />
            </Form.Item>
          </div>
          <div className="flex justify-between">
            <Form.Item label="Lấy giao dịch từ" name="transactionSource"
              rules={[
                { required: true, message: "Vui lòng chọn Lấy giao dịch từ!" },
              ]}>
              <Radio.Group
                onChange={(e) => handleValueChange(e.target.value)}
                // defaultValue={"1"}
                value={value}
              >
                <Space direction="vertical">
                  <Radio value={"2"}>Giao dịch từ SMS</Radio>
                  <Radio value={"1"}>Giao dịch từ Email</Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
            {value === "2" && (
              <>
                <Form.Item
                  className="w-[45%]"
                  label="Nhập số điện thoại"
                  name="phone"
                >
                  <Select
                    options={phoneNumber}
                    onFocus={getListPhoneNumber}
                    placeholder="Chọn số điện thoại"
                    showSearch
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                    onChange={async (value: any) => {
                      const selectedGroup = await phoneNumber.find(
                        (item: any) => item.value === value
                      );
                      if (selectedGroup) {
                        form.setFieldsValue({
                          phoneId: selectedGroup.phoneId,
                        });
                      }
                    }}
                  />
                </Form.Item>
                <Form.Item hidden label="Nhập số điện thoại" name="phoneId">
                  <Select />
                </Form.Item>
              </>
            )}
          </div>
          <Form.Item
            label="Chọn nhóm tài khoản"
            name="typeGroupAccountString"
            rules={[
              { required: true, message: "Vui lòng chọn nhóm tài khoản!" },
            ]}
          >
            <Select
              allowClear
              options={accountGroup}
              placeholder="Chọn nhóm tài khoản"
              mode="multiple"
              onFocus={getListAccountGroup}
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
              onChange={async (value: any[]) => {
                const selectedGroups = accountGroup.filter((item: any) =>
                  value.includes(item.value) || value.includes(item.label)
                );
                form.setFieldsValue({
                  selectedAccountGroups: selectedGroups.map(
                    (group: any) => group.selectedAccountGroups
                  ),
                });
              }}
            />
          </Form.Item>
          <Form.Item
            hidden
            label="Chọn nhóm tài khoản 2"
            name="selectedAccountGroups"
          >
            <Select mode="multiple" />
          </Form.Item>
          <Form.Item label="Ghi chú" name="notes">
            <Input.TextArea
              placeholder="Nhập ghi chú"
              autoSize={{ minRows: 3, maxRows: 5 }}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              onClick={() => {
                handleAddConfirm(true);
              }}
              className={`${isAddAccount && "pointer-events-none"
                } w-full !h-10 bg-[#4B5CB8] hover:bg-[#3A4A9D]`}
              loading={isAddAccount}
            >
              {currentAccount ? "Cập nhật" : "Thêm mới"}
            </Button>
          </Form.Item>
        </Form>
      </BaseModal>
      <DeleteModal
        open={isDeleteModalOpen}
        onCancel={handleCancel}
        onConfirm={handleConfirmDelete}
        selectedAccount={handleDeleteAccount}
      />
      <DeleteModal
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onConfirm={handleConfirmDeletes}
        handleDeleteTele={async () => {
          await handleDeletes();
          setIsModalVisible(false);
        }}
      />
    </>
  );
};

export default Account;
