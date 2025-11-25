import { apiSlice } from "../../api/apiSlice";

const getUser = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query({
      queryFn: async () => {
        // Fetching user and token from localStorage
        const token = localStorage.getItem("accessToken");
        const user = localStorage.getItem("user");

        // Return user and token if found, or an error message
        if (token && user) {
          return { data: { token, user: JSON.parse(user) } };
        } else {
          return { error: { message: "User not found or token missing" } };
        }
      },
      method: "GET",
      providesTags: ["updateUser"],
    }),
    getSingleUser: builder.query({
      query: (id) => ({
        url: `/auth/get-user/${id}`,
        method: "GET",
      }),
    }),
    getProfile: builder.query({
      query: (token) => ({
        url: `/api/v1/users/self/in`,
        method: "GET",
        body:token
      }),
    }),
  }),
});

export const { useGetUserQuery, useGetSingleUserQuery , useGetProfileQuery } = getUser;
