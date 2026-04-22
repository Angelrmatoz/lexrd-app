import { render, screen } from '@/components/__tests__/test-utils';
import { Footer } from '../Footer';

describe('Footer', () => {
  it('debe renderizar el footer completo', () => {
    render(<Footer />);
    // Usamos querySelector o getByText genérico ya que no hay un rol específico a menos que usemos `contentinfo`
    expect(screen.getByText(/LexRD puede cometer errores/i)).toBeInTheDocument();
  });

  it('debe mostrar los enlaces de Términos y Privacidad', () => {
    render(<Footer />);
    expect(screen.getByText('Términos')).toBeInTheDocument();
    expect(screen.getByText('Privacidad')).toBeInTheDocument();
  });

  it('debe mostrar el disclaimer principal', () => {
    render(<Footer />);
    expect(
      screen.getByText(/LexRD puede cometer errores. Verifique la información importante/i)
    ).toBeInTheDocument();
  });

  it('los enlaces deben tener href="#" como placeholder', () => {
    render(<Footer />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBe(2);
    links.forEach((link) => {
      expect(link).toHaveAttribute('href', '#');
    });
  });
});
