import { baseApi } from "../../api/baseApi";

export const customerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllCustomers: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", String(params.page));
        if (params.limit) queryParams.append("limit", String(params.limit));
        if (params.search) queryParams.append("search", params.search);
        if (params.isActive !== undefined && params.isActive !== "")
          queryParams.append("isActive", String(params.isActive));
        if (params.isDeleted !== undefined && params.isDeleted !== "")
          queryParams.append("isDeleted", String(params.isDeleted));
        if (params.sort) queryParams.append("sort", params.sort);
        if (params.order) queryParams.append("order", params.order);

        return {
          url: `/customer/get-all-admin?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Customer"],
    }),
    getCustomer: builder.query({
      query: (identifier) => {
        const queryParams = new URLSearchParams();
        if (identifier._id) queryParams.append("_id", identifier._id);
        if (identifier.email) queryParams.append("email", identifier.email);

        return {
          url: `/customer/get-admin?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Customer"],
    }),
    deactivateCustomer: builder.mutation({
      query: ({ _id, isActive }) => {
        const queryParams = new URLSearchParams();
        queryParams.append("_id", _id);
        queryParams.append("isActive", String(isActive));
        return {
          url: `/customer/deactivate?${queryParams.toString()}`,
          method: "PATCH",
        };
      },
      invalidatesTags: ["Customer"],
    }),
    deleteCustomer: builder.mutation({
      query: ({ _id }) => {
        const queryParams = new URLSearchParams();
        queryParams.append("_id", _id);
        return {
          url: `/customer/delete-admin?${queryParams.toString()}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["Customer"],
    }),
    exportCustomers: builder.query({
      query: () => ({
        url: "/customer/export",
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAllCustomersQuery,
  useGetCustomerQuery,
  useDeactivateCustomerMutation,
  useDeleteCustomerMutation,
  useLazyExportCustomersQuery,
} = customerApi;
