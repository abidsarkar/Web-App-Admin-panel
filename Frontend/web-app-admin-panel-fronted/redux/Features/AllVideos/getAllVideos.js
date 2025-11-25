//===================== /general/read=====================//

import { apiSlice } from "../../api/apiSlice.js";

const getAllVideo = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAllVideo: builder.query({
            query: () => ({
                url: `/general/read`,
                method: "GET",
            }),
        }),
    }),
});

export const { useGetAllVideoQuery } = getAllVideo;