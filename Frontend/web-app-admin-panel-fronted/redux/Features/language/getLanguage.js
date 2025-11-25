import { apiSlice } from "../../api/apiSlice";


const getLanguage = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getLanguage: builder.query({
            queryFn: () => {
                // Getting the language from localStorage and returning it as the result
                const language = localStorage.getItem("lng");
                return { data: language || "en" }; // Default to 'en' if no language is found
            }
        })
    })
});

export const { useGetLanguageQuery } = getLanguage;
