import { Link, useLocation } from "react-router";

export function TopAppBar() {
  const location = useLocation();

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-black border-b border-zinc-800 flex items-center px-6">
      {/* Logo */}
      <Link
        to="/"
        className="font-headline text-white font-bold tracking-[0.2em] uppercase text-sm select-none"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        Pelagic Studio
      </Link>

      {/* Center nav — desktop only */}
      <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
        {[
          { label: "Analyzer", to: "/" },
          { label: "Archive", to: "/archive" },
        ].map(({ label, to }) => (
          <Link
            key={to}
            to={to}
            className={[
              "px-4 py-2 text-[10px] tracking-widest uppercase transition-colors duration-150",
              isActive(to) ? "text-white" : "text-zinc-500 hover:text-white",
            ].join(" ")}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Right icons */}
      <div className="ml-auto flex items-center gap-1">
        <button
          className="w-11 h-11 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors duration-150"
          aria-label="Settings"
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
        </button>
        <button
          className="w-11 h-11 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors duration-150"
          aria-label="Help"
        >
          <span className="material-symbols-outlined text-[20px]">help</span>
        </button>
      </div>
    </header>
  );
}
