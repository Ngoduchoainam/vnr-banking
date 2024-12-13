"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { DeleteOutlined } from "@ant-design/icons";
import Header from "@/src/component/Header";
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Skeleton,
  Space,
  Table,
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

export interface TransactionModal {
  id: number;
  bankName: string;
  bankAccountId: number;
  bankAccount: string;
  fullName: string;
  transDateString: string;
  transType: string;
  purposeDescription: string;
  reason: string;
  balanceBeforeTrans: number;
  currentBalance: number;
  notes: string;
  transDate?: string;
  bankId?: number;
  feeIncurred: number;
  transAmount: number;
}

interface FilterRole {
  Name: string;
  Value: string;
}

type DataTypeWithKey = TransactionModal & { key: React.Key };

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [globalTerm, setGlobalTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] =
    useState<TransactionModal | null>(null);
  const [banks, setBanks] = useState<Array<TransactionModal>>([]);
  const [bankAccount, setBankAccount] = useState<Array<TransactionModal>>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 20;
  const [totalRecord, setTotalRecord] = useState(100);

  const [isAddTransaction, setIsAddTransaction] = useState<boolean>(false);

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
    if (pageIndex > 1 && dataTransaction.length < totalRecord) {
      const scrollPositionBeforeFetch = window.scrollY;
      const previousDocumentHeight = document.documentElement.scrollHeight;

      fetchTransaction().finally(() => {
        setTimeout(() => {
          const newDocumentHeight = document.documentElement.scrollHeight;
          const scrollDifference = newDocumentHeight - previousDocumentHeight;

          window.scrollTo(0, scrollPositionBeforeFetch + scrollDifference);
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

  const fetchTransaction = async (
    globalTerm?: string,
    startDate?: string,
    endDate?: string
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
    arrRole.push({
      Name: keys!,
      Value: values,
    });
    addedParams.add(keys!);
    setLoading(true);
    try {
      const response = await getTransaction(
        pageIndex,
        pageSize,
        globalTerm,
        arrRole
      );
      const formattedData =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    }
  };

  const fetchBankData = async () => {
    try {
      const bankData = await getBank(pageIndex, pageSize);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const arr: any[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj: any = {
      Name: "bankId",
      Value: bankId,
    };
    await arr.push(obj);
    try {
      const bankData = await fetchBankAccounts(1, 50, undefined, arr);
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
        await fetchTransaction(); // Hoặc cập nhật state trực tiếp để tránh fetch lại toàn bộ.
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

  const handleSearch = async (value: string) => {
    setGlobalTerm(value);
    try {
      if (value.trim() === "") {
        const data = await getTransaction(pageIndex, pageSize);
        const formattedData =
          data?.data?.source?.map((item: TransactionModal) => ({
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
          })) || [];

        setDataTransaction(formattedData);
      } else {
        const data = await getTransaction(pageIndex, pageSize, value);
        const formattedData =
          data?.data?.source?.map((item: TransactionModal) => ({
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
          })) || [];

        setDataTransaction(formattedData);
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm tài khoản ngân hàng:", error);
    }
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAccountGroup, setSelectedAccountGroup] =
    useState<TransactionModal | null>(null);

  const handleDeleteClick = (tele: TransactionModal) => {
    setSelectedAccountGroup(tele);
    setIsDeleteModalOpen(true);
  };

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
      // hidden: true,
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
    // {
    //   title: "Mục đích",
    //   dataIndex: "purposeDescription",
    //   key: "purposeDescription",
    // },
    { title: "Lý do", dataIndex: "reason", key: "reason" },
    {
      title: "Số tiền",
      dataIndex: "balanceBeforeTrans",
      key: "balanceBeforeTrans",
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (balance: any) =>
        balance.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
    { title: "Ghi chú", dataIndex: "notes", key: "notes" },
    {
      title: "Chức năng",
      key: "action",
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      render: (record: TransactionModal) => (
        <Space size="middle">
          {/* <Button onClick={() => handleEdit(record)} icon={<EditOutlined />}>
            Chỉnh sửa
          </Button> */}
          <Button
            onClick={() => handleDeleteClick(record)}
            icon={<DeleteOutlined />}
            danger
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [filterParams, setFilterParams] = useState<{
    purpose?: string;
    tranDate?: string;
  }>({});
  const handleSelectChange = (
    purpose?: string,
    startDate?: string,
    endDate?: string
  ) => {
    setFilterParams((prevParams) => ({
      ...prevParams,
      purpose: purpose,
      startDate: startDate,
      endDate: endDate,
    }));
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [purposeDescription, setPurposeDescription] = useState();
  const [startDateFilter, setTranDateFilter] = useState();
  //
  const [checkFilter, setCheckFilter] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectBankId, setSelectBankId] = useState(0);

  useEffect(() => {
    fetchTransaction(globalTerm, startDateFilter, startDateFilter);
  }, [checkFilter, keys]);

  // .........................................................................//

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
      await deleteTransaction(idsToDelete);
      toast.success("Xóa các mục thành công!");
      await fetchTransaction();
      setSelectedRowKeys([]);
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

  return (
    <>
      <Header />
      <div className="px-[30px]">
        <div className="text-[32px] font-bold py-5">
          Danh sách giao dịch thủ công
        </div>
        <div className="flex justify-between items-center mb-7">
          <div>
            <Input
              placeholder="Tìm kiếm số tài khoản ..."
              style={{
                width: 253,
                borderRadius: 10,
                height: 38,
                marginRight: 15,
              }}
              onChange={(e) => {
                const value = e.target.value;
                setGlobalTerm(value);
                if (!value) {
                  setPageIndex(1);
                  setDataTransaction([])
                  setCheckFilter(!checkFilter);
                }
              }}
              onPressEnter={async (e) => {
                setPageIndex(1);
                setDataTransaction([])
                handleSearch(e.currentTarget.value);
              }}
            />
            <RangePicker
              id={{
                start: "startInput",
                end: "endInput",
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(value: any) => {
                setTranDateFilter(value);
                setPageIndex(1);
                setDataTransaction([])
                if (!value || value.length !== 2) {
                  handleSelectChange(purposeDescription);
                  setCheckFilter(!checkFilter);
                } else {
                  const [startDate, endDate] = value;
                  handleSelectChange(startDate, endDate);
                  fetchTransaction(
                    globalTerm,
                    startDate,
                    endDate
                  );
                }
              }}
              disabledDate={(current) =>
                current && current > dayjs().endOf("day")
              }
            />
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
                setCurrentTransaction(null);
                form.resetFields();
                setIsAddModalOpen(true);
              }}
            >
              Thêm mới
            </Button>
          </div>
        </div>
        {loading ? (
          <Table
            rowKey="key"
            pagination={false}
            loading={loading}
            dataSource={
              [...Array(13)].map((_, index) => ({
                key: `key${index}`,
              })) as DataTypeWithKey[]
            }
            columns={columns.map((column) => ({
              ...column,
              render: function renderPlaceholder() {
                return (
                  <Skeleton
                    key={column.key as React.Key}
                    title
                    active={false}
                    paragraph={false}
                  />
                );
              },
            }))}
          />
        ) : (
          <Table
            rowKey="key"
            dataSource={dataSource}
            columns={columns}
            rowSelection={rowSelection}
            loading={loading}
            pagination={false}
          />
        )}
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
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={async (value: any) => {
                  const selectedGroup = await bankAccount.find(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
