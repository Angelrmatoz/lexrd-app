import "../styles/global.css";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "LexRD | Sovereign Intelligence",
  description: "Expert Dominican legal analysis, regulatory intelligence, and jurisprudence.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("dark", "font-sans", geist.variable)}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block"
        />
      </head>
      <body className="bg-surface selection:bg-tertiary/30">
        <TooltipProvider>
          <SidebarProvider defaultOpen={false}>
            {children}
          </SidebarProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
