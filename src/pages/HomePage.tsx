import { Link } from "react-router-dom";
import { ArrowRight, Compass, Droplets, Gem, Sparkles, Timer } from "lucide-react";
import Hero from "../components/Hero";
import SocialProof from "../components/SocialProof";
import { PRODUCTS, JOURNAL_ARTICLES, type Product, type ProductSize } from "../data";
import { Reveal, SectionHead } from "../components/ui";

export default function HomePage({
  onAddProduct,
  onOpenQuiz,
}: {
  onAddProduct: (product: Product, size?: ProductSize) => void;
  onOpenQuiz: () => void;
}) {
  return (
    <div className="relative">
      {/* 1. Hero Section */}
      <Hero
        onShop={() => {
          const el = document.getElementById("featured-collection");
          el?.scrollIntoView({ behavior: "smooth" });
        }}
        onOpenQuiz={onOpenQuiz}
        onAddProduct={onAddProduct}
      />

      {/* 2. Press Accolades */}
      <SocialProof />

      {/* 3. Featured Extraits Spotlight */}
      <section id="featured-collection" className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <SectionHead
              align="left"
              eyebrow="The Imperial Portfolio"
              title={
                <>
                  Rare Botanical Oils. <em className="gold-text font-semibold italic">Immortal Sillage.</em>
                </>
              }
              copy="Four signature extraits hydro-distilled in pure copper alembic stills over twelve weeks. Alcohol-free, lipid-bound, and crafted to bloom with your personal chemistry."
            />
            <Link
              to="/collection"
              className="btn-ghost inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-xs font-bold uppercase tracking-wider shrink-0 self-start sm:self-auto"
            >
              View Full Collection
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {PRODUCTS.map((product, i) => (
              <Reveal key={product.id} delay={i * 0.08}>
                <div className="glass-card group flex h-full flex-col justify-between rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/40 text-cream">
                  <div>
                    <Link
                      to={`/product/${product.id}`}
                      className="relative block aspect-[4/5] overflow-hidden rounded-2xl border border-gold/20 bg-ink"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {product.badge && (
                        <span className="absolute top-3 left-3 rounded-full bg-gradient-to-r from-gold to-gold-2 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-ink shadow-md">
                          {product.badge}
                        </span>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <span className="btn-gold w-full text-center py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl">
                          Explore Scent
                        </span>
                      </div>
                    </Link>

                    <div className="mt-4">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gold/70">
                        {product.family}
                      </span>
                      <h3 className="font-display text-2xl font-semibold text-cream mt-0.5 group-hover:text-gold-light transition-colors">
                        <Link to={`/product/${product.id}`}>{product.name}</Link>
                      </h3>
                      <p className="mt-1 text-xs text-sand/75 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gold/15 flex items-center justify-between">
                    <div>
                      <span className="font-display text-xl font-bold text-gold-light">
                        ${product.price}
                      </span>
                      <span className="text-[10px] text-sand/60 block uppercase">
                        12ml Extrait
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onAddProduct(product)}
                      className="rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-gold-light hover:bg-gold hover:text-ink transition-colors"
                    >
                      Add to Bag
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. The Discovery Ritual Experience Banner */}
      <section className="relative overflow-hidden py-20 bg-ink-2/60 border-y border-gold/15">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-6 space-y-6">
              <span className="eyebrow flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                The Scent Exploration Program
              </span>

              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium leading-[1.05] text-cream">
                The Discovery Ritual — <br />
                <em className="gold-text italic font-semibold">Sample All Five Moods.</em>
              </h2>

              <p className="text-xs sm:text-sm leading-relaxed text-sand/85">
                Uncertain which extrait belongs on your skin? Experience our complete olfactory library in five 2ml crystal vials. The full $59 purchase is credited straight toward your first full flacon.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                {[
                  { title: "5 × 2ml Vials", desc: "All signature extraits included" },
                  { title: "100% Scent Credit", desc: "Full $59 deducted on your flacon" },
                  { title: "Free Worldwide Express", desc: "Insured door-to-door delivery" },
                  { title: "Scent Atlas Guide", desc: "Bespoke ritual & layering notes" },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-gold/15 bg-panel/30 p-3.5">
                    <h4 className="font-display text-sm font-semibold text-gold-light">{item.title}</h4>
                    <p className="text-[11px] text-sand/70 mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  to="/discovery"
                  className="btn-gold inline-flex items-center gap-2 rounded-full px-8 py-4 text-xs font-black uppercase tracking-widest"
                >
                  Order Discovery Ritual — $59
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <button
                  type="button"
                  onClick={onOpenQuiz}
                  className="btn-ghost inline-flex items-center gap-2 rounded-full px-6 py-4 text-xs font-bold uppercase tracking-wider"
                >
                  <Compass className="h-4 w-4 text-gold" />
                  Take Scent Diagnostic
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <Reveal className="relative overflow-hidden rounded-3xl border border-gold/30 shadow-2xl">
                <img
                  src="/images/discovery-set.jpg"
                  alt="The Discovery Ritual coffret with five 2ml crystal vials of pure attar"
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent flex items-end p-6">
                  <div className="glass rounded-2xl p-4 w-full flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gold">The Discovery Ritual</p>
                      <p className="font-display text-lg font-semibold text-cream">Five Extraits Coffret</p>
                    </div>
                    <span className="font-display text-2xl font-bold text-gold-light">$59</span>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Heritage & Craft Teaser */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <Reveal className="relative overflow-hidden rounded-3xl border border-gold/25 ring-glow">
                <img
                  src="/images/craft.jpg"
                  alt="Master artisan distilling attar in copper stills"
                  className="aspect-[4/5] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-ink/20" />
                <div className="glass absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-2xl p-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">Est. 1998</p>
                    <p className="font-display text-lg text-cream">Atelier Kannauj & Dubai</p>
                  </div>
                  <span className="font-display text-2xl font-bold text-gold-light">28+ Years</span>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
              <SectionHead
                align="left"
                eyebrow="Ancestral Art · The Craft"
                title={
                  <>
                    High Perfumery, <em className="gold-text font-semibold italic">Before Dilution.</em>
                  </>
                }
                copy="Attar is the 1,000-year-old art of perfume before alcohol shortcuts existed. We distill CITES-certified wild Cambodian agarwood, dawn-picked Taif roses, and sacred Mysore sandalwood in traditional copper deg-bapka stills."
              />

              <div className="space-y-3 pt-2">
                {[
                  { icon: Droplets, title: "100% Pure Botanical Concentrate", desc: "0% alcohol or synthetic solvent dilution. Pure aromatic concentrate that anchors to skin lipids." },
                  { icon: Timer, title: "14+ Hours Sillage", desc: "Evolves continuously with your body temperature throughout the day and into midnight." },
                  { icon: Gem, title: "Ethical CITES Provenance", desc: "Direct harvest partnerships with generational growers in Cambodia, Taif, and Kashmir." },
                ].map((item) => (
                  <div key={item.title} className="glass-card flex items-start gap-4 rounded-2xl p-4 text-cream">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
                      <item.icon className="h-4 w-4" />
                    </span>
                    <div>
                      <h4 className="font-display text-base font-semibold text-cream">{item.title}</h4>
                      <p className="text-xs text-sand/70 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  to="/heritage"
                  className="btn-ghost inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-xs font-bold uppercase tracking-wider"
                >
                  Discover The Maison Story
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Editorial Journal Teaser */}
      <section className="relative py-20 bg-ink-2/40 border-t border-gold/15">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <SectionHead
              align="left"
              eyebrow="The Scent Journal"
              title={
                <>
                  Chronicles of <em className="gold-text font-semibold italic">Haute Perfumery.</em>
                </>
              }
              copy="Stories from our mountain rose harvests, distillation science, and masterclasses in rare scent layering."
            />
            <Link
              to="/journal"
              className="btn-ghost inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-xs font-bold uppercase tracking-wider shrink-0 self-start sm:self-auto"
            >
              Read All Articles
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {JOURNAL_ARTICLES.map((art, i) => (
              <Reveal key={art.slug} delay={i * 0.1}>
                <article className="glass-card group flex h-full flex-col justify-between rounded-3xl p-5 text-cream">
                  <div>
                    <Link to={`/journal/${art.slug}`} className="block overflow-hidden rounded-2xl border border-gold/15 aspect-[16/10]">
                      <img
                        src={art.image}
                        alt={art.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </Link>
                    <div className="mt-4">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gold/80">
                        <span>{art.category}</span>
                        <span>•</span>
                        <span>{art.readTime}</span>
                      </div>
                      <h3 className="font-display mt-1 text-xl font-semibold text-cream group-hover:text-gold-light transition-colors">
                        <Link to={`/journal/${art.slug}`}>{art.title}</Link>
                      </h3>
                      <p className="mt-2 text-xs text-sand/75 line-clamp-2 leading-relaxed">
                        {art.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-gold/10 flex items-center justify-between text-xs text-sand/60">
                    <span>{art.author}</span>
                    <Link to={`/journal/${art.slug}`} className="text-gold-light font-semibold hover:underline">
                      Read Article →
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
