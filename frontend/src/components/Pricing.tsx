import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Crown, Gift, Infinity as InfinityIcon, Package, RefreshCcw, Sparkles } from "lucide-react";
import { EASE, Reveal, SectionHead } from "./ui";
import { cn } from "../utils/cn";

export type PricingTier = {
  id: string;
  name: string;
  tagline: string;
  price: number;
  compareAt?: number;
  image: string;
  popular?: boolean;
  icon: typeof Package;
  cta: string;
  features: string[];
};

const TIERS: PricingTier[] = [
  {
    id: "discovery-set",
    name: "The Discovery Ritual",
    tagline: "Taste all five moods first",
    price: 59,
    image: "/images/discovery-set.jpg",
    icon: Sparkles,
    cta: "Begin The Ritual",
    features: [
      "Five scents × 2ml crystal vials",
      "Full $59 credited toward your full flacon",
      "Scent atlas & bespoke layering guidebook",
      "Free insured express worldwide shipping",
      "Numbered batch authenticity card",
    ],
  },
  {
    id: "signature-flacon",
    name: "Signature Flacon",
    tagline: "Your one true scent",
    price: 145,
    compareAt: 185,
    popular: true,
    image: "/images/hero-bottle.jpg",
    icon: Crown,
    cta: "Claim Your Flacon",
    features: [
      "One 12ml hand-cut crystal flacon",
      "Your choice of any extrait in the collection",
      "Numbered certificate of authenticity",
      "Gilded gift coffret & silk pouch",
      "30-day Sillage Guarantee",
    ],
  },
  {
    id: "arabian-vault",
    name: "The Arabian Vault",
    tagline: "The complete haute wardrobe",
    price: 420,
    compareAt: 620,
    image: "/images/craft.jpg",
    icon: Gift,
    cta: "Open The Vault",
    features: [
      "All four 12ml flacons, matched harvest batch",
      "Handcrafted walnut & brass keepsake vault",
      "Lifetime 20% off all future refills",
      "Private concierge refill priority",
      "Complimentary personalized engraving on caps",
    ],
  },
];

export default function Pricing({
  onAddTier,
}: {
  onAddTier: (tier: PricingTier, isSubscription: boolean) => void;
}) {
  const [circle, setCircle] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);

  const priceOf = (t: PricingTier) =>
    circle && t.id !== "discovery-set" ? Math.round(t.price * 0.85) : t.price;

  const handleClaim = (t: PricingTier) => {
    onAddTier(
      {
        ...t,
        price: priceOf(t),
      },
      circle
    );
    setAddedId(t.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  return (
    <section
      id="pricing"
      className="relative overflow-hidden py-24 sm:py-32"
      aria-label="Pricing and offers"
    >
      {/* Ambient smoke background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <img
          src="/images/gold-smoke.jpg"
          alt=""
          className="h-full w-full object-cover opacity-[0.12]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/80 to-ink" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-8">
        <SectionHead
          eyebrow="Maison Acquisitions"
          title={
            <>
              Choose How The Story <em className="gold-text font-semibold italic">Begins.</em>
            </>
          }
          copy="Every order ships fully insured within 24 hours in our signature black and gold coffret — protected by our 30-day Sillage Guarantee."
        />

        {/* Purchase Mode Toggle */}
        <Reveal className="mt-10 flex justify-center">
          <div
            className="glass relative flex items-center rounded-full p-1.5"
            role="group"
            aria-label="Purchase type"
          >
            {[
              { id: false, label: "One-Time Acquisition", icon: Package },
              { id: true, label: "Scent Circle · Privilege 15% Off", icon: RefreshCcw },
            ].map((opt) => (
              <button
                key={String(opt.id)}
                type="button"
                onClick={() => setCircle(opt.id)}
                aria-pressed={circle === opt.id}
                className={cn(
                  "relative z-10 flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold tracking-wide transition-colors duration-300 sm:text-xs uppercase",
                  circle === opt.id ? "text-ink" : "text-sand hover:text-cream"
                )}
              >
                {circle === opt.id && (
                  <motion.span
                    layoutId="pricing-toggle-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-gold to-gold-2 shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                    transition={{ duration: 0.35, ease: EASE }}
                  />
                )}
                <opt.icon className="h-3.5 w-3.5" />
                {opt.label}
              </button>
            ))}
          </div>
        </Reveal>

        <AnimatePresence>
          {circle && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-4 text-center text-xs text-gold-light font-semibold"
            >
              ✦ Scent Circle: Complimentary seasonal refill every 90 days. Pause, swap or cancel anytime with one click.
            </motion.p>
          )}
        </AnimatePresence>

        {/* Pricing Cards Grid */}
        <div className="mt-12 grid items-stretch gap-8 lg:mt-16 lg:grid-cols-3">
          {TIERS.map((t, i) => (
            <Reveal key={t.id} delay={i * 0.12} className="h-full">
              <article
                className={cn(
                  "glass-card relative flex h-full flex-col rounded-3xl p-6 sm:p-8 transition-all duration-500",
                  t.popular
                    ? "border-gold/60 shadow-[0_0_35px_rgba(212,175,55,0.25)] ring-1 ring-gold/40 scale-[1.02]"
                    : "hover:border-gold/35"
                )}
                aria-label={`${t.name} plan`}
              >
                {t.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-2 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-ink shadow-lg">
                    <Crown className="h-3 w-3" />
                    Most Reserved
                  </div>
                )}

                <div className="relative mb-6 overflow-hidden rounded-2xl border border-gold/15 bg-ink">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="aspect-[16/9] w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gold">
                    {t.tagline}
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-medium text-cream">
                    {t.name}
                  </h3>
                </div>

                <div className="mt-4 flex items-baseline gap-3">
                  <span className="font-display text-4xl font-bold text-gold-light">
                    ${priceOf(t)}
                  </span>
                  {(t.compareAt || (circle && t.id !== "discovery-set")) && (
                    <span className="text-sm font-semibold text-sand/40 line-through">
                      ${circle && t.id !== "discovery-set" ? t.price : t.compareAt}
                    </span>
                  )}
                  <span className="text-xs text-sand/60">
                    USD · Free shipping
                  </span>
                </div>

                <ul className="mt-6 flex-1 space-y-3 border-t border-gold/15 pt-6">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-xs leading-relaxed text-sand">
                      <Check className="h-4 w-4 shrink-0 text-gold mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => handleClaim(t)}
                  className={cn(
                    "mt-8 flex w-full items-center justify-center gap-2 rounded-full py-4 text-xs font-black uppercase tracking-widest transition-all",
                    addedId === t.id
                      ? "bg-emerald-400 text-ink"
                      : t.popular
                      ? "btn-gold"
                      : "btn-ghost hover:bg-gold hover:text-ink"
                  )}
                >
                  {addedId === t.id ? (
                    <>
                      <Check className="h-4 w-4" strokeWidth={3} />
                      Reserved in Bag
                    </>
                  ) : (
                    t.cta
                  )}
                </button>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Guarantee Banner */}
        <Reveal delay={0.2}>
          <div className="mx-auto mt-12 flex max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-center text-xs text-sand/70 border-t border-gold/15 pt-8">
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-gold" /> 30-Day Sillage Guarantee
            </span>
            <span className="flex items-center gap-2">
              <InfinityIcon className="h-4 w-4 text-gold" /> Numbered Batch Certificate
            </span>
            <span className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gold" /> Complimentary Express Delivery
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
