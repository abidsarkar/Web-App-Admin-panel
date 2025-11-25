import {
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

// Define a base query that accesses the Redux state for the token
const baseQuery = fetchBaseQuery({
  baseUrl: 'http://10.0.60.206:6060',
  prepareHeaders: (headers, ) => {
    // const token = getState()?.auth?.token;
    const token = localStorage.getItem('accessToken');

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    // headers.delete("Content-Type");
    
    return headers;

  },
});

// Enhanced base query with token refresh logic
const baseQueryWithRefreshToken = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // Handle various error statuses
  if (result?.error?.status === 404) {
    // console.log(result.error);
  }
  if (result?.error?.status === 403) {
    console.log(result.error);
  }
  if (result?.error?.status === 409) {
    console.log(result.error);
  }
  // if (result?.error?.status === 401) {
  //   window.location.href = "/login";
  //   //i want to dispatch logout action
  // }

  return result;
};

// Create the base API
export const apiSlice = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithRefreshToken,
  tagTypes: ['language', 'updateUser'],
  endpoints: () => ({}),
});
