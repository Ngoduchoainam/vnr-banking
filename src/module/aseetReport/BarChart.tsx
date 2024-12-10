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

// Đăng ký các thành phần cần thiết của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const data = {
  labels: ["January", "February", "March", "April", "May", "June"], // Các tháng
  datasets: [
    {
      label: "Income",
      data: [30000, 40000, 35000, 50000, 60000, 45000], // Dữ liệu Tiền vào
      backgroundColor: "#4CAF50", // Màu cột Tiền vào
      barThickness: 30,
      borderRadius: 8,
      borderWidth: 2,
      stack: "Stack 1",
    },
    {
      label: "Outcome",
      data: [15000, 20000, 25000, 30000, 40000, 35000], // Dữ liệu Tiền ra
      backgroundColor: "#F44336", // Màu cột Tiền ra
      barThickness: 30,
      borderRadius: 8,
      borderWidth: 2,
      stack: "Stack 2", // Gộp với "balance" vào cùng 1 cột
    },
    {
      label: "Balance",
      data: [10000, 15000, 10000, 20000, 15000, 10000], // Dữ liệu Số dư
      backgroundColor: "#2196F3", // Màu cột Số dư
      barThickness: 30,
      borderRadius: 8,
      borderWidth: 2,
      stack: "Stack 2", // Gộp với "outcome" vào cùng 1 cột
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const, // Hiển thị chú thích ở trên
    },
    title: {
      display: true,
      text: "Monthly Financial Overview", // Tiêu đề biểu đồ
    },
  },
  scales: {
    x: {
      stacked: true, // Cấu hình trục X chồng cột
      ticks: {
        padding: 10, // Khoảng cách giữa các nhãn trục X
      },
      grid: {
        display: false, // Ẩn đường lưới ngang
      },
      categoryPercentage: 0.5, // Thu nhỏ không gian mỗi danh mục (tháng)
      barPercentage: 0.8,
    },
    y: {
      stacked: true, // Cấu hình trục Y chồng cột
      ticks: {
        beginAtZero: true, // Bắt đầu từ 0
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

export default function BarChart() {
  return (
    <div style={{ margin: "0 auto" }}>
      <Bar data={data} options={options} />
    </div>
  );
}
