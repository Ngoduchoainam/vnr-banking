"use client";

import { createContext, PropsWithChildren, useEffect, useState } from "react";

import { DataRoleType, RoleContextType } from "@/src/common/type";
import { apiClient } from "@/src/services/base_api";

export const RoleContext = createContext<RoleContextType>(
  {} as RoleContextType
);
export const RoleWpparProvidrer = ({
  children,
  data,
}: PropsWithChildren<{ data?: DataRoleType }>) => {
  const [roleData, setRoleData] = useState<DataRoleType>(
    data ?? ({} as DataRoleType)
  );
  const getRoleByAccount = async () => {
    const responsive = await apiClient.get("/account/find-role-by-account");
    setRoleData(responsive.data.data);
  };

  useEffect(() => {
    getRoleByAccount();
  }, []);

  return (
    <RoleContext.Provider value={{ dataRole: roleData, getRoleByAccount }}>
      {children}
    </RoleContext.Provider>
  );
};
