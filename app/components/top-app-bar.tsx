import { Link, useLocation } from 'react-router';

export function TopAppBar() {
  const location = useLocation();

  const isActive = (path: string) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

  return (
    <header className="fixed top-0 right-0 left-0 z-50 flex h-16 items-center border-b border-zinc-800 bg-black px-6">
      {/* Logo */}
      <Link
        to="/"
        className="font-headline text-sm font-bold tracking-[0.2em] text-white uppercase select-none"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        Pelagic Studio
      </Link>

      {/* Center nav — desktop only */}
      <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
        {[
          { label: 'Analyzer', to: '/' },
          { label: 'Archive', to: '/archive' },
        ].map(({ label, to }) => (
          <Link
            key={to}
            to={to}
            className={[
              'px-4 py-2 text-[10px] tracking-widest uppercase transition-colors duration-150',
              isActive(to) ? 'text-white' : 'text-zinc-500 hover:text-white',
            ].join(' ')}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Right icons */}
      <div className="ml-auto flex items-center gap-1">
        <button
          className="flex h-11 w-11 items-center justify-center rounded-lg text-zinc-400 transition-colors duration-150 hover:bg-zinc-800 hover:text-white"
          aria-label="Settings"
        >
          <span className="material-symbols-outlined text-[20px]">
            settings
          </span>
        </button>
        <button
          className="flex h-11 w-11 items-center justify-center rounded-lg text-zinc-400 transition-colors duration-150 hover:bg-zinc-800 hover:text-white"
          aria-label="Help"
        >
          <span className="material-symbols-outlined text-[20px]">help</span>
        </button>
      </div>
    </header>
  );
}
