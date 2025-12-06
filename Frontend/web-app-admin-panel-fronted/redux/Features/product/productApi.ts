import { baseApi } from "../../api/baseApi";

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all products with filters and pagination
    getAllProducts: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", String(params.page));
        if (params.limit) queryParams.append("limit", String(params.limit));
        if (params.sort) queryParams.append("sort", params.sort);
        if (params.order) queryParams.append("order", params.order);
        if (params.search) queryParams.append("search", params.search);
        if (params.isSaleable !== "" && params.isSaleable !== "none")
          queryParams.append("isSaleable", String(params.isSaleable));
        if (params.isDisplayable !== "" && params.isDisplayable !== "none")
          queryParams.append("isDisplayable", String(params.isDisplayable));
        if (params.categoryId)
          queryParams.append("categoryId", params.categoryId);
        if (params.subCategoryId)
          queryParams.append("subCategoryId", params.subCategoryId);

        return `/product/get-all-admin?${queryParams.toString()}`;
      },
      transformResponse: (response: any) => response.data,
      providesTags: ["Product"],
      keepUnusedDataFor: 0,
    }),
    // Get single product
    getSingleProduct: builder.query({
      query: (_id: string) => `/product/get-single-admin?_id=${_id}`,
      transformResponse: (response: any) => response.data.product,
      providesTags: ["Product"],
    }),
    // Get products by sub-category
    getProductsBySubCategory: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", String(params.page));
        if (params.limit) queryParams.append("limit", String(params.limit));
        if (params.sort) queryParams.append("sort", params.sort);
        if (params.order) queryParams.append("order", params.order);
        if (params.subCategoryId)
          queryParams.append("subCategoryId", params.subCategoryId);

        return `/product/get-sub?${queryParams.toString()}`;
      },
      transformResponse: (response: any) => response.data,
      providesTags: ["Product"],
    }),
    // Create product
    createProduct: builder.mutation({
      query: (data) => ({
        url: "/product/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),
    // Update product
    updateProduct: builder.mutation({
      query: (data) => ({
        url: "/product/update",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),
    // Delete product
    deleteProduct: builder.mutation({
      query: (_id: string) => ({
        url: `/product/delete?_id=${_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),
    // Upload cover image
    uploadCoverImage: builder.mutation({
      query: (formData) => ({
        url: "/product/upload-cover",
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["Product"],
    }),
    // Upload multiple product images
    uploadProductImages: builder.mutation({
      query: (formData) => ({
        url: "/product/upload-many",
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["Product"],
    }),
    // Delete product image
    deleteProductImage: builder.mutation({
      query: ({
        productId,
        imageId,
      }: {
        productId: string;
        imageId: string;
      }) => ({
        url: `/product/delete-many?productId=${productId}&imageId=${imageId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),
    // Replace product image
    replaceProductImage: builder.mutation({
      query: (formData) => ({
        url: "/product/replace-many",
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["Product"],
    }),
    // Export products
    exportProducts: builder.query({
      query: () => ({
        url: "/product/export",
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAllProductsQuery,
  useGetSingleProductQuery,
  useGetProductsBySubCategoryQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadCoverImageMutation,
  useUploadProductImagesMutation,
  useDeleteProductImageMutation,
  useReplaceProductImageMutation,
  useLazyExportProductsQuery,
} = productApi;
