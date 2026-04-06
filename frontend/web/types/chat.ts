export type MessageRole = "user" | "assistant";

export interface Message {
  role: MessageRole;
  content: string;
  sources?: string[];
  time?: string;
}

export interface ChatResponse {
  response: string;
  sources?: string[];
}
