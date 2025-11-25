// features/auth/authApi.ts
import { apiSlice } from "../../api/apiSlice";

const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    userLogin: builder.mutation({
      query: (credentials) => ({
        url: "/api/v1/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
  }),
});

export const { useUserLoginMutation } = authApi;
