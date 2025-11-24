// get all reservation
import { apiSlice } from "../../api/apiSlice.js";

export const reservationApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAllReservation: builder.query({
            query: ({ activeTab, id }) => ({
                url: `/order/T&S-orders/${activeTab}/${id}`,
                method: "GET",
            }),
        }),
    })
})

export const { useGetAllReservationQuery } = reservationApi;