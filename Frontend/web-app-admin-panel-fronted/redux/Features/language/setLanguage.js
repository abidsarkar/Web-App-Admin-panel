import { apiSlice } from "../../api/apiSlice";


const setLanguage = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        setLanguage: builder.mutation({
            queryFn: (lan) => {
                localStorage.setItem('lng', lan);
            }
        })
    })
});

export const { useSetLanguageMutation } = setLanguage;
