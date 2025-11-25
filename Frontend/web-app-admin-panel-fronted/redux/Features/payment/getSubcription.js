// redux/Features/payment/getSubscription.js
import { apiSlice } from "../../api/apiSlice.js";

const subscription = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSubscription: builder.query({
      query: () => ({
        url: `/api/v1/subscription/all`,
        method: "GET",  // use GET instead of POST if you're just fetching
      }),
      transformResponse: (response) => response.data.attributes, // If your backend sends { data: { attributes: [...] } }
    }),
  }),
});

export const { useGetSubscriptionQuery } = subscription;
