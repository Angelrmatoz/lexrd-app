export function Footer() {
  return (
    <footer className="bg-transparent text-on-surface-variant text-[10px] font-medium uppercase tracking-widest fixed bottom-0 w-full flex flex-col items-center justify-center gap-2 pb-4 opacity-60 z-10 pointer-events-none">
      <div className="flex gap-6 pointer-events-auto">
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
      <span>© 2024 LexRD. Sovereign Intelligence.</span>
    </footer>
  );
}
