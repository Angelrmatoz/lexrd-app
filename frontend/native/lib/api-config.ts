export const API = {
    baseUrl: process.env.EXPO_PUBLIC_BACKEND_LOCAL || process.env.EXPO_PUBLIC_BACKEND_URL_PROD,
    apiKey: process.env.EXPO_PUBLIC_API_KEY_FILTER || "",
    chat: {
        url: `${process.env.EXPO_PUBLIC_BACKEND_LOCAL || process.env.EXPO_PUBLIC_BACKEND_URL_PROD}/api/chat`,
    },
};
