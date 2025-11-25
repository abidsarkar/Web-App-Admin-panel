import { apiSlice } from "../../api/apiSlice.js";

const forgotpassword = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    forgotpassword: builder.mutation({
      query: ({ email }) => ({
        url: `/api/v1/auth/forgot-password`,
        method: "POST",
        body: { email: email } ,
      }),
    }),
  }),
});

export const { useForgotpasswordMutation } = forgotpassword;