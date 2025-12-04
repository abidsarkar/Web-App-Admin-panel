import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";

// Define a type for the dynamic context, which can contain the request headers
// This context will be passed from the getServerSideProps wrapper.
interface ExtraOptions {
  headers?: Record<string, string>;
}

// 1. Create the base query (without headers yet)
const rawBaseQuery = fetchBaseQuery({
  baseUrl: "/api/proxy",
  credentials: "include",
});

// 2. Create a wrapper that conditionally reads the token from the context (SSR)
// or from js-cookie (Client-Side)
const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  ExtraOptions
> = async (args, api, extraOptions) => {
  const state = api.getState(); // Useful if token was in Redux state, but we use cookies here

  let token: string | undefined;

  // 🧑‍💻 Server-Side Check: Check if headers were provided via the extraOptions (SSR)
  if (extraOptions?.headers?.cookie) {
    // A simple approach to parse the cookie header on the server
    // For robust parsing, consider using 'cookie' package or a more complex utility
    const cookieHeader = extraOptions.headers.cookie;
    const cookiesMap = new Map(
      cookieHeader.split("; ").map((c) => {
        const [name, value] = c.split("=");
        return [name, value];
      }) as [string, string][]
    );
    token = cookiesMap.get("accessToken");
  }
  // 🌐 Client-Side Check: Check for the token using js-cookie (Client-Side)
  else {
    token = Cookies.get("accessToken");
  }

  // Deep clone the original FetchArgs to ensure no mutation and correct typing
  const requestArgs = typeof args === "string" ? { url: args } : { ...args };

  // 3. Prepare Headers: Set Authorization header if token is found
  if (token) {
    // Initialize headers if they don't exist
    if (!requestArgs.headers) {
      requestArgs.headers = {};
    }
    // Type checking for headers (can be Headers or plain object)
    if (requestArgs.headers instanceof Headers) {
      requestArgs.headers.set("Authorization", `Bearer ${token}`);
    } else {
      requestArgs.headers = {
        ...requestArgs.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  // 4. Execute the query using the raw base query
  return rawBaseQuery(requestArgs, api, {});
};

// 5. Update your createApi call
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth, // Use the new dynamic baseQuery
  tagTypes: [
    "Employee",
    "Product",
    "User",
    "Category",
    "SubCategory",
    "Content",
  ],
  endpoints: () => ({}),
});
