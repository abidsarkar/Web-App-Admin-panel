import { apiSlice } from "../../api/apiSlice.js";

const otpVerify = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    otpVerify: builder.mutation({
      query: (body) => ({
        url: `/api/v1/auth/verify-email`,
        method: "POST",
        body: body, 
      }),
    }),
  }),
});

export const { useOtpVerifyMutation } = otpVerify;