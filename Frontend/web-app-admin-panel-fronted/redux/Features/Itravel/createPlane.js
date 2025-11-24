import { apiSlice } from "../../api/apiSlice.js";

const createPlane = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createPlane: builder.mutation({
      query: (formData) => ({
        url: `/sell-kg/create`,
        method: "POST",
        body: formData,
      }),
    }),
    getAllPost: builder.query({
      query: () => ({
        url: `/sell-kg/get-all`,
        method: "GET",
      }),
    }),
    getAllPlatform: builder.query({
      query: () => ({
        url: `/platform/read`,
        method: "GET",
      }),
    }),

  }),
});

export const { useCreatePlaneMutation, useGetAllPostQuery  , useGetAllPlatformQuery} = createPlane;