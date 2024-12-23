import LayoutWapper from "@/src/component/LayoutWapper";
import { RoleWpparProvidrer } from "@/src/component/RoleWapper";
import React from "react";
import { redirect } from "next/navigation";
import { SetSession } from "@/src/component/CustomHook/useSession";

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await SetSession();

  console.log(11, session)

  if (!session?.user?.access_token) {
    redirect("/login");
  }

  const response = await fetch(
    "https://apiweb.bankings.vnrsoftware.vn/account/find-role-by-account",
    {
      method: "GET",
      headers: {
        Authorization: session?.user?.access_token ?? "",
      },
    }
  );

  const data = response.ok ? await response.json() : undefined;

  return (
    <LayoutWapper>
      <RoleWpparProvidrer data={data?.data}>{children}</RoleWpparProvidrer>
    </LayoutWapper>
  );
};

export default RootLayout;
