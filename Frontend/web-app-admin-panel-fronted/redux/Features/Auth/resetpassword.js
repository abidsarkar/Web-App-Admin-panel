import { apiSlice } from "../../api/apiSlice.js";

const resetPassword = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    resetPassword: builder.mutation({
      query: ({body }) => ({
        url: `/api/v1/auth/reset-password`,
        method: "POST",
        body: body, 
      }),
    }),
  }),
});

export const { useResetPasswordMutation } = resetPassword;