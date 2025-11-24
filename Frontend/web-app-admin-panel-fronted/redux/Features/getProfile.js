import { apiSlice } from "../api/apiSlice";


const getPost = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPost: builder.query({
      query: () => `1`,
      method: "GET",
    })
  })
});

export const { useGetPostQuery } = getPost;
