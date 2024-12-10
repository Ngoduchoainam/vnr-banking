import { Button, Col, Row } from "antd";
import React from "react";
import CardDetail from "./CardDetail";
import { DataDetail } from "@/src/common/type";
import dayjs from "dayjs";
import { formatCurrencyVN } from "@/src/utils/buildQueryParams";

const GoldDetail = ({
  dataDetail,
  onCancel,
}: {
  dataDetail?: DataDetail;
  onCancel: () => void;
}) => {
  const quantity = dataDetail?.assetInventories.reduce((sum, item) => {
    return sum + (item.quantity || 0);
  }, 0);

  const typeGold = dataDetail?.assetInventories
    .map((item) => item.name)
    .join(", ");

  const handleClickIn = () => {
    window.print();
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <Row gutter={24}>
        <Col span={12}>
          <CardDetail>
            <li className="inline-flex justify-between w-full">
              <p className="font-extrabold text-sm">Người giao dịch:</p>
              <p>{dataDetail?.addedBy}</p>
            </li>
            <li className="inline-flex justify-between w-full">
              <p className="font-extrabold text-sm">Người quản lý:</p>
              <p>{dataDetail?.managerBy}</p>
            </li>
            <li className="inline-flex justify-between w-full">
              <p className="font-extrabold text-sm">Bộ phận quản lý:</p>
              <p>{dataDetail?.departmentManager}</p>
            </li>
            <li className="inline-flex justify-between w-full">
              <p className="font-extrabold text-sm">Loại vàng:</p>
              <p>{dataDetail?.descriptionType}</p>
            </li>
            <li className="inline-flex justify-between w-full">
              <p className="font-extrabold text-sm">Kiểu vàng:</p>
              <p>{typeGold}</p>
            </li>
            <li className="inline-flex justify-between w-full">
              <p className="font-extrabold text-sm">Tổng vàng:</p>
              <p>{quantity}</p>
            </li>
          </CardDetail>
        </Col>
        <Col span={12}>
          <CardDetail>
            <li className="inline-flex justify-between w-full">
              <p className="font-extrabold text-sm">Loại hình thanh toán:</p>
              <p>{dataDetail?.descriptionPaymentType}</p>
            </li>
            <li className="inline-flex justify-between w-full">
              <p className="font-extrabold text-sm">Ngày giao dịch :</p>
              <p>{dayjs(dataDetail?.transDate).format("DD/MM/YYYY")}</p>
            </li>
            <li className="inline-flex justify-between w-full">
              <p className="font-extrabold text-sm">Giờ giao dịch:</p>
              <p>{dayjs(dataDetail?.transDate).format("h:mm:ss A")}</p>
            </li>
            <li className="inline-flex justify-between w-full">
              <p className="font-extrabold text-sm">Loại giao dịch:</p>
              <p>{dataDetail?.descriptionTransType}</p>
            </li>
            <li className="inline-flex justify-between w-full">
              <p className="font-extrabold text-sm">Loại tiền:</p>
              <p>VNĐ</p>
            </li>
            <li className="inline-flex justify-between w-full">
              <p className="font-extrabold text-sm">Số tiền:</p>
              <p>{formatCurrencyVN(`${dataDetail?.totalAmount}`)}</p>
            </li>
          </CardDetail>
        </Col>
      </Row>
      <CardDetail>
        <li className="inline-flex gap-2 w-full">
          <p className="font-extrabold text-sm">Ghi chú:</p>
          {/* <p>{dataDetail?.}</p> */}
        </li>
      </CardDetail>
      <Row gutter={24}>
        <Col span={12}></Col>
        <Col span={12}>
          <div className="flex items-center justify-end gap-6 pt-6">
            <Button onClick={onCancel} className="w-full !h-10">
              Đóng
            </Button>
            <Button
              type="primary"
              className="w-full !h-10"
              onClick={handleClickIn}
            >
              In
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default GoldDetail;
