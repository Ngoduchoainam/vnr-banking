import { Col, DatePicker, Row, Select, Spin } from "antd";
import React, { startTransition, useEffect, useState } from "react";
import BarChart from "./BarChart";
import ProgressMoney from "./ProgressMoney";
import { TypeAsset } from "@/src/common/type";
import {
  buildSearchParams,
  disabledDate,
  options,
} from "@/src/utils/buildQueryParams";
import { apiClient } from "@/src/services/base_api";
import { getTypeAsset } from "@/src/services/bankAccount";
import type { DatePickerProps } from "antd";

const ChartMoney = ({ active }: { active: number }) => {
  const [isLoading1, setIsLoading1] = useState(true);
  const [isLoading2, setIsLoading2] = useState(true);
  const [chart, setChart] = useState<TypeAsset[]>([]);
  const [progress, setProgress] = useState<TypeAsset[]>([]);
  const [typeMoney, setTypeMoney] = useState({
    listType: [],
    typeChoose: "",
  });
  const [dataFilter, setDataFilter] = useState<{
    year?: string;
    month: string | undefined;
    moneyType: string;
  }>({
    year: "",
    month: undefined,
    moneyType: "1",
  });
  const [monthProgress, setMonthProgress] = useState("");

  const getlistTypeAsset = async () => {
    try {
      const listTypeAsset = await getTypeAsset({
        cdType: "TRANS_CASH",
        cdName: "TYPE",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const listTypeAssetConvert = listTypeAsset.map((item: any) => {
        return { label: item.vnContent, value: item.cdVal };
      });

      setTypeMoney((prev) => ({ ...prev, listType: listTypeAssetConvert }));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {}
  };

  const getListChart = async ({
    type,
    typeChart,
    year,
    month,
  }: {
    type: string;
    typeChart: string;
    year?: string;
    month?: string;
  }) => {
    const arr = [
      {
        Name: "type",
        Value: type,
      },
      {
        Name: "typeChart",
        Value: typeChart,
      },
    ];
    if (year || dataFilter.year) {
      arr.push({
        Name: "year",
        Value: year ?? dataFilter.year ?? "",
      });
    }
    if (month || dataFilter.month) {
      arr.push({
        Name: "month",
        Value: month ?? dataFilter.month ?? "",
      });
    }

    const params = buildSearchParams(arr, {
      pageIndex: 1,
      pageSize: 20,
    });

    try {
      setIsLoading1(true);
      const responsive = await apiClient.get(`/asset-api/get-chart`, {
        params,
      });
      const listMoneyChart = responsive.data.data.cashChart?.filter(
        (item: TypeAsset) => item.value !== 0
      );

      setChart(listMoneyChart ?? []);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
    } finally {
      setIsLoading1(false);
    }
  };

  const getLisChartProgress = async ({
    type,
    typeChart,
    month,
  }: {
    type: string;
    typeChart: string;
    year?: string;
    month?: string;
  }) => {
    const arr = [
      {
        Name: "type",
        Value: type,
      },
      {
        Name: "typeChart",
        Value: typeChart,
      },
    ];
    if (month) {
      arr.push({
        Name: "month",
        Value: month,
      });
    }

    const params = buildSearchParams(arr, {
      pageIndex: 1,
      pageSize: 20,
    });

    try {
      setIsLoading2(true);
      const responsive = await apiClient.get(`/asset-api/get-chart`, {
        params,
      });
      const listMoneyChart = responsive.data.data.cashChart?.filter(
        (item: TypeAsset) => item.value !== 0
      );
      setProgress(listMoneyChart ?? []);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
    } finally {
      setIsLoading2(false);
    }
  };

  useEffect(() => {
    Promise.all([
      getListChart({ type: "1", typeChart: `${active}` }),
      getLisChartProgress({ type: "1", typeChart: `${active}` }),
    ]);
    startTransition(() => {
      getlistTypeAsset();
    });
  }, [active]);

  const handleChangeTypeMoney = (e: string | undefined) => {
    setDataFilter((prev) => ({ ...prev, moneyType: e ?? "1" }));
    Promise.all([
      getListChart({
        type: e ?? "1",
        typeChart: `${active}`,
      }),
      getLisChartProgress({
        type: e ?? "1",
        typeChart: `${active}`,
        month: monthProgress,
      }),
    ]);
  };

  const handleChangeYear: DatePickerProps["onChange"] = (date, dateString) => {
    if (typeof dateString === "string" && dateString.trim() !== "") {
      setDataFilter((prev) => ({ ...prev, year: dateString }));
      getListChart({
        type: dataFilter.moneyType,
        typeChart: `${active}`,
        year: dateString,
      });
    } else {
      setDataFilter((prev) => ({ ...prev, year: "", month: undefined }));
      getListChart({
        type: dataFilter.moneyType,
        typeChart: `${active}`,
        year: "",
        month: "",
      });
    }
  };

  const handleChangeMonth = (e: string) => {
    setDataFilter((prev) => ({ ...prev, month: e }));
    getListChart({
      type: dataFilter.moneyType ?? "1",
      typeChart: `${active}`,
      month: `${e}`,
    });
  };

  const handleChangeMonthProgress = (e: string) => {
    setMonthProgress(e);
    getLisChartProgress({
      type: dataFilter.moneyType ?? "1",
      typeChart: `${active}`,
      month: e,
    });
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-10">
        <Select
          options={typeMoney.listType}
          allowClear
          placeholder="Loại tiền"
          onChange={(e) => {
            handleChangeTypeMoney(e);
          }}
          className="w-[180px]"
        />
        <DatePicker
          onChange={handleChangeYear}
          picker="year"
          placeholder="Năm"
          disabledDate={disabledDate}
        />
        <Select
          placeholder="Tháng"
          style={{ width: 150 }}
          allowClear
          options={options}
          disabled={!dataFilter.year}
          onChange={(e) => handleChangeMonth(e)}
          value={dataFilter.month}
        />
      </div>
      <Row>
        <Col
          span={16}
          className={`${isLoading1 && "mx-auto pt-40 text-center"}`}
        >
          {isLoading1 ? (
            <Spin />
          ) : (
            <>
              {chart && chart.length > 0 ? (
                <BarChart moneyChart={chart} moneyType={dataFilter.moneyType} />
              ) : (
                <p className="text-base text-center italic pt-20">
                  Không có dữ liệu!
                </p>
              )}
            </>
          )}
        </Col>
        <Col span={8}>
          <ProgressMoney
            progress={progress}
            moneyType={dataFilter.moneyType}
            handleChangeMonthProgress={handleChangeMonthProgress}
            isLoading2={isLoading2}
          />
        </Col>
      </Row>
    </>
  );
};

export default ChartMoney;
