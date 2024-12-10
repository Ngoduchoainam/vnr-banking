"use client";

import LayoutWapper from "@/src/component/LayoutWapper";
import { RoleWpparProvidrer } from "@/src/component/RoleWapper";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../api/auth/[...nextauth]/config";
import { DataRoleType } from "@/src/common/type";

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<DataRoleType>(({} as DataRoleType));
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const session = await auth();
      if (!session?.user?.access_token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        "https://apiweb.bankings.vnrsoftware.vn/account/find-role-by-account",
        {
          method: "GET",
          headers: {
            Authorization: session.user.access_token,
          },
        }
      );
      const result = response ? await response.json() : undefined;
      setData(result?.data || null);
      setLoading(false);
    };

    fetchData();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  return (
    <LayoutWapper>
      <RoleWpparProvidrer data={data}>{children}</RoleWpparProvidrer>
    </LayoutWapper>
  );
};

export default RootLayout;
