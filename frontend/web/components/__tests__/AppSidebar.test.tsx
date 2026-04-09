import { render, screen, fireEvent } from '@/components/__tests__/test-utils';
import { AppSidebar } from '../AppSidebar';

const mockOnNewChat = jest.fn();

describe('AppSidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe renderizar el sidebar con el logo LexRD', () => {
    render(<AppSidebar onNewChat={mockOnNewChat} />);
    expect(screen.getByText('Lex')).toBeInTheDocument();
    expect(screen.getByText('R')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
  });

  it('debe mostrar el botón de New Chat', () => {
    render(<AppSidebar onNewChat={mockOnNewChat} />);
    expect(screen.getByText('New Chat')).toBeInTheDocument();
  });

  it('debe llamar onNewChat al hacer clic en el botón de New Chat', () => {
    render(<AppSidebar onNewChat={mockOnNewChat} />);
    const button = screen.getByRole('button', { name: /new chat/i });
    fireEvent.click(button);
    expect(mockOnNewChat).toHaveBeenCalledTimes(1);
  });

  it('debe mostrar el enlace de Chat', () => {
    render(<AppSidebar onNewChat={mockOnNewChat} />);
    expect(screen.getByText('Chat')).toBeInTheDocument();
  });

  it('debe mostrar el enlace de Library', () => {
    render(<AppSidebar onNewChat={mockOnNewChat} />);
    expect(screen.getByText('Library')).toBeInTheDocument();
  });

  it('debe mostrar la etiqueta de Navegación', () => {
    render(<AppSidebar onNewChat={mockOnNewChat} />);
    expect(screen.getByText('Navegación')).toBeInTheDocument();
  });

  it('el enlace de Library debe apuntar a /library', () => {
    render(<AppSidebar onNewChat={mockOnNewChat} />);
    const libraryLink = screen.getByText('Library').closest('a');
    expect(libraryLink).toHaveAttribute('href', '/library');
  });

  it('el enlace de Chat debe apuntar a /', () => {
    render(<AppSidebar onNewChat={mockOnNewChat} />);
    const chatLink = screen.getByText('Chat').closest('a');
    expect(chatLink).toHaveAttribute('href', '/');
  });

  it('debe renderizar el contenedor del sidebar', () => {
    render(<AppSidebar onNewChat={mockOnNewChat} />);
    const sidebar = document.querySelector('[data-sidebar="true"]');
    expect(sidebar).toBeInTheDocument();
  });
});
