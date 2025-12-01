import { baseApi } from "../../api/baseApi";

export const employeeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query({
      query: (params) => {
        const queryString = new URLSearchParams(params).toString();
        return `/employee/get-all?${queryString}`;
      },
      providesTags: ["Employee"],
      keepUnusedDataFor: 0,
    }),
    getEmployeesSuperAdmin: builder.query({
      query: (params) => {
        const queryString = new URLSearchParams(params).toString();
        return `/employee/get-all-sup?${queryString}`;
      },
      providesTags: ["Employee"],
      keepUnusedDataFor: 0,
    }),
    getEmployeeDetails: builder.mutation({
      query: (email) => ({
        url: "/employee/get",
        method: "POST",
        body: { email },
      }),
    }),
    createEmployee: builder.mutation({
      query: (formData) => ({
        url: "/employee/create",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Employee"],
    }),
    deleteEmployee: builder.mutation({
      query: (id) => ({
        url: "/employee/delete",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["Employee"],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useGetEmployeesSuperAdminQuery,
  useGetEmployeeDetailsMutation,
  useCreateEmployeeMutation,
  useDeleteEmployeeMutation,
} = employeeApi;
