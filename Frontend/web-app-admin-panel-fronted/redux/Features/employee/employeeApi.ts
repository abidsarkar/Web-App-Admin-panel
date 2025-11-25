import { baseApi } from "../../api/baseApi";

export const employeeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query({
      query: () => "/employee/get-all",
      providesTags: ["Employee"],
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
  useCreateEmployeeMutation,
  useDeleteEmployeeMutation,
} = employeeApi;
