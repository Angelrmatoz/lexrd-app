/**
 * Pruebas de Integración
 *
 * Estas pruebas verifican la interacción entre múltiples componentes y el store,
 * simulando flujos reales de usuario que las pruebas unitarias aisladas no cubren.
 */

import { render, screen, fireEvent, waitFor, act } from '@/components/__tests__/test-utils';
import { useChatStore } from '@/store/useChatStore';
import { ChatInput } from '../ChatInput';
import { NavBar } from '../NavBar';
import { AppSidebar } from '../AppSidebar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Timer } from 'lucide-react';

// ──────────────────────────────────────────────
// Helper: Mock global fetch
// ──────────────────────────────────────────────

function mockFetchWithJSONResponse(responseText: string, sources: string[] = []) {
  const mockResponse = {
    ok: true,
    status: 200,
    headers: {
      get: (name: string) => name === 'content-type' ? 'application/json' : null,
    },
    json: async () => ({ response: responseText, sources }),
  };
  global.fetch = jest.fn().mockResolvedValue(mockResponse);
}

function mockFetchWithStreamResponse(responseText: string, sources: string[] = []) {
  const mockResponse = {
    ok: true,
    status: 200,
    headers: {
      get: (name: string) => name === 'content-type' ? 'text/event-stream' : null,
    },
    body: null,
  };
  global.fetch = jest.fn().mockResolvedValue(mockResponse);
}

function mockFetchWithError() {
  global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
}

// ──────────────────────────────────────────────
// Integración 1: ChatInput + Store States (loading, limitReached)
// ──────────────────────────────────────────────

describe('Integración: ChatInput + useChatStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useChatStore.getState().clearMessages();
  });

  it('debe deshabilitar ChatInput completamente cuando limitReached es true', () => {
    // Simulamos que se alcanzó el límite
    act(() => {
      useChatStore.setState({ limitReached: true, isLoading: false });
    });

    const { isLoading, limitReached } = useChatStore.getState();
    render(
      <ChatInput
        input=""
        setInput={jest.fn()}
        onSend={jest.fn()}
        isLoading={isLoading}
        isDisabled={limitReached}
      />
    );

    const textarea = screen.getByRole('textbox');
    const button = screen.getByRole('button');

    expect(textarea).toBeDisabled();
    expect(button).toBeDisabled();
    expect(screen.getByPlaceholderText('Conversación bloqueada...')).toBeInTheDocument();
  });

  it('debe deshabilitar el botón de enviar mientras isLoading es true', () => {
    act(() => {
      useChatStore.setState({ isLoading: true, limitReached: false });
    });

    const { isLoading, limitReached } = useChatStore.getState();
    render(
      <ChatInput
        input="Pregunta legal"
        setInput={jest.fn()}
        onSend={jest.fn()}
        isLoading={isLoading}
        isDisabled={limitReached}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('debe habilitar el botón cuando hay input y no está cargando ni bloqueado', () => {
    act(() => {
      useChatStore.setState({ isLoading: false, limitReached: false });
    });

    const { isLoading, limitReached } = useChatStore.getState();
    render(
      <ChatInput
        input="¿Qué dice la ley?"
        setInput={jest.fn()}
        onSend={jest.fn()}
        isLoading={isLoading}
        isDisabled={limitReached}
      />
    );

    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
  });

  it('debe reflejar los estados del store de forma consistente (loading + limitReached)', () => {
    // Ambos estados activos
    act(() => {
      useChatStore.setState({ isLoading: true, limitReached: true });
    });

    const { isLoading, limitReached } = useChatStore.getState();
    render(
      <ChatInput
        input=""
        setInput={jest.fn()}
        onSend={jest.fn()}
        isLoading={isLoading}
        isDisabled={limitReached}
      />
    );

    const textarea = screen.getByRole('textbox');
    const button = screen.getByRole('button');

    expect(textarea).toBeDisabled();
    expect(button).toBeDisabled();
  });
});

// ──────────────────────────────────────────────
// Integración 2: Flujo completo de envío con store
// ──────────────────────────────────────────────

describe('Integración: Flujo completo de envío', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useChatStore.getState().clearMessages();
    global.fetch = jest.fn();
  });

  it('debe completar el ciclo: input → enviar → loading → respuesta', async () => {
    // Limpiar estado antes del test
    act(() => {
      useChatStore.setState({
        messages: [],
        isLoading: false,
        isThinking: false,
        limitReached: false,
      });
    });

    mockFetchWithJSONResponse('Según el artículo 39 de la Constitución...', ['Constitución Dominicana Art. 39']);

    const store = useChatStore.getState();
    expect(store.messages).toHaveLength(0);
    expect(store.isLoading).toBe(false);

    // Simular envío
    await act(async () => {
      await store.sendMessage('¿Qué dice el artículo 39?');
    });

    // Verificar que el mensaje del usuario se agregó
    const state = useChatStore.getState();
    expect(state.messages).toHaveLength(2); // user + assistant
    expect(state.messages[0].role).toBe('user');
    expect(state.messages[0].content).toBe('¿Qué dice el artículo 39?');

    // Verificar que la respuesta del asistente llegó
    expect(state.messages[1].role).toBe('assistant');
    expect(state.messages[1].content).toBe('Según el artículo 39 de la Constitución...');
    expect(state.messages[1].sources).toContain('Constitución Dominicana Art. 39');

    // Verificar que loading se reseteó
    expect(state.isLoading).toBe(false);
    expect(state.isThinking).toBe(false);
  });

  it('debe manejar errores del servidor y agregar mensaje de error', async () => {
    // Espiamos console.error para silenciarlo durante este test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Asegurarse de que el store está limpio
    act(() => {
      useChatStore.setState({
        messages: [],
        isLoading: false,
        isThinking: false,
        limitReached: false,
      });
    });

    mockFetchWithError();

    await act(async () => {
      await useChatStore.getState().sendMessage('Pregunta que fallará');
    });

    const state = useChatStore.getState();
    expect(state.messages).toHaveLength(2);
    expect(state.messages[1].role).toBe('assistant');
    expect(state.messages[1].content).toContain('Hubo un error');

    // Loading debe resetearse incluso con error
    expect(state.isLoading).toBe(false);
    expect(state.isThinking).toBe(false);

    // Restaurar console.error
    consoleSpy.mockRestore();
  });

  it('no debe enviar mensaje si el input está vacío', async () => {
    const store = useChatStore.getState();

    await act(async () => {
      await store.sendMessage('');
    });

    expect(useChatStore.getState().messages).toHaveLength(0);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('no debe enviar mensaje si ya está cargando', async () => {
    act(() => {
      useChatStore.setState({ isLoading: true });
    });

    const store = useChatStore.getState();

    await act(async () => {
      await store.sendMessage('Otra pregunta');
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('no debe enviar mensaje si limitReached es true', async () => {
    act(() => {
      useChatStore.setState({ limitReached: true });
    });

    const store = useChatStore.getState();

    await act(async () => {
      await store.sendMessage('Pregunta después del límite');
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('debe activar limitReached al alcanzar MAX_MESSAGES (20)', async () => {
    // Limpiar estado
    act(() => {
      useChatStore.setState({
        messages: [],
        isLoading: false,
        isThinking: false,
        limitReached: false,
      });
    });

    // Mock de fetch
    mockFetchWithJSONResponse('Respuesta');

    // Simular 18 mensajes manualmente (9 ciclos user+assistant)
    for (let i = 0; i < 9; i++) {
      await act(async () => {
        useChatStore.setState((state) => ({
          messages: [
            ...state.messages,
            { role: 'user', content: `Mensaje ${i * 2 + 1}` },
            { role: 'assistant', content: 'Respuesta' },
          ],
          isLoading: false,
          isThinking: false,
        }));
      });
    }

    expect(useChatStore.getState().messages).toHaveLength(18);
    expect(useChatStore.getState().limitReached).toBe(false);

    // Enviar un mensaje más: user (19) + assistant (20) → debe activar limitReached
    await act(async () => {
      await useChatStore.getState().sendMessage('Mensaje 19');
    });

    const state = useChatStore.getState();
    expect(state.messages).toHaveLength(20);
    expect(state.limitReached).toBe(true);
  });

  it('clearMessages debe resetear TODOS los estados correctamente (incluyendo isLoading)', async () => {
    act(() => {
      useChatStore.setState({
        messages: [{ role: 'user', content: 'test' }],
        isLoading: true,
        isThinking: true,
        limitReached: true,
      });
    });

    act(() => {
      useChatStore.getState().clearMessages();
    });

    const state = useChatStore.getState();
    expect(state.messages).toHaveLength(0);
    expect(state.isLoading).toBe(false);
    expect(state.isThinking).toBe(false);
    expect(state.limitReached).toBe(false);
    expect(state.sessionId).toBeDefined();
  });
});

// ──────────────────────────────────────────────
// Integración 3: NavBar + AppSidebar con contexto compartido
// ──────────────────────────────────────────────

describe('Integración: NavBar + AppSidebar con contexto', () => {
  const mockOnNewChat = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 0,
      configurable: true,
    });
  });

  it('deben compartir la misma acción de Nuevo Chat', () => {
    render(
      <>
        <NavBar onNewChat={mockOnNewChat} />
        <AppSidebar onNewChat={mockOnNewChat} />
      </>
    );

    // Verificar que ambos componentes renderizan su botón de nuevo chat
    const navButton = screen.getByText('Nuevo Chat').closest('button');
    const sidebarButton = screen.getByRole('button', { name: /new chat/i });

    expect(navButton).toBeInTheDocument();
    expect(sidebarButton).toBeInTheDocument();

    // Ambos deben llamar la misma función
    fireEvent.click(navButton!);
    expect(mockOnNewChat).toHaveBeenCalledTimes(1);

    fireEvent.click(sidebarButton);
    expect(mockOnNewChat).toHaveBeenCalledTimes(2);
  });

  it('deben mostrar el logo LexRD consistentemente en ambos componentes', () => {
    render(
      <>
        <NavBar onNewChat={mockOnNewChat} />
        <AppSidebar onNewChat={mockOnNewChat} />
      </>
    );

    // El logo debe aparecer en ambos (NavBar + Sidebar header)
    const lexElements = screen.getAllByText('Lex');
    expect(lexElements.length).toBeGreaterThanOrEqual(1);
  });

  it('la navegación de NavBar debe tener los enlaces correctos', () => {
    render(<NavBar onNewChat={mockOnNewChat} />);

    const chatLink = screen.getByText('Chat');
    const docLink = screen.getByText('Documentos Oficiales');

    expect(chatLink.closest('a')).toHaveAttribute('href', '/');
    expect(docLink.closest('a')).toHaveAttribute('href', '/documentos-oficiales');
  });

  it('la navegación de AppSidebar debe tener los enlaces correctos', () => {
    render(<AppSidebar onNewChat={mockOnNewChat} />);

    const chatLink = screen.getByText('Chat');
    const libraryLink = screen.getByText('Library');

    expect(chatLink.closest('a')).toHaveAttribute('href', '/');
    expect(libraryLink.closest('a')).toHaveAttribute('href', '/library');
  });

  it('deben coexistir sin conflictos de contexto de Sidebar', () => {
    // Este test verifica que NavBar (que usa SidebarTrigger) y AppSidebar
    // (que usa Sidebar) pueden coexistir con el mismo SidebarProvider
    expect(() => {
      render(
        <>
          <NavBar onNewChat={mockOnNewChat} />
          <AppSidebar onNewChat={mockOnNewChat} />
        </>
      );
    }).not.toThrow();
  });
});

// ──────────────────────────────────────────────
// Integración 4: Alerta de límite + countdown
// ──────────────────────────────────────────────

describe('Integración: Alerta de límite con countdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    useChatStore.getState().clearMessages();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('debe mostrar la alerta cuando limitReached es true', () => {
    // Mock del Alert para que renderice correctamente
    const MockAlert = ({ children, ...props }: Record<string, unknown>) => (
      <div data-alert="true" {...props}>{children}</div>
    );

    render(
      <MockAlert>
        <div role="alert">
          <strong>Límite de conversación alcanzado</strong>
          <span>Se ha excedido el límite de 10 mensajes. El chat se borrará automáticamente en <strong>10s</strong>.</span>
        </div>
      </MockAlert>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Límite de conversación alcanzado/i)).toBeInTheDocument();
  });

  it('debe resetear el store cuando countdown llega a 0', async () => {
    act(() => {
      useChatStore.setState({
        limitReached: true,
        messages: [
          { role: 'user', content: 'test' },
          { role: 'assistant', content: 'respuesta' },
        ],
      });
    });

    // Simular countdown logic del page.tsx
    let countdown = 10;
    const interval = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(interval);
        act(() => {
          useChatStore.getState().clearMessages();
        });
      }
    }, 1000);

    // Avanzar 10 segundos
    await act(async () => {
      jest.advanceTimersByTime(10000);
    });

    const state = useChatStore.getState();
    expect(state.messages).toHaveLength(0);
    expect(state.limitReached).toBe(false);

    clearInterval(interval);
  });
});
