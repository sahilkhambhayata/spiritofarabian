import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Droplets,
  Filter,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  X,
  Loader2,
} from "lucide-react";
import { PRODUCTS, type Product, type ProductSize } from "../data";
import { cn } from "../utils/cn";
import { productService, type ProductDocument } from "../services/productService";
import { categoryService, type CategoryDocument } from "../services/categoryService";

const PRICE_RANGES = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under ₹1,500", min: 0, max: 1500 },
  { label: "₹1,500 – ₹3,000", min: 1500, max: 3000 },
  { label: "₹3,000 – ₹5,000", min: 3000, max: 5000 },
  { label: "₹5,000+", min: 5000, max: Infinity },
];

export default function CollectionPage({
  onAddProduct,
}: {
  onAddProduct: (product: Product, size?: ProductSize) => void;
}) {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [categories, setCategories] = useState<string[]>(["All Extraits"]);
  const [dynamicProducts, setDynamicProducts] = useState<Product[]>(PRODUCTS);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Extraits");
  const [selectedPriceRange, setSelectedPriceRange] = useState(PRICE_RANGES[0]);
  const [sortBy, setSortBy] = useState<"top-selling" | "price-asc" | "price-desc" | "rating" | "intensity">("top-selling");
  const [selectedSizes, setSelectedSizes] = useState<Record<string, number>>({});
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  // Sync category param from URL
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  // Load dynamic categories & products from MongoDB Atlas
  useEffect(() => {
    let isMounted = true;
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const [catsRes, prodsRes] = await Promise.allSettled([
          categoryService.getCategories(),
          productService.getProducts({ limit: 50 }),
        ]);

        if (isMounted) {
          if (catsRes.status === "fulfilled" && Array.isArray(catsRes.value)) {
            const catNames = ["All Extraits", ...catsRes.value.map((c: CategoryDocument) => c.name)];
            setCategories(catNames);
          }

          if (prodsRes.status === "fulfilled" && prodsRes.value?.products?.length > 0) {
            const mapped: Product[] = prodsRes.value.products.map((doc: ProductDocument) => {
              const defaultVariant = doc.variants?.find((v) => v.isDefault) || doc.variants?.[0];
              const primaryImg = doc.images?.find((img) => img.isPrimary)?.url || doc.images?.[0]?.url || "/images/cambodian-oud.jpg";

              const sizesFormatted = (doc.variants || []).map((v) => ({
                id: v._id || `${doc.slug}-${v.size}ml`,
                ml: `${v.size}${v.unit}`,
                volume: `${v.size}${v.unit}`,
                price: v.price,
                compareAt: v.compareAtPrice || undefined,
                label: v.label || `${v.size}${v.unit} Flacon`,
              }));

              // If no variants, fallback
              if (sizesFormatted.length === 0) {
                sizesFormatted.push({
                  id: `${doc.slug}-6ml`,
                  ml: "6ml",
                  volume: "6ml",
                  price: 1999,
                  compareAt: undefined,
                  label: "6ml Royal Bottle",
                });
              }

              return {
                id: doc.slug,
                name: doc.name,
                arabicName: doc.arabicName || "عطر فاخر",
                category: (doc.category?.name || "Pure Royal Ouds") as any,
                price: defaultVariant?.price || sizesFormatted[0].price,
                compareAt: defaultVariant?.compareAtPrice || undefined,
                rating: doc.rating?.average || 4.9,
                reviewsCount: doc.rating?.count || 48,
                badge: doc.badge || (doc.isBestSeller ? "Grand Reserve" : undefined),
                isTopSelling: Boolean(doc.isBestSeller || doc.isFeatured),
                salesRank: doc.isBestSeller ? 1 : 10,
                scentType: doc.fragrance?.family || "Imperial Attar",
                ml: defaultVariant ? `${defaultVariant.size}${defaultVariant.unit}` : "6ml",
                sizes: sizesFormatted,
                image: primaryImg,
                gallery: (doc.images || []).map((im) => im.url),
                intensity: doc.fragrance?.intensity === "Very Strong" ? 5 : 4,
                notes: {
                  top: (doc.notes?.top || ["Golden Saffron"]).map((n) => ({ name: n, desc: "Pure Extract" })),
                  heart: (doc.notes?.heart || ["Aged Leather"]).map((n) => ({ name: n, desc: "Alembic Distillate" })),
                  base: (doc.notes?.base || ["Wild Cambodian Oud"]).map((n) => ({ name: n, desc: "Aged Resin" })),
                },
                description: doc.description || doc.shortDescription || "",
                longevity: doc.fragrance?.longevity || "18+ Hours",
                sillage: doc.fragrance?.sillage || "Enormous",
                occasion: doc.fragrance?.suitableFor?.join(", ") || "Royal Evenings & Special Occasions",
                story: doc.tagline || doc.description,
              };
            });

            setDynamicProducts(mapped);
          }
        }
      } catch (err) {
        console.warn("[CollectionPage] Fallback to local product list:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter products by search query, category, and price range
  const filtered = useMemo(() => {
    return dynamicProducts.filter((p) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const topNotes = p.notes.top.map((n) => `${n.name} ${n.desc}`).join(" ");
        const heartNotes = p.notes.heart.map((n) => `${n.name} ${n.desc}`).join(" ");
        const baseNotes = p.notes.base.map((n) => `${n.name} ${n.desc}`).join(" ");

        const searchBlob = [
          p.name,
          p.arabicName,
          p.category,
          p.scentType,
          p.description,
          p.story,
          p.ml,
          topNotes,
          heartNotes,
          baseNotes,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchBlob.includes(q)) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== "All Extraits" && p.category !== selectedCategory) {
        return false;
      }

      // Price filter
      if (p.price < selectedPriceRange.min || p.price > selectedPriceRange.max) {
        return false;
      }

      return true;
    });
  }, [dynamicProducts, searchQuery, selectedCategory, selectedPriceRange]);

  // Sort products
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === "top-selling") {
        return (a.salesRank ?? 999) - (b.salesRank ?? 999);
      }
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
      if (sortBy === "intensity") return (b.intensity ?? 4) - (a.intensity ?? 4);
      return 0;
    });
  }, [filtered, sortBy]);

  const handleSizeChange = (productId: string, sizeIdx: number) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: sizeIdx }));
  };

  const handleAdd = (product: Product) => {
    const sizeIdx = selectedSizes[product.id] ?? 0;
    const size = product.sizes[sizeIdx] || product.sizes[0];
    onAddProduct(product, size);

    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Extraits");
    setSelectedPriceRange(PRICE_RANGES[0]);
    setSortBy("top-selling");
  };

  return (
    <div className="relative pt-24 sm:pt-28 pb-24 sm:pb-32 min-h-screen">
      {/* High-Performance Lightweight Ambient Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        {/* Deep Royal Emerald Radial Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(14,68,52,0.65),rgba(4,29,20,0.98)_80%)]" />
        
        {/* Soft Golden Glow Top Center */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[450px] w-[900px] max-w-full rounded-full bg-gradient-to-b from-gold/15 to-transparent blur-[100px] opacity-70" />

        {/* Subtle Lattice Texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #fdfaf2 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-sand/60">
          <Link to="/" className="hover:text-cream transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-cream font-semibold">
            The Royal Collection ({sorted.length} Extraits)
          </span>
        </nav>

        {/* Page Hero Header */}
        <div className="relative max-w-3xl">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-gold-light mb-4 shadow-sm backdrop-blur-sm">
            <Sparkles className="h-3 w-3 text-gold" />
            <span>The Imperial Portfolio</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-cream leading-[1.1]">
            The Complete Collection of{" "}
            <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-sand via-gold-light to-cream">
              Pure Extraits.
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-sand/75 leading-relaxed max-w-2xl font-normal">
            Distilled without alcohol over twelve weeks in antique copper alembic stills.
            Lipid-bound botanical fragrance oils crafted to bloom uniquely with your personal warmth.
          </p>
        </div>

        {/* Search & Filter Header Bar */}
        <div className="mt-8 relative max-w-2xl">
          <div className="relative flex items-center group">
            <Search className="absolute left-4 h-4 w-4 text-sand/60 transition-colors group-focus-within:text-gold pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by extrait name, category, note (e.g. Saffron, Agarwood, Amber), or scent family..."
              className="w-full rounded-2xl border border-white/15 bg-panel/60 pl-11 pr-11 py-3.5 text-xs sm:text-sm text-cream placeholder-sand/45 backdrop-blur-md focus:border-gold/50 focus:bg-panel/90 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all shadow-lg"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 grid h-6 w-6 place-items-center rounded-full text-sand/60 hover:text-cream hover:bg-white/10 transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category, Price & Sort Controls Bar */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-panel/40 p-4 sm:p-5 backdrop-blur-md space-y-4 shadow-xl">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sand/60 mr-1 hidden sm:inline">
              Category:
            </span>
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "relative rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200",
                    active
                      ? "bg-white text-ink font-black shadow-[0_2px_12px_rgba(255,255,255,0.25)] scale-102"
                      : "border border-white/15 bg-ink-2/60 text-sand/80 hover:border-white/30 hover:text-cream hover:bg-ink-2/90"
                  )}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Price Range & Sort Selector Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-3 border-t border-white/10">
            {/* Price Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sand/60 mr-1 hidden sm:inline">
                Price:
              </span>
              {PRICE_RANGES.map((range) => {
                const active = selectedPriceRange.label === range.label;
                return (
                  <button
                    key={range.label}
                    type="button"
                    onClick={() => setSelectedPriceRange(range)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs transition-all duration-200",
                      active
                        ? "bg-gold/20 text-gold-light font-bold border border-gold/40 shadow-sm"
                        : "border border-white/10 bg-ink-2/40 text-sand/70 hover:border-white/20 hover:text-cream"
                    )}
                  >
                    {range.label}
                  </button>
                );
              })}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <span className="text-xs text-sand/60 flex items-center gap-1.5 font-semibold">
                <Filter className="h-3.5 w-3.5 text-gold" /> Sort By:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="field rounded-xl px-3.5 py-1.5 text-xs font-semibold text-cream bg-ink-2/90 border border-white/20 hover:border-gold/40 focus:border-gold focus:outline-none cursor-pointer transition-colors"
              >
                <option value="top-selling" className="bg-ink text-cream">
                  Top Selling First
                </option>
                <option value="price-asc" className="bg-ink text-cream">
                  Price: Low to High
                </option>
                <option value="price-desc" className="bg-ink text-cream">
                  Price: High to Low
                </option>
                <option value="rating" className="bg-ink text-cream">
                  Highest Customer Rating
                </option>
                <option value="intensity" className="bg-ink text-cream">
                  Highest Sillage Intensity
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter & Active Filter Indicators */}
        <div className="mt-4 flex items-center justify-between text-xs text-sand/60 px-1">
          <span>
            Showing <strong className="text-cream font-bold">{sorted.length}</strong> of{" "}
            {dynamicProducts.length} imperial extraits
          </span>
          {(searchQuery ||
            selectedCategory !== "All Extraits" ||
            selectedPriceRange.label !== "All Prices") && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-gold hover:text-gold-light underline transition-colors font-medium"
            >
              Reset All Filters
            </button>
          )}
        </div>

        {/* Loading Spinner */}
        {loading && dynamicProducts.length === 0 && (
          <div className="py-24 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gold mx-auto mb-4" />
            <p className="font-serif text-sm text-sand/80">Loading Imperial Catalog...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && sorted.length === 0 && (
          <div className="my-16 text-center space-y-4 py-16 px-6 rounded-3xl border border-white/10 bg-panel/30 backdrop-blur-md shadow-2xl">
            <div className="grid h-16 w-16 mx-auto place-items-center rounded-full border border-gold/30 bg-gold/10 text-gold">
              <Search className="h-8 w-8" />
            </div>
            <p className="font-display text-2xl text-cream">No extraits matched your search criteria.</p>
            <p className="text-xs text-sand/70 max-w-md mx-auto leading-relaxed">
              Try adjusting your search terms, selecting a broader category, or resetting the price filters.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-xs uppercase tracking-widest font-black text-ink hover:bg-cream hover:shadow-lg transition-all"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* All Products Grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sorted.map((product) => {
            const sizeIdx = selectedSizes[product.id] ?? 0;
            const currentSize = product.sizes[sizeIdx] || product.sizes[0];
            const isAdded = addedIds[product.id];

            return (
              <div
                key={product.id}
                className="group relative flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-panel/40 p-4 text-cream backdrop-blur-md transition-all duration-300 hover:border-gold/40 hover:bg-panel/70 hover:shadow-[0_12px_35px_rgba(0,0,0,0.35)] hover:-translate-y-1"
              >
                <div>
                  {/* Product Image Box */}
                  <Link
                    to={`/product/${product.id}`}
                    className="relative block aspect-[4/4.5] overflow-hidden rounded-xl bg-ink-2 border border-white/10"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />

                    {/* Hover Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Top Selling floating badge */}
                    {product.badge && (
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full border border-gold/40 bg-ink-2/90 px-2.5 py-0.5 text-[10px] font-bold text-gold-light backdrop-blur-md shadow">
                        <Sparkles className="h-2.5 w-2.5 text-gold" />
                        <span>{product.badge}</span>
                      </div>
                    )}

                    {/* Sillage Intensity Dots on Hover */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[10px] text-cream opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="font-semibold text-sand/90">Sillage Intensity</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((lvl) => (
                          <span
                            key={lvl}
                            className={cn(
                              "h-1.5 w-1.5 rounded-full transition-colors",
                              lvl <= product.intensity ? "bg-gold" : "bg-white/20"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </Link>

                  {/* Meta Details */}
                  <div className="mt-4 space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-sand/60">
                        <span className="font-semibold uppercase tracking-wider text-sand/80 truncate max-w-[150px]">
                          {product.category}
                        </span>
                        <span className="font-medium text-gold/80 shrink-0">{currentSize.volume || currentSize.ml} Extrait</span>
                      </div>

                      <h3 className="mt-1 font-display text-xl font-semibold text-cream group-hover:text-white transition-colors leading-snug line-clamp-1">
                        <Link to={`/product/${product.id}`}>{product.name}</Link>
                      </h3>

                      <div className="text-xs text-sand/80 line-clamp-1 mt-0.5">
                        <span className="text-sand/50 font-medium">Scent Family: </span>
                        <span>{product.scentType}</span>
                      </div>
                    </div>

                    {/* Size Selector Pills */}
                    <div className="mt-3 flex items-center gap-1.5 pt-1">
                      {product.sizes.map((s, sIdx) => (
                        <button
                          key={s.id || sIdx}
                          type="button"
                          onClick={() => handleSizeChange(product.id, sIdx)}
                          className={cn(
                            "flex-1 rounded-lg border py-1.5 text-center text-[10px] font-semibold transition-all duration-200 whitespace-nowrap",
                            sizeIdx === sIdx
                              ? "border-white bg-white/25 text-white font-bold shadow-sm"
                              : "border-white/10 bg-ink/40 text-sand/60 hover:border-white/20 hover:text-cream"
                          )}
                        >
                          {s.volume || s.ml}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Price & Action Row */}
                <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between gap-2">
                  <div className="shrink-0">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-display text-xl sm:text-2xl font-bold text-cream">
                        ₹{currentSize.price.toLocaleString("en-IN")}
                      </span>
                      {currentSize.compareAt && (
                        <span className="text-[11px] text-sand/40 line-through">
                          ₹{currentSize.compareAt.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleAdd(product)}
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-full px-3 sm:px-4 py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow whitespace-nowrap shrink-0",
                        isAdded
                          ? "bg-emerald-400 text-ink scale-105"
                          : "border border-white/20 bg-panel text-cream hover:bg-white hover:text-ink hover:scale-102 active:scale-98"
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
                      className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-panel/30 text-sand/70 hover:text-cream hover:border-white/30 hover:bg-white/10 shrink-0 transition-all"
                      title="View Details"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Assurance Metrics Footer */}
        <div className="mt-20 grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-white/10 pt-8 text-center text-xs text-sand/70">
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
