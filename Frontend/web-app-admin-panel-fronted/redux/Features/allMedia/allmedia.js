import { apiSlice } from "../../api/apiSlice.js";

const allMedia = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAllMedia: builder.query({
            query: () => '/social/read',
            providesTags: ['language'],
        }),
    }),
})

export const { useGetAllMediaQuery } = allMedia