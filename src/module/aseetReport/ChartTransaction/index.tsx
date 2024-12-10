import { Col, DatePicker, Row, Select, Spin } from "antd";
import React, { startTransition, useEffect, useState } from "react";
import BarChart from "./BarChart";
import { TransactionType } from "@/src/common/type";
import { apiClient } from "@/src/services/base_api";
import {
  buildSearchParams,
  disabledDate,
  options,
} from "@/src/utils/buildQueryParams";
import type { DatePickerProps } from "antd";

export interface ListOptionsTransactionType {
  account: [];
  system: [];
  team: [];
  branch: [];
  team_acount: [];
}

const ChartTransaction = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [transaction, setTransaction] = useState<TransactionType[]>([]);
  const [listOptions, setListOptions] = useState<ListOptionsTransactionType>({
    account: [],
    system: [],
    team: [],
    branch: [],
    team_acount: [],
  });
  const [dataFilterTransaction, setDataFilterTransaction] = useState<{
    dataAccount: string;
    dataSystem: string;
    dataTeam: string | undefined;
    dataBranch: string | undefined;
    dataTeamAccount: string;
    dataYear: string;
    dataMonth: string | undefined;
  }>({
    dataAccount: "",
    dataSystem: "",
    dataTeam: undefined,
    dataBranch: undefined,
    dataTeamAccount: "",
    dataYear: "",
    dataMonth: undefined,
  });
  const getListSystem = async () => {
    const data = await apiClient.get("/group-system-api/find");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataConvert = data.data.data.source.map((item: any) => {
      return { label: item.name, value: `${item.id}` };
    });
    setListOptions((prev) => ({ ...prev, system: dataConvert ?? [] }));
  };

  const getListBranch = async (systemId: string) => {
    const params = buildSearchParams(
      [
        {
          Name: "groupSystemId",
          Value: systemId,
        },
      ],
      {
        pageIndex: 1,
        pageSize: 20,
      }
    );
    const data = await apiClient.get("/group-branch-api/find", {
      params,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataConvert = data.data.data.source.map((item: any) => {
      return { label: item.name, value: `${item.id}` };
    });

    setListOptions((prev) => ({ ...prev, branch: dataConvert }));
  };

  const getListTeam = async (branchId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const arr: any[] = [];
    if (dataFilterTransaction.dataSystem) {
      arr.push({
        Name: "groupSystemId",
        Value: dataFilterTransaction.dataSystem,
      });
    }
    if (branchId) {
      arr.push({
        Name: "groupBranchId",
        Value: branchId,
      });
    }
    const params = buildSearchParams(arr, {
      pageIndex: 1,
      pageSize: 20,
    });
    const data = await apiClient.get("/group-team-api/find", {
      params,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataConvert = data.data.data.source.map((item: any) => {
      return { label: item.name, value: `${item.id}` };
    });
    setListOptions((prev) => ({ ...prev, team: dataConvert }));
  };

  const getListAccount = async () => {
    const data = await apiClient.get("/allcode-api/find", {
      params: {
        cdType: "BANK_ACCOUNT",
        cdName: "TYPE_ACCOUNT",
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataConvert = data.data.data.map((item: any) => {
      return { label: item.vnContent, value: `${item.cdVal}` };
    });
    setListOptions((prev) => ({ ...prev, account: dataConvert }));
  };

  const getListTeamAccount = async () => {
    const data = await apiClient.get("/group-account-api/find");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataConvert = data.data.data.source.map((item: any) => {
      return { label: item.fullName, value: `${item.id}` };
    });
    setListOptions((prev) => ({ ...prev, team_acount: dataConvert }));
  };
  const getListTransaction = async ({
    groupSystemId,
    groupBranchId,
    groupTeamId,
    typeAccount,
    groupAccount,
    year,
    month,
  }: {
    groupSystemId?: string;
    groupBranchId?: string;
    groupTeamId?: string;
    typeAccount?: string;
    groupAccount?: string;
    year?: string;
    month?: string;
  }) => {
    const arr = [];
    if (groupSystemId || dataFilterTransaction.dataSystem) {
      arr.push({
        Name: "groupSystemId",
        Value: groupSystemId ?? dataFilterTransaction.dataSystem,
      });
    }
    if (groupBranchId || dataFilterTransaction.dataBranch) {
      arr.push({
        Name: "groupBranchId",
        Value: groupBranchId ?? dataFilterTransaction.dataBranch ?? "",
      });
    }
    if (groupTeamId || dataFilterTransaction.dataTeam) {
      arr.push({
        Name: "groupTeamId",
        Value: groupTeamId ?? dataFilterTransaction.dataTeam ?? "",
      });
    }
    if (typeAccount || dataFilterTransaction.dataAccount) {
      arr.push({
        Name: "typeAccount",
        Value: typeAccount ?? dataFilterTransaction.dataAccount,
      });
    }
    if (groupAccount || dataFilterTransaction.dataTeamAccount) {
      arr.push({
        Name: "groupAccount",
        Value: groupAccount ?? dataFilterTransaction.dataTeamAccount,
      });
    }
    if (year || dataFilterTransaction.dataYear) {
      arr.push({
        Name: "year",
        Value: year ?? dataFilterTransaction.dataYear,
      });
    }
    if (month || dataFilterTransaction.dataMonth) {
      arr.push({
        Name: "month",
        Value: month ?? dataFilterTransaction.dataMonth ?? "",
      });
    }
    const params = buildSearchParams(arr, {
      pageIndex: 1,
      pageSize: 20,
    });

    try {
      setIsLoading(true);
      const responsive = await apiClient.get(`/asset-api/get-transaction`, {
        params,
      });

      const isCheckData = responsive.data.data.some(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (item: any) =>
          item.balance !== 0 &&
          item.totalAmountIn !== 0 &&
          item.totalAmountOut !== 0
      );
      setTransaction(isCheckData ? responsive.data.data : []);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getListTransaction({});
    startTransition(() => {
      Promise.all([getListSystem(), getListTeamAccount(), getListAccount()]);
    });
  }, []);

  const handleChangeSystem = (e: string | undefined) => {
    if (e && e !== dataFilterTransaction.dataSystem) {
      setDataFilterTransaction((prev) => ({
        ...prev,
        dataSystem: e,
        dataBranch: undefined,
        dataTeam: undefined,
      }));
      getListBranch(e);
      getListTransaction({
        groupSystemId: e,
      });
    } else if (e && e === dataFilterTransaction.dataSystem) {
      return;
    } else {
      setDataFilterTransaction((prev) => ({
        ...prev,
        dataSystem: "",
        dataBranch: undefined,
        dataTeam: undefined,
      }));
      getListTransaction({
        groupSystemId: "",
        groupBranchId: "",
        groupTeamId: "",
      });
    }
  };
  const handleChangeBranch = (e: string | undefined) => {
    if (e && e !== dataFilterTransaction.dataBranch) {
      setDataFilterTransaction((prev) => ({
        ...prev,
        dataBranch: e,
        dataTeam: undefined,
      }));
      getListTeam(e);
      getListTransaction({
        groupBranchId: e,
      });
    } else if (e && e == dataFilterTransaction.dataBranch) {
      return;
    } else {
      setDataFilterTransaction((prev) => ({
        ...prev,
        dataBranch: undefined,
        dataTeam: undefined,
      }));
      getListTransaction({
        groupBranchId: "",
        groupTeamId: "",
      });
    }
  };
  const handleChangeTeam = (e: string | undefined) => {
    if (e) {
      setDataFilterTransaction((prev) => ({
        ...prev,
        dataTeam: e,
      }));
      getListTransaction({
        groupTeamId: e,
      });
    } else {
      setDataFilterTransaction((prev) => ({
        ...prev,
        dataTeam: undefined,
      }));
      getListTransaction({
        groupTeamId: "",
      });
    }
  };

  const handleChangeTeamAccount = (e: number | undefined) => {
    setDataFilterTransaction((prev) => ({
      ...prev,
      dataTeamAccount: e ? `${e}` : "",
    }));
    getListTransaction({
      groupAccount: e ? `${e}` : "",
    });
  };

  const handleChangeYearTransaction: DatePickerProps["onChange"] = (
    date,
    dateString
  ) => {
    if (typeof dateString === "string" && dateString.trim() !== "") {
      setDataFilterTransaction((prev) => ({ ...prev, dataYear: dateString }));
      getListTransaction({
        year: dateString,
      });
    } else {
      setDataFilterTransaction((prev) => ({
        ...prev,
        dataYear: "",
        dataMonth: undefined,
      }));
      getListTransaction({
        year: "",
      });
    }
  };

  const handleChangeMonthTransaction = (e: string | undefined) => {
    setDataFilterTransaction((prev) => ({
      ...prev,
      dataMonth: e ? `${e}` : "",
    }));
    getListTransaction({
      month: e ? `${e}` : "",
    });
  };

  const handleChangeAccount = (e: number | undefined) => {
    setDataFilterTransaction((prev) => ({
      ...prev,
      dataAccount: e ? `${e}` : "",
    }));
    getListTransaction({
      typeAccount: e ? `${e}` : "",
    });
  };

  const totalAmountIn = transaction?.reduce((sum, item) => {
    return sum + item.totalAmountIn;
  }, 0);

  const totalAmountOut = transaction?.reduce((sum, item) => {
    return sum + item.totalAmountOut;
  }, 0);

  const totalBalance = transaction?.reduce((sum, item) => {
    return sum + item.balance;
  }, 0);

  return (
    <>
      <div className="flex items-center gap-4 mb-10">
        <Select
          options={listOptions.account}
          placeholder="Loại tài khoản"
          style={{ width: 245 }}
          allowClear
          onChange={(e) => handleChangeAccount(e)}
        />
        <Select
          options={listOptions.system}
          placeholder="Hệ thống"
          style={{ width: 245 }}
          allowClear
          onChange={(e) => handleChangeSystem(e)}
        />
        <Select
          options={listOptions.branch}
          placeholder="Chi nhánh"
          style={{ width: 245 }}
          allowClear
          disabled={
            dataFilterTransaction.dataSystem === "" ||
            listOptions.branch.length === 0
          }
          onChange={(e) => handleChangeBranch(e)}
          value={dataFilterTransaction.dataBranch}
        />
        <Select
          options={listOptions.team}
          placeholder="Đội nhóm"
          style={{ width: 245 }}
          allowClear
          disabled={
            dataFilterTransaction.dataBranch === undefined ||
            listOptions.team.length === 0
          }
          onChange={(e) => handleChangeTeam(e)}
          value={dataFilterTransaction.dataTeam}
        />

        <Select
          options={listOptions.team_acount}
          placeholder="Nhóm tài khoản"
          style={{ width: 245 }}
          allowClear
          onChange={(e) => handleChangeTeamAccount(e)}
        />
        <DatePicker
          onChange={handleChangeYearTransaction}
          picker="year"
          placeholder="Năm"
          disabledDate={disabledDate}
        />
        <Select
          placeholder="Tháng"
          style={{ width: 150 }}
          allowClear
          options={options}
          disabled={dataFilterTransaction.dataYear === ""}
          onChange={(e) => handleChangeMonthTransaction(e)}
          value={dataFilterTransaction.dataMonth}
        />
      </div>
      {isLoading ? (
        <Spin className="!flex !justify-center !pt-40" />
      ) : (
        <>
          {transaction.length > 0 ? (
            <Row>
              <Col span={16}>
                <BarChart transaction={transaction} />
              </Col>
              <Col span={8}>
                <div className="bg-white px-4 py-10 rounded-lg flex flex-col gap-4">
                  <p className="uppcase text-2xl font-bold">Tổng</p>
                  <ul className="flex flex-col gap-4 pl-3">
                    <li>
                      <p>
                        <span className="inline-block w-[100px] text-base">
                          Tiền vào:
                        </span>
                        <span className="font-semibold w-[100px] text-base">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(totalAmountIn)}
                        </span>
                      </p>
                    </li>
                    <li>
                      <p>
                        <span className="inline-block w-[100px] text-base">
                          Tiền ra:
                        </span>
                        <span className="font-semibold w-[100px] text-base">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(totalAmountOut)}
                        </span>
                      </p>
                    </li>
                    <li>
                      <p>
                        <span className="inline-block w-[100px] text-base">
                          Số dư:
                        </span>
                        <span className="font-semibold w-[100px] text-base">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(totalBalance)}
                        </span>
                      </p>
                    </li>
                  </ul>
                </div>
              </Col>
            </Row>
          ) : (
            <p className="text-base text-center italic pt-40">
              Không có dữ liệu!
            </p>
          )}
        </>
      )}
    </>
  );
};

export default ChartTransaction;
