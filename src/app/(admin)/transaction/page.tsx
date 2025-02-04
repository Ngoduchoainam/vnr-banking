"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Spin,
} from "antd";
import {
  addTransaction,
  deleteTransaction,
  getTransaction,
} from "@/src/services/transaction";
import BaseModal from "@/src/component/config/BaseModal";
import { fetchBankAccounts, getBank } from "@/src/services/bankAccount";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import DeleteModal from "@/src/component/config/modalDelete";
import dayjs, { Dayjs } from "dayjs";
import { formatDate } from "@/src/utils/buildQueryParams";
import { RoleContext } from "@/src/component/RoleWapper";
import { Utility } from "@/src/utils/Utility";
import LoadingTable from "@/src/component/LoadingTable";
import CustomSelect from "@/src/component/CustomSelect";

export interface TransactionModal {
  id?: number;
  bankName?: string;
  bankAccountId: number;
  bankAccount?: string;
  fullName?: string;
  transDateString?: string;
  transType: string;
  purposeDescription?: string;
  reason: string;
  balanceBeforeTrans: number;
  currentBalance: number;
  notes: string;
  transDate?: string;
  bankId?: number;
  feeIncurred?: number;
  transAmount: number;
}

interface FilterRole {
  Name: string;
  Value: string;
}

interface FilterProducts {
  Name: string;
  Value: any;
}

const Transaction = () => {
  const { dataRole } = useContext(RoleContext);
  const keys = dataRole.key;
  const values = `${dataRole.value}`;

  const { RangePicker } = DatePicker;

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [dataTransaction, setDataTransaction] = useState<TransactionModal[]>(
    []
  );
  const [globalTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] =
    useState<TransactionModal | null>(null);
  const [banks, setBanks] = useState([]);
  const [bankAccount, setBankAccount] = useState([]);
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 20;
  const [totalRecord, setTotalRecord] = useState(100);
  const [isLoading, setIsLoading] = useState(false);

  const [isAddTransaction, setIsAddTransaction] = useState<boolean>(false);

  const isFetchingRef = useRef(false);
  const [bankId, setBankId] = useState();
  const [bankAccountId, setBankAccountId] = useState();

  const handleScroll = () => {
    const scrollPosition = window.scrollY + window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollPosition >= documentHeight && !isFetchingRef.current) {
      isFetchingRef.current = true;
      setPageIndex((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (pageIndex > 1 && dataTransaction.length < totalRecord) {
      const scrollPositionBeforeFetch = window.scrollY;

      fetchTransaction(startDate, endDate, bankId, bankAccountId).finally(() => {
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


  const [fullDate, setFullDate] = useState();
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  const fetchTransaction = async (
    startDate?: string,
    endDate?: string,
    selectedBankId?: string,
    bankAccountId?: string,
    pageIndexFilter?: number
  ) => {
    const arrRole: FilterRole[] = [];
    const addedParams = new Set<string>();

    const dateStartFormat = await Utility.ConvertDateTimeSameDay(startDate);
    const dateEndFormat = await Utility.ConvertDateTimeSameDay(endDate);

    if (startDate && endDate) {
      arrRole.push({
        Name: "startDate",
        Value: formatDate(dateStartFormat.startOfDay || new Date),
      });
      arrRole.push({
        Name: "endDate",
        Value: formatDate(dateEndFormat.endOfDay || new Date),
      });
    }

    if (selectedBankId) {
      arrRole.push({
        Name: "bankId",
        Value: selectedBankId,
      });
    }

    if (Array.isArray(bankAccountId) && bankAccountId.length > 0) {
      arrRole.push({
        Name: "bankAccountId",
        Value: bankAccountId,
      });
    }

    arrRole.push({
      Name: keys!,
      Value: values,
    });
    addedParams.add(keys!);
    setLoading(true);
    if (pageIndex > 1) {
      setIsLoading(true)
    }

    try {
      const response = await getTransaction(
        pageIndexFilter || pageIndex,
        pageSize,
        globalTerm,
        arrRole
      );
      const formattedData =
        response?.data?.source?.map((item: any) => ({
          id: item.id, // id
          bankName: item.bankName, // Mã ngân hàng
          bankAccount: item.bankAccount, // stk
          fullName: item.fullName, // tên chủ tk
          transDateString: item.transDateString || new Date(), // Ngày giao dịch
          transType: item.transType, // Giao dịch
          purposeDescription: item.purposeDescription, // Mục đích
          reason: item.reason, // lý do
          balanceBeforeTrans: item.balanceBeforeTrans, // Số dư trc giao dịch
          currentBalance: item.currentBalance, // số dư hiện tại
          notes: item.notes, // ghi chú
          bankAccountId: item.bankAccountId, // thêm trường id tài khoản
          feeIncurred: item.feeIncurred,
          transAmount: item.transAmount,
          transDate: item.transDate
            ? dayjs(item.transDate).format("YYYY-MM-DDTHH:mm:ss.SSSZ")
            : null,
          // transDate: item.transDate,
        })) || [];

      setTotalRecord(response?.data?.totalRecords || 0);
      setDataTransaction((prevData) => [...prevData, ...formattedData]);
    } catch (error) {
      console.error("Error fetching:", error);
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
          value: bank.code,
          label: bank.code + " - " + bank.fullName,
          bankId: bank.id,
        })) || [];
      setBanks(formattedBanks);
    } catch (error) {
      console.error("Error fetching banks:", error);
    }
  };

  const genBankAccountData = async (bankId?: number) => {
    const arr: any[] = [];
    const obj: any = {
      Name: "bankId",
      Value: bankId,
    };
    await arr.push(obj);
    try {
      const bankData = await fetchBankAccounts(1, 100, undefined, arr);
      const formattedBanks =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        bankData?.data?.source?.map((bankAccount: any) => ({
          value: bankAccount.id,
          label: `${bankAccount.accountNumber} - ${bankAccount.fullName}`,
          bankAccountId: bankAccount.id,
        })) || [];
      setBankAccount(formattedBanks);
    } catch (error) {
      console.error("Error fetching banks:", error);
    }
  };

  const ClearFilter = () => {
    setBankId(undefined);
    setBankAccountId(undefined);
    setFullDate(undefined);
  }

  const handleAddConfirm = async (isAddTransaction: boolean) => {
    const formData = await form.validateFields();
    setLoading(true);

    try {
      setIsAddTransaction(isAddTransaction);

      const requestData = {
        id: currentTransaction ? currentTransaction.id : formData.id,
        bankName: formData.bankName,
        bankAccountId: formData.bankAccountId,
        fullName: formData.fullName,
        transDateString: formData.transDateString,
        transType: formData.transType,
        purposeDescription: formData.purposeDescription,
        reason: formData.reason,
        balanceBeforeTrans: formData.balanceBeforeTrans,
        currentBalance: formData.currentBalance,
        notes: formData.notes,
        transAmount: formData.transAmount,
        transDate: selectedDate
          ? dayjs(selectedDate).format("YYYY-MM-DDTHH:mm:ss.SSSZ")
          : undefined,
        bankId: selectBankId,
        feeIncurred: formData.feeIncurred,
        bankAccount: "",
      };

      const response = await addTransaction(requestData);

      if (response && response.success === false) {
        toast.error(response.message || "Lỗi trong quá trình thực hiện.");
      } else {
        toast.success(
          currentTransaction
            ? "Cập nhật giao dịch thành công!"
            : "Thêm mới giao dịch thành công!"
        );
        setIsAddModalOpen(false); // Chỉ đóng modal khi thành công
        form.resetFields();
        setCurrentTransaction(null);
        await setPageIndex(1);
        await setDataTransaction([]);
        ClearFilter();

        fetchTransaction();
        setSelectBankId(0);
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const message =
          error.response.status === 400
            ? error.response.data.message ||
            "Vui lòng nhập các trường dữ liệu để thêm mới!"
            : "Đã xảy ra lỗi, vui lòng thử lại.";
        toast.error(message);
      } else {
        toast.error("Đã xảy ra lỗi không xác định.");
      }
    } finally {
      setLoading(false);
      setIsAddTransaction(false);
    }
  };

  const handleDelete = async (x: TransactionModal) => {
    setLoading(true);

    try {
      const response = await deleteTransaction([x.id]);

      if (response && response.success === false) {
        toast.error(response.message || "Xóa giao dịch thất bại.");
      } else {
        toast.success("Xóa giao dịch thành công!");
        await setPageIndex(1);
        await setDataTransaction([]);
        ClearFilter();

        fetchTransaction(); // Hoặc cập nhật state trực tiếp để tránh fetch lại toàn bộ.
      }

      setIsAddModalOpen(false); // Đặt trong try để chắc chắn chỉ đóng khi thành công.
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const message =
          error.response.status === 400
            ? error.response.data.message || "Không thể xóa giao dịch này!"
            : "Đã xảy ra lỗi, vui lòng thử lại.";
        toast.error(message);
      } else {
        toast.error("Đã xảy ra lỗi không xác định.");
      }
    } finally {
      setLoading(false);
    }
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAccountGroup, setSelectedAccountGroup] =
    useState<TransactionModal | null>(null);

  const handleCancel = () => {
    setIsDeleteModalOpen(false);
    setSelectedAccountGroup(null);
  };

  const handleConfirmDelete = () => {
    if (selectedAccountGroup) {
      handleDelete(selectedAccountGroup);
      setIsDeleteModalOpen(false);
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", hidden: true },
    {
      title: "Ngân hàng",
      dataIndex: "bankName",
      key: "bankName",
    },
    {
      title: "Ngày giao dịch",
      dataIndex: "transDate",
      key: "transDate",
      hidden: true,
    },
    {
      title: "transAmount",
      dataIndex: "transAmount",
      key: "transAmount",
      hidden: true,
    },
    {
      title: "Chi phí phát sinh",
      dataIndex: "feeIncurred",
      key: "feeIncurred",
    },
    {
      title: "Số tài khoản",
      dataIndex: "bankAccountId",
      key: "bankAccountId",
      hidden: true,
    },
    { title: "Số tài khoản", dataIndex: "bankAccount", key: "bankAccount" },
    { title: "Tên chủ tài khoản", dataIndex: "fullName", key: "fullName" },
    {
      title: "Ngày giao dịch",
      dataIndex: "transDateString",
      key: "transDateString",
    },
    {
      title: "Giao dịch",
      dataIndex: "transType",
      key: "transType",
      render: (transType: string) => (
        <>
          {transType == "2" ? (
            <div className="font-semibold text-[#D40606]">Tiền ra</div>
          ) : transType == "3" ? (
            <div className="font-semibold text-[#01AF36]">Tiền vào</div>
          ) : (
            <div className="font-semibold">Không xác định</div>
          )}
        </>
      ),
    },
    { title: "Lý do", dataIndex: "reason", key: "reason" },
    {
      title: "Số tiền",
      dataIndex: "transAmount",
      key: "transAmount",
      render: (balance: number, record: { transType: string }) => {
        let sign = "";
        if (record.transType === "2") {
          sign = "-"; // Tiền ra
        } else if (record.transType === "3") {
          sign = "+"; // Tiền vào
        }
        const formattedBalance = Math.abs(balance).toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        });
        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ marginRight: "4px", fontWeight: "bold" }}>
              {sign}
            </span>
            <span>{formattedBalance}</span>
          </div>
        );
      },
    },
    {
      title: "Số dư hiện tại",
      dataIndex: "currentBalance",
      key: "currentBalance",
      render: (balance: any) =>
        balance.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
    { title: "Ghi chú", dataIndex: "notes", key: "notes" }
  ];

  //
  const [checkFilter, setCheckFilter] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectBankId, setSelectBankId] = useState(0);

  useEffect(() => {
    fetchTransaction(startDate, endDate, bankId, bankAccountId);
  }, [checkFilter, keys]);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const dataSource = dataTransaction.map((item) => ({
    ...item,
    key: item.id,
  }));

  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleDeletes = async () => {
    setLoading(true);
    try {
      const idsToDelete = selectedRowKeys.map((key) => Number(key));
      const res = await deleteTransaction(idsToDelete);

      if (!res || !res.success) {
        toast.error(res?.message);
      }
      else {
        toast.success("Xóa các mục thành công!");
        await setPageIndex(1);
        await setDataTransaction([]);
        ClearFilter();

        fetchTransaction();
        setSelectedRowKeys([]);
      }
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      toast.error("Có lỗi xảy ra khi xóa!");
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
        <div className="text-[32px] font-bold py-5">
          Danh sách giao dịch thủ công
        </div>
        <div className="flex justify-between items-center mb-7">
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
                await setDataTransaction([])

                await setBankId(value);
                filterBankAccount(value);

                fetchTransaction(startDate, endDate, value, bankAccountId, 1);
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
                await setDataTransaction([])
                await setBankAccountId(parsedValue);

                fetchTransaction(startDate, endDate, bankId, parsedValue, 1);
              }}
              value={bankAccountId}
            />

            <RangePicker
              id={{
                start: "startInput",
                end: "endInput",
              }}
              onChange={async (value: any) => {
                await setPageIndex(1);
                await setDataTransaction([])
                if (!value || value.length !== 2) {
                  setCheckFilter(!checkFilter);
                } else {
                  const [startDate, endDate] = value;
                  setFullDate(value);
                  setStartDate(startDate);
                  setEndDate(endDate);
                  fetchTransaction(
                    startDate,
                    endDate,
                    bankId,
                    bankAccountId,
                    1
                  );
                }
              }}
              disabledDate={(current) =>
                current && current > dayjs().endOf("day")
              }
              value={fullDate}
            />
          </Space>
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
                setCurrentTransaction(null);
                form.resetFields();
                setIsAddModalOpen(true);
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
        title={
          currentTransaction
            ? "Chỉnh sửa giao dịch thủ công"
            : "Thêm mới giao dịch thủ công"
        }
      >
        <Form
          form={form}
          layout="vertical"
          className="flex flex-col gap-1 w-full"
          onFinish={handleAddConfirm}
        >
          <Form.Item hidden label="id" name="id">
            <Input hidden autoComplete="off" />
          </Form.Item>
          <div className="flex justify-between">
            <Form.Item
              className="w-[45%]"
              label="Ngân hàng"
              name="bankName"
              rules={[{ required: true, message: "Vui lòng chọn ngân hàng!" }]}
            >
              <Select
                allowClear
                placeholder="Chọn ngân hàng"
                onFocus={fetchBankData}
                options={banks}
                showSearch
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
                onChange={(value: string | null) => {
                  if (!value) {
                    form.setFieldsValue({
                      bankId: undefined,
                      bankAccountName: undefined,
                      bankAccountId: undefined,
                    });
                    return;
                  }
                  const selectedGroup = banks.find(
                    (item: any) => item.value === value
                  );
                  if (selectedGroup) {
                    genBankAccountData(selectedGroup.bankId);
                    form.setFieldsValue({
                      bankId: selectedGroup.bankId,
                      bankAccountName: undefined,
                      bankAccountId: undefined,
                    });
                  }
                }}
              />
            </Form.Item>

            <Form.Item hidden label="Id Ngân hàng 2" name="bankId">
              <Select placeholder="Chọn ngân hàng 2" />
            </Form.Item>
            <Form.Item
              className="w-[45%]"
              label="Tài khoản ngân hàng"
              name="bankAccountName"
              rules={[{ required: true, message: "Vui lòng chọn ngân hàng!" }]}
            >
              <Select
                allowClear
                placeholder="Chọn tài khoản ngân hàng"
                onFocus={() => {
                  const formData = form.getFieldsValue();
                  genBankAccountData(formData.bankId);
                }}
                options={bankAccount}
                showSearch
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
                onChange={async (value: any) => {
                  const selectedGroup = await bankAccount.find(
                    (item: any) => item.value === value
                  );
                  if (selectedGroup) {
                    genBankAccountData(selectedGroup.bankAccountId);
                    form.setFieldsValue({
                      bankAccountId: selectedGroup.bankAccountId,
                    });
                  }
                }}
              />
            </Form.Item>
            <Form.Item hidden label="Id Ngân hàng 2" name="bankAccountId">
              <Select placeholder="Chọn ngân hàng 2" />
            </Form.Item>
          </div>
          <div className="flex justify-between">
            <Form.Item
              className="w-[45%]"
              label="Chọn loại giao dịch"
              name="transType"
              rules={[
                { required: true, message: "Vui lòng chọn loại giao dịch!" },
              ]}
            >
              <Select
                options={[
                  { value: "2", label: "Tiền ra" },
                  { value: "3", label: "Tiền vào" },
                ]}
                showSearch
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
                placeholder="Chọn loại giao dịch"
                onChange={(value) => {
                  console.log(value);
                }}
              />
            </Form.Item>
            <Form.Item
              className="w-[45%]"
              label="Ngày giao dịch"
              name="transDate"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn ngày giao dịch!",
                },
              ]}
            >
              <Space direction="vertical" size="large" className="w-full">
                <DatePicker
                  className="w-full"
                  showTime
                  disabledDate={(current) => {
                    return current && current.isAfter(dayjs());
                  }}
                  onChange={(value: Dayjs | null) => {
                    const formattedDate = value?.format(
                      "YYYY-MM-DDTHH:mm:ss.SSSZ"
                    );
                    setSelectedDate(formattedDate!);
                    form.setFieldsValue({ transDate: value });
                  }}
                />
              </Space>
            </Form.Item>
          </div>
          <div className="flex justify-between items-center">
            <Form.Item
              className="w-[45%]"
              label="Số dư trước giao dịch"
              name="balanceBeforeTrans"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập số dư trước giao dịch!",
                },
                {
                  validator: (_, value) =>
                    value >= 0
                      ? Promise.resolve()
                      : Promise.reject(
                        new Error("Số dư trước giao dịch phải lớn hơn 0!")
                      ),
                },
              ]}
            >
              <InputNumber
                className="w-full"
                placeholder="Nhập số dư trước giao dịch"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value: any) => value.replace(/\s?VND|(,*)/g, "")}
              />
            </Form.Item>
            <Form.Item
              className="w-[45%]"
              label="Số tiền giao dịch"
              name="transAmount"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập số tiền giao dịch!",
                },
                {
                  validator: (_, value) =>
                    value > 0
                      ? Promise.resolve()
                      : Promise.reject(
                        new Error("Số tiền giao dịch phải lớn hơn 0!")
                      ),
                },
              ]}
            >
              <InputNumber
                className="w-full"
                placeholder="Nhập số tiền giao dịch"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value: any) => value.replace(/\s?VND|(,*)/g, "")}
              />
            </Form.Item>
          </div>
          <div className="flex justify-between">
            <Form.Item
              className="w-[45%]"
              label="Số dư sau giao dịch"
              name="currentBalance"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập số dư sau giao dịch!",
                },
                {
                  validator: (_, value) =>
                    value >= 0
                      ? Promise.resolve()
                      : Promise.reject(
                        new Error("Số dư sau giao dịch phải lớn hơn 0!")
                      ),
                },
              ]}
            >
              <InputNumber
                className="w-full"
                placeholder="Nhập số dư sau giao dịch"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value: any) => value.replace(/\s?VND|(,*)/g, "")}
              />
            </Form.Item>
            <Form.Item
              className="w-[45%]"
              label="Nhập chi phí phát sinh"
              name="feeIncurred"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập chi phí phát sinh!",
                },
                {
                  validator: (_, value) =>
                    value >= 0
                      ? Promise.resolve()
                      : Promise.reject(
                        new Error("Chi phí phát sinh phải lớn hơn 0!")
                      ),
                },
              ]}
            >
              <InputNumber
                className="w-full"
                placeholder="Nhập chi phí phát sinh"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value: any) => value.replace(/\s?VND|(,*)/g, "")}
              />
            </Form.Item>
          </div>
          <div className="flex justify-between">
            <Form.Item
              className="w-[45%]"
              label="Nhập lý do"
              name="reason"
              rules={[
                {
                  required: true,
                  message: "Vui lòng Nhập lý do!",
                },
              ]}
            >
              <Input placeholder="Nhập lý do" autoComplete="off" />
            </Form.Item>
          </div>
          <Form.Item label="Ghi chú" name="notes">
            <Input.TextArea
              placeholder="Nhập ghi chú"
              autoSize={{ minRows: 3, maxRows: 5 }}
            />
          </Form.Item>
          <div className="flex justify-end pt-5">
            <Button
              onClick={() => setIsAddModalOpen(false)}
              className="w-[189px] !h-10"
            >
              Đóng
            </Button>
            <div className="w-4" />
            <Button
              type="primary"
              onClick={() => handleAddConfirm(true)}
              className={`${isAddTransaction && "pointer-events-none"
                } bg-[#4B5CB8] border text-white font-medium w-[189px] !h-10`}
              loading={isAddTransaction}
            >
              {currentTransaction ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </Form>
      </BaseModal>
      <DeleteModal
        open={isDeleteModalOpen}
        onCancel={handleCancel}
        onConfirm={handleConfirmDelete}
        transaction={selectedAccountGroup}
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

export default Transaction;
