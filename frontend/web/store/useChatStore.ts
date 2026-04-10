import { create } from "zustand";
import { Message, ChatResponse } from "@/types/chat";
import { ChatState } from "@/types/chat-store";
import { API } from "@/lib/api-config";

const MAX_MESSAGES = 20;
const TYPEWRITER_INTERVAL_MS = 15;

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  isThinking: false,
  isTyping: false,
  sessionId: generateId(),
  limitReached: false,

  clearMessages: () => set({
    messages: [],
    sessionId: generateId(),
    limitReached: false,
    isLoading: false,
    isThinking: false,
    isTyping: false,
  }),

  sendMessage: async (input: string) => {
    if (!input.trim() || get().isLoading || get().limitReached) return;

    const { sessionId } = get();

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

    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
      isThinking: true,
    }));

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (API.apiKey) {
        headers["x-api-key"] = API.apiKey;
      }

      const response = await fetch(API.chat.url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: input,
          sessionId: sessionId,
        }),
      });

      if (!response.ok) throw new Error("Error del servidor");

      const data: ChatResponse = await response.json();
      const fullResponse = data.response || "";
      const sources = data.sources || [];

      set({ isThinking: false });

      // Crear mensaje vacío del asistente
      const assistantMessageIndex = get().messages.length;
      set((state) => ({
        messages: [
          ...state.messages,
          {
            role: "assistant",
            content: "",
            sources: sources.length > 0 ? sources : undefined,
            time: getCurrentTime(),
          },
        ],
      }));

      // Efecto typewriter: mostrar carácter por carácter
      if (fullResponse.length > 0) {
        set({ isTyping: true });

        let charIndex = 0;
        await new Promise<void>((resolve) => {
          const interval = setInterval(() => {
            if (charIndex >= fullResponse.length) {
              clearInterval(interval);
              set({ isTyping: false, isLoading: false });
              resolve();
              return;
            }

            charIndex++;
            const typedContent = fullResponse.substring(0, charIndex);

            set((state) => {
              const updatedMessages = [...state.messages];
              updatedMessages[assistantMessageIndex] = {
                ...updatedMessages[assistantMessageIndex],
                content: typedContent,
              };
              return { messages: updatedMessages };
            });
          }, TYPEWRITER_INTERVAL_MS);
        });
      } else {
        set({ isLoading: false });
      }

      if (get().messages.length >= MAX_MESSAGES) {
        set({ limitReached: true });
      }
    } catch (error) {
      console.error("Error:", error);
      set({ isThinking: false });

      set((state) => ({
        messages: [
          ...state.messages,
          {
            role: "assistant",
            content: "Hubo un error al procesar tu solicitud. Por favor intenta de nuevo.",
            time: getCurrentTime(),
          },
        ],
        isLoading: false,
        isThinking: false,
      }));
    }
  },
}));
