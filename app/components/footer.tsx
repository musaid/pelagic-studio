import { Link } from "react-router";

export function Footer() {
  return (
    <footer className="border-t border-blue-900/30 py-8 px-4 mt-24">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600">
        <p>
          Built by{" "}
          <span className="text-slate-400 font-medium">Pelagic Studio</span>
        </p>
        <div className="flex items-center gap-6">
          <Link
            to="/about"
            className="hover:text-slate-400 transition-colors duration-150"
          >
            About & Methodology
          </Link>
        </div>
      </div>
    </footer>
  );
}
