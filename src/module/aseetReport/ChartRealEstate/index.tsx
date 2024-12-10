import { Col, DatePicker, Row, Select, Spin } from "antd";
import React, { useEffect, useState } from "react";
import BarChart from "./BarChart";
import { TypeAsset } from "@/src/common/type";
import ProgressRealEstate from "./ProgressRealEstate";
import {
  buildSearchParams,
  disabledDate,
  options,
} from "@/src/utils/buildQueryParams";
import { apiClient } from "@/src/services/base_api";
import type { DatePickerProps } from "antd";

const ChartRealEstate = ({ active }: { active: number }) => {
  const [isLoading1, setIsLoading1] = useState(true);
  const [isLoading2, setIsLoading2] = useState(true);
  const [chart, setChart] = useState<TypeAsset[]>([]);
  const [progress, setProgress] = useState<TypeAsset[]>([]);
  const [year, setYear] = useState("");
  const [month, setMonth] = useState<string | undefined>(undefined);

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
    if (year) {
      arr.push({
        Name: "year",
        Value: year,
      });
    }
    if (month) {
      arr.push({
        Name: "month",
        Value: month,
      });
    }

    const params = buildSearchParams(arr, {
      pageSize: 20,
    });

    try {
      setIsLoading1(true);
      const responsive = await apiClient.get(`/asset-api/get-chart`, {
        params,
      });
      const listMoneyChart = responsive.data.data.realEstateChart?.filter(
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
      const listMoneyChart = responsive.data.data.realEstateChart?.filter(
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
  }, [active]);

  const handleChangeMonthProgress = (e: string) => {
    getLisChartProgress({
      type: "1",
      typeChart: `${active}`,
      month: e,
    });
  };

  const handleChangeYear: DatePickerProps["onChange"] = (date, dateString) => {
    if (typeof dateString === "string" && dateString.trim() !== "") {
      setYear(dateString);
      getListChart({
        type: "1",
        typeChart: `${active}`,
        year: dateString,
      });
    } else {
      setYear("");
      setMonth(undefined);
      getListChart({
        type: "1",
        typeChart: `${active}`,
        year: "",
        month: "",
      });
    }
  };

  const handleChangeMonth = (e: string) => {
    setMonth(e);
    getListChart({
      type: "1",
      typeChart: `${active}`,
      year: year,
      month: `${e}`,
    });
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-10">
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
          disabled={!year}
          onChange={(e) => handleChangeMonth(e)}
          value={month}
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
                <BarChart realEstate={chart} />
              ) : (
                <p className="text-base text-center italic pt-20">
                  Không có dữ liệu!
                </p>
              )}
            </>
          )}
        </Col>
        <Col span={8}>
          <ProgressRealEstate
            handleChangeMonthProgress={handleChangeMonthProgress}
            progress={progress}
            isLoading2={isLoading2}
          />
        </Col>
      </Row>
    </>
  );
};

export default ChartRealEstate;
