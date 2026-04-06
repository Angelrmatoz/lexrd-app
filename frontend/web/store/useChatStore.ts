import { create } from "zustand";
import { Message, ChatResponse } from "@/types/chat";

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (input: string) => Promise<void>;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,

  clearMessages: () => set({ messages: [] }),

  sendMessage: async (input: string) => {
    if (!input.trim() || get().isLoading) return;

    const getCurrentTime = () =>
      new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

    const userMessage: Message = {
      role: "user",
      content: input,
      time: getCurrentTime(),
    };

    // Actualizar UI con el mensaje del usuario inmediatamente
    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
    }));

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) throw new Error("Error en la respuesta del servidor");

      const data: ChatResponse = await response.json();
      
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        sources: data.sources,
        time: getCurrentTime(),
      };

      set((state) => ({
        messages: [...state.messages, assistantMessage],
      }));
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Hubo un error al procesar tu solicitud. Por favor intenta de nuevo.",
        time: getCurrentTime(),
      };
      set((state) => ({
        messages: [...state.messages, errorMessage],
      }));
    } finally {
      set({ isLoading: false });
    }
  },
}));
