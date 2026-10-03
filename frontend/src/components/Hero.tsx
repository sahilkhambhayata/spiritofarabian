import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, ShieldCheck, ShoppingBag, Sparkles, Timer } from "lucide-react";
import { PRODUCTS, type Product, type ProductSize } from "../data";
import { EASE } from "./ui";
import { cn } from "../utils/cn";

export default function Hero({
  onShop: _onShop,
  onOpenQuiz: _onOpenQuiz,
  onAddProduct,
}: {
  onShop?: () => void;
  onOpenQuiz?: () => void;
  onAddProduct?: (product: Product, size?: ProductSize) => void;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const p = PRODUCTS[activeIdx];

  // Auto-cycle through scents if untouched
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % PRODUCTS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const handleAdd = () => {
    if (onAddProduct) {
      onAddProduct(p, p.sizes[1] || p.sizes[0]);
    }
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  return (
    <section
      id="signature-story"
      className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden bg-ink pt-20 pb-20 sm:pt-24 sm:pb-24 border-t border-gold/15"
      aria-label="SPIRIT OF ARABIAN Introduction"
    >
      {/* Ambient Dynamic Background Hue */}
      <div
        className="pointer-events-none absolute inset-0 transition-colors duration-1000"
        style={{
          background: `radial-gradient(1200px 700px at 70% 40%, ${p.hue}22, transparent 75%), radial-gradient(900px 500px at 15% 20%, rgba(21,107,83,0.3), transparent 70%)`,
        }}
        aria-hidden
      />

      {/* Ambient Smoke Texture */}
      <div className="pointer-events-none absolute inset-0 opacity-15" aria-hidden>
        <img
          src="/images/gold-smoke.jpg"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-transparent to-ink" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 w-full">
        {/* Top Interactive Scent Ticker */}
        <div className="mb-8 flex flex-wrap items-center gap-2 sm:gap-3 border-b border-gold/15 pb-4">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/60 mr-2">
            Signature Lineup:
          </span>
          {PRODUCTS.map((scent, i) => (
            <button
              key={scent.id}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={cn(
                "group flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all uppercase tracking-wider",
                i === activeIdx
                  ? "border border-gold bg-gold/20 text-gold-light shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                  : "border border-gold/15 bg-panel/30 text-sand/70 hover:border-gold/30 hover:text-cream"
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", i === activeIdx ? "bg-gold" : "bg-cream/20")} />
              <span>0{i + 1} {scent.name}</span>
            </button>
          ))}
        </div>

        {/* 2-Column Hero Grid */}
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Left Column: Brand Story & Interactive Scent Details */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center gap-3">
                <p className="eyebrow flex items-center gap-2">
                  <span className="h-px w-6 bg-gold" />
                  Maison d'Attar · Est. 1998
                </p>
                <span className="rounded-full bg-gold/15 border border-gold/30 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-gold-light">
                  {p.badge || "Pure Extrait"}
                </span>
              </div>

              <h2 className="font-display mt-3 text-4xl sm:text-5xl lg:text-[4.2rem] font-medium leading-[1.02] text-cream">
                Liquid Gold, <br />
                <em className="gold-text italic font-semibold">Worn on Skin.</em>
              </h2>

              <AnimatePresence mode="wait">
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="mt-4 space-y-3"
                >
                  <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-gold-light">
                    <span>{p.name}</span>
                    <span>•</span>
                    <span className="text-sand/70">{p.family}</span>
                  </div>

                  <p className="text-sm sm:text-base leading-relaxed text-sand/90 max-w-lg">
                    {p.description}
                  </p>

                  {/* Notes Pills */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {p.notes.heart.map((n) => (
                      <span
                        key={n.name}
                        className="rounded-xl border border-gold/20 bg-panel/50 px-3 py-1 text-xs font-semibold text-cream/90"
                      >
                        ✦ {n.name}
                      </span>
                    ))}
                    <span className="rounded-xl border border-gold/15 bg-gold/[0.05] px-3 py-1 text-xs font-bold text-gold-light">
                      {p.longevityHours} Wear
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to={`/product/${p.id}`}
                className="btn-gold group inline-flex items-center gap-2.5 rounded-full px-8 py-4 text-xs font-black uppercase tracking-widest shadow-[0_0_25px_rgba(212,175,55,0.35)]"
              >
                Explore {p.name} — ${p.price}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <button
                type="button"
                onClick={handleAdd}
                className={cn(
                  "btn-ghost inline-flex items-center gap-2 rounded-full px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all",
                  isAdded && "bg-emerald-400 text-ink border-emerald-400"
                )}
              >
                {isAdded ? (
                  <>
                    <Check className="h-4 w-4" strokeWidth={3} />
                    Added to Bag
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4 text-gold" />
                    Quick Add to Bag
                  </>
                )}
              </button>
            </div>

            {/* Stats Metrics */}
            <dl className="mt-8 grid max-w-lg grid-cols-3 gap-4 border-t border-gold/15 pt-6">
              {[
                { icon: Timer, val: "14+ Hours", label: "Wear, 1 Single Drop" },
                { icon: ShieldCheck, val: "100%", label: "Pure Oil · 0% Alcohol" },
                { icon: Sparkles, val: "4.9 / 5", label: "From 12,400+ Patrons" },
              ].map((s, i) => (
                <div key={i}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd>
                    <span className="font-display block text-xl sm:text-2xl font-bold text-gold-light">
                      {s.val}
                    </span>
                    <span className="mt-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-sand/60">
                      <s.icon className="h-3 w-3 text-gold shrink-0" />
                      {s.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Right Column: Haute Studio Showcase Card with Golden Frame */}
          <div className="lg:col-span-6">
            <div className="relative">
              {/* Pulsing Aura */}
              <div
                className="absolute -inset-4 rounded-3xl opacity-40 blur-2xl transition-colors duration-1000"
                style={{ background: p.hue }}
                aria-hidden
              />

              {/* Main Luxury Frame */}
              <div className="glass-card relative rounded-3xl border border-gold/35 p-6 sm:p-8 shadow-2xl overflow-hidden">
                {/* Visual Image with Smooth Transitions */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="relative aspect-[4/4.5] w-full overflow-hidden rounded-2xl border border-gold/20 bg-ink"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-ink/20" />

                    {/* Floating Note Pill 1 (Top Left) */}
                    <div className="glass absolute top-4 left-4 rounded-2xl p-3 border border-gold/30 shadow-xl max-w-[180px]">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gold block">
                        Top Note Accord
                      </span>
                      <strong className="font-display text-sm text-cream block mt-0.5">
                        {p.notes.top[0]?.name || "Crimson Saffron"}
                      </strong>
                    </div>

                    {/* Floating Note Pill 2 (Bottom Right) */}
                    <div className="glass absolute bottom-4 right-4 rounded-2xl p-3 border border-gold/30 shadow-xl max-w-[190px] text-right">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gold block">
                        Base Dry-Down
                      </span>
                      <strong className="font-display text-sm text-cream block mt-0.5">
                        {p.notes.base[0]?.name || "Aged Smoked Amber"}
                      </strong>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Bottom Card Controls */}
                <div className="mt-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-2xl font-semibold text-cream">
                      {p.name}
                    </h3>
                    <p className="text-xs text-sand/70">
                      12ml Imperial Extrait Flacon
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {PRODUCTS.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveIdx(i)}
                        className={cn(
                          "h-2 rounded-full transition-all duration-300",
                          i === activeIdx ? "w-7 bg-gold shadow-[0_0_8px_rgba(212,175,55,0.6)]" : "w-2 bg-cream/20 hover:bg-cream/40"
                        )}
                        aria-label={`View extrait ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
