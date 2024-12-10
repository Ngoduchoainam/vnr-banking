"use client";
import React, { useState, useContext } from "react";
import { Menu as AntMenu } from "antd";
import Image from "next/image";
import Logo from "../../public/img/logo.png";
import "./menu.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RoleContext } from "@/src/component/RoleWapper";

type MenuItem = {
  key: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  items?: MenuItem[];
  type?: "group" | "divider";
};

const items: MenuItem[] = [
  {
    key: "dashboard",
    label: "Thống kê",
    path: "/dashboard",
  },
  {
    key: "system_configuration",
    label: "Cấu hình hệ thống",
    items: [
      {
        key: "group_system",
        label: "Danh sách hệ thống",
        path: "/group_system",
      },
      {
        key: "group_branch",
        label: "Danh sách chi nhánh",
        path: "/group_branch",
      },
      {
        key: "group_team",
        label: "Danh sách đội nhóm",
        path: "/group_team",
      },
    ],
  },
  {
    key: "account-config",
    label: "Cấu hình tài khoản",
    items: [
      {
        key: "account_group",
        label: "Nhóm tài khoản",
        path: "/account_group",
      },
      {
        key: "phone_number",
        label: "Danh sách số điện thoại",
        path: "/phone_number",
      },
      {
        key: "account",
        label: "Danh sách tài khoản",
        path: "/account",
      },
    ],
  },
  {
    key: "telegram_seting",
    label: "Cấu hình telegram",
    items: [
      {
        key: "telegram",
        label: "Nhóm telegram",
        path: "/telegram",
      },
      {
        key: "telegram_integration",
        label: "Danh sách tích hợp telegram",
        path: "/telegram_integration",
      },
    ],
  },
  {
    key: "sheet-setting",
    label: "Cấu hình trang tính",
    items: [
      {
        key: "sheet",
        label: "Nhóm trang tính",
        path: "/sheet",
      },
      {
        key: "sheet_intergration",
        label: "Danh sách tích hợp trang tính",
        path: "/sheet_intergration",
      },
    ],
  },
  {
    key: "transaction",
    label: "Giao dịch thủ công",
    path: "/transaction",
  },
  {
    key: "asset-management",
    label: "Quản lý tài sản",
    items: [
      {
        key: "asset-report",
        label: "Báo cáo quản lý tài sản",
        path: "/asset-report",
      },
      {
        key: "list-transaction",
        label: "Danh sách giao dịch",
        path: "/list-transaction",
      },
    ],
  },
  {
    key: "role",
    label: "Quyền tài khoản",
    path: "/role",
  },
  {
    key: "settings",
    label: "Cấu hình hệ thống",
    path: "/settings",
  },
];

const SideMenu = () => {
  const { getRoleByAccount } = useContext(RoleContext);

  const pathname = usePathname();
  const parentKey = items.find((item) =>
    item.items?.some((subItem) => subItem.path === pathname)
  )?.key;
  const [openKeys, setOpenKeys] = useState<string[]>(
    parentKey ? [parentKey] : []
  );
  const onOpenChange = (keys: string[]) => {
    const latestOpenKey = keys.find((key) => !openKeys.includes(key));
    if (latestOpenKey) {
      setOpenKeys([latestOpenKey]);
    } else {
      setOpenKeys([]);
    }
  };

  const renderMenuItems = (items: MenuItem[]) =>
    items.map((item) =>
      item.items ? (
        <AntMenu.SubMenu key={item.key} title={item.label} icon={item.icon}>
          {renderMenuItems(item.items)}
        </AntMenu.SubMenu>
      ) : (
        <AntMenu.Item
          key={item.key}
          icon={item.icon}
          className="custom-link-item"
        >
          <Link href={item.path ?? "/"} onClick={() => getRoleByAccount()}>
            {item.label}
          </Link>
        </AntMenu.Item>
      )
    );

  return (
    <div className="side-menu">
      <div className="logo-container">
        <Image src={Logo} alt="Logo" width={100} height={40} />
      </div>
      <AntMenu
        mode="inline"
        theme="dark"
        openKeys={openKeys}
        selectedKeys={[pathname.split("/")[1]]}
        onOpenChange={onOpenChange}
      >
        {renderMenuItems(items)}
      </AntMenu>
    </div>
  );
};

export default SideMenu;
