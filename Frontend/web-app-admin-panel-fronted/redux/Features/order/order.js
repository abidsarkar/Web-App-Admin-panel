import { apiSlice } from "../../api/apiSlice.js";


const orderApi = apiSlice.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        getAllSenderOrder: builder.query({
            query: () => ({
                url: `/order/get-all-orders`,
                method: "GET"
            })
        }),
        getAllTravellerOrder: builder.query({
            query: () => ({
                url: `/order/get-orders-request`,
                method: "GET"
            })
        }),
        completeOrder: builder.mutation({
            query: (data) => ({
                url: `/order/complete-order-status`,
                method: "POST",
                body: data
            })
        })
    })
})

export const { useGetAllSenderOrderQuery, useGetAllTravellerOrderQuery, useCompleteOrderMutation } = orderApi