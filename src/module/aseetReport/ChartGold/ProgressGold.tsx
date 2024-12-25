/* eslint-disable @typescript-eslint/no-explicit-any */
import { TypeAsset } from "@/src/common/type";
import React from "react";

const ProgressGold = ({
  progress,
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
          if (item.key === "Vàng nhẫn") return "#4393FF";
          if (item.key === "Vàng thỏi") return "#FFB759";
          if (item.key === "Dây chuyền") return "#D499FF";
        };

        return {
          key: item.key,
          percentage: parseFloat(percentage.toFixed(2)),
          color: color(),
          title: item.key,
          amount: item.amount
        };
      });
    }
  }

  return (
    <div className="bg-white px-4 py-10 rounded-lg flex flex-col gap-4">
      <p className="uppcase text-2xl font-bold">Tổng</p>
      <ul className="flex flex-col gap-4 pl-3">
        {listMoneyPercentage.length > 0 ? (
          listMoneyPercentage?.map((item, index) => {
            if (item.percentage === 0) return null;
            return (
              <li key={index}>
                <p>
                  <span className="inline-block w-[100px] text-base">
                    {item.title}:
                  </span>
                  <span className="font-semibold w-[100px] text-base">
                    {
                      new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(item.amount)
                    }
                  </span>
                </p>
              </li>
            );
          })
        ) : (
          <p className="text-base text-center italic">Không có dữ liệu!</p>
        )}

      </ul>
    </div>
  );
};

export default ProgressGold;
