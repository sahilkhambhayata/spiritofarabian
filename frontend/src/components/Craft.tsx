import { Droplets, FlaskConical, Gem, Leaf } from "lucide-react";
import { Reveal, SectionHead, CountUp } from "./ui";

const PILLARS = [
  {
    icon: FlaskConical,
    num: "01",
    title: "Hydro-Distilled the Ancestral Way",
    copy: "Traditional copper deg-bapka alembics, wood-fired low heat, weeks of maceration. Our third-generation atelier extracts essential oils the way it was done before chemical solvents existed.",
  },
  {
    icon: Gem,
    num: "02",
    title: "Raw Materials Money Barely Buys",
    copy: "CITES-certified Cambodian wild agarwood aged 8 years, 5am dawn-picked Taif mountain roses, and cold-pressed Mysore sandalwood. We harvest pure vintage crops.",
  },
  {
    icon: Droplets,
    num: "03",
    title: "Zero Alcohol. 100% Pure Extrait.",
    copy: "Nothing to evaporate aggressively, nothing to dry your skin. Pure concentrated fragrance oils that meld with personal chemistry to release waves from dawn to midnight.",
  },
  {
    icon: Leaf,
    num: "04",
    title: "Kind to Skin by Design",
    copy: "IFRA-compliant, dermatologically reviewed, naturally hypoallergenic for sensitive skin prone to spray irritation. No synthetics left raw upon skin.",
  },
];

export default function Craft() {
  return (
    <section id="craft" className="relative overflow-hidden py-24 sm:py-32" aria-label="The craft behind SPIRIT OF ARABIAN attars">
      {/* Ambient Radial */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-full opacity-40"
        style={{
          background:
            "radial-gradient(700px 420px at 85% 20%, rgba(212,175,55,0.08), transparent 70%)",
        }}
        aria-hidden
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <SectionHead
          eyebrow="Artisanal Heritage · Est. 1998"
          title={
            <>
              High Perfumery, <em className="gold-text font-semibold italic">Before Dilution.</em>
            </>
          }
          copy="Attar is the 1,000-year-old high art modern commercial fragrance forgot. Pure botanical oil, zero alcohol, zero filler — the most intimate and long-lasting form of scent ever conceived."
        />

        <div className="mt-14 grid items-center gap-10 lg:mt-20 lg:grid-cols-12 lg:gap-14">
          {/* Visual Image */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <Reveal className="relative">
              <div className="glass-card relative overflow-hidden rounded-3xl border border-gold/25 ring-glow">
                <img
                  src="/images/craft.jpg"
                  alt="Artisan distilling pure attar oil in a copper alembic still surrounded by oud wood and rose petals"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-1000 hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-2/90 via-transparent to-ink-2/30" aria-hidden />

                <div className="glass absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl p-4 sm:p-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
                      Master Atelier No. 3
                    </p>
                    <p className="font-display mt-0.5 text-lg leading-tight text-cream">
                      Kannauj, Taif & Dubai
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-2xl sm:text-3xl font-bold text-gold-light">
                      <CountUp to={28} suffix="+" />
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-sand/60">
                      Years of Mastery
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Batch Yield Card */}
              <div className="glass absolute -right-3 -top-5 hidden animate-float-slow rounded-2xl p-4 sm:block border border-gold/30 shadow-2xl">
                <p className="text-[9px] font-bold uppercase tracking-widest text-sand/70">
                  Taif Rose Extraction
                </p>
                <p className="font-display mt-0.5 text-lg text-gold-light">
                  500 kg Petals → <strong className="text-cream">1 Litre Oil</strong>
                </p>
              </div>
            </Reveal>
          </div>

          {/* Pillars List */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <ul className="space-y-3">
              {PILLARS.map((p, i) => (
                <Reveal key={p.num} delay={i * 0.08}>
                  <li className="glass-card group flex gap-4 sm:gap-5 rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:border-gold/40 text-cream">
                    <div className="shrink-0">
                      <span className="grid h-12 w-12 place-items-center rounded-2xl border border-gold/30 bg-gold/10 text-gold transition-all duration-300 group-hover:scale-110 group-hover:bg-gold group-hover:text-ink shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                        <p.icon className="h-5 w-5" strokeWidth={1.8} />
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold tracking-[0.3em] text-gold/70">
                        {p.num}
                      </span>
                      <h4 className="font-display text-lg sm:text-xl font-semibold text-cream group-hover:text-gold-light transition-colors">
                        {p.title}
                      </h4>
                      <p className="mt-1 text-xs sm:text-[13px] leading-relaxed text-sand/80">
                        {p.copy}
                      </p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
