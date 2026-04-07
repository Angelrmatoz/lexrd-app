/**
 * Configuración de la API del backend
 */
export const API = {
  baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000",
  apiKey: process.env.NEXT_PUBLIC_API_KEY || "",
  chat: {
    url: `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/chat`,
  },
};
