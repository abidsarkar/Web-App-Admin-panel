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
    getEmployeeDetails: builder.query({
      query: (email) => `/employee/get?email=${email}`,
      keepUnusedDataFor: 0,
    }),
    createEmployee: builder.mutation({
      query: (formData) => ({
        url: "/employee/create",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Employee"],
    }),
    updateEmployee: builder.mutation({
      query: (formData) => ({
        url: "/employee/update",
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["Employee"],
    }),
    updateProfilePicture: builder.mutation({
      query: (formData) => ({
        url: "/employee/update-profile-pic",
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["Employee"],
    }),
    deleteEmployee: builder.mutation({
      query: ({ email, employer_id }) => ({
        url: `/employee/delete?email=${email}&employer_id=${employer_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Employee"],
    }),
    exportEmployees: builder.query({
      query: () => ({
        url: "/employee/export-employees",
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetEmployeesQuery,
  useGetEmployeesSuperAdminQuery,
  useLazyGetEmployeeDetailsQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useUpdateProfilePictureMutation,
  useDeleteEmployeeMutation,
  useLazyExportEmployeesQuery,
} = employeeApi;
