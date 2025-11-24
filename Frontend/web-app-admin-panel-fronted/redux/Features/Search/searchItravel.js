import { apiSlice } from "../../api/apiSlice.js";

const searchItravel = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    searchItravel: builder.mutation({
      query: (formData) => ({
        url: `/sell-kg/search`,
        method: "POST",
        body: formData, 
      }),
    }),
  }),
});

const searchIShop = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    searchIShop: builder.mutation({
      query: (formData) => ({
        url: `/sell-kg/search/courier`,
        method: "POST",
        body: formData, 
      }),
    }),
  }),
});



export const { useSearchItravelMutation } = searchItravel;
export const { useSearchIShopMutation } = searchIShop;