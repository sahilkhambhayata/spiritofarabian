import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Compass, Package, Sparkles } from "lucide-react";
import { PRODUCTS } from "../data";
import { Reveal, SectionHead } from "../components/ui";
import { cn } from "../utils/cn";

export default function DiscoveryPage({
  onAddDiscovery,
  onOpenQuiz,
}: {
  onAddDiscovery: () => void;
  onOpenQuiz: () => void;
}) {
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = () => {
    onAddDiscovery();
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  return (
    <div className="relative pt-28 pb-24 sm:pb-32 text-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-sand/60">
          <Link to="/" className="hover:text-gold-light transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gold-light font-semibold">The Discovery Ritual</span>
        </nav>

        {/* Hero Section */}
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6 space-y-6">
            <span className="eyebrow flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              Complete Olfactory Exploration
            </span>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium leading-[1.04] text-cream">
              The Discovery Ritual — <br />
              <em className="gold-text italic font-semibold">Sample Before You Choose.</em>
            </h1>

            <p className="text-sm sm:text-base leading-relaxed text-sand/90">
              Fragrance evolves differently on every skin chemistry. Experience all signature extraits in our gilded 5 × 2ml crystal flacon coffret. The entire $59 purchase is automatically returned to you as instant store credit toward any full 12ml or 30ml flacon.
            </p>

            {/* Value Highlights */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { title: "Five 2ml Crystal Vials", desc: "Oud Impérial, Rose Sultane, Musk Céleste, Ambre Noir & Private Blend" },
                { title: "100% Scent Credit", desc: "Full $59 deducted on your next flacon purchase within 60 days" },
                { title: "Free Worldwide Express", desc: "Dispatched insured in 24 hours via DHL Express" },
                { title: "Bespoke Layering Atlas", desc: "Includes note breakdown guide & pulse points roadmap" },
              ].map((h) => (
                <div key={h.title} className="rounded-2xl border border-gold/15 bg-panel/30 p-4">
                  <h4 className="font-display text-sm font-semibold text-gold-light">{h.title}</h4>
                  <p className="text-[11px] text-sand/70 mt-1 leading-snug">{h.desc}</p>
                </div>
              ))}
            </div>

            {/* Pricing & CTA */}
            <div className="space-y-4 pt-4 border-t border-gold/15">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-4xl font-bold text-gold-light">$59</span>
                <span className="text-xs text-sand/60">USD · Full $59 Redeemable Credit Included</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleAdd}
                  className={cn(
                    "btn-gold flex-1 flex items-center justify-center gap-2.5 rounded-full py-4 text-xs font-black uppercase tracking-widest shadow-xl",
                    isAdded && "bg-emerald-400 text-ink"
                  )}
                >
                  {isAdded ? (
                    <>
                      <Check className="h-4 w-4" strokeWidth={3} />
                      Discovery Ritual Reserved in Bag
                    </>
                  ) : (
                    <>
                      <Package className="h-4 w-4" />
                      Acquire The Discovery Ritual — $59
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onOpenQuiz}
                  className="btn-ghost inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-xs font-bold uppercase tracking-wider"
                >
                  <Compass className="h-4 w-4 text-gold" />
                  Scent Diagnostic
                </button>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="lg:col-span-6">
            <Reveal className="glass-card relative overflow-hidden rounded-3xl border border-gold/30 shadow-2xl p-4">
              <img
                src="/images/discovery-set.jpg"
                alt="The Discovery Ritual 5-vial crystal coffret"
                className="aspect-[4/3] w-full object-cover rounded-2xl"
              />
              <div className="mt-4 flex items-center justify-between px-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gold">Numbered Batch Issue</p>
                  <p className="font-display text-xl text-cream font-semibold">The 5-Extrait Discovery Coffret</p>
                </div>
                <span className="font-display text-2xl font-bold text-gold-light">$59 USD</span>
              </div>
            </Reveal>
          </div>
        </div>

        {/* 5 Included Scents Breakdown */}
        <section className="mt-28 border-t border-gold/15 pt-16">
          <SectionHead
            eyebrow="Inside The Coffret"
            title={
              <>
                Five Olfactory Horizons. <em className="gold-text font-semibold italic">One Master Box.</em>
              </>
            }
            copy="Each 2ml crystal vial provides approximately 30 daily applications (over 150 wears in total)."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PRODUCTS.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08}>
                <div className="glass-card rounded-3xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gold">{p.family}</span>
                    <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold-light">2ml Extrait</span>
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-cream">{p.name}</h3>
                  <p className="text-xs text-sand/75 line-clamp-2 leading-relaxed">{p.description}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {p.notes.top.slice(0, 2).map((n) => (
                      <span key={n.name} className="rounded-md border border-gold/15 bg-ink/40 px-2 py-0.5 text-[10px] text-sand">
                        {n.name}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* How The Credit Voucher Works */}
        <section className="mt-24 rounded-3xl border border-gold/25 bg-panel/30 p-8 sm:p-12 text-cream">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="eyebrow">How The Credit Guarantee Works</span>
            <h3 className="font-display text-3xl font-medium text-cream">
              Your Entire $59 Becomes Store Credit
            </h3>
            <p className="text-xs sm:text-sm text-sand/80">
              When your Discovery Ritual arrives, it includes a sealed golden invitation with your personal voucher code worth $59.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { step: "01", title: "Explore At Leisure", copy: "Sample all 5 scents on your skin across 14 days in different settings and seasons." },
              { step: "02", title: "Select Your Signature", copy: "Choose your favorite full-sized 12ml or 30ml flacon on our boutique." },
              { step: "03", title: "Redeem Full $59", copy: "Enter your unique voucher code at checkout to have the full $59 instantly deducted." },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl border border-gold/15 bg-ink/40 p-6 text-center space-y-2">
                <span className="font-display text-3xl font-bold text-gold/70">{s.step}</span>
                <h4 className="font-display text-lg font-semibold text-cream">{s.title}</h4>
                <p className="text-xs text-sand/70 leading-relaxed">{s.copy}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
