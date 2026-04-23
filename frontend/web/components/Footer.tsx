export function Footer() {
  return (
    <footer className="text-center text-xs text-on-surface-variant/50 py-4 px-4">
      <span>
        LexRD puede cometer errores. Verifique la información importante.
        {' '}
        <a href="#" className="underline hover:text-on-surface">Términos</a>
        {' & '}
        <a href="#" className="underline hover:text-on-surface">Privacidad</a>
      </span>
    </footer>
  );
}
