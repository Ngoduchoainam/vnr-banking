"use client";
import React, { useEffect, useState } from "react";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import BaseModal from "@/src/component/config/BaseModal";
import { Spin, Table, Tooltip } from "antd";
import {
  getDataGenaral,
  getDetailCurentBalance,
} from "@/src/services/statistics";

interface filterRole {
  Name: string;
  Value: string;
}

const Statistics = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dataDetailCurentBalance, setDataDetailCurentBalance] = useState([]);
  const [databalance, setDataBalance] = useState();
  const [dataTotalAmount, setDataTotalAmount] = useState();
  const [keys, setKeys] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [values, setValues] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setKeys(localStorage.getItem("key"));
    setValues(localStorage.getItem("value"));
  }, []);

  const fetchDataGenaral = async () => {
    const arrRole: filterRole[] = [];
    const addedParams = new Set<string>();
    arrRole.push({
      Name: localStorage.getItem("key")!,
      Value: localStorage.getItem("value")!,
    });
    addedParams.add(keys!);
    try {
      const res = await getDataGenaral(1, 20, undefined, arrRole);
      if (
        res &&
        res.data &&
        res.data.balance !== undefined &&
        res.data.totalAmount !== undefined
      ) {
        setDataBalance(res.data.balance);
        setDataTotalAmount(res.data.totalAmount);
      } else {
        console.warn("Balance or Total Amount is missing in the response");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchDataGenaral();
  }, []);

  const fetchListStatistics = async () => {
    try {
      const response = await getDetailCurentBalance(1, 20);
      const formattedData =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        response?.source?.map((x: any) => ({
          id: x.id,
          bankName: x.bankName,
          bankAccount: x.bankAccount,
          fullName: x.fullName,
          currentBalance: x.currentBalance,
        })) || [];
      setDataDetailCurentBalance(formattedData);
    } catch (error) {
      console.error("Error fetching phone numbers:", error);
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
    await fetchListStatistics();
    setLoading(false);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

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
          {loading ? (
            <Spin size="default">
              <div style={{ minHeight: 200 }} />
            </Spin>
          ) : (
            <Table columns={columns} dataSource={dataDetailCurentBalance} />
          )}
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
