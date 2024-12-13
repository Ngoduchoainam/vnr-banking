"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { DatePicker, Select, Skeleton, Space, Spin, Table } from "antd";
import type { TableProps } from "antd/es/table";
import Header from "@/src/component/Header";
import BarChart from "../products/BarChartMoney";
import Statistics from "../products/statistics";
import {
  getListStatistics,
  getTransactionById,
  resendSheet,
} from "@/src/services/statistics";
import BaseModal from "@/src/component/config/BaseModal";
import "./style.css";
import { fetchBankAccounts, getBank } from "@/src/services/bankAccount";
import { getListTelegram } from "@/src/services/telegram";
import { SyncOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import BarChartType from "../products/BarChartType";
import { RoleContext } from "@/src/component/RoleWapper";
import { formatDate } from "@/src/utils/buildQueryParams";
import { Utility } from "@/src/utils/Utility";

interface DataType {
  id: number;
  bankName: string;
  bankAccount: number;
  transDateString: Date;
  fullName: string;
  transAmount: number;
  narrative: string;
  transType: string;
  currentBalance: number;
  logStatus: string;
  bankAccountId: number;
}

interface LogEntry {
  chatName?: string;
  sheetName?: string;
  logMessage?: string;
  createdDate: string;
  logMessageDescription: string;
}

interface Transaction {
  id: number;
  bankAccountId: number;
  groupChatId: number;
  transDate: string;
  transAmount: number;
  fullName: string;
  narrative: string;
  balanceBeforeTrans: number;
  currentBalance: number;
  transType: string;
  transDateString: string;
  logMessageDescription: string;
  transTypeDescription: string;
}

interface TransactionData {
  logChatSqlRes: LogEntry[];
  logSheetSqlRes: LogEntry[];
  transaction: Transaction;
}

interface FilterProducts {
  Name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Value: any;
}

type DataTypeWithKey = DataType & { key: React.Key };

const Dashboard = () => {
  const { dataRole } = useContext(RoleContext);
  const keys = dataRole.key;
  const values = dataRole.value;
  const [isLoading, setIsLoading] = useState(false);
  const { RangePicker } = DatePicker;

  const [dataStatistics, setDataStatistics] = useState<DataType[]>([]);
  const [dataTransaction, setDataTransaction] =
    useState<TransactionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(20);
  const [totalRecord, setTotalRecord] = useState(100);

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
    if (pageIndex > 1 && dataStatistics.length < totalRecord) {
      const scrollPositionBeforeFetch = window.scrollY;
      const previousDocumentHeight = document.documentElement.scrollHeight;

      fetchListStatistics().finally(() => {
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

  console.log(130, dataStatistics);

  const fetchListStatistics = async (
    bank?: number,
    bankAccount?: string,
    groupChat?: number,
    transType?: string,
    typeAccount?: string,
    // transDate?: string | Date[]
    startDate?: string,
    endDate?: string
  ) => {
    const arrFilter: FilterProducts[] = [];
    const addedParams = new Set<string>();
    if (bank && !addedParams.has("bankId")) {
      arrFilter.push({
        Name: "bankId",
        Value: bank,
      });
      addedParams.add("bankId");
    }
    if (bankAccount && !addedParams.has("bankAccountId")) {
      arrFilter.push({
        Name: "bankAccountId",
        Value: bankAccount,
      });
      addedParams.add("bankAccountId");
    }
    if (groupChat && !addedParams.has("groupChatId")) {
      arrFilter.push({
        Name: "groupChatId",
        Value: groupChat.toString(),
      });
      addedParams.add("groupChatId");
    }
    if (transType && !addedParams.has("transType")) {
      arrFilter.push({
        Name: "transType",
        Value: transType,
      });
      addedParams.add("transType");
    }
    if (typeAccount && !addedParams.has("typeAccount")) {
      arrFilter.push({
        Name: "typeAccount",
        Value: typeAccount,
      });
      addedParams.add("transType");
    }

    const dateStartFormat = await Utility.ConvertDateTimeSameDay(startDate);
    const dateEndFormat = await Utility.ConvertDateTimeSameDay(endDate);

    if (startDate && endDate) {
      arrFilter.push({
        Name: "startDate",
        Value: formatDate(dateStartFormat.startOfDay || new Date),
      });
      arrFilter.push({
        Name: "endDate",
        Value: formatDate(dateEndFormat.endOfDay || new Date),
      });
    }


    arrFilter.push({
      Name: keys!,
      Value: values,
    });
    addedParams.add(keys!);
    setLoading(true);
    try {
      const response = await getListStatistics(pageIndex, 20, undefined, arrFilter);

      console.log(204, arrFilter)

      const formattedData =
        response?.data?.source?.map((x: DataType) => ({
          id: x.id,
          bankName: x.bankName,
          bankAccount: x.bankAccount,
          transDateString: x.transDateString,
          fullName: x.fullName,
          transAmount: x.transAmount,
          narrative: x.narrative,
          transType: x.transType,
          currentBalance: x.currentBalance,
          logStatus: x.logStatus,
          bankAccountId: x.bankAccountId,
        })) || [];

      setTotalRecord(response?.data?.totalRecords || 0);

      setDataStatistics((prevData) => [...prevData, ...formattedData]);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };

  const fetchStatisticsById = async (id: number) => {
    try {
      const response = await getTransactionById(id);
      setDataTransaction(response?.data);
    } catch (error) {
      console.error("Error fetching transaction by id:", error);
    }
  };

  const columns: TableProps<DataType>["columns"] = [
    { title: "Id", dataIndex: "id", key: "id", hidden: true },
    { title: "Ngân hàng", dataIndex: "bankName", key: "bankName" },
    { title: "TK ngân hàng", dataIndex: "bankAccount", key: "bankAccount" },
    {
      title: "Ngày giao dịch",
      dataIndex: "transDateString",
      key: "transDateString",
    },
    {
      title: "Chủ tài khoản",
      dataIndex: "fullName",
      key: "fullName",
    },
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
    { title: "Nội dung CK", dataIndex: "narrative", key: "narrative" },
    {
      title: "Loại giao dịch",
      dataIndex: "transType",
      key: "transType",
      render: (type: string) => {
        const className = type === "3" ? "text-green-500" : "text-red-500";
        const label = type === "3" ? "Tiền vào" : "Tiền ra";

        return <div className={`font-bold ${className}`}>{label}</div>;
      },
    },
    {
      title: "Số dư",
      dataIndex: "currentBalance",
      key: "currentBalance",
      render: (balance: number) =>
        new Intl.NumberFormat("vi-VN").format(balance),
    },
    {
      title: "Trạng thái",
      dataIndex: "logStatus",
      key: "logStatus",
      render: (status: string, record: DataType) => (
        <div
          className={`text-white flex items-center justify-center rounded-md font-bold w-[93px] h-[27px] cursor-pointer ${status === "1" ? "bg-green-500" : "bg-red-500"
            }`}
          onClick={() => {
            fetchStatisticsById(record.id);
            showModal();
          }}
        >
          {status === "1" ? "Thành công" : "Giao dịch lỗi"}
        </div>
      ),
    },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const [bankIdFilterAPI, setBankIdFilterAPI] = useState();
  const [bankFilter, setBankFilter] = useState();
  const [chatFilter, setChatFilter] = useState();
  const [transTypeFilter, setTransTypeFilter] = useState();
  const [transTypeCompanyFilter, setTransTypeCompanyFilter] = useState();
  const [startDateFilter, setTranDateFilter] = useState();

  // const [bankIdFilter, setBankIdFilter] = useState<
  //   Array<{ value: string; label: string }>
  // >([]);
  const [bankDataFilter, setBankDataFilter] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [bankAccountFilter, setBankAccountFilter] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [groupChatFilter, setGroupChatFilter] = useState<
    Array<{ value: string; label: string }>
  >([]);

  const options = [
    { value: "3", label: "Tiền vào" },
    { value: "2", label: "Tiền ra" },
    // { value: "1", label: "Cả hai" },
  ];
  const optionCompany = [
    { value: "1", label: "Tài khoản công ty" },
    { value: "2", label: "Tài khoản marketing" },
  ];

  const filterBankAPI = async () => {
    const arr: FilterProducts[] = [];
    const addedParams = new Set<string>();
    arr.push({
      Name: keys!,
      Value: values,
    });
    addedParams.add(keys!);
    try {
      const fetchBankDataAPI = await getBank(pageIndex, pageSize, arr);

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

  const filterBankAccount = async (bankId?: string) => {
    // console.log(352, bankId)
    const arr: FilterProducts[] = [];
    const addedParams = new Set<string>();
    arr.push({
      Name: "bankId",
      Value: bankId || "0",
    });
    arr.push({
      Name: keys!,
      Value: values,
    });
    addedParams.add(keys!);
    try {
      const fetchBankAccountAPI = await fetchBankAccounts(
        pageIndex,
        pageSize,
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

  const fetchListTelegram = async (groupChat?: string) => {
    const arr: FilterProducts[] = [];
    const addedParams = new Set<string>();
    if (groupChat && !addedParams.has("groupChat")) {
      arr.push({
        Name: "groupChat",
        Value: groupChat,
      });
    }
    arr.push({
      Name: keys!,
      Value: values,
    });
    addedParams.add(keys!);
    try {
      const fetchBankAccountAPI = await getListTelegram(
        pageIndex,
        pageSize,
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
          label: x.name || "Không xác định",
        }));

        setGroupChatFilter(res);
      } else {
        setGroupChatFilter([]);
      }
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
    }
  };

  const [filterParams, setFilterParams] = useState<{
    bankId?: string;
    bankAccountId?: string;
    groupChatId?: number;
    transType?: string;
    typeAccount?: string;
    tranDate?: string;
  }>({});

  const handleSelectChange = (
    bank?: string,
    bankAccount?: string,
    groupChat?: number,
    transType?: string,
    typeAccount?: string,
    startDate?: string,
    endDate?: string
  ) => {
    // console.log(bank,452)
    setFilterParams((prevParams) => ({
      ...prevParams,
      bankId: bank,
      bankAccountId: bankAccount,
      groupChatId: groupChat,
      transType: transType,
      typeAccount: typeAccount,
      startDate: startDate,
      endDate: endDate,
    }));
  };

  const handleResendSheet = async (transId: number, sheetMapId: number) => {
    setIsModalOpen(false);
    setIsLoading(true);
    try {
      const response = await resendSheet(transId, sheetMapId);
      if (response.status === 200 && response.success) {
        toast.success("Reload thành công!");
      } else {
        toast.success("Reload thành công!");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("API error:", error);
      toast.error(error.message || "Đã xảy ra lỗi khi gọi API.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await filterBankAPI();
      await filterBankAccount(filterParams?.bankId ?? "");
      await fetchListTelegram();
    };

    fetchData();
  }, [filterParams]);

  const [checkFilter, setCheckFilter] = useState(false);
  useEffect(() => {
    fetchListStatistics(bankIdFilterAPI, bankFilter, chatFilter);
  }, [checkFilter]);

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
          <Spin size="large" />
        </div>
      )}
      <div>
        <Header />
        <div className="dashboard mt-7">
          <div
            style={{
              display: "flex",
              gap: "20px",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <BarChart />
            <BarChartType />
            <Statistics />
          </div>
        </div>
        <div className="flex mx-[35px] mt-7">
          <Space direction="horizontal" size="middle">
            <Select
              // mode="multiple"
              options={bankDataFilter}
              placeholder="Ngân hàng"
              style={{ width: 245 }}
              allowClear
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={async (value: any) => {
                setBankIdFilterAPI(value);
                filterBankAccount(value);
                await setPageIndex(1);
                await setDataStatistics([])

                if (!value) {
                  handleSelectChange(
                    value,
                    bankFilter,
                    chatFilter,
                    transTypeFilter,
                    transTypeCompanyFilter,
                    startDateFilter
                  );
                  setCheckFilter(!checkFilter);
                } else {
                  fetchListStatistics(
                    value,
                    bankFilter,
                    chatFilter,
                    transTypeFilter,
                    transTypeCompanyFilter,
                    startDateFilter
                  );
                }
              }}
            />
            <Select
              mode="multiple"
              options={bankAccountFilter}
              placeholder="Tài khoản ngân hàng"
              style={{ width: 245 }}
              allowClear
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={async (value: any) => {
                const parsedValue = Array.isArray(value)
                  ? value
                  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  value.split(",").map((item: any) => item.trim());

                setBankFilter(parsedValue);
                await setPageIndex(1);
                await setDataStatistics([])

                if (!parsedValue.length) {
                  setFilterParams((prevParams) => ({
                    ...prevParams,
                    bankAccountId: parsedValue,
                  }));
                  handleSelectChange(
                    bankIdFilterAPI,
                    parsedValue,
                    chatFilter,
                    transTypeFilter,
                    transTypeCompanyFilter,
                    startDateFilter
                  );
                  setCheckFilter(!checkFilter);
                } else {
                  fetchListStatistics(
                    bankIdFilterAPI,
                    parsedValue,
                    chatFilter,
                    transTypeFilter,
                    transTypeCompanyFilter,
                    startDateFilter
                  );
                }
              }}
            />
            <Select
              mode="multiple"
              options={groupChatFilter}
              placeholder="Nhóm chat telegram"
              style={{ width: 245 }}
              allowClear
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={async (value: any) => {
                const parsedValue = Array.isArray(value)
                  ? value
                  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  value.split(",").map((item: any) => item.trim());
                setChatFilter(value);
                await setPageIndex(1);
                await setDataStatistics([])
                if (!value) {
                  handleSelectChange(
                    bankIdFilterAPI,
                    bankFilter,
                    parsedValue,
                    transTypeFilter,
                    transTypeCompanyFilter,
                    startDateFilter
                  );
                  setCheckFilter(!checkFilter);
                } else {
                  fetchListStatistics(
                    bankIdFilterAPI,
                    bankFilter,
                    parsedValue,
                    transTypeFilter,
                    transTypeCompanyFilter,
                    startDateFilter
                  );
                }
              }}
            />
            <Select
              options={options}
              placeholder="Loại giao dịch"
              style={{ width: 245 }}
              allowClear
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={async (value: any) => {
                setTransTypeFilter(value);
                await setPageIndex(1);
                await setDataStatistics([])
                if (!value) {
                  handleSelectChange(
                    bankIdFilterAPI,
                    bankFilter,
                    chatFilter,
                    value,
                    transTypeCompanyFilter,
                    startDateFilter
                  );
                  setCheckFilter(!checkFilter);
                } else {
                  fetchListStatistics(
                    bankIdFilterAPI,
                    bankFilter,
                    chatFilter,
                    value,
                    transTypeCompanyFilter,
                    startDateFilter
                  );
                }
              }}
            />
            <Select
              allowClear
              options={optionCompany}
              placeholder="Loại tài khoản"
              style={{ width: 245 }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={async (value: any) => {
                setTransTypeCompanyFilter(value);
                await setPageIndex(1);
                await setDataStatistics([])
                if (!value) {
                  handleSelectChange(
                    bankIdFilterAPI,
                    bankFilter,
                    chatFilter,
                    transTypeFilter,
                    value,
                    startDateFilter
                  );
                  setCheckFilter(!checkFilter);
                } else {
                  fetchListStatistics(
                    bankIdFilterAPI,
                    bankFilter,
                    chatFilter,
                    transTypeFilter,
                    value,
                    startDateFilter
                  );
                }
              }}
            />
            <RangePicker
              id={{
                start: "startInput",
                end: "endInput",
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={async (value: any) => {
                setTranDateFilter(value);
                await setPageIndex(1);
                await setDataStatistics([])

                if (!value || value.length !== 2) {
                  handleSelectChange(
                    bankIdFilterAPI,
                    bankFilter,
                    chatFilter,
                    transTypeFilter,
                    "",
                    ""
                  );
                  setCheckFilter(!checkFilter);
                } else {
                  const [startDate, endDate] = value;
                  handleSelectChange(
                    bankIdFilterAPI,
                    bankFilter,
                    chatFilter,
                    transTypeFilter,
                    transTypeCompanyFilter,
                    startDate,
                    endDate
                  );
                  fetchListStatistics(
                    bankIdFilterAPI,
                    bankFilter,
                    chatFilter,
                    transTypeFilter,
                    transTypeCompanyFilter,
                    startDate,
                    endDate
                  );
                }
              }}
              disabledDate={(current) =>
                current && current > dayjs().endOf("day")
              }
            />
          </Space>
        </div>
        <div className="mt-5 mx-[35px]">
          {loading ? (
            <Table
              rowKey="key"
              pagination={false}
              loading={loading}
              dataSource={
                [...Array(10)].map((_, index) => ({
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
            <Table dataSource={dataStatistics} columns={columns} pagination={false} />
          )}
        </div>
      </div>
      <BaseModal
        title="Chi tiết giao dịch"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        offPadding
      >
        <div className="w-full">
          <div className="text-red-500 text-2xl pb-2">
            -{" "}
            {new Intl.NumberFormat("vi-VN", {
              currency: "VND",
            }).format(dataTransaction?.transaction?.transAmount || 0)}
          </div>
          <div className="font-bold flex py-1">
            Tài khoản:{" "}
            <div className="font-normal pl-1">
              {dataTransaction?.transaction?.fullName}
            </div>
          </div>
          <div className="font-bold flex py-1">
            Nội dung:{" "}
            <div className="pl-2 font-normal">
              {dataTransaction?.transaction?.narrative}
            </div>
          </div>
          <div className="font-bold flex py-1">
            Số dư:
            <div className="pl-2 font-normal">
              {new Intl.NumberFormat("vi-VN", {
                currency: "VND",
              }).format(dataTransaction?.transaction?.currentBalance || 0)}
            </div>
          </div>
          <div className="font-bold flex py-1">
            Trạng thái:
            <div className="pl-2 font-normal">
              {dataTransaction?.transaction?.logMessageDescription}
            </div>
          </div>
          <div className="font-bold flex py-1 pb-3">
            Ngày giao dịch:
            <div className="pl-2 font-normal">
              {dataTransaction?.transaction?.transDateString}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4">
              <div className="text-xl text-[#495057]">Thông báo Telegram</div>
              <div>
                {dataTransaction?.logChatSqlRes?.map(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (x: any, index: number) => (
                    <div
                      key={index}
                      className="pt-3 border-b border-solid border-gray-300"
                    >
                      <div>{x?.chatName}</div>
                      <div className="bg-[#04a616] w-24 rounded-xl flex justify-center text-white my-1">
                        {x?.logMessageDescription}
                      </div>
                      <div className="pb-3">
                        {x?.modifiedDate &&
                          new Date(x?.modifiedDate).toLocaleString("en-US", {
                            month: "2-digit",
                            day: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: true,
                          })}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
            <div className="p-4">
              <div className="text-xl text-[#495057]">
                Thông báo Google Sheet
              </div>
              <div>
                {dataTransaction?.logSheetSqlRes?.map(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (x: any, index: number) => (
                    <div
                      key={index}
                      className="pt-3 border-b border-solid border-gray-300"
                    >
                      <div>{x?.sheetName}</div>
                      <div>
                        {x?.logMessage === "2" ? (
                          <div className="flex justify-between items-center">
                            <div className="bg-[#ff0000] w-12 rounded-xl flex justify-center text-white my-1">
                              {x?.logMessageDescription}
                            </div>
                            <SyncOutlined
                              // spin={isLoading}
                              onClick={() => {
                                handleResendSheet(x.transactionId, x?.id);
                              }}
                              className="cursor-pointer"
                            />
                          </div>
                        ) : (
                          <div className="bg-[#04a616] w-24 rounded-xl flex justify-center text-white my-1">
                            {x?.logMessageDescription}
                          </div>
                        )}
                      </div>
                      <div className="pb-3">
                        {x?.modifiedDate &&
                          new Date(x?.modifiedDate).toLocaleString("en-US", {
                            month: "2-digit",
                            day: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: true,
                          })}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </BaseModal>
    </>
  );
};

export default Dashboard;
