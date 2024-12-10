import React from "react";
import type { TabsProps } from "antd";
import { Tabs } from "antd";

import { ModalAddNewType } from "@/src/common/type";
import BaseModal from "@/src/component/config/BaseModal";
import { FormMoney } from "../FormMoney";
import { FormGold } from "../FormGold";
import { FormRealEstate } from "../FormRealEstate";

const ModalAddNew = ({
  isAddModalOpen = false,
  onCancel,
  fetchData,
}: ModalAddNewType) => {
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Quản lý tiền mặt",
      children: <FormMoney onCancel={onCancel} fetchData={fetchData} />,
    },
    {
      key: "2",
      label: "Quản lý vàng",
      children: <FormGold onCancel={onCancel} fetchData={fetchData} />,
    },
    {
      key: "3",
      label: "Quản lý bất động sản",
      children: <FormRealEstate onCancel={onCancel} fetchData={fetchData} />,
    },
  ];

  return (
    <BaseModal
      open={isAddModalOpen}
      onCancel={() => {
        onCancel();
      }}
      title="Thêm mới giao dịch quản lý tài sản"
      offPadding
      className="!w-[1100px]"
    >
      <Tabs
        defaultActiveKey="1"
        items={items}
        className="w-full modal-list-transaction-tabs"
      />
    </BaseModal>
  );
};

export default ModalAddNew;
