import { apiSlice } from "../../api/apiSlice.js";

const submitDocument = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        submitDocument: builder.mutation({
            query: ({ body, userId }) => ({
                url: `/auth/update/${userId}`,
                method: "PATCH",
                body: body,
            }),
        }),
    }),
});

export const { useSubmitDocumentMutation } = submitDocument;