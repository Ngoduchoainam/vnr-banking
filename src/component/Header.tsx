"use client";
import "./header.css";
import React, { useEffect, useState } from "react";
import { DownOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, Menu } from "antd";
import { signOut } from "next-auth/react";
import { apiClient } from "../services/base_api";

const Header = () => {
  const [roleData, setRoleData] = useState(null);
  const [accountData, setAccountData] = useState(null);

  const getRoleByAccount = async () => {
    try {
      const response = await apiClient.get("/account/find-role-by-account");
      setRoleData(response?.data?.data?.accountId);
      // console.log("getRoleByAccount", response);
    } catch (error) {
      console.error("Error fetching role data:", error);
    }
  };

  const accountFind = async () => {
    try {
      const response = await fetch(
        `https://apiweb.bankings.vnrsoftware.vn/account/find-by-id?id=${roleData}`
      );
      const data = await response.json();
      setAccountData(data?.data?.userName);
      // console.log("Account data:", data);
    } catch (error) {
      console.error("Error fetching account data:", error);
    }
  };

  useEffect(() => {
    getRoleByAccount();
  }, []);

  useEffect(() => {
    accountFind();
  }, [roleData]);

  const menu = (
    <Menu>
      <Menu.Item key="logout" onClick={() => signOut()}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="bg-white flex justify-between px-[30px] h-[70px] header">
      <div className="flex items-center">
        <div className="search-container">
          {/* Search input có thể thêm sau */}
        </div>
      </div>
      <div className="flex items-center">
        <Avatar size={44} icon={<UserOutlined />} />
        <div className="avatar-info px-5">
          <div className="text-sm font-bold">{accountData}</div>
        </div>
        <Dropdown overlay={menu} trigger={["click"]}>
          <div
            className="w-[18px] h-[18px] border border-solid border-[#5C5C5C] rounded-full flex items-center justify-center opacity-50 avt cursor-pointer"
            onClick={(e) => e.preventDefault()}
          >
            <DownOutlined className="w-[6px] h-[4px]" />
          </div>
        </Dropdown>
      </div>
    </div>
  );
};

export default Header;
