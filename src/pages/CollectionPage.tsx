import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Droplets, Filter, ShieldCheck, ShoppingBag, Sparkles, Truck } from "lucide-react";
import { PRODUCTS, type Product, type ProductSize } from "../data";
import { Reveal, SectionHead } from "../components/ui";
import { cn } from "../utils/cn";

const CATEGORIES = [
  "All Extraits",
  "Dark Woody / Oriental",
  "Floral Extrait / Honeyed Rose",
  "Luminous Musk / Clean Floral",
  "Amber Oriental / Gourmand Smoke",
];

export default function CollectionPage({
  onAddProduct,
}: {
  onAddProduct: (product: Product, size?: ProductSize) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState("All Extraits");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "intensity">("featured");
  const [selectedSizes, setSelectedSizes] = useState<Record<string, number>>({});
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const filtered = PRODUCTS.filter((p) => {
    if (selectedCategory === "All Extraits") return true;
    return p.family === selectedCategory;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "intensity") return b.intensity - a.intensity;
    return 0;
  });

  const handleSizeChange = (productId: string, sizeIdx: number) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: sizeIdx }));
  };

  const handleAdd = (product: Product) => {
    const sizeIdx = selectedSizes[product.id] ?? 1; // default 12ml
    const size = product.sizes[sizeIdx] || product.sizes[0];
    onAddProduct(product, size);

    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

  return (
    <div className="relative pt-28 pb-24 sm:pb-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-sand/60">
          <Link to="/" className="hover:text-gold-light transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gold-light font-semibold">The Royal Collection</span>
        </nav>

        {/* Page Header */}
        <SectionHead
          eyebrow="Maison Portfolio"
          title={
            <>
              The Royal Collection of <em className="gold-text font-semibold italic">Pure Extraits.</em>
            </>
          }
          copy="Distilled without alcohol over twelve weeks in antique copper stills. Lipid-bound botanical fragrance oils that evolve uniquely with your body heat."
        />

        {/* Filter & Sort Bar */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-4 border-y border-gold/15 py-4">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-bold transition-all uppercase tracking-wider",
                  selectedCategory === cat
                    ? "border border-gold bg-gold text-ink shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                    : "border border-gold/20 bg-panel/30 text-sand hover:border-gold/40 hover:text-cream"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            <span className="text-xs text-sand/60 flex items-center gap-1 font-semibold">
              <Filter className="h-3.5 w-3.5 text-gold" /> Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="field rounded-xl px-3 py-1.5 text-xs font-semibold text-cream cursor-pointer"
            >
              <option value="featured" className="bg-ink text-cream">Featured Architecture</option>
              <option value="price-asc" className="bg-ink text-cream">Price: Low to High</option>
              <option value="price-desc" className="bg-ink text-cream">Price: High to Low</option>
              <option value="intensity" className="bg-ink text-cream">Highest Sillage Intensity</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {sorted.map((product, i) => {
            const sizeIdx = selectedSizes[product.id] ?? 1;
            const currentSize = product.sizes[sizeIdx] || product.sizes[0];
            const isAdded = addedIds[product.id];

            return (
              <Reveal key={product.id} delay={i * 0.08}>
                <div className="glass-card group flex h-full flex-col justify-between rounded-3xl p-5 text-cream transition-all duration-300 hover:border-gold/40 hover:-translate-y-1">
                  <div>
                    {/* Image Link */}
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
                      <span className="absolute bottom-3 right-3 rounded-full bg-ink/80 backdrop-blur-md border border-gold/20 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold-light">
                        {product.longevityHours}
                      </span>
                    </Link>

                    {/* Meta info */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-gold/70">
                        <span>{product.family}</span>
                        <span>Intensity {product.intensity}/5</span>
                      </div>

                      <h3 className="font-display text-2xl font-semibold text-cream mt-1 group-hover:text-gold-light transition-colors">
                        <Link to={`/product/${product.id}`}>{product.name}</Link>
                      </h3>

                      <p className="mt-1 text-xs text-sand/75 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Notes tags */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {product.notes.heart.slice(0, 2).map((n) => (
                          <span
                            key={n.name}
                            className="rounded-lg border border-gold/15 bg-panel/40 px-2 py-0.5 text-[10px] text-sand"
                          >
                            {n.name}
                          </span>
                        ))}
                      </div>

                      {/* Size Selector */}
                      <div className="mt-4 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sand/60 block">
                          Flacon Size
                        </span>
                        <div className="grid grid-cols-3 gap-1.5">
                          {product.sizes.map((s, sIdx) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => handleSizeChange(product.id, sIdx)}
                              className={cn(
                                "rounded-xl border py-1.5 text-center text-[10px] font-bold transition-all",
                                sizeIdx === sIdx
                                  ? "border-gold bg-gold/20 text-gold-light shadow-[0_0_10px_rgba(212,175,55,0.2)]"
                                  : "border-gold/15 bg-ink/40 text-sand/70 hover:border-gold/30 hover:text-cream"
                              )}
                            >
                              {s.volume}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Add to Bag */}
                  <div className="mt-6 pt-4 border-t border-gold/15 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-2xl font-bold text-gold-light">
                          ${currentSize.price}
                        </span>
                        {currentSize.compareAt && (
                          <span className="text-xs text-sand/40 line-through">
                            ${currentSize.compareAt}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-semibold text-sand/60 uppercase">
                        {currentSize.label}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleAdd(product)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 rounded-full py-3 text-xs font-black uppercase tracking-wider transition-all",
                          isAdded ? "bg-emerald-400 text-ink" : "btn-gold"
                        )}
                      >
                        {isAdded ? (
                          <>
                            <Check className="h-3.5 w-3.5" strokeWidth={3} /> Added
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="h-3.5 w-3.5" /> Add to Bag
                          </>
                        )}
                      </button>

                      <Link
                        to={`/product/${product.id}`}
                        className="btn-ghost grid h-10 w-10 place-items-center rounded-full shrink-0"
                        title="View Full Details"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Discovery Ritual Promotion Banner */}
        <Reveal className="mt-16">
          <div className="glass-card flex flex-col md:flex-row items-center justify-between gap-6 rounded-3xl p-6 sm:p-10 border border-gold/30">
            <div className="space-y-2">
              <span className="eyebrow flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                Unsure Which Scent Fits Your Chemistry?
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-medium text-cream">
                Try The Discovery Ritual (5 × 2ml Vials)
              </h3>
              <p className="text-xs text-sand/80 max-w-xl">
                Experience all five signature extrait moods in 2ml crystal vials. The full $59 price is automatically credited toward any 12ml or 30ml flacon.
              </p>
            </div>
            <Link
              to="/discovery"
              className="btn-gold inline-flex items-center gap-2 rounded-full px-8 py-4 text-xs font-black uppercase tracking-widest shrink-0"
            >
              Order Discovery Set — $59
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>

        {/* Assurance Metrics Footer */}
        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3 border-t border-gold/15 pt-8 text-center text-xs text-sand/70">
          <div className="flex items-center justify-center gap-2">
            <Truck className="h-4 w-4 text-gold" /> Free Worldwide Express on Orders $95+
          </div>
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="h-4 w-4 text-gold" /> 30-Day Sillage & Longevity Guarantee
          </div>
          <div className="flex items-center justify-center gap-2">
            <Droplets className="h-4 w-4 text-gold" /> 100% Pure Botanical Concentrate · 0% Alcohol
          </div>
        </div>
      </div>
    </div>
  );
}
