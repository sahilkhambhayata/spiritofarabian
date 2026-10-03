import { ArrowRight, Compass, ShieldCheck, Truck, Undo2 } from "lucide-react";
import { Flourish, Reveal } from "./ui";

export default function Cta({
  onShop,
  onOpenQuiz,
}: {
  onShop: () => void;
  onOpenQuiz: () => void;
}) {
  return (
    <section className="relative overflow-hidden px-4 py-24 sm:px-8 sm:py-32" aria-label="Final call to action">
      <Reveal className="relative mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-gold/30 px-6 py-16 text-center sm:px-12 sm:py-24 shadow-2xl">
          {/* Backdrop Image & Lighting */}
          <div className="absolute inset-0" aria-hidden>
            <img
              src="/images/gold-smoke.jpg"
              alt=""
              className="h-full w-full object-cover opacity-35"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-ink-2/90 via-ink/80 to-ink-2/95" />
            <div className="absolute left-1/2 top-1/2 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(212,175,55,0.18),transparent)] blur-3xl" />
          </div>

          <div className="relative z-10 text-cream">
            <Flourish className="mb-6" />

            <h2 className="font-display mx-auto max-w-3xl text-[clamp(2.2rem,5.5vw,4.2rem)] font-medium leading-[1.04] text-cream">
              Some Fragrances You Wear.
              <br />
              <em className="gold-text font-semibold italic">This One Remembers You.</em>
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-xs sm:text-base leading-relaxed text-sand/80">
              Tonight it opens as Kashmir saffron and Taif rose. By midnight, it melts into skin and smoked amber — entirely unique to you. Begin with our Discovery Ritual or claim your signature flacon.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={onShop}
                className="btn-gold group inline-flex items-center gap-2.5 rounded-full px-8 py-4 text-xs font-black uppercase tracking-widest shadow-[0_0_30px_rgba(212,175,55,0.4)]"
              >
                Shop The Collection
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={onOpenQuiz}
                className="btn-ghost inline-flex items-center gap-2 rounded-full px-7 py-4 text-xs font-bold uppercase tracking-wider"
              >
                <Compass className="h-4 w-4 text-gold" />
                Take Scent Diagnostic
              </button>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-sand/70 border-t border-gold/15 pt-8">
              <span className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-gold" /> Insured 24h Global Express Dispatch
              </span>
              <span className="flex items-center gap-2">
                <Undo2 className="h-4 w-4 text-gold" /> 30-Day Sillage Guarantee
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-gold" /> Certified Pure Botanical Oils
              </span>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
