import Cookies from "js-cookie";

export const setAuthCookies = (accessToken: string, refreshToken: string) => {
  Cookies.set("accessToken", accessToken, {
    expires: 1, // 1 day
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  Cookies.set("refreshToken", refreshToken, {
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
};

export const clearAuthCookies = () => {
  Cookies.remove("accessToken");
  Cookies.remove("refreshToken");
};
