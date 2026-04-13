import { create } from "zustand";
import { Message, ChatResponse } from "@/types/chat";
import { ChatState } from "@/types/chat-store";
import { API } from "@/lib/api-config";

export const MAX_MESSAGES = 20;
export const MAX_CONVERSATION_TURNS = Math.floor(MAX_MESSAGES / 2);
export const CHAT_RESET_COUNTDOWN_SECONDS = 10;
const TYPEWRITER_INTERVAL_MS = 20;

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

      const text = await response.text();
      if (!text || text.trim() === "") throw new Error("Respuesta vacía del servidor");
      
      let data: ChatResponse;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Error parseando JSON:", text);
        set({ isLoading: false, isThinking: false });
        throw new Error("Respuesta del servidor malformada");
      }
      
      let fullResponse = data.response || "";
      const sources = data.sources || [];

      // Filtrar bloques de razonamiento interno (thought/thinking)
      fullResponse = fullResponse
        .replace(/<thought>[\s\S]*?<\/thought>/gi, "")
        .replace(/<thinking>[\s\S]*?<\/thinking>/gi, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

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
            const currentMessages = get().messages;
            
            // Si el chat se limpió mientras escribíamos, detener el intervalo
            if (currentMessages.length === 0) {
              clearInterval(interval);
              set({ isTyping: false, isLoading: false });
              resolve();
              return;
            }

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
              
              // Si el mensaje en el índice ya no existe, abortar
              if (!updatedMessages[assistantMessageIndex]) {
                return state;
              }

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
