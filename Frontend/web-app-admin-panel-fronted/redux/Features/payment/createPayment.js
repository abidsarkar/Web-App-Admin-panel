
//============ /auth/update/ ================
import { apiSlice } from "../../api/apiSlice.js";

const payment = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        payment: builder.mutation({
            query: (data) => ({
                url: `/payment/create-checkout-session`,
                method: "POST",
                body: data,
            }),
        })
    }),
});

export const { usePaymentMutation } = payment;