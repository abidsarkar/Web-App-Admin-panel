import { baseApi } from "../../api/baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: { email },
      }),
    }),
    verifyForgotPasswordOTP: builder.mutation({
      query: ({ email, otp, token }) => ({
        url: "/auth/verify-forgot-password-otp",
        method: "POST",
        body: { email, otp },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    changePassword: builder.mutation({
      query: ({ newPassword, confirmPassword, email, token }) => ({
        url: "/auth/change-password",
        method: "POST",
        body: { password: newPassword, confirmPassword, email },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    changePasswordFromProfile: builder.mutation({
      query: (data) => ({
        url: "/auth/change-pass-from-profile",
        method: "POST",
        body: data,
      }),
    }),
    refreshToken: builder.mutation({
      query: () => ({
        url: "/auth/refresh-token",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),
    resendOTP: builder.mutation({
      query: (email) => ({
        url: "/auth/resend-otp",
        method: "POST",
        body: { email },
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useVerifyForgotPasswordOTPMutation,
  useChangePasswordMutation,
  useChangePasswordFromProfileMutation,
  useRefreshTokenMutation,
  useResendOTPMutation,
} = authApi;
