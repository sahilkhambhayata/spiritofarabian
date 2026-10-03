import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import RealResultsVideos from "./RealResultsVideos";
import type { Product, ProductSize } from "../data";
import api from "../services/api";

function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function YouTubeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" />
    </svg>
  );
}

function TwitterIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const FOOTER_NAV = [
  {
    title: "Quick Links",
    links: [
      { name: "Shipping Policy", href: "/shipping-policy" },
      { name: "Return & Exchange Policy", href: "/return-policy" },
      { name: "Privacy Policy", href: "/privacy-policy" },
      { name: "Terms & Condition", href: "/terms-of-service" },
      { name: "Refund Policy", href: "/refund-policy" },
    ],
  },
  {
    title: "Company & Support",
    links: [
      { name: "Contact Us", href: "/contact" },
      { name: "About Us", href: "/about" },
      { name: "Track Order", href: "/track-order" },
      { name: "Faqs", href: "/faqs" },
      { name: "Blogs", href: "/blogs" },
    ],
  },
  {
    title: "The Collection",
    links: [
      { name: "All Extraits (24)", href: "/collection" },
      { name: "The Discovery Coffret", href: "/discovery" },
      { name: "Top Selling Reserve", href: "/collection" },
      { name: "Your Shopping Bag", href: "/cart" },
    ],
  },
];

export default function Footer({
  onAddProduct,
}: {
  onOpenQuiz?: () => void;
  onAddProduct?: (product: Product, size?: ProductSize) => void;
}) {
  const [socials, setSocials] = useState<{
    instagram?: { url: string; enabled: boolean };
    facebook?: { url: string; enabled: boolean };
    youtube?: { url: string; enabled: boolean };
    twitter?: { url: string; enabled: boolean };
  }>({
    instagram: { url: "https://www.instagram.com/spiritofarabian/", enabled: true },
    facebook: { url: "https://facebook.com/spiritofarabian", enabled: true },
    youtube: { url: "https://youtube.com/@spiritofarabian", enabled: true },
    twitter: { url: "https://x.com/spiritofarabian", enabled: true },
  });

  useEffect(() => {
    let isMounted = true;
    api
      .get("/settings")
      .then((res: any) => {
        if (isMounted && res?.socialMedia) {
          setSocials(res.socialMedia);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch dynamic social links:", err?.message);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <footer className="relative bg-ink-3 text-cream overflow-hidden" aria-label="Footer">
      {/* REAL RESULTS — Shop From Videos Section */}
      <RealResultsVideos onAddProduct={onAddProduct} />

      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[350px] w-[900px] rounded-full opacity-20 blur-[120px]"
        style={{ background: "radial-gradient(circle, rgba(212,175,55,0.4) 0%, rgba(10,61,46,0.2) 70%, transparent 100%)" }}
        aria-hidden
      />

      {/* Main Footer Links & Brand Section */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-8 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Brand Col */}
          <div className="lg:col-span-5 space-y-6">
            <Link to="/" className="group flex items-center gap-3.5" aria-label="SPIRIT OF ARABIAN — Home">
              <div className="relative h-12 w-12 shrink-0 transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_0_15px_rgba(212,175,55,0.45)]">
                <img
                  src="/images/brand-emblem-gold.png"
                  alt="SPIRIT OF ARABIAN Logo Emblem"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="brand-gold-title text-xl font-bold tracking-[0.2em] uppercase whitespace-nowrap group-hover:brightness-125 transition-all">
                  SPIRIT OF ARABIAN
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="h-[1px] w-2.5 bg-gradient-to-r from-gold/60 to-transparent" />
                  <span className="font-brand-sub text-[8.5px] font-bold uppercase tracking-[0.48em] text-gold/85 whitespace-nowrap">
                    MAISON D'ATTAR
                  </span>
                  <span className="h-[1px] w-2.5 bg-gradient-to-l from-gold/60 to-transparent" />
                </div>
              </div>
            </Link>

            <p className="text-xs sm:text-[13px] leading-relaxed text-sand/75 max-w-sm">
              An independent third-generation haute perfumery house dedicated to preserving ancient copper alembic hydro-distillation. 100% pure botanical lipid concentrates without alcohol or synthetic solvents.
            </p>

            <div className="space-y-3 pt-1 text-xs text-sand/70">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-gold shrink-0" />
                <span>Dubai Atelier · Rotterdam Salon · London Concierge</span>
              </div>

              {/* Dynamic Social Media Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                {socials.instagram?.enabled && socials.instagram?.url && (
                  <a
                    href={socials.instagram.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1.5 text-xs font-semibold text-gold-light hover:border-gold hover:bg-gold hover:text-ink transition-all duration-300 shadow-xs group"
                    aria-label="Follow on Instagram"
                  >
                    <InstagramIcon className="h-3.5 w-3.5 text-gold group-hover:text-ink transition-colors" />
                    <span>Instagram</span>
                  </a>
                )}

                {socials.facebook?.enabled && socials.facebook?.url && (
                  <a
                    href={socials.facebook.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1.5 text-xs font-semibold text-gold-light hover:border-gold hover:bg-gold hover:text-ink transition-all duration-300 shadow-xs group"
                    aria-label="Follow on Facebook"
                  >
                    <FacebookIcon className="h-3.5 w-3.5 text-gold group-hover:text-ink transition-colors" />
                    <span>Facebook</span>
                  </a>
                )}

                {socials.youtube?.enabled && socials.youtube?.url && (
                  <a
                    href={socials.youtube.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1.5 text-xs font-semibold text-gold-light hover:border-gold hover:bg-gold hover:text-ink transition-all duration-300 shadow-xs group"
                    aria-label="Subscribe on YouTube"
                  >
                    <YouTubeIcon className="h-3.5 w-3.5 text-gold group-hover:text-ink transition-colors" />
                    <span>YouTube</span>
                  </a>
                )}

                {socials.twitter?.enabled && socials.twitter?.url && (
                  <a
                    href={socials.twitter.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1.5 text-xs font-semibold text-gold-light hover:border-gold hover:bg-gold hover:text-ink transition-all duration-300 shadow-xs group"
                    aria-label="Follow on X/Twitter"
                  >
                    <TwitterIcon className="h-3.5 w-3.5 text-gold group-hover:text-ink transition-colors" />
                    <span>X</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Nav Columns */}
          <div className="lg:col-span-7 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
            {FOOTER_NAV.map((col) => (
              <div key={col.title} className="space-y-4">
                <h4 className="font-display text-sm font-semibold tracking-wider text-gold-light uppercase border-b border-gold/15 pb-2.5">
                  {col.title}
                </h4>
                <ul className="space-y-2.5 text-xs">
                  {col.links.map((l) => (
                    <li key={l.name}>
                      <Link
                        to={l.href}
                        className="text-sand/70 hover:text-gold-light hover:translate-x-1 inline-block transition-all duration-200"
                      >
                        {l.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Legal & Payment Row */}
        <div className="mt-12 pt-6 border-t border-gold/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-sand/50">
          <p>© {new Date().getFullYear()} SPIRIT OF ARABIAN Maison d'Attar. All rights reserved.</p>
          
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sand/60">
            <Link to="/privacy-policy" className="hover:text-gold-light transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-gold-light transition-colors">Terms of Service</Link>
            <Link to="/heritage" className="hover:text-gold-light transition-colors">CITES Registry</Link>
            
            {/* Dynamic footer copyright social links */}
            {socials.instagram?.enabled && socials.instagram?.url && (
              <a
                href={socials.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold-light transition-colors flex items-center gap-1.5 text-gold/80"
              >
                <InstagramIcon className="h-3 w-3" /> Instagram
              </a>
            )}
            {socials.facebook?.enabled && socials.facebook?.url && (
              <a
                href={socials.facebook.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold-light transition-colors flex items-center gap-1.5 text-gold/80"
              >
                <FacebookIcon className="h-3 w-3" /> Facebook
              </a>
            )}
            {socials.youtube?.enabled && socials.youtube?.url && (
              <a
                href={socials.youtube.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold-light transition-colors flex items-center gap-1.5 text-gold/80"
              >
                <YouTubeIcon className="h-3 w-3" /> YouTube
              </a>
            )}
            {socials.twitter?.enabled && socials.twitter?.url && (
              <a
                href={socials.twitter.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold-light transition-colors flex items-center gap-1.5 text-gold/80"
              >
                <TwitterIcon className="h-3 w-3" /> X
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

