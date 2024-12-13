import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isPublicRoute = ["/login", "/signup", "/api"].some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isPublicRoute) {
    return NextResponse.next(); // Cho phép truy cập các trang công khai
  }

  // Chuyển hướng đến login nếu không có token (kiểm tra sơ bộ)
  return NextResponse.next(); // Luôn tiếp tục, xác thực chi tiết sẽ trên client
}

export const config = {
  matcher: ["/:path*"], // Áp dụng cho tất cả các trang
};
