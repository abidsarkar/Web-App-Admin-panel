// middleware.ts
import { NextResponse, NextRequest } from "next/server";

const PROTECTED_ROUTES = [
  "/",
  "/dashboard",
  "/products",
  "/orders",
  "/customers",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // 1️⃣ If not protected route → allow access
  if (!isProtected) return NextResponse.next();

  // 2️⃣ If user has accessToken → allow access
  if (accessToken) {
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 3️⃣ If no accessToken but has refreshToken → try to refresh
  if (!accessToken && refreshToken) {
    const refreshed = await refreshTokens(request);

    if (refreshed) {
      const response =
        pathname === "/"
          ? NextResponse.redirect(new URL("/dashboard", request.url))
          : NextResponse.next();

      // Set ALL cookies returned from backend
      refreshed.cookies.forEach((cookie) => {
        response.headers.append("set-cookie", cookie);
      });

      return response;
    }

    // Failed refresh → send to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 4️⃣ No tokens at all → redirect to login
  return NextResponse.redirect(new URL("/login", request.url));
}

// ---------------------------------------------
// 🔄 Helper: Refresh token through proxy route
// ---------------------------------------------
async function refreshTokens(request: NextRequest) {
  try {
    const backendRes = await fetch(
      `${request.nextUrl.origin}/api/proxy/auth/refresh-token`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      }
    );

    if (!backendRes.ok) return null;

    // Collect multiple Set-Cookie headers
    const rawSetCookies: string[] = [];
    backendRes.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        rawSetCookies.push(value);
      }
    });

    // No cookies returned → invalid refresh
    if (rawSetCookies.length === 0) return null;

    return {
      cookies: rawSetCookies,
    };
  } catch (error) {
    console.error("❌ Refresh token error:", error);
    return null;
  }
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/products/:path*",
    "/orders/:path*",
    "/customers/:path*",
  ],
};
