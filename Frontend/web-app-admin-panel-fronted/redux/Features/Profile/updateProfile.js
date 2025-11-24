
//============ /auth/update/ ================

import { apiSlice } from "../../api/apiSlice.js";

const updateProfile = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        updateProfile: builder.mutation({
            query: ( formData ) => ({
                url: `/auth/update`,
                method: "PATCH",
                body: formData,
            }),
        }),
        invalidatesTags: ["updateUser"]
    }),
});

export const { useUpdateProfileMutation } = updateProfile;