import { baseApi } from "../../api/baseApi";

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.categoryId)
          queryParams.append("categoryId", params.categoryId);
        if (params.subCategory !== "" && params.subCategory !== "none")
          queryParams.append("subCategory", String(params.subCategory));
        if (params.isDisplayed !== "" && params.isDisplayed !== "none")
          queryParams.append("isDisplayed", String(params.isDisplayed));

        return `/category/get-admin?${queryParams.toString()}`;
      },
      transformResponse: (response: any) => {
        const categoryData = response.data.category;
        if (Array.isArray(categoryData)) {
          return categoryData;
        } else if (categoryData && typeof categoryData === "object") {
          return [categoryData];
        }
        return [];
      },
      providesTags: ["Category"],
      keepUnusedDataFor: 0,
    }),
    createCategory: builder.mutation({
      query: (data) => ({
        url: "/category/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),
    updateCategory: builder.mutation({
      query: (data) => ({
        url: "/category/update",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),
    deleteCategory: builder.mutation({
      query: (categoryId) => ({
        url: `/category/delete?categoryId=${categoryId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
