import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Droplets, Flame, Gem, HeartHandshake, Plane } from "lucide-react";
import { EASE, Reveal, SectionHead } from "./ui";

const BARS = [
  { name: "Eau de Toilette", pct: 8, wear: "2–3 Hours", dim: true },
  { name: "Eau de Parfum", pct: 18, wear: "4–6 Hours", dim: true },
  { name: "Extrait de Parfum", pct: 30, wear: "6–8 Hours", dim: true },
  { name: "SPIRIT OF ARABIAN Attar", pct: 100, wear: "14+ Hours", dim: false },
];

const STEPS = [
  {
    num: "01",
    title: "Warm one sacred droplet",
    copy: "Unscrew the crystal glass wand and let a single droplet rest upon your warmest pulse point — inner wrist, hollow of the throat, or nape.",
  },
  {
    num: "02",
    title: "Press gently, never rub",
    copy: "Press pulse points softly together. Friction crushes the delicate top florals; gentle body heat allows the accord to bloom gradually across 14 hours.",
  },
  {
    num: "03",
    title: "Layer for signature presence",
    copy: "Layer Musk Céleste beneath Oud Impérial to amplify its depth, or wear Rose Sultane alone when your presence must command the room.",
  },
];

const BENEFITS = [
  { icon: Flame, title: "14+ Hour Wear", copy: "One morning droplet carries from breakfast meeting to midnight gala." },
  { icon: Gem, title: "100% Pure Oil", copy: "0% alcohol or synthetic solvent fillers. 100% aromatic concentrate." },
  { icon: HeartHandshake, title: "Hypoallergenic", copy: "Eliminates 95% of common alcohol irritation for sensitive skin." },
  { icon: Plane, title: "Cabin-Safe Luxury", copy: "TSA approved 12ml crystal flacon. Over 180 applications per flacon." },
];

export default function Benefits() {
  const barRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  return (
    <section id="ritual" className="relative overflow-hidden py-24 sm:py-32" aria-label="The attar ritual and benefits">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(900px 520px at 80% 75%, rgba(212,175,55,0.06), transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-8">
        <SectionHead
          eyebrow="The Ancient Ritual · The Science"
          title={
            <>
              Why One Drop Outlasts <em className="gold-text font-semibold italic">A Hundred Sprays.</em>
            </>
          }
          copy="Alcohol evaporates in minutes; pure botanical oil anchors into your skin lipids for hours. Compare pure aromatic concentration below."
        />

        <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-12 lg:gap-14">
          {/* Comparison chart */}
          <div className="lg:col-span-6">
            <Reveal className="h-full">
              <div className="glass-card relative h-full flex flex-col justify-between rounded-3xl p-6 sm:p-9 text-cream">
                <div>
                  <div className="flex items-center justify-between border-b border-gold/15 pb-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold-light">
                      Aromatic Compound Concentration
                    </p>
                    <Droplets className="h-4 w-4 text-gold" />
                  </div>

                  <div ref={barRef} className="mt-8 space-y-6">
                    {BARS.map((b, i) => (
                      <div key={b.name}>
                        <div className="mb-2 flex items-baseline justify-between gap-3">
                          <span
                            className={
                              b.dim
                                ? "text-xs sm:text-sm font-medium text-sand/70"
                                : "text-sm sm:text-base font-bold text-gold-light"
                            }
                          >
                            {b.name}
                          </span>
                          <span
                            className={
                              b.dim
                                ? "text-xs font-semibold text-sand/50"
                                : "text-xs font-bold text-emerald-400"
                            }
                          >
                            {b.pct}% Oil · {b.wear}
                          </span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-cream/10">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${b.pct}%` }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: reduce ? 0 : 1.2, delay: 0.1 + i * 0.1, ease: EASE }}
                            className={
                              b.dim
                                ? "h-full rounded-full bg-cream/25"
                                : "h-full rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-2 shadow-[0_0_15px_rgba(212,175,55,0.7)]"
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="mt-8 border-t border-gold/10 pt-4 text-xs leading-relaxed text-sand/70">
                  Ordinary commercial sprays flash off rapidly as alcohol evaporates. SPIRIT OF ARABIAN attar oils bond with your skin's natural warmth, releasing aromatic waves throughout the day.
                </p>
              </div>
            </Reveal>
          </div>

          {/* Ritual steps + image */}
          <div className="lg:col-span-6">
            <Reveal className="glass-card relative overflow-hidden rounded-3xl text-cream">
              <div className="relative">
                <img
                  src="/images/ritual.jpg"
                  alt="A golden droplet of pure attar oil applied to pulse points"
                  className="aspect-[16/9] w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-2 via-ink-2/30 to-transparent" aria-hidden />
                <span className="glass absolute left-4 top-4 rounded-full px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-gold-light">
                  10 Seconds Every Morning
                </span>
              </div>

              <ol className="p-6 sm:p-8 space-y-4">
                {STEPS.map((s, i) => (
                  <Reveal key={s.num} delay={i * 0.08}>
                    <li className="flex gap-4 rounded-2xl border border-transparent p-3 transition-colors hover:border-gold/20 hover:bg-panel/40">
                      <span className="font-display text-2xl font-bold text-gold/70">
                        {s.num}
                      </span>
                      <div>
                        <h4 className="font-display text-lg font-semibold text-cream">
                          {s.title}
                        </h4>
                        <p className="mt-1 text-xs sm:text-[13px] leading-relaxed text-sand/80">
                          {s.copy}
                        </p>
                      </div>
                    </li>
                  </Reveal>
                ))}
              </ol>
            </Reveal>
          </div>
        </div>

        {/* 4 Benefit Chips */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {BENEFITS.map((b, i) => (
            <Reveal key={b.title} delay={i * 0.06}>
              <div className="glass-card group h-full rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 text-cream">
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-gold/30 bg-gold/10 text-gold transition-transform group-hover:scale-110 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                  <b.icon className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <h4 className="mt-4 font-display text-lg font-semibold text-cream">
                  {b.title}
                </h4>
                <p className="mt-1.5 text-xs text-sand/80 leading-relaxed">
                  {b.copy}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
