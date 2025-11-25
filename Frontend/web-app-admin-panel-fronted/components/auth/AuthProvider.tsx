"use client";
import { useEffect } from "react";
import { useRefreshTokenMutation } from "@/redux/Features/Auth/authApi";
import Cookies from "js-cookie";
import { useRouter, usePathname } from "next/navigation";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [refreshToken] = useRefreshTokenMutation();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      // Only run on client side
      if (typeof window === "undefined") {
        return;
      }

      const accessToken = Cookies.get("accessToken");
      const refreshTokenValue = Cookies.get("refreshToken");

      // If we have an access token, we're good
      if (accessToken) {
        return;
      }

      // If we have a refresh token but no access token, try to refresh
      if (refreshTokenValue && !accessToken) {
        try {
          const result = await refreshToken().unwrap();

          if (result.data?.accessToken) {
            // Store new access token
            Cookies.set("accessToken", result.data.accessToken, {
              expires: 1,
            });

            // Update refresh token if provided
            if (result.data?.refreshToken) {
              Cookies.set("refreshToken", result.data.refreshToken, {
                expires: 7,
              });
            }

            // Update user info if provided
            if (result.data?.user) {
              localStorage.setItem("user", JSON.stringify(result.data.user));
            }
          }
        } catch {
          // Refresh failed, clear tokens and redirect to login if on protected route
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
          localStorage.removeItem("user");

          if (pathname?.startsWith("/dashboard")) {
            router.push("/login");
          }
        }
      }
    };

    checkAuth();
  }, [refreshToken, router, pathname]);

  // Render children immediately without loading state
  return <>{children}</>;
}
