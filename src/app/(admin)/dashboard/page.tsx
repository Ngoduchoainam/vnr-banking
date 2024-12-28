"use client";

import { Col, Row } from "antd";
import { useEffect, useState } from "react";

import { DataAseet } from "@/src/common/type";
import CardAseet from "@/src/module/aseetReport";
import { apiClient } from "@/src/services/base_api";
import ChartGold from "@/src/module/aseetReport/ChartGold";
import ChartRealEstate from "@/src/module/aseetReport/ChartRealEstate";
import ChartTransaction from "@/src/module/aseetReport/ChartTransaction";
import ChartMoney from "@/src/module/aseetReport/ChartMoney";
export interface ListOptionsTransactionType {
  account: [];
  system: [];
  team: [];
  branch: [];
  team_acount: [];
  year: "";
  month: "";
}

const AssetPage = () => {
  const [active, setActive] = useState<number>(1);
  const [asset, setAsset] = useState<DataAseet>();

  const handleClick = (type: number) => {
    setActive(type);
  };

  const getListSummary = async () => {
    try {
      const responsive = await apiClient.get("/asset-api/get-summary");
      setAsset(responsive.data.data);
    } catch (error) {
      console.error(error)
    }
  };

  useEffect(() => {
    getListSummary();
  }, []);

  return (
    <div>
      <div className="px-[30px]">
        <div className="text-[32px] font-bold py-5">
          Báo cáo quản lý tài sản
        </div>

        <Row gutter={[60, 20]}>
          <Col span={4}>
            <div className="flex flex-col gap-7">
              <CardAseet
                title="Giao dịch ngân hàng"
                type={0}
                handleClick={handleClick}
                active={active}
                isTitle={true}
              />
              <CardAseet
                title="Tiền mặt"
                quantity={asset?.cashTotal}
                type={1}
                handleClick={handleClick}
                active={active}
              />
              <CardAseet
                title="Vàng"
                quantity={asset?.goldTotal}
                type={2}
                handleClick={handleClick}
                active={active}
              />
              <CardAseet
                title="Bất động sản"
                quantity={asset?.realEstateTotal}
                type={3}
                handleClick={handleClick}
                active={active}
              />
            </div>
          </Col>
          <Col span={20}>
            {active === 0 && <ChartTransaction />}
            {active === 1 && <ChartMoney active={active} />}
            {active === 2 && <ChartGold active={active} />}
            {active === 3 && <ChartRealEstate active={active} />}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AssetPage;
