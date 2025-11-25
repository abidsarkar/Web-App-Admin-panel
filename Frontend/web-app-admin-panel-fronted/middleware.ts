import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

  // If on root path
  if (pathname === "/") {
    if (accessToken) {
      // Has access token, redirect to dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else if (refreshToken) {
      // Has refresh token, try to validate it
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1"}/auth/refresh`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
          }
        );

        if (response.ok) {
          const data = await response.json();

          // Create response to redirect to dashboard
          const dashboardResponse = NextResponse.redirect(
            new URL("/dashboard", request.url)
          );

          // Set new tokens in cookies
          if (data.data?.accessToken) {
            dashboardResponse.cookies.set(
              "accessToken",
              data.data.accessToken,
              {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24, // 1 day
              }
            );
          }

          if (data.data?.refreshToken) {
            dashboardResponse.cookies.set(
              "refreshToken",
              data.data.refreshToken,
              {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 7, // 7 days
              }
            );
          }

          return dashboardResponse;
        } else {
          // Refresh failed, redirect to login
          return NextResponse.redirect(new URL("/login", request.url));
        }
      } catch (error) {
        console.error("Token refresh error:", error);
        return NextResponse.redirect(new URL("/login", request.url));
      }
    } else {
      // No tokens, redirect to login
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // For protected routes (like /dashboard)
  if (pathname.startsWith("/dashboard")) {
    if (!accessToken && !refreshToken) {
      // No tokens at all, redirect to login
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (!accessToken && refreshToken) {
      // Try to refresh the token
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1"}/auth/refresh`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const nextResponse = NextResponse.next();

          // Set new tokens
          if (data.data?.accessToken) {
            nextResponse.cookies.set("accessToken", data.data.accessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 60 * 60 * 24,
            });
          }

          if (data.data?.refreshToken) {
            nextResponse.cookies.set("refreshToken", data.data.refreshToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 60 * 60 * 24 * 7,
            });
          }

          return nextResponse;
        } else {
          // Refresh failed, redirect to login
          return NextResponse.redirect(new URL("/login", request.url));
        }
      } catch (error) {
        console.error("Token refresh error:", error);
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
