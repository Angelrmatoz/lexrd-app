import { render, screen, fireEvent } from '@/components/__tests__/test-utils';
import { NavBar } from '../NavBar';
import * as navigation from 'next/navigation';

const mockOnNewChat = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
}));

describe('NavBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (navigation.usePathname as jest.Mock).mockReturnValue('/');
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 0,
      configurable: true,
    });
  });

  it('debe renderizar el logo LexRD', () => {
    render(<NavBar onNewChat={mockOnNewChat} />);
    expect(screen.getByText('Lex')).toBeInTheDocument();
    expect(screen.getByText('R')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
  });

  it('debe mostrar el enlace de Chat activo cuando pathname es "/"', () => {
    render(<NavBar onNewChat={mockOnNewChat} />);
    const chatLink = screen.getByText('Chat');
    expect(chatLink).toBeInTheDocument();
    expect(chatLink.closest('a')).toHaveAttribute('href', '/');
  });

  it('debe mostrar el enlace de Documentos Oficiales', () => {
    render(<NavBar onNewChat={mockOnNewChat} />);
    const docLink = screen.getByText('Documentos Oficiales');
    expect(docLink).toBeInTheDocument();
    expect(docLink.closest('a')).toHaveAttribute('href', '/documentos-oficiales');
  });

  it('debe mostrar el botón de Nuevo Chat', () => {
    render(<NavBar onNewChat={mockOnNewChat} />);
    expect(screen.getByText('Nuevo Chat')).toBeInTheDocument();
  });

  it('debe llamar onNewChat al hacer clic en el botón de Nuevo Chat', () => {
    render(<NavBar onNewChat={mockOnNewChat} />);
    const button = screen.getByText('Nuevo Chat').closest('button');
    expect(button).not.toBeNull();
    if (button) {
      fireEvent.click(button);
      expect(mockOnNewChat).toHaveBeenCalledTimes(1);
    }
  });

  it('debe resaltar Chat como activo cuando pathname es "/"', () => {
    render(<NavBar onNewChat={mockOnNewChat} />);
    const chatLink = screen.getByText('Chat').closest('a');
    expect(chatLink).toHaveClass('bg-surface-container-highest');
  });

  it('debe resaltar Documentos Oficiales cuando pathname es "/official-documents"', () => {
    (navigation.usePathname as jest.Mock).mockReturnValue('/official-documents');
    render(<NavBar onNewChat={mockOnNewChat} />);
    const docLink = screen.getByText('Documentos Oficiales').closest('a');
    expect(docLink).toHaveClass('bg-surface-container-highest');
  });

  it('debe resaltar Documentos Oficiales cuando pathname es "/documentos-oficiales"', () => {
    (navigation.usePathname as jest.Mock).mockReturnValue('/documentos-oficiales');
    render(<NavBar onNewChat={mockOnNewChat} />);
    const docLink = screen.getByText('Documentos Oficiales').closest('a');
    expect(docLink).toHaveClass('bg-surface-container-highest');
  });

  it('no debe resaltar ningún enlace cuando pathname no coincide', () => {
    (navigation.usePathname as jest.Mock).mockReturnValue('/otra-ruta');
    render(<NavBar onNewChat={mockOnNewChat} />);
    const chatLink = screen.getByText('Chat').closest('a');
    const docLink = screen.getByText('Documentos Oficiales').closest('a');
    expect(chatLink).not.toHaveClass('bg-surface-container-highest');
    expect(docLink).not.toHaveClass('bg-surface-container-highest');
  });
});
