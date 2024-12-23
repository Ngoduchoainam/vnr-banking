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

export default function BarChartGold({
  goldChart,
}: Readonly<{ goldChart: TypeAsset[] }>) {
  const [hiddenBars, setHiddenBars] = useState<{ [key: string]: boolean }>({});

  const listLabelConvert = goldChart?.map((item2) => {
    return item2.key;
  });

  const listDataCovert = goldChart.map((item2) => {
    return Math.abs(item2.value);
  });

  const listBackground = goldChart.map((item2) => {
    if (item2.key === "Vàng nhẫn") return "#4393FF";
    if (item2.key === "Vàng thỏi") return "#FFB759";
    if (item2.key === "Dây chuyền") return "#D499FF";
  });

  const data = {
    labels: listLabelConvert,
    datasets: [
      {
        data: listDataCovert,
        backgroundColor: listBackground,
        barThickness: 25,
        stack: "Stack 1",
      },
    ],
  };

  const listField = ['value'];
  const maxValue = Utility.GetMaxValueOfFields(goldChart, listField);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
        onClick: (e: any, legendItem: any) => {
          const { index } = legendItem;
          const label = data.labels[index];

          // Toggle visibility of the clicked legend item
          setHiddenBars((prev) => ({
            ...prev,
            [label]: !prev[label],
          }));
        },
        labels: {
          usePointStyle: false,  // Không dùng kiểu điểm, giữ dạng hình chữ nhật
          padding: 40,
          font: {
            size: 16,
          },
        },
      },
      title: {
        display: true,
        text: "Số lượng vàng đã giao dịch",
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
        stacked: true,
        max: Utility.calculateMax(maxValue),
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

  // Cập nhật lại data với hiddenBars
  const filteredData = {
    labels: data.labels,
    datasets: [
      {
        data: data.datasets[0].data.filter((_, index) => !hiddenBars[data.labels[index]]),
        backgroundColor: data.datasets[0].backgroundColor.filter((_, index) => !hiddenBars[data.labels[index]]),
        barThickness: 25,
        stack: "Stack 1",
      },
    ],
  };

  return (
    <div
      style={{ width: "80%", height: "550px", margin: "0" }}
      className="custom-chart"
    >
      <Bar data={filteredData} options={options} />
    </div>
  );
}
