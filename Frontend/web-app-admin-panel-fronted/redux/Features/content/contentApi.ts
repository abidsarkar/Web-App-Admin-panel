import { baseApi } from "../../api/baseApi";

export const contentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all content fields
    getAllContent: builder.query({
      query: () => "/text/get-all",
      transformResponse: (response: any) => response.data,
      providesTags: ["Content"],
    }),
    // Get specific field(s)
    getContent: builder.query({
      query: (fields: string) => `/text/get?fields=${fields}`,
      transformResponse: (response: any) => response.data,
      providesTags: ["Content"],
    }),
    // Create or update content (upsert)
    upsertContent: builder.mutation({
      query: (data) => ({
        url: "/text/create-update",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Content"],
    }),
    // Export content
    exportContent: builder.query({
      query: () => ({
        url: "/text/export",
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAllContentQuery,
  useGetContentQuery,
  useUpsertContentMutation,
  useLazyExportContentQuery,
} = contentApi;
