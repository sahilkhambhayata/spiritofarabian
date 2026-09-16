import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BadgeCheck, Quote } from "lucide-react";
import { TESTIMONIALS, type Testimonial } from "../data";
import { EASE, Reveal, SectionHead, Stars } from "./ui";
import { cn } from "../utils/cn";

const AUTOPLAY_MS = 6000;
const SCENT_FILTERS = ["All Scents", "Oud Impérial", "Rose Sultane", "Musk Céleste", "Ambre Noir"];

export default function Testimonials() {
  const [activeFilter, setActiveFilter] = useState("All Scents");
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const timer = useRef<number | null>(null);

  const filtered = TESTIMONIALS.filter(
    (t) => activeFilter === "All Scents" || t.scent === activeFilter
  );

  const currentIdx = Math.min(idx, filtered.length - 1);
  const t: Testimonial = filtered[currentIdx] || TESTIMONIALS[0];

  const step = useCallback((d: number) => {
    setDir(d);
    setIdx((i) => (i + d + filtered.length) % filtered.length);
  }, [filtered.length]);

  useEffect(() => {
    if (paused || filtered.length <= 1) return;
    timer.current = window.setTimeout(() => step(1), AUTOPLAY_MS);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [currentIdx, paused, step, filtered.length]);

  return (
    <section
      id="reviews"
      className="relative overflow-hidden py-24 sm:py-32"
      aria-label="Customer reviews"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(800px 500px at 50% 10%, rgba(212,175,55,0.08), transparent 75%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-8">
        <SectionHead
          eyebrow="Word of Nose · Verified Collectors"
          title={
            <>
              Worn, Judged, <em className="gold-text font-semibold italic">Cherished.</em>
            </>
          }
          copy="Read unfiltered experiences from fragrance critics, dermatologists, and bespoke attar collectors across 42 countries."
        />

        {/* Scent Filter Pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {SCENT_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => {
                setActiveFilter(filter);
                setIdx(0);
              }}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-bold transition-all uppercase tracking-wider",
                activeFilter === filter
                  ? "border border-gold bg-gold text-ink shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                  : "border border-gold/20 bg-panel/30 text-sand hover:border-gold/40 hover:text-cream"
              )}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Testimonial Card */}
        <Reveal className="mt-10">
          <div
            className="glass-card relative rounded-3xl px-6 py-10 sm:px-14 sm:py-14 text-cream"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            role="region"
            aria-roledescription="carousel"
            aria-label="Customer Testimonials"
          >
            <Quote className="absolute -top-4 left-8 h-10 w-10 fill-gold/20 text-gold/30" aria-hidden />

            <div className="min-h-[220px] sm:min-h-[180px] flex items-center justify-center">
              <AnimatePresence mode="wait" initial={false}>
                <motion.figure
                  key={`${activeFilter}-${currentIdx}`}
                  initial={{ opacity: 0, x: dir * 30, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: dir * -30, filter: "blur(4px)" }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="text-center w-full"
                >
                  <blockquote className="font-display mx-auto max-w-3xl text-xl font-medium leading-relaxed text-cream sm:text-2xl lg:text-[1.65rem]">
                    "{t.quote}"
                  </blockquote>

                  <figcaption className="mt-8 flex flex-col items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-full border border-gold/40 bg-gradient-to-br from-gold/20 to-panel font-display text-lg font-bold text-gold-light">
                      {t.name.split(" ").map((w) => w[0]).join("")}
                    </span>

                    <div>
                      <p className="flex items-center justify-center gap-1.5 text-sm font-bold text-cream">
                        {t.name}
                        <BadgeCheck className="h-4 w-4 text-emerald-400" aria-label="Verified collector" />
                      </p>
                      <p className="mt-0.5 text-xs text-sand/60">
                        {t.role} · {t.location}
                      </p>
                    </div>

                    <span className="rounded-full border border-gold/20 bg-gold/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-gold-light">
                      Wears {t.scent}
                    </span>
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>

            {/* Navigation Controls */}
            {filtered.length > 1 && (
              <div className="mt-8 flex items-center justify-center gap-5">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="grid h-10 w-10 place-items-center rounded-full border border-gold/25 text-sand transition-all hover:border-gold hover:text-gold hover:scale-110"
                  aria-label="Previous review"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>

                <div className="flex gap-2">
                  {filtered.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setDir(i > currentIdx ? 1 : -1);
                        setIdx(i);
                      }}
                      aria-label={`Go to review ${i + 1}`}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        i === currentIdx ? "w-8 bg-gold shadow-[0_0_8px_rgba(212,175,55,0.6)]" : "w-2 bg-cream/20 hover:bg-cream/40"
                      )}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => step(1)}
                  className="grid h-10 w-10 place-items-center rounded-full border border-gold/25 text-sand transition-all hover:border-gold hover:text-gold hover:scale-110"
                  aria-label="Next review"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </Reveal>

        {/* Star Rating Badge */}
        <Reveal delay={0.15}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-center text-xs sm:text-sm text-sand/70">
            <Stars />
            <span>
              <strong className="text-gold-light">4.9 out of 5</strong> across 12,400+ verified orders — 96% return loyalty rate.
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
