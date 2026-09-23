import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import BannerSlider from "../components/BannerSlider";
import SocialProof from "../components/SocialProof";
import Testimonials from "../components/Testimonials";
import { PRODUCTS, type Product, type ProductSize } from "../data";
import { Reveal } from "../components/ui";

export default function HomePage({
  onAddProduct,
}: {
  onAddProduct: (product: Product, size?: ProductSize) => void;
  onOpenQuiz?: () => void;
}) {
  const scrollToCollection = () => {
    const el = document.getElementById("featured-collection");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* 0. Full-Width Promotional Banners & Video Slider (Title and Description Only) */}
      <BannerSlider onShop={scrollToCollection} />

      {/* 1. Press Accolades & Social Proof Ticker */}
      <SocialProof />

      {/* 2. Signature Extraits Portfolio (Top Selling Products Grid) */}
      <section id="featured-collection" className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 border-b border-white/10 pb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sand/70 mb-2">
                Curated Collection
              </p>
              <h2 className="font-display text-3xl sm:text-5xl font-medium text-cream tracking-tight">
                Top Selling <em className="italic text-sand font-normal">Imperial Extraits</em>
              </h2>
              <p className="mt-3 text-sm text-sand/80 max-w-2xl leading-relaxed">
                Hydro-distilled pure botanical oils. 0% alcohol, lipid-bound to bloom dynamically with your body warmth.
              </p>
            </div>
            <Link
              to="/collection"
              className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-panel/40 px-7 py-3.5 text-xs font-bold uppercase tracking-widest text-cream hover:border-gold hover:text-gold-light hover:bg-panel transition-all shrink-0 self-start sm:self-auto shadow-md"
            >
              <span>View Full Collection (24)</span>
              <ArrowRight className="h-4 w-4 text-gold" />
            </Link>
          </div>

          {/* Product Listing Grid: Price, Category, ML, Scent Type without golden labels */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PRODUCTS.slice(0, 8).map((product, i) => (
              <Reveal key={product.id} delay={i * 0.06}>
                <div className="group flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-panel/30 p-4 text-cream transition-all duration-300 hover:border-white/25 hover:bg-panel/60 hover:-translate-y-1 shadow-lg">
                  <div>
                    {/* Clean Product Image Container */}
                    <Link
                      to={`/product/${product.id}`}
                      className="relative block aspect-[4/4.5] overflow-hidden rounded-xl bg-ink-2 border border-white/5"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </Link>

                    {/* Meta Details: Category, Scent Type, Name */}
                    <div className="mt-4 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-sand/60">
                        <span className="font-semibold uppercase tracking-wider">{product.category}</span>
                        <span>{product.ml || "12ml"}</span>
                      </div>

                      <h3 className="font-display text-xl font-semibold text-cream group-hover:text-white transition-colors">
                        <Link to={`/product/${product.id}`}>{product.name}</Link>
                      </h3>

                      <div className="text-xs text-sand/80 line-clamp-1 pt-0.5">
                        <span className="text-sand/50 font-medium">Scent Type: </span>
                        <span>{product.scentType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Action Row */}
                  <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-2xl font-bold text-cream">
                          ${product.price}
                        </span>
                        {product.compareAt && (
                          <span className="text-xs text-sand/40 line-through">
                            ${product.compareAt}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onAddProduct(product)}
                      className="rounded-full border border-white/20 bg-panel px-4 py-2 text-xs font-bold uppercase tracking-wider text-cream hover:bg-white hover:text-ink transition-colors shadow"
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

      {/* 3. Verified Patron Testimonials & Reviews Carousel */}
      <Testimonials />

    </div>
  );
}
