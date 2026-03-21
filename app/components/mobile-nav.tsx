import { Link, useLocation } from 'react-router';

interface NavItem {
  label: string;
  to: string | null;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Analyzer', to: '/', icon: 'biotech' },
  { label: 'Depth Log', to: '/analysis', icon: 'layers' },
  { label: 'Species', to: null, icon: 'visibility' },
  { label: 'Archive', to: '/archive', icon: 'database' },
];

export function MobileNav() {
  const location = useLocation();

  const isActive = (to: string | null) => {
    if (!to) return false;
    return to === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(to);
  };

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 flex h-16 items-stretch border-t border-zinc-900 bg-black md:hidden">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.to);
        const content = (
          <span
            className={[
              'flex h-full flex-1 flex-col items-center justify-center gap-1 transition-colors duration-150',
              active
                ? '-mt-px border-t-2 border-white text-white'
                : 'text-zinc-600',
            ].join(' ')}
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
              className="text-[9px] leading-none tracking-tighter uppercase"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {item.label}
            </span>
          </span>
        );

        if (!item.to) {
          return (
            <button
              key={item.label}
              className="h-full flex-1"
              aria-label={item.label}
            >
              {content}
            </button>
          );
        }

        return (
          <Link key={item.label} to={item.to} className="flex h-full flex-1">
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
