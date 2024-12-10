import { Button, Col, Row } from "antd";
import React from "react";
import CardDetail from "./CardDetail";
import { AssetInventory, DataDetail } from "@/src/common/type";
import dayjs from "dayjs";
import {
  formatCurrencyUSD,
  formatCurrencyVN,
} from "@/src/utils/buildQueryParams";

const MoneyDetail = ({
  dataDetail,
  onCancel,
}: {
  dataDetail?: DataDetail;
  onCancel: () => void;
}) => {
  let firstMoney: AssetInventory[] = [];
  let seconMoney: AssetInventory[] = [];
  if (dataDetail?.assetInventories) {
    const midIndex = Math.ceil(dataDetail?.assetInventories?.length / 2);
    firstMoney = dataDetail?.assetInventories.slice(0, midIndex);
    seconMoney = dataDetail?.assetInventories.slice(midIndex);
  }

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
          </CardDetail>
        </Col>
        <Col span={12}>
          <CardDetail>
            <li className="inline-flex justify-between w-full">
              <p className="font-extrabold text-sm">Ngày giao dịch:</p>
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
              <p>{dataDetail?.descriptionType}</p>
            </li>
            <li className="inline-flex justify-between w-full">
              <p className="font-extrabold text-sm">Số tiền:</p>
              <p>
                {dataDetail?.descriptionType === "USD"
                  ? formatCurrencyUSD(`${dataDetail?.totalAmount}`)
                  : formatCurrencyVN(`${dataDetail?.totalAmount}`)}
              </p>
            </li>
          </CardDetail>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={12}>
          <CardDetail>
            <li className="inline-flex justify-start gap-6 w-full">
              <p className="font-extrabold text-sm flex-shrink-0">Mệnh giá:</p>
              <Row gutter={24} className="w-full">
                <Col span={12}>
                  <ul className="flex flex-col gap-4 items-end">
                    {firstMoney?.map((item) => {
                      return (
                        <li className="inline-flex gap-6" key={item.name}>
                          <span className="text-end w-16">{item.name}</span>
                          <span>{item.quantity}</span>
                        </li>
                      );
                    })}
                  </ul>
                </Col>
                <Col span={12}>
                  <ul className="flex flex-col gap-4 items-end">
                    {seconMoney?.map((item) => {
                      return (
                        <li className="inline-flex gap-6" key={item.name}>
                          <span className="text-end w-16">{item.name}</span>
                          <span>{item.quantity}</span>
                        </li>
                      );
                    })}
                  </ul>
                </Col>
              </Row>
            </li>
          </CardDetail>
        </Col>
        <Col span={12}>
          <CardDetail>
            <li className="inline-flex gap-2 w-full">
              <p className="font-extrabold text-sm">Ghi chú:</p>
              <p>{dataDetail?.note}</p>
            </li>
          </CardDetail>
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

export default MoneyDetail;
