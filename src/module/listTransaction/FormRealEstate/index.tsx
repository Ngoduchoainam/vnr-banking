import { Tabs, TabsProps } from "antd";

import { FormMoneyType } from "@/src/common/type";
import { FormCash } from "./FormCash";
import { FormTransfer } from "./FormTransfer";

export const FormRealEstate = ({ onCancel, fetchData }: FormMoneyType) => {
  const items: TabsProps["items"] = [
    {
      key: "transfer",
      label: "Thanh toán chuyển khoản",
      children: <FormTransfer onCancel={onCancel} fetchData={fetchData} />,
    },
    {
      key: "cash",
      label: "Thanh toán bằng tiền mặt",
      children: <FormCash onCancel={onCancel} fetchData={fetchData} />,
    },
  ];
  return (
    <Tabs
      defaultActiveKey="transfer"
      items={items}
      className="w-full tabs-gold"
    />
  );
};
