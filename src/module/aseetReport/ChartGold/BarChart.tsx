"use client";

import React from "react";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
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

export default function BarChartGold({
  goldChart,
}: Readonly<{ goldChart: TypeAsset[] }>) {
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

  return (
    <div
      style={{ width: "80%", height: "550px", margin: "0" }}
      className="custom-chart"
    >
      <Bar data={data} options={options} />
    </div>
  );
}
