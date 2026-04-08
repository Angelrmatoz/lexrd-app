import { render, screen, fireEvent } from '@/components/__tests__/test-utils';
import { ChatInput } from '../ChatInput';

const defaultProps = {
  input: '',
  setInput: jest.fn(),
  onSend: jest.fn(),
  isLoading: false,
  isDisabled: false,
};

describe('ChatInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe renderizar el textarea', () => {
    render(<ChatInput {...defaultProps} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('debe mostrar el placeholder correcto', () => {
    render(<ChatInput {...defaultProps} />);
    expect(screen.getByPlaceholderText('Consultar LexRD...')).toBeInTheDocument();
  });

  it('debe mostrar el botón de enviar', () => {
    render(<ChatInput {...defaultProps} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('debe mostrar placeholder de bloqueado cuando isDisabled es true', () => {
    render(<ChatInput {...defaultProps} isDisabled={true} />);
    expect(screen.getByPlaceholderText('Conversación bloqueada...')).toBeInTheDocument();
  });

  it('debe deshabilitar el textarea cuando isDisabled es true', () => {
    render(<ChatInput {...defaultProps} isDisabled={true} />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('debe deshabilitar el botón cuando no hay input', () => {
    render(<ChatInput {...defaultProps} input="" />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('debe habilitar el botón cuando hay input', () => {
    render(<ChatInput {...defaultProps} input="Hola" />);
    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
  });

  it('debe deshabilitar el botón cuando isLoading es true', () => {
    render(<ChatInput {...defaultProps} input="Hola" isLoading={true} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('debe deshabilitar el botón cuando isDisabled es true', () => {
    render(<ChatInput {...defaultProps} input="Hola" isDisabled={true} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('debe llamar setInput al escribir en el textarea', () => {
    render(<ChatInput {...defaultProps} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Hola mundo' } });
    expect(defaultProps.setInput).toHaveBeenCalledWith('Hola mundo');
  });

  it('debe llamar onSend al hacer clic en el botón', () => {
    render(<ChatInput {...defaultProps} input="Hola" />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(defaultProps.onSend).toHaveBeenCalledTimes(1);
  });

  it('debe llamar onSend al presionar Enter sin Shift', () => {
    render(<ChatInput {...defaultProps} input="Hola" />);
    const textarea = screen.getByRole('textbox');
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
    expect(defaultProps.onSend).toHaveBeenCalledTimes(1);
  });

  it('NO debe llamar onSend al presionar Enter con Shift', () => {
    render(<ChatInput {...defaultProps} input="Hola" />);
    const textarea = screen.getByRole('textbox');
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });
    expect(defaultProps.onSend).not.toHaveBeenCalled();
  });

  it('NO debe llamar onSend al presionar Enter sin Shift si input solo tiene espacios', () => {
    render(<ChatInput {...defaultProps} input="   " />);
    const textarea = screen.getByRole('textbox');
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
    // Ahora el handler valida input.trim(), así que no se debe llamar onSend
    expect(defaultProps.onSend).not.toHaveBeenCalled();
  });
});
