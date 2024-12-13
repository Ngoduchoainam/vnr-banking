import LayoutWapper from "@/src/component/LayoutWapper";
import { RoleWpparProvidrer } from "@/src/component/RoleWapper";
import React from "react";
import { auth } from "../api/auth/[...nextauth]/config";
import { redirect } from "next/navigation";

const RootLayout: React.FC<{ children: React.ReactNode; data: any }> = ({
  children,
  data,
}) => {
  if (!data) {
    redirect("/login");
    return null; // Prevent rendering anything if redirected
  }

  return (
    <LayoutWapper>
      <RoleWpparProvidrer data={data.data}>{children}</RoleWpparProvidrer>
    </LayoutWapper>
  );
};

export async function getServerSideProps() {
  const session = await auth();
  if (!session?.user?.access_token) {
    redirect("/login");
    return { props: { data: null } }; // Early exit if no session
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

  const data = response ? await response.json() : undefined;

  return { props: { data } };
}

export default RootLayout;
