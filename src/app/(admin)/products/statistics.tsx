"use client";
import React, { useEffect, useRef, useState } from "react";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import BaseModal from "@/src/component/config/BaseModal";
import { Spin, Table, Tooltip } from "antd";
import {
  getDetailCurentBalance,
} from "@/src/services/statistics";

const Statistics = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dataDetailCurentBalance, setDataDetailCurentBalance] = useState([]);
  const [databalance, setDataBalance] = useState();
  const [dataTotalAmount, setDataTotalAmount] = useState<number>(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [values, setValues] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [pageIndex, setPageIndex] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (props.dataChart) {
      setValues(localStorage.getItem("value"));

      const { totalAmountOut, totalAmountIn, balance } = props.dataChart;

      const profit = totalAmountIn - totalAmountOut;

      setDataTotalAmount(profit || 0);
      setDataBalance(balance);
    }
  }, [props.dataChart]);

  const fetchListStatistics = async (page: number, resetList?: boolean) => {
    setLoading(true);
    try {
      const response = await getDetailCurentBalance(page, 20, undefined, props.searchTerms); // Hàm API

      const formattedData =
        response?.source?.map((x: any) => ({
          id: x.id,
          bankName: x.bankName,
          bankAccount: x.bankAccount,
          fullName: x.fullName,
          currentBalance: x.currentBalance,
        })) || [];

      if (formattedData.length === 0) {
        setHasMoreData(false); // Nếu không có dữ liệu mới, ngừng tải thêm
      } else {
        setDataDetailCurentBalance(resetList ? formattedData : (prev) => [...prev, ...formattedData]); // Gộp dữ liệu cũ và mới
      }
    } catch (error) {
      console.error("Error fetching phone numbers:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "id", dataIndex: "id", key: "id", hidden: true },
    { title: "Ngân hàng", dataIndex: "bankName", key: "bankName" },
    {
      title: "Tài khoản ngân hàng",
      dataIndex: "bankAccount",
      key: "bankAccount",
    },
    { title: "Chủ tài khoản", dataIndex: "fullName", key: "fullName" },
    {
      title: "Số dư",
      dataIndex: "currentBalance",
      key: "currentBalance",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (amount: any) => new Intl.NumberFormat("vi-VN").format(amount),
    },
  ];

  const showModal = async () => {
    setLoading(true);
    setIsModalOpen(true);
    setLoading(false);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleScroll = () => {
    if (!tableContainerRef.current || loading || !hasMoreData) return;

    const { scrollTop, scrollHeight, clientHeight } = tableContainerRef.current;
    console.log(123, scrollHeight, scrollTop, clientHeight);

    // Kiểm tra nếu cuộn chạm đáy
    if (scrollTop >= clientHeight + clientHeight / 10) {
      console.log(130, "call here");
      setPageIndex((prev) => prev + 1); // Tăng page index để tải thêm dữ liệu
    }
  };

  useEffect(() => {
    fetchListStatistics(pageIndex); // Gọi hàm fetch dữ liệu khi pageIndex thay đổi
  }, [pageIndex]);

  useEffect(() => {
    fetchListStatistics(1, true);

    console.log(120, "call here")
  }, [props.searchTerms]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        alignItems: "end",
      }}
    >
      <div
        style={statBoxStyle}
        className="flex justify-center flex-col items-center"
      >
        <h3 className="font-bold text-lg">Lợi Nhuận</h3>
        <h1 className="font-bold text-3xl">
          {dataTotalAmount !== undefined
            ? new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(dataTotalAmount)
            : "0 ₫"}
        </h1>
      </div>
      <div
        style={statBoxStyles}
        className="flex justify-center flex-col items-center relative"
      >
        <div className="font-bold text-lg">Số Dư Hiện Tại</div>
        <h1 className="font-bold text-3xl">
          {databalance !== undefined
            ? new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(databalance)
            : "0 ₫"}
        </h1>

        <Tooltip placement="bottom" title={"Chi tiết số dư hiện tại"}>
          <div className="absolute right-2 top-2">
            <ExclamationCircleOutlined onClick={showModal} />
          </div>
        </Tooltip>
        <BaseModal
          title="Chi tiết số dư hiện tại"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          offPadding
        >
          <div ref={tableContainerRef} style={{ maxHeight: 500, overflowY: "auto", width: "100%" }} onScroll={handleScroll}>
            {loading && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  background: "rgba(255, 255, 255, 0.8)", // Làm mờ nền phía sau
                  zIndex: 10,
                }}
              >
                <Spin size="large" />
              </div>
            )}
            <Table
              columns={columns}
              dataSource={dataDetailCurentBalance}
              pagination={false}
              rowKey="id"
            />
          </div>

        </BaseModal>
      </div>
    </div>
  );
};

const statBoxStyle = {
  backgroundColor: "#67B173",
  color: "white",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  width: "100%",
  height: "120px",
};

const statBoxStyles = {
  backgroundColor: "#8667B1",
  color: "white",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  width: "100%",
  height: "120px",
};

export default Statistics;
