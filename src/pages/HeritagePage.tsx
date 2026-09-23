import { Link } from "react-router-dom";
import { Droplets, FlaskConical, Gem, Leaf, MapPin } from "lucide-react";
import { HERITAGE_EVENTS } from "../data";
import { CountUp, Reveal, SectionHead } from "../components/ui";

export default function HeritagePage() {
  return (
    <div className="relative pt-32 sm:pt-36 pb-24 sm:pb-32 text-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-sand/60">
          <Link to="/" className="hover:text-gold-light transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gold-light font-semibold">Maison & Heritage</span>
        </nav>

        {/* Hero Header */}
        <SectionHead
          eyebrow="The Maison Story · Est. 1998"
          title={
            <>
              Guardians of Ancestral <em className="gold-text font-semibold italic">Hydro-Distillation.</em>
            </>
          }
          copy="For three generations, SPIRIT OF ARABIAN has preserved the thousand-year-old art of pure attar — extracting raw botanicals in copper deg-bapka stills without a single drop of alcohol."
        />

        {/* Story Section */}
        <div className="mt-16 grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6 space-y-6">
            <h2 className="font-display text-3xl sm:text-4xl font-medium text-cream leading-[1.1]">
              "We Do Not Manufacture Perfume. <br />
              <em className="gold-text italic font-semibold">We Capture Living Flora."</em>
            </h2>

            <p className="text-sm sm:text-base leading-relaxed text-sand/90">
              Before the modern fragrance industry turned to synthetic aromachemicals and 80% alcohol dilution, perfume was a sacred extraction. It was the purest oil of wood, petals, and resins that bonded to human skin for days.
            </p>

            <p className="text-sm sm:text-base leading-relaxed text-sand/90">
              At our master ateliers in Kannauj, Al-Hada, and Dubai, we harvest wild harvests at dawn and distill them over weeks in handmade copper alembics. No shortcuts, no chemical fixatives, and no dilution.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gold/15">
              <div>
                <span className="font-display text-3xl font-bold text-gold-light">
                  <CountUp to={28} suffix="+" />
                </span>
                <span className="text-xs text-sand/70 block font-semibold uppercase mt-0.5">Years of Mastery</span>
              </div>
              <div>
                <span className="font-display text-3xl font-bold text-gold-light">
                  <CountUp to={100} suffix="%" />
                </span>
                <span className="text-xs text-sand/70 block font-semibold uppercase mt-0.5">Pure Lipid Oil</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <Reveal className="glass-card overflow-hidden rounded-3xl border border-gold/30 shadow-2xl p-4">
              <img
                src="/images/arabian-brand-assets.jpg"
                alt="SPIRIT OF ARABIAN Maison d'Attar brand assets and crystal flacons"
                className="aspect-[16/10] w-full object-cover rounded-2xl"
              />
              <div className="mt-4 flex items-center justify-between px-2 text-xs text-sand/70">
                <span className="flex items-center gap-1.5 text-gold-light font-semibold">
                  <MapPin className="h-4 w-4 text-gold" /> The Imperial Flacon Atelier
                </span>
                <span>Numbered Crystal Reserves</span>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Artisanal Flacon & Vault Showcase Gallery */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          <Reveal delay={0.1}>
            <div className="glass-card overflow-hidden rounded-3xl border border-gold/25 p-4 shadow-xl">
              <img
                src="/images/arabian-vault-box.jpg"
                alt="Imperial Extrait in emerald velvet presentation vault with agarwood and frankincense"
                className="aspect-[16/10] w-full object-cover rounded-2xl"
              />
              <div className="mt-3 px-2">
                <h4 className="font-display text-base font-semibold text-gold-light">
                  The Imperial Velvet Presentation Vault
                </h4>
                <p className="text-xs text-sand/70 mt-0.5">
                  Hand-crafted green velvet presentation case with golden satin lining and pure wax seal.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="glass-card overflow-hidden rounded-3xl border border-gold/25 p-4 shadow-xl">
              <img
                src="/images/arabian-flacon-box.jpg"
                alt="The signature crystal flacon with gold filigree cap and royal wax seal"
                className="aspect-[16/10] w-full object-cover rounded-2xl"
              />
              <div className="mt-3 px-2">
                <h4 className="font-display text-base font-semibold text-gold-light">
                  Heavy Faceted Lead Crystal Flacon
                </h4>
                <p className="text-xs text-sand/70 mt-0.5">
                  Gold filigree dome cap with an integrated glass dip wand for precise ritual application.
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* 4 Pillars of Craft */}
        <section className="mt-24 border-t border-gold/15 pt-16">
          <SectionHead
            eyebrow="Our Four Tenets"
            title={
              <>
                The Four Pillars of <em className="gold-text font-semibold italic">SPIRIT OF ARABIAN.</em>
              </>
            }
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: FlaskConical,
                title: "Deg-Bapka Hydro-Distillation",
                copy: "Handmade pure copper alembic stills, wood-fired slow maceration, and water cooling over weeks.",
              },
              {
                icon: Gem,
                title: "CITES-Certified Wild Agarwood",
                copy: "8-year barrel aged wild Cambodian agarwood sourced legally and ethically under strict conservation laws.",
              },
              {
                icon: Droplets,
                title: "Zero Alcohol & Zero Fillers",
                copy: "100% lipid-bound perfume extrait. 0% ethanol, drying agents, or phthalates.",
              },
              {
                icon: Leaf,
                title: "Dermatologically Reviewed",
                copy: "Hypoallergenic carrier matrices that nurture skin rather than strip it of moisture.",
              },
            ].map((p, i) => (
              <Reveal key={p.title} delay={i * 0.08}>
                <div className="glass-card flex h-full flex-col justify-between rounded-3xl p-6 space-y-4">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl border border-gold/30 bg-gold/10 text-gold shadow-md">
                    <p.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-cream">{p.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-sand/75">{p.copy}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Historical Timeline */}
        <section className="mt-28 border-t border-gold/15 pt-16">
          <SectionHead
            eyebrow="Maison Timeline"
            title={
              <>
                Twenty-Eight Years of <em className="gold-text font-semibold italic">Uncompromising Art.</em>
              </>
            }
          />

          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {HERITAGE_EVENTS.map((event, i) => (
              <Reveal key={event.year} delay={i * 0.1}>
                <div className="rounded-3xl border border-gold/15 bg-panel/30 p-6 space-y-3">
                  <span className="font-display text-3xl font-bold text-gold-light">{event.year}</span>
                  <h4 className="font-display text-lg font-semibold text-cream">{event.title}</h4>
                  <p className="text-xs text-sand/75 leading-relaxed">{event.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-24 text-center">
          <div className="glass-card max-w-3xl mx-auto rounded-3xl p-8 sm:p-12 border border-gold/30 space-y-4">
            <span className="eyebrow">Experience The Alchemy</span>
            <h3 className="font-display text-3xl sm:text-4xl font-medium text-cream">
              Begin With The Collection
            </h3>
            <p className="text-xs sm:text-sm text-sand/80 max-w-lg mx-auto">
              Explore our four signature extraits or sample all five moods in the Discovery Ritual.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <Link to="/collection" className="btn-gold rounded-full px-8 py-4 text-xs font-black uppercase tracking-widest">
                Explore The Collection
              </Link>
              <Link to="/discovery" className="btn-ghost rounded-full px-7 py-4 text-xs font-bold uppercase tracking-wider">
                Order Discovery Set — $59
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
