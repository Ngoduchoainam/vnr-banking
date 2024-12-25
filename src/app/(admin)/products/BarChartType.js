// components/BarChart.js
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

const BarChartType = (props) => {
    const [dataChart, setDataChart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [maxValue, setMaxValue] = useState(0);

    useEffect(() => {
        if (props.dataChart) {
            const { countTransactionOut,
                countTransactionIn } = props.dataChart;

            setMaxValue(Math.max(countTransactionOut, countTransactionIn));

            const data = {
                labels: ['Giao dịch tiền ra', 'Giao dịch tiền vào'],
                datasets: [
                    {
                        label: 'Giao dịch tiền ra',
                        data: [countTransactionOut, 0],
                        backgroundColor: 'rgba(255, 206, 86, 0.2)',
                        borderColor: 'rgba(255, 206, 86, 1)',
                        borderWidth: 1,
                    },
                    {
                        label: 'Giao dịch tiền vào',
                        data: [0, countTransactionIn],
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
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
                        return value; // Hiển thị theo đơn vị triệu
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

export default BarChartType;
