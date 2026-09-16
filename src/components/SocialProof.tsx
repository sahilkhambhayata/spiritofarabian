import { PRESS } from "../data";
import { Reveal } from "./ui";

export default function SocialProof() {
  const row = [...PRESS, ...PRESS];
  return (
    <section id="press" aria-label="Featured in the press" className="relative py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <div className="flex items-center justify-center gap-4 opacity-40">
             <span className="h-px w-8 bg-gold" />
             <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-gold">The Maison Record</p>
             <span className="h-px w-8 bg-gold" />
          </div>
        </Reveal>
      </div>

      <div className="relative mt-12 overflow-hidden py-4">
        <div className="flex w-max animate-marquee items-center gap-20 pr-20">
          {row.map((name, i) => (
            <span key={i} className="font-display whitespace-nowrap text-3xl font-medium tracking-[0.1em] text-gold/20 sm:text-5xl">
              {name}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-7xl px-5 sm:px-8">
        <Reveal delay={0.1}>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-center">
            {[
              { label: "Verified Rating", val: "4.9/5" },
              { label: "Global Presence", val: "42 Countries" },
              { label: "Return Loyalty", val: "96%" }
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center gap-2">
                 <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold/30">{s.label}</span>
                 <span className="font-display text-xl text-gold-light">{s.val}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
