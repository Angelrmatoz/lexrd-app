"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";

interface HeaderProps {
  onNewChat: () => void;
}

export function Header({ onNewChat }: HeaderProps) {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface-container-low border-b border-outline-variant/10">
      <div className="flex justify-between items-center w-full px-6 py-4 h-16 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="md:hidden">
            <Menu className="size-5 text-on-surface" />
          </SidebarTrigger>
          <div className="text-2xl font-black tracking-tighter uppercase text-white">
            <span>Lex</span>
            <span className="text-dominican-red">R</span>
            <span className="text-dominican-blue">D</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-3 text-sm font-medium">
            <a
              className="text-on-surface font-bold transition-colors duration-200 border-b-2 border-dominican-red"
              href="#"
            >
              Chat
            </a>
            <a
              className="text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200 px-3 py-1 rounded-md"
              href="#"
            >
              Library
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={onNewChat}
              className="flex items-center gap-2 bg-primary text-on-primary px-4 py-1.5 rounded-full font-bold text-xs active:scale-95 transition-transform hover:opacity-90 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span className="hidden sm:inline">New Chat</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
