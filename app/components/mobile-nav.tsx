import { Link, useLocation } from "react-router";

interface NavItem {
  label: string;
  to: string | null;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Analyzer", to: "/", icon: "biotech" },
  { label: "Depth Log", to: "/analysis", icon: "layers" },
  { label: "Species", to: null, icon: "visibility" },
  { label: "Archive", to: "/archive", icon: "database" },
];

export function MobileNav() {
  const location = useLocation();

  const isActive = (to: string | null) => {
    if (!to) return false;
    return to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-black border-t border-zinc-900 flex items-stretch">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.to);
        const content = (
          <span
            className={[
              "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors duration-150",
              active ? "text-white border-t-2 border-white -mt-px" : "text-zinc-600",
            ].join(" ")}
          >
            <span
              className="material-symbols-outlined text-[22px] leading-none"
              style={{
                fontVariationSettings: active
                  ? "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24"
                  : "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24",
              }}
            >
              {item.icon}
            </span>
            <span
              className="text-[9px] uppercase tracking-tighter leading-none"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {item.label}
            </span>
          </span>
        );

        if (!item.to) {
          return (
            <button key={item.label} className="flex-1 h-full" aria-label={item.label}>
              {content}
            </button>
          );
        }

        return (
          <Link key={item.label} to={item.to} className="flex-1 h-full flex">
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
