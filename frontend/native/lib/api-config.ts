export const API = {
  baseUrl: process.env.EXPO_PUBLIC_BACKEND_URL || "http://192.168.88.7:5000",
  apiKey: process.env.EXPO_PUBLIC_API_KEY_FILTER || "",
  chat: {
    url: `${process.env.EXPO_PUBLIC_BACKEND_URL || "http://192.168.88.7:5000"}/api/chat`,
  },
};
