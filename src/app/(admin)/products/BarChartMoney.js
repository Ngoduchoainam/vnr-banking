import { Bar } from 'react-chartjs-2';
import './style.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
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

const BarChart = (props) => {
  const [dataChart, setDataChart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [maxValue, setMaxValue] = useState(0);

  useEffect(() => {
    if (props.dataChart) {
      const { totalAmountOut, totalAmountIn } = props.dataChart;

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
      setLoading(false)
    }

  }, [props.dataChart]);

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        max: Utility.calculateMax(maxValue),
        ticks: {
          callback: function (value) {
            return value == 0 ? ' 0 đồng' : value < 1000000000 ? Math.round(value / 1000000) + ' triệu' : Math.round(value / 1000000000) + ' tỉ';
          },
        },
      },
    },
  };

  return (
    <div className='bar-char'>
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
