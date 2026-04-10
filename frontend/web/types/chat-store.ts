import { Message } from "@/types/chat";

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isThinking: boolean;
  isTyping: boolean;
  sessionId: string;
  limitReached: boolean;
  sendMessage: (input: string) => Promise<void>;
  clearMessages: () => void;
}
