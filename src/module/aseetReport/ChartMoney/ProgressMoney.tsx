/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { TypeAsset } from "@/src/common/type";

const ProgressMoney = ({
  progress,
  moneyType
}: {
  progress: TypeAsset[] | null;
  moneyType: string;
  handleChangeMonthProgress: (e: string) => void;
  isLoading2: boolean;
}) => {

  console.log(19, progress)
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

        console.log(47, item.amount)

        return {
          key: item.key,
          percentage: parseFloat(percentage.toFixed(2)),
          color: color(),
          title,
          amount: item.amount,
          type: 'VND'
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

        console.log(82, item)

        return {
          key: item.key,
          percentage: parseFloat(percentage.toFixed(2)),
          color: color(),
          title: item.key,
          amount: Math.abs(item.value) * Number(item.key.replace("$", "")),
          type: 'USD'
        };
      });
    }
  }

  console.log(89, listMoneyPercentage)

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
                    {item.type == 'VND' ?
                      new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(item.amount) :
                      new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0,
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

export default ProgressMoney;
