import { apiSlice } from "../../api/apiSlice";



const widthraw = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        widthraw: builder.mutation({
            query: (data) => ({
                url: `/withdraw/create`,
                method: "POST",
                body: data,
            }),
        }),
        getWidthraw: builder.query({
            query: () => ({
                url: `/wallet/create`,
                method: "GET",
            }),
        }),
        getAllwidthraw: builder.query({
            query: () => ({
                url: `/wallet/read`,
                method: "GET",
            }),
        }),
        getAllTransaction: builder.query({
            query: () => ({
                url: `/payment/transition`,
                method: "GET",
            }),
        }),
    })
})

export const {
    useWidthrawMutation,
    useGetWidthrawQuery,
    useGetAllwidthrawQuery,
    useGetAllTransactionQuery
} = widthraw;



// /withdraw/create