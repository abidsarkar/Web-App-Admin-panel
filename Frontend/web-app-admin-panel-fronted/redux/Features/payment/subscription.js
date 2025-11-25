import { apiSlice } from "../../api/apiSlice.js";

const subscription = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createSubscription: builder.mutation({
            query: (data) => ({
                url: `/api/v1/subscription/all`,
                method: "POST",
                body: data,
            }),
        })
    })
})

export const { useCreateSubscriptionMutation } = subscription