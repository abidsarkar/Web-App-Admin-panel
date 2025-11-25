import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isTokenExpired } from "./utils/tokenExpire";

// Define public routes that don't require authentication
const publicRoutes = ["/login", "/forgot-password", "/reset-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get tokens from cookies
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  // Helper function to refresh tokens
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function refreshTokens(): Promise<{ success: boolean; user?: any }> {
    try {
      const response = await fetch(
        `${request.nextUrl.origin}/api/proxy/auth/refresh-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: request.headers.get("cookie") || "",
          },
          credentials: "include",
        }
      );
      console.log("📨 Response Status:", response.status);
      console.log("📨 Response Headers:");

      // Check for set-cookie headers in response
      const setCookieHeader = response.headers.get("set-cookie");
      console.log("Set-Cookie Header:", setCookieHeader);

      // Log all response headers for debugging
      response.headers.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });
      if (response.ok) {
        const data = await response.json();

        // Extract user data from response if available
        const userData = data.data?.user || data.user;

        return {
          success: true,
          user: userData,
        };
      }
      return { success: false };
    } catch (error) {
      console.warn("Token refresh error:", error);
      return { success: false };
    }
  }

  // If on root path
  if (pathname === "/") {
    //check accessToken expire client-side first
    if (accessToken && !isTokenExpired(accessToken)) {
      // Has access token, redirect to dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else if (refreshToken) {
      const refreshResult = await refreshTokens();
      if (refreshResult.success) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      } else {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // For protected routes (like /dashboard)
  if (pathname.startsWith("/dashboard")) {
    if (!accessToken && !refreshToken) {
      // No tokens at all, redirect to login
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Check if access token is expired but refresh token exists
    if ((!accessToken || isTokenExpired(accessToken)) && refreshToken) {
      const refreshResult = await refreshTokens();

      if (!refreshResult.success) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
