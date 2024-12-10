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
import { TransactionType } from "@/src/common/type";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function BarChartTransaction({
  transaction,
}: Readonly<{ transaction: TransactionType[] }>) {
  const dataTotalAmountIn = transaction.map((item: TransactionType) => {
    return item.totalAmountIn;
  });

  const dataTotalAmountOut = transaction.map((item: TransactionType) => {
    return item.totalAmountOut;
  });

  const dataBalance = transaction.map((item: TransactionType) => {
    return item.balance;
  });

  const dataMonth = transaction.map((item: TransactionType) => {
    return item.month;
  });

  const data = {
    labels: dataMonth,
    datasets: [
      {
        label: "Tiền vào",
        data: dataTotalAmountIn,
        backgroundColor: "#4393FF",
        barThickness: 25,
        stack: "Stack 1",
      },
      {
        label: "Tiền ra",
        data: dataTotalAmountOut,
        backgroundColor: "#FFB759",
        barThickness: 25,
        stack: "Stack 2",
      },
      {
        label: "Số dư",
        data: dataBalance,
        backgroundColor: "#D499FF",
        barThickness: 25,
        stack: "Stack 2",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          padding: 40,
          font: {
            size: 16,
          },
        },
        onClick: () => {},
      },
      title: {
        display: true,
        text: "Số tiền giao dịch",
        color: "#000",
        padding: {
          top: 20,
          bottom: 20,
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
        beginAtZero: true,
      },
    },
  };

  return (
    <div
      style={{ width: "80%", margin: "0 auto" }}
      className="custom-chart-transaction"
    >
      <Bar data={data} options={options} />
    </div>
  );
}
