import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, MapPin, Sparkles } from "lucide-react";
import { NAV_LINKS } from "../data";

const InstagramIcon = (props: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={props.className} aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);
const YoutubeIcon = (props: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={props.className} aria-hidden>
    <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
    <path d="M10 9.5l5 2.5-5 2.5z" fill="currentColor" stroke="none" />
  </svg>
);
const PinterestIcon = (props: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={props.className} aria-hidden>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 20.5c.8-2.4 1.5-4.7 2-7" />
    <path d="M11.5 13.5c-1.8-.4-2.6-1.9-2.4-3.6.3-2 2-3.7 4.3-3.7 2.1 0 3.7 1.4 3.7 3.5 0 2.4-1.5 4.4-3.4 4.4-1 0-1.8-.6-2-1.5" />
  </svg>
);

const FOOTER_COLUMNS = [
  {
    title: "Imperial Collection",
    links: [
      { name: "Oud Impérial", href: "/product/oud-imperial" },
      { name: "Rose Sultane", href: "/product/rose-sultane" },
      { name: "Musk Céleste", href: "/product/musk-celeste" },
      { name: "Ambre Noir", href: "/product/ambre-noir" },
      { name: "The Discovery Ritual", href: "/discovery" },
      { name: "All Extraits", href: "/collection" },
    ],
  },
  {
    title: "Maison & Heritage",
    links: [
      { name: "The Maison Story", href: "/heritage" },
      { name: "Hydro-Distillation Art", href: "/heritage" },
      { name: "The Scent Journal", href: "/journal" },
      { name: "Taif Harvest Chronicles", href: "/journal/taif-rose-dawn-harvest" },
      { name: "Olfactory Science", href: "/journal/science-of-pure-oil-vs-alcohol" },
    ],
  },
  {
    title: "Client Care",
    links: [
      { name: "Book Consultation", href: "/concierge" },
      { name: "Track Your Order", href: "/concierge" },
      { name: "Boutique Salons", href: "/concierge" },
      { name: "30-Day Sillage Guarantee", href: "/concierge" },
      { name: "Frequently Answered Questions", href: "/concierge" },
    ],
  },
];

export default function Footer({
  onOpenQuiz,
}: {
  onOpenQuiz: () => void;
}) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <footer className="relative border-t border-gold/15 bg-ink-2/95 text-cream" aria-label="Footer">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand & Newsletter Column */}
          <div className="lg:col-span-5 space-y-6">
            <Link to="/" className="flex items-center gap-3" aria-label="SPIRIT OF ARABIAN — Home">
              <span className="grid h-10 w-10 place-items-center rounded-2xl border border-gold/40 bg-gold/10 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                <svg viewBox="0 0 32 32" className="h-5 w-5 fill-gold" aria-hidden>
                  <path d="M16 2C16 2 6 14 6 21a10 10 0 0 0 20 0C26 14 16 2 16 2z" />
                </svg>
              </span>
              <span className="leading-none">
                <span className="font-display block text-[1.25rem] sm:text-[1.4rem] font-bold tracking-[0.14em] text-gold-light">
                  SPIRIT OF ARABIAN
                </span>
                <span className="block text-[0.52rem] font-bold uppercase tracking-[0.5em] text-gold">
                  MAISON D'ATTAR
                </span>
              </span>
            </Link>

            <p className="max-w-sm text-xs sm:text-sm leading-relaxed text-sand/80">
              A private third-generation haute maison of pure botanical attars — alcohol-free extraits of wild agarwood, Taif rose, and black amber. Hydro-distilled since 1998.
            </p>

            {/* Newsletter Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!email.includes("@")) return;
                setSent(true);
              }}
              className="space-y-2 pt-2"
            >
              <label
                htmlFor="newsletter-email"
                className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-light block"
              >
                The Private Guild — Harvest drops & rare batch alerts
              </label>

              {sent ? (
                <div className="glass flex items-center gap-2.5 rounded-2xl p-4 text-xs font-semibold text-emerald-400" role="status">
                  <Check className="h-4 w-4" />
                  You are enrolled in The Private Guild. Your first dispatch arrives Friday.
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    id="newsletter-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="field flex-1 rounded-2xl px-4 py-3 text-xs text-cream"
                  />
                  <button
                    type="submit"
                    className="btn-gold grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
                    aria-label="Join private list"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </form>

            <div className="flex items-center gap-3 pt-2">
              {[
                { icon: InstagramIcon, label: "Instagram" },
                { icon: YoutubeIcon, label: "YouTube" },
                { icon: PinterestIcon, label: "Pinterest" },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#top"
                  aria-label={`SPIRIT OF ARABIAN on ${s.label}`}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-gold/20 text-sand hover:border-gold hover:text-gold hover:bg-gold/10 transition-all"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
              <span className="ml-2 flex items-center gap-1.5 text-xs text-sand/60">
                <MapPin className="h-3.5 w-3.5 text-gold" /> Dubai · Rotterdam · London
              </span>
            </div>
          </div>

          {/* Nav Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-8 sm:grid-cols-3">
            {FOOTER_COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h4 className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold-light border-b border-gold/15 pb-2">
                  {col.title}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.name}>
                      <Link
                        to={l.href}
                        className="text-xs text-sand/75 transition-colors hover:text-gold-light"
                      >
                        {l.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Quick Nav Bar */}
        <nav aria-label="Footer quick navigation" className="mt-12 border-t border-gold/15 pt-6">
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  to={l.href}
                  className="text-xs font-bold uppercase tracking-[0.2em] text-sand/60 hover:text-gold-light transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={onOpenQuiz}
                className="flex items-center gap-1 text-xs font-bold uppercase tracking-[0.2em] text-gold hover:text-gold-2 transition-colors"
              >
                <Sparkles className="h-3 w-3" /> Scent Diagnostic
              </button>
            </li>
          </ul>
        </nav>

        {/* Bottom Bar */}
        <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-gold/10 pt-6 text-xs text-sand/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Maison SPIRIT OF ARABIAN Attar. All rights reserved.</p>
          <p className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
            <Link to="/concierge" className="hover:text-gold transition-colors">Client Services</Link>
            <Link to="/heritage" className="hover:text-gold transition-colors">CITES Authenticity</Link>
            <span className="text-sand/30">Visa · Mastercard · Amex · Apple Pay</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
