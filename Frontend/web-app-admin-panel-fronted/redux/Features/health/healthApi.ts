import { baseApi } from "../../api/baseApi";

export const healthApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get overall health status
    getHealth: builder.query({
      query: () => "/health",
      transformResponse: (response: any) => response.data,
    }),
    // Get MongoDB health
    getMongoHealth: builder.query({
      query: () => "/health/mongo",
      transformResponse: (response: any) => response.data,
    }),
    // Get Redis health
    getRedisHealth: builder.query({
      query: () => "/health/redis",
      transformResponse: (response: any) => response.data,
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetHealthQuery,
  useGetMongoHealthQuery,
  useGetRedisHealthQuery,
  useLazyGetHealthQuery,
  useLazyGetMongoHealthQuery,
  useLazyGetRedisHealthQuery,
} = healthApi;
