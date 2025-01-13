"use client";

import { Layout } from "antd";
import React, { useState } from "react";
import SideMenu from "../Menu";
import "./style.css";

const LayoutWapper = ({ children }: { children: React.ReactNode }) => {
  const { Content } = Layout;
  const [isMenuVisible, setIsMenuVisible] = useState(window.innerWidth > 1366);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [selectedMenuKey, setSelectedMenuKey] = useState<string | null>(null);

  // Bắt đầu kéo
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = e.type === "touchstart" ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    setStartX(clientX);
  };

  // Di chuyển khi kéo
  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (isDragging) {
      const clientX = e.type === "touchmove" ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
      const deltaX = clientX - startX;

      if (deltaX > 50) {
        setIsMenuVisible(true);
      } else if (deltaX < -50) {
        setIsMenuVisible(false);
      }
    }
  };

  // Kết thúc kéo
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <Layout
      className="min-h-screen"
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
    >
      <div className="grid grid-cols-12 min-h-screen">
        <div className={`col-span-2 bg-gray-100 h-screen sticky top-0 menu ${isMenuVisible ? 'menu-visible' : 'menu-hidden'}`}>
          <SideMenu onMenuClick={setSelectedMenuKey} />
        </div>

        <div
          className={
            `col-span-${isMenuVisible ? '10' : '12'} 
            ${(selectedMenuKey == '/statistical' || selectedMenuKey == '/telegram_integration' || selectedMenuKey == '/sheet_intergration' || selectedMenuKey == '/transaction') ? "statistical-class" : ""} 
            ${selectedMenuKey == '/account' ? "account-class" : ""}`}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <div className="w-full h-2 bg-blue-500 cursor-ew-resize xl:hidden"></div>
          <Content>{children}</Content>
        </div>
      </div>
    </Layout>
  );
};

export default LayoutWapper;
