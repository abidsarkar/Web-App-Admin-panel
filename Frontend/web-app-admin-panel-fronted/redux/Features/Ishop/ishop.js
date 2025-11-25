import { apiSlice } from "../../api/apiSlice.js";

const ishop = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createIshop: builder.mutation({
            query: (data) => ({
                url: "/post-product/create-post",
                method: "POST",
                body: data,
            }),
        }),
        getAllIshop: builder.query({
            query: () => ({
                url: "/post-product/read-post",
                method: "GET",
            }),
        }),
    }),
});
export const { useCreateIshopMutation , useGetAllIshopQuery} = ishop;