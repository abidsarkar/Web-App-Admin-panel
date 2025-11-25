import { apiSlice } from "../../api/apiSlice";

const teamsApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAllTeams: builder.query({
      query: () => "/api/v1/team/all", // GET endpoint
      transformResponse: (response) => response.data.attributes, // Get only the array
    }),
  }),
});

export const {useGetAllTeamsQuery} = teamsApi;
