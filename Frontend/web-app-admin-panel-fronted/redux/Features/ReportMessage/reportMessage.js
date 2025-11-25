import { apiSlice } from "../../api/apiSlice.js";

const reportMessage = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        reportMessage: builder.mutation({
            query: (data) => ({
                url: `/report/create`,
                method: "POST",
                body: data,
            }),
        }),
    }),
});


export const { useReportMessageMutation } = reportMessage;