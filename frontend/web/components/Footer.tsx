export function Footer() {
  return (
    <footer className="bg-transparent text-on-surface-variant text-[10px] font-medium uppercase tracking-widest flex flex-col items-center justify-center gap-2 py-12 opacity-60">
      <div className="flex gap-6 mb-1">
        <a className="hover:text-on-surface transition-colors" href="#">
          Terms
        </a>
        <a className="hover:text-on-surface transition-colors" href="#">
          Privacy
        </a>
        <a className="hover:text-on-surface transition-colors" href="#">
          Legal Disclaimer
        </a>
      </div>
      <span>© {new Date().getFullYear()} LexRD. IA Jurídica Dominicana.</span>
      <p className="text-[9px] text-center mt-1 text-on-surface-variant/40 uppercase tracking-[0.2em] font-medium">
        LexRD puede cometer errores. Verifique siempre con un profesional
        legal.
      </p>
    </footer>
  );
}
