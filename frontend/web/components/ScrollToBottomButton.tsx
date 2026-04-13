import { ArrowDown } from "lucide-react";

interface ScrollToBottomButtonProps {
  isVisible: boolean;
  onClick: () => void;
}

export function ScrollToBottomButton({ isVisible, onClick }: ScrollToBottomButtonProps) {
  if (!isVisible) return null;

  return (
    <div className="absolute bottom-36 left-0 right-0 flex justify-center z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-300">
      <button
        onClick={onClick}
        className="bg-surface-container-high/80 backdrop-blur-md text-on-surface-variant hover:text-on-surface border border-outline-variant/20 p-2.5 rounded-full shadow-lg transition-all active:scale-95 pointer-events-auto cursor-pointer"
        aria-label="Ir al final"
      >
        <ArrowDown className="size-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}
