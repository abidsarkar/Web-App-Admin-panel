import { apiSlice } from "../../api/apiSlice.js";

const changePassword = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    changePassword: builder.mutation({
      query: ({body }) => ({
        url: `/api/v1/auth/change-password`,
        method: "POST",
        body: body, 
      }),
    }),
  }),
});

export const { useChangePasswordMutation } = changePassword;

