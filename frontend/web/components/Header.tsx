"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface HeaderProps {
  onNewChat: () => void;
}

export function Header({ onNewChat }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 w-full z-50 bg-surface-container-low border-b border-outline-variant/10">
      <div className="flex justify-between items-center w-full px-6 py-4 h-16 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="md:hidden">
            <Menu className="size-5 text-on-surface" />
          </SidebarTrigger>
          <Link href="/" className="text-2xl font-black tracking-tighter uppercase text-white">
            <span>Lex</span>
            <span className="text-dominican-red">R</span>
            <span className="text-dominican-blue">D</span>
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-3 text-sm font-medium">
            <Link
              className={`transition-colors duration-200 px-3 py-1 rounded-md ${
                pathname === "/" 
                ? "text-on-surface font-bold border-b-2 border-dominican-red rounded-none" 
                : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
              href="/"
            >
              Chat
            </Link>
            <Link
              className={`transition-colors duration-200 px-3 py-1 rounded-md ${
                pathname === "/library" 
                ? "text-on-surface font-bold border-b-2 border-dominican-red rounded-none" 
                : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
              href="/library"
            >
              Library
            </Link>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onNewChat}
              className="flex items-center gap-2 bg-primary text-on-primary px-4 py-1.5 rounded-full font-bold text-xs active:scale-95 transition-transform hover:opacity-90 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>New Chat</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
