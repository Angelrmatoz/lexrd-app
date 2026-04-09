import { render, screen } from '@/components/__tests__/test-utils';
import { Footer } from '../Footer';

describe('Footer', () => {
  it('debe renderizar el footer completo', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('debe mostrar los enlaces de Terms, Privacy y Legal Disclaimer', () => {
    render(<Footer />);
    expect(screen.getByText('Terms')).toBeInTheDocument();
    expect(screen.getByText('Privacy')).toBeInTheDocument();
    expect(screen.getByText('Legal Disclaimer')).toBeInTheDocument();
  });

  it('debe mostrar el copyright con el año actual', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} LexRD. IA Jurídica Dominicana.`)).toBeInTheDocument();
  });

  it('debe mostrar el disclaimer de que LexRD puede cometer errores', () => {
    render(<Footer />);
    expect(
      screen.getByText(/LexRD puede cometer errores/i)
    ).toBeInTheDocument();
  });

  it('los enlaces deben tener href="#" como placeholder', () => {
    render(<Footer />);
    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      expect(link).toHaveAttribute('href', '#');
    });
  });
});
