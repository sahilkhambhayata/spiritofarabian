import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, ShoppingBag, Sparkles, X } from "lucide-react";
import { NAV_LINKS } from "../data";
import { EASE } from "./ui";
import { cn } from "../utils/cn";

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className="group flex items-center gap-3"
      aria-label="SPIRIT OF ARABIAN — Home"
    >
      <span className="grid h-10 w-10 place-items-center rounded-2xl border border-gold/40 bg-gold/10 transition-all duration-700 group-hover:rotate-[180deg] group-hover:border-gold group-hover:bg-gold/20 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
        <svg viewBox="0 0 32 32" className="h-5 w-5 fill-gold" aria-hidden>
          <path d="M16 2C16 2 6 14 6 21a10 10 0 0 0 20 0C26 14 16 2 16 2z" />
        </svg>
      </span>
      <span className="leading-none">
        <span className="font-display block text-[1.2rem] sm:text-[1.35rem] font-bold tracking-[0.14em] text-gold-light">
          SPIRIT OF ARABIAN
        </span>
        <span className="block text-[0.52rem] font-bold uppercase tracking-[0.5em] text-gold">
          MAISON D'ATTAR
        </span>
      </span>
    </Link>
  );
}

export default function Navbar({
  cartCount,
  onOpenCart,
  onOpenQuiz,
}: {
  cartCount: number;
  onOpenCart: () => void;
  onOpenQuiz: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (cartCount === 0) return;
    setBump(true);
    const t = setTimeout(() => setBump(false), 500);
    return () => clearTimeout(t);
  }, [cartCount]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-gold/15 bg-ink/95 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
            : "border-b border-gold/10 bg-ink/80 backdrop-blur-md"
        )}
      >
        {/* Luxury Announcement Bar */}
        <div className="bg-gradient-to-r from-panel via-ink to-panel border-b border-gold/10 py-1.5 px-4 text-center">
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-gold-light">
            Complimentary Insured Worldwide Express Shipping On Orders $95+
          </p>
        </div>

        <nav
          className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-8"
          aria-label="Primary Navigation"
        >
          <Logo />

          {/* Desktop Multi-Page Nav Links */}
          <ul className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((l) => {
              const isActive = location.pathname === l.href;
              return (
                <li key={l.href}>
                  <Link
                    to={l.href}
                    className={cn(
                      "group relative text-[11px] font-bold tracking-[0.22em] uppercase transition-all duration-300",
                      isActive
                        ? "text-gold-light"
                        : "text-sand/80 hover:text-gold-light"
                    )}
                  >
                    {l.label}
                    {isActive ? (
                      <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-gold to-gold-2 shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                    ) : (
                      <span className="absolute -bottom-2 left-1/2 h-0.5 w-0 -translate-x-1/2 bg-gold transition-all duration-300 group-hover:w-full" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Right Action Icons & Buttons */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Scent Diagnostic CTA */}
            <button
              type="button"
              onClick={onOpenQuiz}
              className="btn-ghost hidden items-center gap-1.5 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-wider md:inline-flex"
            >
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              Scent Diagnostic
            </button>

            {/* Shopping Bag Button */}
            <button
              type="button"
              onClick={onOpenCart}
              className="relative grid h-10 w-10 place-items-center rounded-xl border border-gold/30 bg-panel/40 text-gold-light transition-all duration-300 hover:border-gold hover:bg-panel hover:scale-105"
              aria-label={`Shopping bag, ${cartCount} item${cartCount === 1 ? "" : "s"}`}
            >
              <ShoppingBag className="h-[18px] w-[18px] text-gold" strokeWidth={2} />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: bump ? [1, 1.3, 1] : 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-gradient-to-br from-gold to-gold-2 px-1 text-[10px] font-black text-ink shadow-[0_0_12px_rgba(212,175,55,0.6)]"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <Link
              to="/collection"
              className="btn-gold hidden rounded-full px-6 py-2.5 text-[11px] font-black tracking-[0.18em] uppercase sm:inline-flex"
            >
              Shop
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-gold/25 bg-panel/40 text-cream lg:hidden hover:border-gold transition-colors"
              aria-label="Open navigation menu"
              aria-expanded={open}
            >
              <Menu className="h-5 w-5 text-gold" strokeWidth={2} />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Mega Drawer Navigation */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-nav"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[70] flex flex-col bg-ink-2/95 backdrop-blur-2xl lg:hidden text-cream"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="flex h-[72px] items-center justify-between px-5 border-b border-gold/15">
              <Logo onClick={() => setOpen(false)} />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full border border-gold/25 text-cream hover:border-gold transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col justify-center px-8 py-6" aria-label="Mobile Navigation">
              <ul className="space-y-2">
                {NAV_LINKS.map((l, i) => (
                  <motion.li
                    key={l.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.04, duration: 0.4 }}
                  >
                    <Link
                      to={l.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "font-display group flex items-baseline gap-4 border-b border-gold/10 py-3.5 text-3xl transition-colors",
                        location.pathname === l.href ? "text-gold-light font-bold" : "text-cream hover:text-gold-light"
                      )}
                    >
                      <span className="text-xs font-bold tracking-[0.3em] text-gold/60">
                        0{i + 1}
                      </span>
                      {l.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-8 space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onOpenQuiz();
                  }}
                  className="btn-ghost flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-xs font-bold uppercase tracking-wider"
                >
                  <Sparkles className="h-4 w-4 text-gold" />
                  Take Scent Diagnostic
                </button>

                <Link
                  to="/collection"
                  onClick={() => setOpen(false)}
                  className="btn-gold flex w-full items-center justify-center rounded-full py-4 text-xs font-black tracking-widest uppercase"
                >
                  Explore The Collection
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
