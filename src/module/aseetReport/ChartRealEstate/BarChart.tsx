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
      text: "Số lượng bất động sản đã giao dịch",
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

export default function BarChartRealEstate({
  realEstate,
}: Readonly<{ realEstate: TypeAsset[] }>) {
  const listLabelConvert = realEstate?.map((item2) => {
    return item2.key;
  });

  const listDataCovert = realEstate.map((item2) => {
    return Math.abs(item2.value);
  });

  const listBackground = realEstate.map((item2) => {
    if (item2.key === "Căn hộ chung cư") return "#4393FF";
    if (item2.key === "Nhà phố") return "#FFB759";
    if (item2.key === "Đất nền") return "#D499FF";
    if (item2.key === "BĐS Nghỉ Dưỡng") return "#EF3826";
    if (item2.key === "Shophouse") return "#18BA36";
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
