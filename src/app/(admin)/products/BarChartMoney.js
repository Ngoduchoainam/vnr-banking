import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getDataGenaral } from '@/src/services/statistics';
import { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { Utility } from "@/src/utils/Utility";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = () => {
  const [dataChart, setDataChart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [maxValue, setMaxValue] = useState(0);

  const fetchDataGenaral = async () => {
    try {
      const response = await getDataGenaral(0, 0);
      if (response.data) {
        const {
          totalAmountOut,
          totalAmountIn,
        } = response.data;

        setMaxValue(Math.max(totalAmountOut, totalAmountIn));

        const data = {
          labels: ['Tổng tiền ra', 'Tổng tiền vào'],
          datasets: [
            {
              label: 'Tổng tiền ra',
              data: [totalAmountOut, 0],
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
            },
            {
              label: 'Tổng tiền vào',
              data: [0, totalAmountIn],
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        };
        setDataChart(data);
      } else {
        console.error("Data is not valid");
      }
    } catch (error) {
      console.error("Lỗi r:", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchDataGenaral();
  }, []);

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        max: Utility.calculateMax(maxValue),
        ticks: {
          callback: function (value) {
            return Math.round(value / 1000000) + ' triệu'; // Chuyển thành triệu và thêm đơn vị "triệu"
          },
        },
      },
    },
  };

  return (
    <div>
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <Spin size="default" />
        </div>
      ) : (
        <Bar data={dataChart} options={options} />
      )}
    </div>
  );
};

export default BarChart;
