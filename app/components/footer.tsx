import { useEffect, useState } from 'react';
import { Link } from 'react-router';

function UtcClock() {
  const [time, setTime] = useState(() => {
    const now = new Date();
    return now.toUTCString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1') + ' UTC';
  });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const hh = now.getUTCHours().toString().padStart(2, '0');
      const mm = now.getUTCMinutes().toString().padStart(2, '0');
      const ss = now.getUTCSeconds().toString().padStart(2, '0');
      setTime(`${hh}:${mm}:${ss} UTC`);
    };
    const id = setInterval(tick, 1000);
    tick();
    return () => clearInterval(id);
  }, []);

  return <span>{time}</span>;
}

export function Footer() {
  return (
    <footer className="border-t border-zinc-900 bg-black px-6 py-8">
      <div className="mx-auto max-w-5xl space-y-4">
        {/* Row 1 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              to="/archive"
              className="text-[10px] tracking-widest text-zinc-600 uppercase transition-colors duration-150 hover:text-zinc-400"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Documentation
            </Link>
            <Link
              to="/archive"
              className="text-[10px] tracking-widest text-zinc-600 uppercase transition-colors duration-150 hover:text-zinc-400"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              System Status
            </Link>
          </div>
          <span
            className="text-[10px] tracking-widest text-zinc-600 uppercase tabular-nums"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <UtcClock />
          </span>
        </div>

        {/* Row 2 — citation */}
        <p
          className="text-[9px] leading-relaxed text-zinc-700 uppercase"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Loew, E.R., McFarland, W.N. &amp; Margulies, D. (2002). Developmental
          Changes in the Visual Pigments of the Yellowfin Tuna, Thunnus
          albacares. Marine and Freshwater Behaviour and Physiology, 35(4),
          235–246. Vision model uses Govardovskii et al. (2000) nomogram. Water
          attenuation follows Jerlov (1976) Type I coefficients.
        </p>
      </div>
    </footer>
  );
}
