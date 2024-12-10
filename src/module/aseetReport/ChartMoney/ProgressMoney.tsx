/* eslint-disable @typescript-eslint/no-explicit-any */
import { Progress, Select, Spin } from "antd";
import React from "react";
import { TypeAsset } from "@/src/common/type";
import { options } from "@/src/utils/buildQueryParams";

const ProgressMoney = ({
  progress,
  moneyType,
  handleChangeMonthProgress,
  isLoading2,
}: {
  progress: TypeAsset[] | null;
  moneyType: string;
  handleChangeMonthProgress: (e: string) => void;
  isLoading2: boolean;
}) => {
  let listMoneyPercentage: any[] = [];
  if (progress && moneyType === "1") {
    const totalMoney = progress?.reduce((sum, item) => {
      const quantity =
        Number(item.key.replace(/\./g, "")) * Math.abs(item.value);
      return sum + quantity;
    }, 0);
    if (totalMoney) {
      listMoneyPercentage = progress?.map((item) => {
        const percentage =
          ((Math.abs(item.value) * Number(item.key.replace(/\./g, ""))) /
            totalMoney) *
          100;
        const color = () => {
          if (item.key === "1.000") return "#979797";
          if (item.key === "2.000") return "#FFB759";
          if (item.key === "5.000") return "#3749A6";
          if (item.key === "10.000") return "#FFD56D";
          if (item.key === "20.000") return "#4393FF";
          if (item.key === "50.000") return "#FF5DA0";
          if (item.key === "100.000") return "#07C751";
          if (item.key === "200.000") return "#FF0000";
          if (item.key === "500.000") return "#44BED3";
        };

        const title = `${item.key.split(".")[0]}k`;

        return {
          key: item.key,
          percentage: parseFloat(percentage.toFixed(2)),
          color: color(),
          title,
        };
      });
    }
  }
  if (progress && moneyType === "2") {
    const totalMoney = progress?.reduce((sum, item) => {
      const quantity =
        parseFloat(item.key.replace("$", "")) * Math.abs(item.value);
      return sum + quantity;
    }, 0);
    if (totalMoney) {
      listMoneyPercentage = progress?.map((item) => {
        const percentage =
          ((Math.abs(item.value) * Number(item.key.replace("$", ""))) /
            totalMoney) *
          100;
        const color = () => {
          if (item.key === "$1") return "#979797";
          if (item.key === "$2") return "#FFB759";
          if (item.key === "$5") return "#3749A6";
          if (item.key === "$10") return "#FFD56D";
          if (item.key === "$20") return "#4393FF";
          if (item.key === "$50") return "#FF5DA0";
          if (item.key === "$100") return "#07C751";
        };

        return {
          key: item.key,
          percentage: parseFloat(percentage.toFixed(2)),
          color: color(),
          title: item.key,
        };
      });
    }
  }

  return (
    <div className="bg-white px-4 py-10 rounded-lg flex flex-col gap-4">
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold">Đã giao dịch</span>
        <Select
          placeholder="Tháng"
          allowClear
          options={options}
          className="w-[120px]"
          onChange={(e) => handleChangeMonthProgress(e)}
        />
      </div>
      {isLoading2 ? (
        <Spin />
      ) : (
        <>
          {listMoneyPercentage.length > 0 ? (
            listMoneyPercentage?.map((item) => {
              if (item.percentage === 0) return null;
              return (
                <div key={item.key}>
                  <div className="flex justify-between">
                    <p>{item.title}</p>
                    <span>{`${item.percentage}%`}</span>
                  </div>
                  <Progress
                    percent={item.percentage}
                    strokeColor={item.color}
                    className="pt-2 aseet-progress"
                    showInfo={false}
                  />
                </div>
              );
            })
          ) : (
            <p className="text-base text-center italic">Không có dữ liệu!</p>
          )}
        </>
      )}
    </div>
  );
};

export default ProgressMoney;
