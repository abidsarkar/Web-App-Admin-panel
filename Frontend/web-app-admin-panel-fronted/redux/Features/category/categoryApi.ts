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
    // Sub-Category Endpoints
    getSubCategories: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.subCategoryId)
          queryParams.append("subCategoryId", params.subCategoryId);
        if (params.category !== "" && params.category !== "none")
          queryParams.append("category", String(params.category));
        if (params.isDisplayed !== "" && params.isDisplayed !== "none")
          queryParams.append("isDisplayed", String(params.isDisplayed));

        return `/category/get-sub-admin?${queryParams.toString()}`;
      },
      transformResponse: (response: any) => {
        const subCategoryData = response.data.subCategory;
        // Handle nested structure if present (based on user request example)
        if (
          subCategoryData &&
          subCategoryData.subCategory &&
          Array.isArray(subCategoryData.subCategory)
        ) {
          return subCategoryData.subCategory;
        }
        if (Array.isArray(subCategoryData)) {
          return subCategoryData;
        } else if (subCategoryData && typeof subCategoryData === "object") {
          // If it's a single object wrapped in data.subCategory
          if (
            subCategoryData.subCategory &&
            typeof subCategoryData.subCategory === "object" &&
            !Array.isArray(subCategoryData.subCategory)
          ) {
            return [subCategoryData.subCategory];
          }
          // If it's a direct single object
          return [subCategoryData];
        }
        return [];
      },
      providesTags: ["SubCategory"],
      keepUnusedDataFor: 0,
    }),
    createSubCategory: builder.mutation({
      query: (data) => ({
        url: "/category/create-sub",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SubCategory"],
    }),
    updateSubCategory: builder.mutation({
      query: (data) => ({
        url: "/category/update-sub",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["SubCategory"],
    }),
    deleteSubCategory: builder.mutation({
      query: (subCategoryId) => ({
        url: `/category/delete-sub?subCategoryId=${subCategoryId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SubCategory"],
    }),
    // Export
    exportCategories: builder.query({
      query: () => ({
        url: "/category/export",
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetSubCategoriesQuery,
  useCreateSubCategoryMutation,
  useUpdateSubCategoryMutation,
  useDeleteSubCategoryMutation,
  useLazyExportCategoriesQuery,
} = categoryApi;
