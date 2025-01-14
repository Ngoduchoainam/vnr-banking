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

export default function BarChartRealEstate({
  realEstate,
}: Readonly<{ realEstate: TypeAsset[] }>) {
  const [hiddenBars, setHiddenBars] = useState<{ [key: string]: boolean }>({});

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

  const listField = ['value'];
  const maxValue = Utility.GetMaxValueOfFields(realEstate, listField);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        onClick: (e: any, legendItem: any) => {
          const { index } = legendItem;
          const label = data.labels[index];

          // Toggle visibility of the clicked legend item
          setHiddenBars((prev) => {
            const newHiddenBars = { ...prev };
            newHiddenBars[label] = !newHiddenBars[label]; // Toggle trạng thái ẩn/hiện
            return newHiddenBars;
          });
        },
        labels: {
          usePointStyle: false,  // Không dùng kiểu điểm, giữ dạng hình chữ nhật
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
        data: listDataCovert.map((value, index) =>
          hiddenBars[listLabelConvert[index]] ? 0 : value
        ),
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
      <Bar data={filteredData} options={options} />
    </div>
  );
}
