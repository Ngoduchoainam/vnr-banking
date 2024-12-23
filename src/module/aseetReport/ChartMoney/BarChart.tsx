"use client";

import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { TypeAsset } from "@/src/common/type";
import { Utility } from "@/src/utils/Utility";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function BarChartMoney({
  moneyChart,
  moneyType,
}: Readonly<{ moneyChart: TypeAsset[]; moneyType: string }>) {
  let listLabelConvert: string[] = [];
  let listDataCovert: number[] = [];
  let listBackground: (string | undefined)[] = [];
  const [hiddenBars, setHiddenBars] = useState<{ [key: string]: boolean }>({});

  // Xử lý trường hợp moneyType === "1"
  if (moneyType === "1") {
    listLabelConvert = moneyChart?.map((item2) => {
      return `${item2.key.split(".")[0]}k`;
    });

    listDataCovert = moneyChart.map((item2) => {
      return Math.abs(item2.value);
    });

    listBackground = moneyChart.map((item2) => {
      if (item2.key === "1.000") return "#979797";
      if (item2.key === "2.000") return "#FFB759";
      if (item2.key === "5.000") return "#3749A6";
      if (item2.key === "10.000") return "#FFD56D";
      if (item2.key === "20.000") return "#4393FF";
      if (item2.key === "50.000") return "#FF5DA0";
      if (item2.key === "100.000") return "#07C751";
      if (item2.key === "200.000") return "#FF0000";
      if (item2.key === "500.000") return "#44BED3";
      return "#000000";  // Thêm màu mặc định
    });
  }

  // Xử lý trường hợp moneyType === "2"
  if (moneyType === "2") {
    listLabelConvert = moneyChart?.map((item2) => {
      return `${item2.key}`;
    });

    listDataCovert = moneyChart.map((item2) => {
      return Math.abs(item2.value);
    });

    listBackground = moneyChart.map((item2) => {
      if (item2.key === "$1") return "#979797";
      if (item2.key === "$2") return "#FFB759";
      if (item2.key === "$5") return "#3749A6";
      if (item2.key === "$10") return "#FFD56D";
      if (item2.key === "$20") return "#4393FF";
      if (item2.key === "$50") return "#FF5DA0";
      if (item2.key === "$100") return "#07C751";
      return "#000000";  // Thêm màu mặc định
    });
  }

  console.log(81, listDataCovert)

  const data = {
    labels: listLabelConvert,
    datasets: [
      {
        label: "Số lượng tờ tiền",  // Thêm label cho dataset
        data: listDataCovert.map((value, index) =>
          hiddenBars[listLabelConvert[index]] ? 0 : value
        ),
        backgroundColor: listBackground,  // Cung cấp màu cho mỗi cột
        barThickness: 25,
        stack: "Stack 1",
      },
    ],
  };

  const listField = ['value'];
  const maxValue = Utility.GetMaxValueOfFields(moneyChart, listField);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        onClick: (e: any, legendItem: any) => {
          const { index } = legendItem;


          const label = data.labels[index];
          setHiddenBars((prev) => {
            const newHiddenBars = { ...prev };
            newHiddenBars[label] = !newHiddenBars[label]; // Toggle trạng thái ẩn/hiện
            return newHiddenBars;
          });
        },
        labels: {
          padding: 40,
          font: {
            size: 16,
          },
          generateLabels: (chart) => {
            // Tạo label cho mỗi màu của cột
            return chart.data.labels.map((label, index) => ({
              text: label,
              fillStyle: listBackground[index] || "#000000", // Màu sắc cột cho legend
              strokeStyle: listBackground[index] || "#000000",
              lineWidth: 2,
              hidden: hiddenBars[label] || false,
              index,
            }));
          },
        },
      },
      title: {
        display: true,
        text: "Số lượng tờ tiền đã giao dịch",
        color: "#000",
        padding: {
          top: 20,
          bottom: 60,
        },
        font: {
          size: 24,
          weight: "bold" as const,
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          padding: 10,
        },
        grid: {
          display: false,
        },
        categoryPercentage: 0.5,
        barPercentage: 0.8,
      },
      y: {
        max: Utility.calculateMax(maxValue),
        stacked: true,
        ticks: {
          beginAtZero: true,
          stepSize: 1,
          callback(value: number | string) {
            if (typeof value === "number") {
              return value >= 1e3 ? `${(value / 1e3).toFixed(1)}K` : value;
            }
            return value;
          },
        },
      },
    },
  };

  return (
    <div
      style={{ width: "80%", height: "550px", margin: "0" }}
      className="custom-chart"
    >
      <Bar data={data} options={options} />
    </div>
  );
}
