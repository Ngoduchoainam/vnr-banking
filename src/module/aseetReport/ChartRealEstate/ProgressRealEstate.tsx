/* eslint-disable @typescript-eslint/no-explicit-any */
import { TypeAsset } from "@/src/common/type";
import { options } from "@/src/utils/buildQueryParams";
import { Progress, Select, Spin } from "antd";
import React from "react";

const ProgressRealEstate = ({
  progress,
  handleChangeMonthProgress,
  isLoading2,
}: {
  progress: TypeAsset[] | null;
  handleChangeMonthProgress: (e: string) => void;
  isLoading2: boolean;
}) => {
  let listMoneyPercentage: any[] = [];
  if (progress) {
    const totalGold = progress.reduce((sum, item) => {
      return sum + Math.abs(item.value);
    }, 0);
    if (totalGold) {
      listMoneyPercentage = progress.map((item) => {
        const percentage = (Math.abs(item.value) / totalGold) * 100;
        const color = () => {
          if (item.key === "Căn hộ chung cư") return "#4393FF";
          if (item.key === "Nhà phố") return "#FFB759";
          if (item.key === "Đất nền") return "#D499FF";
          if (item.key === "BĐS Nghỉ Dưỡng") return "#EF3826";
          if (item.key === "Shophouse") return "#18BA36";
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
                    showInfo={false}
                    className="pt-2 aseet-progress"
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

export default ProgressRealEstate;
