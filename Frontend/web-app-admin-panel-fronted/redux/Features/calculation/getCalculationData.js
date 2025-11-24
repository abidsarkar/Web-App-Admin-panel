//===================== /platform/read =====================//

import { apiSlice } from "../../api/apiSlice.js";

const getAllCalculationData = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllCalculationData: builder.query({
      query: () => ({
        url: `/platform/read`,
        method: "GET", 
      }),
    }),
  }),
});

export const { useGetAllCalculationDataQuery } = getAllCalculationData;