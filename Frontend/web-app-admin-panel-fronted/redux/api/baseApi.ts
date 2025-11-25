import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

// Helper to get cookie on client side, for server side we might need a different approach if we were doing direct server calls
// But for RTK Query running on client (mostly), this works.
// For SSR prefetching, we'd need to pass headers.

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5001/api/v1",
    credentials: "include", // Important for cookies
    prepareHeaders: (headers) => {
      const token = Cookies.get("accessToken");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Employee", "Product", "User"],
  endpoints: () => ({}),
});
