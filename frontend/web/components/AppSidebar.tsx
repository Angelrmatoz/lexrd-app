"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { MessageSquare, Library, Plus } from "lucide-react";
import Link from "next/link";

interface AppSidebarProps {
  onNewChat: () => void;
}

export function AppSidebar({ onNewChat }: AppSidebarProps) {
  return (
    <Sidebar side="left" collapsible="offcanvas" className="md:hidden border-r border-outline-variant/10 bg-surface-container-low">
      <SidebarHeader className="p-6 border-b border-outline-variant/10">
        <div className="text-2xl font-black tracking-tighter uppercase text-white">
          <span>Lex</span>
          <span className="text-dominican-red">R</span>
          <span className="text-dominican-blue">D</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={onNewChat}
                  className="w-full flex items-center gap-3 bg-primary text-on-primary hover:opacity-90 transition-opacity rounded-lg py-6 px-4"
                >
                  <Plus className="size-5" />
                  <span className="font-bold uppercase tracking-wider text-xs">New Chat</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/50 font-bold px-4 mb-2">
            Navegación
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="rounded-lg py-5 px-4 data-active:bg-surface-container-highest data-active:text-on-surface">
                  <Link href="/" className="flex items-center gap-3">
                    <MessageSquare className="size-5" />
                    <span className="font-medium">Chat</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="rounded-lg py-5 px-4 hover:bg-surface-container-high transition-colors">
                  <Link href="/library" className="flex items-center gap-3">
                    <Library className="size-5" />
                    <span className="font-medium text-on-surface-variant">Library</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
