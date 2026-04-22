"use client";

import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { AppSidebar } from "@/components/AppSidebar";
import { useChatStore } from "@/store/useChatStore";
import { useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";
import { LEGAL_CATEGORIES } from "@/constants/categories";

export default function LibraryPage() {
  const { clearMessages } = useChatStore();
  const router = useRouter();

  const handleNewChat = () => {
    clearMessages();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen text-on-surface bg-surface">
      <AppSidebar onNewChat={handleNewChat} />

      <div className="flex flex-col flex-1 relative bg-surface overflow-hidden">
        <NavBar onNewChat={handleNewChat} />

        <main className="grow pt-28 pb-12 px-6 overflow-y-auto hide-scrollbar">
          <div className="max-w-6xl mx-auto space-y-16">
            {/* Project Hero */}
            <div className="space-y-6 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/10 text-tertiary text-[10px] font-bold uppercase tracking-widest">
                <BookOpen className="size-3" />
                Knowledge Base
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-tight">
                Biblioteca <span className="text-dominican-red">Digital</span> <br />
                de <span className="text-dominican-blue">Jurisprudencia</span>
              </h1>
              <p className="text-lg text-on-surface-variant max-w-2xl leading-relaxed font-light">
                LexRD es un sistema de inteligencia soberana diseñado para democratizar el acceso 
                al conocimiento legal dominicano. Nuestra base de datos ha sido expandida y 
                reestructurada para cubrir todas las ramas fundamentales del derecho nacional.
              </p>
            </div>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {LEGAL_CATEGORIES.map((category, idx) => (
                <div 
                  key={idx}
                  className="group bg-surface-container-lowest border border-outline-variant/5 hover:border-tertiary/30 p-8 rounded-2xl transition-all duration-300 flex flex-col space-y-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center group-hover:scale-110 transition-transform">
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight mb-1">{category.title}</h3>
                    <p className="text-sm text-on-surface-variant font-medium mb-4 opacity-70">
                      {category.description}
                    </p>
                    <ul className="space-y-2">
                      {category.documents.map((doc, dIdx) => (
                        <li key={dIdx} className="flex items-center gap-2 text-xs font-semibold text-on-surface/80">
                          <div className="size-1 rounded-full bg-dominican-red" />
                          {doc}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Disclaimer Section */}
            <div className="bg-surface-container-high/30 border border-outline-variant/10 p-8 rounded-2xl">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-on-surface-variant">Nota sobre la fuente</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed opacity-80">
                Todos los documentos integrados en el cerebro de LexRD son versiones oficiales 
                obtenidas de repositorios gubernamentales y legislativos de la República Dominicana. 
                El sistema procesa estos textos mediante fragmentación estructural para asegurar que las 
                citas mantengan el contexto original del legislador.
              </p>
            </div>

            <Footer />
          </div>
        </main>
      </div>

      {/* Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="ambient-orb absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-dominican-blue rounded-full"></div>
        <div className="ambient-orb absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-dominican-red rounded-full"></div>
      </div>
    </div>
  );
}
