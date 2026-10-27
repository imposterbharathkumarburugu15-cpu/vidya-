import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { BrandLogo } from "./BrandMark";
import { BTN_PRIMARY } from "./landing/styles";

const LINKS = [
  ["#/", "Home", "/"],
  ["#/how-it-works", "How it works", "how"],
  ["#/?s=data", "Live data", "data"],
  ["#/?s=roles", "Who it's for", "roles"],
  ["#/activate", "Activate account", "/activate"],
] as const;

/**
 * Public header (sticky, glass): Vidyadwaar lockup, section links, mobile navigation,
 * and a gold Sign in button.
 */
export default function Navbar({ current = "/" }: { demo?: boolean; current?: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#07090E]/85 backdrop-blur-2xl transition-all">
      <div className="mx-auto flex h-[72px] w-full max-w-[1440px] items-center justify-between gap-8 px-6 sm:px-10">
        {/* Approved Brand Logo */}
        <a href="#/" aria-label="Vidyadwaar home" className="shrink-0 transition-transform hover:scale-[1.01]">
          <BrandLogo size="md" />
        </a>

        {/* Desktop Navigation — Centered & evenly spaced */}
        <nav aria-label="Main" className="hidden items-center justify-center gap-2 font-inter lg:flex flex-1 max-w-2xl mx-auto">
          {LINKS.map(([href, text, key]) => {
            const on = current === key;
            return (
              <a
                key={href}
                href={href}
                aria-current={on ? "page" : undefined}
                className={`relative px-4 py-2 text-[14.5px] font-medium tracking-wide transition-all ${
                  on
                    ? "text-[#F5C067] font-semibold"
                    : "text-slate-300 hover:text-white hover:bg-white/[0.04] rounded-lg"
                }`}
              >
                {text}
                {on && (
                  <span
                    aria-hidden
                    className="absolute inset-x-3.5 -bottom-[14px] h-[2.5px] rounded-full bg-gradient-to-r from-[#F5C067] to-[#D4AF37] shadow-[0_0_12px_rgba(245,192,103,0.8)]"
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Action Controls & Mobile Toggle */}
        <div className="flex shrink-0 items-center gap-3 font-inter">
          <a
            href="#/signin"
            className={`${BTN_PRIMARY} group !px-5 !py-2.5 !text-[14px] !font-bold shadow-[0_0_24px_rgba(245,192,103,0.3)] hover:shadow-[0_0_32px_rgba(245,192,103,0.45)]`}
          >
            <span>Sign in</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </a>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 lg:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="border-b border-white/10 bg-[#07090E]/98 px-6 py-5 backdrop-blur-2xl lg:hidden animate-fade-in space-y-2">
          {LINKS.map(([href, text, key]) => {
            const on = current === key;
            return (
              <a
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  on
                    ? "bg-amber-400/10 text-amber-300 font-bold border border-amber-400/30"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {text}
              </a>
            );
          })}
        </div>
      )}
    </header>
  );
}
