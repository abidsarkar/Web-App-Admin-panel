"use client";
import { useEffect } from "react";
import { useRefreshTokenMutation } from "@/redux/Features/Auth/authApi";
import Cookies from "js-cookie";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUser, logout } from "@/redux/Features/Auth/authSlice";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [refreshToken] = useRefreshTokenMutation();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      // Only run on client side
      if (typeof window === "undefined") {
        return;
      }

      // Hydrate user from localStorage on mount
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          dispatch(setUser(user));
        } catch (e) {
          console.error("Failed to parse user from localStorage", e);
        }
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
          // Pass the refresh token as an argument
          const result = await refreshToken({
            refreshToken: refreshTokenValue,
          }).unwrap();

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
              dispatch(setUser(result.data.user));
            }
          }
        } catch {
          // Refresh failed, clear tokens and redirect to login if on protected route
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
          localStorage.removeItem("user");
          dispatch(logout());

          if (pathname?.startsWith("/dashboard")) {
            router.push("/login");
          }
        }
      }
    };

    checkAuth();
  }, [refreshToken, router, pathname, dispatch]);

  // Render children immediately without loading state
  return <>{children}</>;
}
