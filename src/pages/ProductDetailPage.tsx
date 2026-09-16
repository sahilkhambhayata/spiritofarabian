import { useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Clock,
  Droplets,
  Layers,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import { PRODUCTS, TESTIMONIALS, type Product, type ProductSize } from "../data";
import BottleScene from "../components/BottleScene";
import { Stars } from "../components/ui";
import { cn } from "../utils/cn";

export default function ProductDetailPage({
  onAddProduct,
}: {
  onAddProduct: (product: Product, size?: ProductSize) => void;
}) {
  const { id } = useParams<{ id: string }>();
  const product = PRODUCTS.find((p) => p.id === id);

  const [viewMode, setViewMode] = useState<"3d" | "photo">("3d");
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(1); // default 12ml
  const [activeTab, setActiveTab] = useState<"pyramid" | "provenance" | "ritual" | "layering">("pyramid");
  const [isAdded, setIsAdded] = useState(false);

  if (!product) {
    return <Navigate to="/collection" replace />;
  }

  const currentSize = product.sizes[selectedSizeIndex] || product.sizes[0];
  const relatedProducts = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3);
  const relevantReviews = TESTIMONIALS.filter((t) => t.scent === product.name);

  const handleAdd = () => {
    onAddProduct(product, currentSize);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  return (
    <div className="relative pt-28 pb-24 sm:pb-32 text-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-sand/60">
          <Link to="/" className="hover:text-gold-light transition-colors">Home</Link>
          <span>/</span>
          <Link to="/collection" className="hover:text-gold-light transition-colors">Collection</Link>
          <span>/</span>
          <span className="text-gold-light font-semibold">{product.name}</span>
        </nav>

        {/* 2-Column Product Layout */}
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Visual Gallery & 3D Interactive View */}
          <div className="lg:col-span-6 space-y-4">
            <div className="glass-card relative aspect-square sm:aspect-[4/3] lg:aspect-square w-full rounded-3xl border border-gold/25 p-4 shadow-2xl overflow-hidden">
              {viewMode === "3d" ? (
                <div className="relative h-full w-full">
                  <BottleScene
                    oilColor={product.hue}
                    className="h-full w-full cursor-grab active:cursor-grabbing"
                  />
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none">
                    <span className="rounded-full border border-gold/20 bg-ink-2/80 px-3.5 py-1 text-[9px] font-bold uppercase tracking-[0.25em] text-gold-light backdrop-blur-md">
                      Drag to Rotate 360°
                    </span>
                  </div>
                </div>
              ) : (
                <div className="relative h-full w-full overflow-hidden rounded-2xl">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              {/* Badges */}
              {product.badge && (
                <span className="absolute top-4 left-4 rounded-full bg-gradient-to-r from-gold to-gold-2 px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-ink shadow-lg">
                  {product.badge}
                </span>
              )}
            </div>

            {/* View Mode Switcher Thumbnails */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setViewMode("3d")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-bold uppercase tracking-wider transition-all",
                  viewMode === "3d"
                    ? "border-gold bg-gold/15 text-gold-light shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                    : "border-gold/15 bg-panel/30 text-sand hover:border-gold/30 hover:text-cream"
                )}
              >
                <Sparkles className="h-4 w-4 text-gold" />
                Interactive 3D Flacon
              </button>

              <button
                type="button"
                onClick={() => setViewMode("photo")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-bold uppercase tracking-wider transition-all",
                  viewMode === "photo"
                    ? "border-gold bg-gold/15 text-gold-light shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                    : "border-gold/15 bg-panel/30 text-sand hover:border-gold/30 hover:text-cream"
                )}
              >
                <Droplets className="h-4 w-4 text-gold" />
                Studio Photography
              </button>
            </div>
          </div>

          {/* Right Column: Title, Scent Architecture, Volume Selection & Add to Cart */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="eyebrow">{product.tagline}</span>
                <span className="h-1 w-1 rounded-full bg-gold/50" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gold-light/70">
                  {product.family}
                </span>
              </div>

              <h1 className="font-display mt-2 text-4xl sm:text-5xl font-medium leading-[1.05] text-cream">
                {product.name}
              </h1>

              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-gold-light">
                {product.accent}
              </p>

              <div className="mt-4 flex items-center gap-4">
                <Stars />
                <span className="text-xs text-sand/80 font-medium">
                  4.9 / 5.0 (2,400+ Verified Collectors)
                </span>
              </div>

              <p className="mt-5 text-sm sm:text-base leading-relaxed text-sand/90">
                {product.description}
              </p>
            </div>

            {/* Key Longevity Highlights */}
            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-gold/15 bg-panel/30 p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gold shrink-0" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sand/60 block">Longevity</span>
                  <strong className="text-xs text-gold-light">{product.longevityHours} On Skin</strong>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-gold shrink-0" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sand/60 block">Formulation</span>
                  <strong className="text-xs text-gold-light">100% Pure Oil · 0% Alcohol</strong>
                </div>
              </div>
            </div>

            {/* Volume / Size Picker */}
            <div className="space-y-2 pt-2 border-t border-gold/15">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-sand/70">
                <span>Select Flacon Volume</span>
                <span className="text-gold-light">{currentSize.label}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {product.sizes.map((size, idx) => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => setSelectedSizeIndex(idx)}
                    className={cn(
                      "flex flex-col items-center rounded-2xl border p-3.5 text-center transition-all",
                      selectedSizeIndex === idx
                        ? "border-gold bg-gold/15 text-gold-light shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                        : "border-gold/15 bg-panel/30 text-sand hover:border-gold/30 hover:text-cream"
                    )}
                  >
                    <span className="text-xs font-bold">{size.volume}</span>
                    <span className="font-display mt-1 text-lg font-semibold">
                      ${size.price}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pricing & Add to Bag CTA */}
            <div className="space-y-4 pt-4 border-t border-gold/15">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-4xl font-bold text-gold-light">
                      ${currentSize.price}
                    </span>
                    {currentSize.compareAt && (
                      <span className="text-sm text-sand/40 line-through">
                        ${currentSize.compareAt}
                      </span>
                    )}
                    <span className="text-xs text-sand/60">USD</span>
                  </div>
                  <span className="text-[10px] text-sand/70 block mt-0.5">
                    Complimentary Insured Worldwide Express Shipping
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleAdd}
                  className={cn(
                    "btn-gold flex-1 flex items-center justify-center gap-2.5 rounded-full py-4 text-xs font-black uppercase tracking-[0.2em] shadow-lg",
                    isAdded && "bg-emerald-400 text-ink"
                  )}
                >
                  {isAdded ? (
                    <>
                      <Check className="h-4 w-4" strokeWidth={3} />
                      Added to Imperial Bag
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" />
                      Add to Imperial Bag — ${currentSize.price}
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-6 text-[11px] text-sand/70 pt-1">
                <span className="flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-gold" /> Ships in 24h
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-gold" /> 30-Day Guarantee
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5 text-gold" /> 1 Free Sample
                </span>
              </div>
            </div>

            {/* Deep-Dive Accordion Tabs */}
            <div className="space-y-2 pt-6 border-t border-gold/15">
              {/* Tab navigation */}
              <div className="flex border-b border-gold/15 gap-2 overflow-x-auto pb-2">
                {[
                  { id: "pyramid", label: "Fragrance Pyramid", icon: Droplets },
                  { id: "provenance", label: "Harvest & Origin", icon: MapPin },
                  { id: "ritual", label: "Application Ritual", icon: Sparkles },
                  { id: "layering", label: "Bespoke Layering", icon: Layers },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id as any)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors shrink-0 rounded-xl",
                      activeTab === t.id
                        ? "border border-gold/40 bg-gold/15 text-gold-light"
                        : "text-sand/60 hover:text-cream"
                    )}
                  >
                    <t.icon className="h-3.5 w-3.5" />
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab Content Box */}
              <div className="rounded-2xl border border-gold/15 bg-panel/30 p-5 mt-3">
                {activeTab === "pyramid" && (
                  <div className="space-y-4">
                    {[
                      { label: "Top Notes (0–2 Hours)", list: product.notes.top },
                      { label: "Heart Notes (2–8 Hours)", list: product.notes.heart },
                      { label: "Base Notes (8–14+ Hours)", list: product.notes.base },
                    ].map((section) => (
                      <div key={section.label} className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gold-light block">
                          {section.label}
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {section.list.map((n) => (
                            <div key={n.name} className="rounded-xl border border-gold/10 bg-ink/50 p-2.5">
                              <strong className="text-xs text-cream block">{n.name}</strong>
                              <span className="text-[11px] text-sand/70">{n.desc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "provenance" && (
                  <div className="space-y-3">
                    <h4 className="font-display text-lg font-semibold text-gold-light">
                      Geographic Provenance & Extraction
                    </h4>
                    <p className="text-xs text-sand/80 leading-relaxed">
                      Sourced from <strong className="text-cream">{product.origin}</strong>. Every batch is certified under CITES regulations and hydro-distilled in traditional copper alembics for twelve weeks before resting in French oak casks.
                    </p>
                  </div>
                )}

                {activeTab === "ritual" && (
                  <div className="space-y-3">
                    <h4 className="font-display text-lg font-semibold text-gold-light">
                      The 10-Second Pulse Ritual
                    </h4>
                    <p className="text-xs text-sand/80 leading-relaxed">
                      Unscrew the glass wand and let one single droplet touch your pulse points (inner wrist, neck hollow, or behind ears). Press gently together; never rub, as friction crushes delicate top notes.
                    </p>
                  </div>
                )}

                {activeTab === "layering" && (
                  <div className="space-y-3">
                    <h4 className="font-display text-lg font-semibold text-gold-light">
                      Pairing: {product.layeringPartner}
                    </h4>
                    <p className="text-xs text-sand/80 leading-relaxed">
                      {product.layeringTip}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Verified Reviews Section */}
        {relevantReviews.length > 0 && (
          <section className="mt-24 border-t border-gold/15 pt-16">
            <h3 className="font-display text-3xl font-medium text-cream text-center">
              Patron Experiences with {product.name}
            </h3>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {relevantReviews.map((rev, i) => (
                <div key={i} className="glass-card rounded-3xl p-6 space-y-4">
                  <Stars />
                  <blockquote className="font-display text-lg text-cream leading-relaxed">
                    "{rev.quote}"
                  </blockquote>
                  <div className="flex items-center justify-between border-t border-gold/10 pt-3 text-xs text-sand/60">
                    <span className="font-bold text-cream flex items-center gap-1.5">
                      {rev.name} <BadgeCheck className="h-4 w-4 text-emerald-400" />
                    </span>
                    <span>{rev.role} · {rev.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Fragrances Carousel */}
        <section className="mt-24 border-t border-gold/15 pt-16">
          <div className="flex items-center justify-between">
            <div>
              <span className="eyebrow">Complementary Extraits</span>
              <h3 className="font-display text-3xl font-medium text-cream mt-1">
                You May Also Cherish
              </h3>
            </div>
            <Link to="/collection" className="btn-ghost hidden sm:inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold uppercase">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {relatedProducts.map((rel) => (
              <Link
                key={rel.id}
                to={`/product/${rel.id}`}
                className="glass-card group block rounded-3xl p-4 transition-all hover:border-gold/40 hover:-translate-y-1"
              >
                <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-gold/20 bg-ink">
                  <img
                    src={rel.image}
                    alt={rel.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-display text-xl font-semibold text-cream group-hover:text-gold-light transition-colors">
                      {rel.name}
                    </h4>
                    <span className="text-[10px] text-sand/60 uppercase">{rel.family}</span>
                  </div>
                  <span className="font-display text-lg font-bold text-gold-light">
                    ${rel.price}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
