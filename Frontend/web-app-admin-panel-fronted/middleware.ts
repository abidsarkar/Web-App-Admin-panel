import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const { pathname } = request.nextUrl;

  // 1. Redirect to login if accessing dashboard without token
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 2. Redirect to dashboard if accessing login/signup with token
  if (pathname === "/login" || pathname === "/forgot-password") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // 3. Redirect root to login (or dashboard if logged in, handled by rule 2 implicitly if we redirect to login first)
  if (pathname === "/") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/forgot-password", "/dashboard/:path*"],
};
