import "./globals.css";
import React from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NextTopLoader from "nextjs-toploader";
import { RoleWpparProvidrer } from "../component/RoleWapper";
import NextAuthWrapper from "../component/next.auth.wapper";

const MasterRootLayout: React.FC<{ children: React.ReactNode }> = async ({
  children,
}) => {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <NextTopLoader
            color="#2299DD"
            height={3}
            speed={400}
            showSpinner={false}
          />

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={true}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <NextAuthWrapper>
            <RoleWpparProvidrer>{children}</RoleWpparProvidrer>
          </NextAuthWrapper>
        </AntdRegistry>
      </body>
    </html>
  );
};
export default MasterRootLayout;
