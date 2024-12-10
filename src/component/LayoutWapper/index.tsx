"use client";

import { Layout } from "antd";
import React from "react";
import SideMenu from "../Menu";

const LayoutWapper = ({ children }: { children: React.ReactNode }) => {
  const { Content } = Layout;
  return (
    <Layout className="min-h-screen">
      <div className="grid grid-cols-12 min-h-screen">
        <div className="col-span-2 bg-gray-100 h-screen sticky top-0">
          <SideMenu />
        </div>

        <div className="col-span-10">
          <Content>{children}</Content>
        </div>
      </div>
    </Layout>
  );
};

export default LayoutWapper;
