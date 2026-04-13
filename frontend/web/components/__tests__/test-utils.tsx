import React, { createContext, useContext, useState } from 'react';

// ──────────────────────────────────────────────
// Mocks de módulos UI (deben ir ANTES del render)
// ──────────────────────────────────────────────

jest.mock('@/components/ui/sidebar', () => ({
  Sidebar: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-sidebar="true" className={className}>
      {children}
    </div>
  ),
  SidebarContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-sidebar-content="true" className={className}>
      {children}
    </div>
  ),
  SidebarHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-sidebar-header="true" className={className}>
      {children}
    </div>
  ),
  SidebarMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-sidebar-menu="true">{children}</div>
  ),
  SidebarMenuButton: ({
    children,
    onClick,
    asChild,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    asChild?: boolean;
    className?: string;
  }) =>
    asChild ? (
      <div data-sidebar-menu-button="true" className={className}>
        {children}
      </div>
    ) : (
      <button data-sidebar-menu-button="true" onClick={onClick} className={className}>
        {children}
      </button>
    ),
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => (
    <div data-sidebar-menu-item="true">{children}</div>
  ),
  SidebarGroup: ({ children }: { children: React.ReactNode }) => (
    <div data-sidebar-group="true">{children}</div>
  ),
  SidebarGroupLabel: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-sidebar-group-label="true" className={className}>
      {children}
    </div>
  ),
  SidebarGroupContent: ({ children }: { children: React.ReactNode }) => (
    <div data-sidebar-group-content="true">{children}</div>
  ),
  SidebarTrigger: ({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
    <button data-sidebar-trigger="true" className={className} onClick={onClick}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea className={className} {...props} />
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    className,
    size,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    size?: string;
  }) => (
    <button onClick={onClick} disabled={disabled} className={className} data-size={size}>
      {children}
    </button>
  ),
}));

jest.mock('lucide-react', () => {
  const mockIcon = ({ className, ...props }: { className?: string }) => (
    <span data-testid="lucide-icon" className={className} {...props} />
  );
  return {
    Menu: mockIcon,
    Plus: mockIcon,
    MessageSquare: mockIcon,
    Library: mockIcon,
    BookOpen: mockIcon,
    ChevronDown: mockIcon,
    ArrowUp: mockIcon,
    AlertCircle: mockIcon,
    Bot: mockIcon,
    Gavel: mockIcon,
    Timer: mockIcon,
    ArrowDown: mockIcon,
  };
});

jest.mock('next/link', () => {
  return function NextLinkMock({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

// ──────────────────────────────────────────────
// SidebarProvider para componentes que usan SidebarContext
// ──────────────────────────────────────────────

interface SidebarContextValue {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  isMobile: boolean;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [openMobile, setOpenMobile] = useState(false);

  return (
    <SidebarContext.Provider
      value={{
        state: 'expanded',
        open,
        setOpen,
        isMobile: false,
        openMobile,
        setOpenMobile,
        toggleSidebar: () => setOpen((prev) => !prev),
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

// ──────────────────────────────────────────────
// Custom render
// ──────────────────────────────────────────────

import { render, RenderOptions } from '@testing-library/react';

interface AllProvidersProps {
  children: React.ReactNode;
}

function AllProviders({ children }: AllProvidersProps) {
  return <SidebarProvider>{children}</SidebarProvider>;
}

function customRender(ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react';
export { customRender as render };
