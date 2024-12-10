import React from 'react';
import { Layout } from 'antd';
import Link from 'next/link';

const { Footer } = Layout;

const AppFooter = () => {
  return (
    <Footer style={{ textAlign: 'center', backgroundColor: '#001529', color: '#fff' }}>
      <div style={{ padding: '20px 0' }}>
        <Link href="/" style={{ color: '#fff', margin: '0 15px' }}>Trang Chủ</Link>
        <Link href="/about" style={{ color: '#fff', margin: '0 15px' }}>Giới Thiệu</Link>
        <Link href="/services" style={{ color: '#fff', margin: '0 15px' }}>Dịch Vụ</Link>
        <Link href="/contact" style={{ color: '#fff', margin: '0 15px' }}>Liên Hệ</Link>
      </div>
      <div style={{ fontSize: '14px' }}>
        © {new Date().getFullYear()} MyApp. Tất cả các quyền được bảo lưu.
      </div>
    </Footer>
  );
};

export default AppFooter;
