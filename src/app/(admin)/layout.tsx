"use client";

import LayoutWapper from "@/src/component/LayoutWapper";
import { RoleWpparProvidrer } from "@/src/component/RoleWapper";
import React from "react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // const { data: session, status } = useSession();
  // const [data, setData] = useState<any>(null);
  // const [loading, setLoading] = useState(true);
  // const router = useRouter();

  // useEffect(() => {
  //   const fetchData = async () => {
  //     if (!session?.user?.access_token) {
  //       router.push("/login");
  //       return;
  //     }

  //     try {
  //       const response = await fetch(
  //         "https://apiweb.bankings.vnrsoftware.vn/account/find-role-by-account",
  //         {
  //           method: "GET",
  //           headers: {
  //             Authorization: session.user.access_token,
  //           },
  //         }
  //       );
  //       const result = await response.json();
  //       setData(result.data);
  //     } catch (error) {
  //       console.error("Failed to fetch roles:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   if (status === "authenticated") {
  //     fetchData();
  //   }
  // }, [session, status, router]);

  // if (status === "loading" || loading) {
  //   return <div>Loading...</div>; // Or a custom loading component
  // }

  return (
    <LayoutWapper>
      <RoleWpparProvidrer>{children}</RoleWpparProvidrer>
    </LayoutWapper>
  );
};

export default RootLayout;
