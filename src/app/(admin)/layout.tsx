import LayoutWapper from "@/src/component/LayoutWapper";
import { RoleWpparProvidrer } from "@/src/component/RoleWapper";
import React from "react";
import { redirect } from "next/navigation";
import { SetSession } from "@/src/component/CustomHook/useSession";
import Header from "@/src/component/Header";

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await SetSession();

  if (!session?.user?.access_token) {
    redirect("/login");
  }

  const response = await fetch(
    "https://apisms.bankings.vnrsoftware.vn/account/find-role-by-account",
    {
      method: "GET",
      headers: {
        Authorization: session?.user?.access_token ?? "",
      },
    }
  );

  const responseResult = await response.json();

  if (responseResult.Code == 401) {
    redirect("/login");
  }

  const data = response.ok ? responseResult : undefined;

  return (
    <LayoutWapper>
      <Header />
      <RoleWpparProvidrer data={data?.data}>{children}</RoleWpparProvidrer>
    </LayoutWapper>
  );
};

export default RootLayout;
