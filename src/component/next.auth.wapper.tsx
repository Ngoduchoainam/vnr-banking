import { SessionProvider } from "next-auth/react";

export default function NextAuthWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SessionProvider>{children}</SessionProvider>;
}
