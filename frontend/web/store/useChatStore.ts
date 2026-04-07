import { create } from "zustand";
import { Message, ChatResponse } from "@/types/chat";
import { API } from "@/lib/api-config";

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isThinking: boolean;
  sessionId: string;
  limitReached: boolean;
  sendMessage: (input: string) => Promise<void>;
  clearMessages: () => void;
}

const MAX_MESSAGES = 20;

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  isThinking: false,
  sessionId: generateId(),
  limitReached: false,

  clearMessages: () => set({
    messages: [],
    sessionId: generateId(),
    limitReached: false,
    isThinking: false,
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

      // Usar endpoint de streaming
      const streamUrl = API.chat.url.replace("/api/chat", "/api/chat/stream");
      const response = await fetch(streamUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: input,
          sessionId: sessionId,
        }),
      });

      if (!response.ok) throw new Error("Error del servidor");

      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("text/event-stream")) {
        // SSE Streaming
        set({ isThinking: false });

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let streamedContent = "";
        let sources: string[] = [];

        const streamingMessageIndex = get().messages.length;
        set((state) => ({
          messages: [
            ...state.messages,
            {
              role: "assistant",
              content: "",
              sources: [],
              time: getCurrentTime(),
            },
          ],
        }));

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");
            
            for (const line of lines) {
              if (line.startsWith("data:")) {
                try {
                  const jsonStr = line.substring(5).trim();
                  if (jsonStr) {
                    const data: ChatResponse = JSON.parse(jsonStr);
                    if (data.response) {
                      streamedContent += data.response;
                    }
                    if (data.sources && data.sources.length > 0) {
                      sources = data.sources;
                    }
                  }
                } catch (e) {
                  // Ignorar parse errors
                }
              }
            }

            set((state) => {
              const updatedMessages = [...state.messages];
              updatedMessages[streamingMessageIndex] = {
                ...updatedMessages[streamingMessageIndex],
                content: streamedContent,
                sources: sources.length > 0 ? sources : undefined,
              };
              return { messages: updatedMessages };
            });
          }
        }

        set({ isLoading: false, isThinking: false });
      } else {
        // Fallback JSON
        set({ isThinking: false });
        const data: ChatResponse = await response.json();

        set((state) => ({
          messages: [
            ...state.messages,
            {
              role: "assistant",
              content: data.response,
              sources: data.sources,
              time: getCurrentTime(),
            },
          ],
          isLoading: false,
          isThinking: false,
        }));
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
