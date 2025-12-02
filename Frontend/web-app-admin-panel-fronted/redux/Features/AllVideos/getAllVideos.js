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
  overrideExisting: true,
});

export const { useGetAllVideoQuery } = getAllVideo;
