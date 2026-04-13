"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  isDisabled?: boolean;
}

export function ChatInput({
  input,
  setInput,
  onSend,
  isLoading,
  isDisabled = false,
}: ChatInputProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-surface via-surface to-transparent pt-12 px-6 z-40" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 3.5rem)" }}>
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-end">
          <div className="w-full flex items-end bg-surface-container-lowest border border-outline-variant/10 rounded-2xl pl-6 pr-2 py-2 shadow-2xl focus-within:bg-surface-container-highest transition-all duration-300">
            <Textarea
              className="flex-grow bg-transparent border-none focus-visible:ring-0 text-on-surface placeholder:text-on-surface-variant/40 text-base sm:text-sm py-3 min-h-[44px] max-h-[200px] resize-none hide-scrollbar disabled:opacity-50"
              placeholder={isDisabled ? "Conversación bloqueada..." : "Consultar LexRD..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && input.trim()) {
                  e.preventDefault();
                  onSend();
                }
              }}
              disabled={isDisabled}
            />
            <div className="flex items-center gap-1 pb-1 ml-2">
              <Button
                data-testid="send-button"
                aria-label="Enviar mensaje"
                onClick={onSend}
                disabled={isLoading || !input.trim() || isDisabled}
                size="icon"
                className={`w-10 h-10 rounded-full transition-all ${
                  !input.trim() || isLoading
                    ? "bg-surface-container-high text-on-surface-variant/20"
                    : "bg-primary text-on-primary hover:opacity-90 active:scale-95 shadow-lg shadow-primary/10"
                }`}
              >
                <ArrowUp className="size-5" strokeWidth={2.5} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
