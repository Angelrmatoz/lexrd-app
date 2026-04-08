"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Menu, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface HeaderProps {
  onNewChat: () => void;
}

export function NavBar({ onNewChat }: HeaderProps) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY === 0) {
        // Solo al tope de la página → mostrar
        setVisible(true);
      } else {
        // Cualquier otro scroll → ocultar
        setVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div
      className={`fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <header className="w-full max-w-5xl bg-surface-container-low/70 backdrop-blur-xl border border-outline-variant/10 rounded-2xl shadow-2xl shadow-black/20 pointer-events-auto">
        <div className="flex justify-between items-center w-full px-6 py-2 h-14">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="md:hidden">
              <Menu className="size-5 text-on-surface" />
            </SidebarTrigger>
            <Link href="/" className="text-xl font-black tracking-tighter uppercase text-white flex items-center gap-1">
              <span>Lex</span>
              <div className="flex">
                <span className="text-dominican-red">R</span>
                <span className="text-dominican-blue">D</span>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.15em]">
              <Link
                className={`transition-all duration-300 px-4 py-1.5 rounded-xl ${
                  pathname === "/" 
                  ? "bg-surface-container-highest text-on-surface shadow-inner" 
                  : "text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container-high/50"
                }`}
                href="/"
              >
                Chat
              </Link>
              <Link
                className={`transition-all duration-300 px-4 py-1.5 rounded-xl ${
                  pathname === "/documentos-oficiales" || pathname === "/official-documents"
                  ? "bg-surface-container-highest text-on-surface shadow-inner"
                  : "text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container-high/50"
                }`}
                href="/documentos-oficiales"
              >
                Documentos Oficiales
              </Link>
            </nav>
            
            <div className="hidden md:flex items-center">
              <button
                onClick={onNewChat}
                className="flex items-center gap-2 bg-primary text-on-primary px-4 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-all hover:opacity-90 shadow-lg shadow-primary/10"
              >
                <Plus className="size-3.5" strokeWidth={3} />
                <span>Nuevo Chat</span>
              </button>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
