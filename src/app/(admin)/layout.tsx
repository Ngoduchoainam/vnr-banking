import LayoutWapper from "@/src/component/LayoutWapper";
import { RoleWpparProvidrer } from "@/src/component/RoleWapper";
import React from "react";
import { auth } from "../api/auth/[...nextauth]/config";
import { redirect } from "next/navigation";

const RootLayout: React.FC<{ children: React.ReactNode }> = async ({
  children,
}) => {
  const session = await auth();
  const responsive = await fetch(
    "https://apiweb.bankings.vnrsoftware.vn/account/find-role-by-account",
    {
      method: "GET",
      headers: {
        Authorization: session?.user?.access_token ?? "",
      },
    }
  );
  const data = responsive ? await responsive.json() : undefined;
  if (!session?.user?.access_token) {
    redirect("/login");
  }

  return (
    <LayoutWapper>
      <RoleWpparProvidrer data={data.data}>{children}</RoleWpparProvidrer>
    </LayoutWapper>
  );
};

export default RootLayout;
