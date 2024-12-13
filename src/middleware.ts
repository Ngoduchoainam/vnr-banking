// import { NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";
// import type { NextRequest } from "next/server";

// export async function middleware(req: NextRequest) {
//   const token = await getToken({
//     req,
//     secret: process.env.AUTH_SECRET,
//   });

//   console.log("00000000token", token);

//   if (!token) {
//     const url = req.nextUrl.clone();
//     url.pathname = "/login";
//     return NextResponse.redirect(url);
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/((?!api|_next|login|register).*)", "/"],
// };

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./app/api/auth/[...nextauth]/config";

export async function middleware(req: NextRequest) {
  const session = await auth();

  console.log("Middleware Sessionnnnnnnnn:", session);

  if (!session?.user?.access_token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|login|register).*)", "/"],
};
