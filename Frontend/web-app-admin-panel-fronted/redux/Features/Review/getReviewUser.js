import { apiSlice } from "../../api/apiSlice.js";

const getReviewUser = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getReviewUser: builder.query({
            query: (review) => ({
                url: `/sell-kg/read/${review}`,
                method: "GET",
            }),
        }),
    }),
});

export const { useGetReviewUserQuery } = getReviewUser;