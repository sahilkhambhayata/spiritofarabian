import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2,
} from "lucide-react";
import { PRODUCTS, type CartItem, type Product, type ProductSize } from "../data";
import { Reveal } from "../components/ui";

const ATTAR_SIZES = [
  { id: "8ml", volume: "8ml", label: "8ml Artisanal Flacon", multiplier: 0.72 },
  { id: "10ml", volume: "10ml", label: "10ml Collector Flacon", multiplier: 0.86 },
  { id: "12ml", volume: "12ml", label: "12ml Imperial Extrait", multiplier: 1.0 },
];

/**
 * Continuous Smooth Fluid Waves:
 * Multi-layered, organic SVG silk waves moving smoothly in opposing directions with gradient fills.
 */
function SmoothSilkWaveBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* 1. Primary Bottom Emerald Silk Wave */}
      <motion.div
        animate={{
          x: ["0%", "-50%"],
          y: [0, -14, 0],
        }}
        transition={{
          x: { duration: 22, repeat: Infinity, ease: "linear" },
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute bottom-0 left-0 w-[200%] h-[380px] sm:h-[500px] opacity-25"
      >
        <svg
          viewBox="0 0 2880 320"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <defs>
            <linearGradient id="wave1-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0a3d2e" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#0f5440" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0a3d2e" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          <path
            fill="url(#wave1-grad)"
            d="M0,160 C360,280 480,40 720,160 C960,280 1080,40 1440,160 C1800,280 1920,40 2160,160 C2520,280 2640,40 2880,160 L2880,320 L0,320 Z"
          />
        </svg>
      </motion.div>

      {/* 2. Secondary Champagne Gold & Jade Flowing Wave */}
      <motion.div
        animate={{
          x: ["-50%", "0%"],
          y: [0, 18, 0],
        }}
        transition={{
          x: { duration: 28, repeat: Infinity, ease: "linear" },
          y: { duration: 8, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute bottom-0 left-0 w-[200%] h-[320px] sm:h-[440px] opacity-20"
      >
        <svg
          viewBox="0 0 2880 320"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <defs>
            <linearGradient id="wave2-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d4af37" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#d4af37" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <path
            fill="url(#wave2-grad)"
            d="M0,224 C400,100 520,290 720,224 C920,160 1040,290 1440,224 C1840,160 1960,290 2160,224 C2360,160 2480,290 2880,224 L2880,320 L0,320 Z"
          />
        </svg>
      </motion.div>

      {/* 3. Top Inverted Subtle Mist Wave */}
      <motion.div
        animate={{
          x: ["0%", "-50%"],
          y: [0, 12, 0],
        }}
        transition={{
          x: { duration: 32, repeat: Infinity, ease: "linear" },
          y: { duration: 7, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute top-0 left-0 w-[200%] h-[260px] sm:h-[360px] opacity-15 rotate-180"
      >
        <svg
          viewBox="0 0 2880 320"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <defs>
            <linearGradient id="wave3-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d4af37" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#0a3d2e" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#d4af37" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path
            fill="url(#wave3-grad)"
            d="M0,192 C420,80 540,270 720,192 C900,110 1020,270 1440,192 C1860,110 1980,270 2160,192 C2340,110 2460,270 2880,192 L2880,320 L0,320 Z"
          />
        </svg>
      </motion.div>
    </div>
  );
}

export default function CartPage({
  items,
  onUpdateQty,
  onRemoveItem,
  onAddProduct,
  onCheckout,
  discountPercent = 0,
}: {
  items: CartItem[];
  onUpdateQty: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  onAddProduct?: (product: Product, size?: ProductSize) => void;
  onCheckout: () => void;
  discountPercent?: number;
  onApplyPromo?: (code: string) => boolean;
  selectedSample?: string;
  onSelectSample?: (id: string) => void;
}) {
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const total = Math.max(0, subtotal - discountAmount);

  // Filter recommendations to show attars not currently in the bag
  const recommendedProducts = useMemo(() => {
    const candidate = PRODUCTS.filter(
      (p) => !items.some((item) => item.productId === p.id)
    );
    return candidate.slice(0, 4);
  }, [items]);

  const handleSelectSize = (productId: string, sizeId: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: sizeId }));
  };

  const getProductActiveSize = (productId: string) => {
    const sizeId = selectedSizes[productId] || "12ml";
    return ATTAR_SIZES.find((s) => s.id === sizeId) || ATTAR_SIZES[2];
  };

  const getProductPrice = (product: Product, size: typeof ATTAR_SIZES[0]) => {
    return Math.round(product.price * size.multiplier);
  };

  const handleAddRecommended = (product: Product) => {
    if (onAddProduct) {
      const activeSize = getProductActiveSize(product.id);
      const customSize: ProductSize = {
        id: activeSize.id,
        label: `${activeSize.volume} Imperial Extrait`,
        volume: activeSize.volume,
        price: getProductPrice(product, activeSize),
      };
      onAddProduct(product, customSize);

      // Smoothly scroll back to top of the page so the user sees the updated cart items
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen pt-24 sm:pt-28 pb-14 text-cream bg-[#041d14] overflow-hidden">
      {/* Continuous Smooth Fluid Silk Waves */}
      <SmoothSilkWaveBackground />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs text-sand/60">
          <Link to="/" className="hover:text-gold-light transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/collection" className="hover:text-gold-light transition-colors">
            Collection
          </Link>
          <span>/</span>
          <span className="text-cream font-medium">Your Shopping Bag</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 border border-white/10 text-gold-light">
              <ShoppingBag className="h-4.5 w-4.5" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-medium tracking-tight text-cream">
                Imperial Shopping Bag
              </h1>
              <p className="text-xs text-sand/70 mt-0.5">
                {itemCount === 0
                  ? "Your bag is currently empty"
                  : `${itemCount} item${itemCount === 1 ? "" : "s"} selected for artisan preparation`}
              </p>
            </div>
          </div>

          <Link
            to="/collection"
            className="inline-flex items-center gap-1.5 text-xs text-sand/80 hover:text-gold-light transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Continue Exploring Collection</span>
          </Link>
        </div>

        {items.length === 0 ? (
          /* Empty State */
          <Reveal>
            <div className="flex flex-col items-center justify-center text-center py-16 px-4 max-w-lg mx-auto">
              <div className="grid h-18 w-18 place-items-center rounded-3xl border border-white/10 bg-white/[0.02] text-sand/40 mb-5">
                <ShoppingBag className="h-9 w-9 stroke-[1.2]" />
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-medium text-cream">
                Your Bag is Currently Empty
              </h2>
              <p className="mt-2.5 text-sm text-sand/70 leading-relaxed max-w-sm">
                Explore our collection of pure attar extraits, distilled over twelve weeks without alcohol.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <Link
                  to="/collection"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-cream px-8 py-3.5 text-xs uppercase tracking-widest font-black text-[#041d14] hover:bg-white hover:shadow-xl transition-all"
                >
                  <span>Explore Masterpieces</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/discovery"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-xs uppercase tracking-widest font-semibold text-cream hover:bg-white/10 transition-all"
                >
                  <span>Try Discovery Coffret ($59)</span>
                </Link>
              </div>
            </div>
          </Reveal>
        ) : (
          /* Active Cart Layout */
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Column: Items (7 or 8 cols) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              {/* Items List */}
              <div className="rounded-2xl border border-white/10 bg-[#041d14]/75 backdrop-blur-md divide-y divide-white/5 overflow-hidden shadow-xl">
                <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-sand/60 bg-black/20">
                  <div className="col-span-6">Attar Selection</div>
                  <div className="col-span-3 text-center">Quantity</div>
                  <div className="col-span-3 text-right">Total</div>
                </div>

                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="p-4 sm:p-5 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                        {/* Product Detail */}
                        <div className="sm:col-span-6 flex items-center gap-3.5">
                          <div className="relative h-18 w-18 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#03140e]">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <Link
                              to={`/product/${item.productId}`}
                              className="font-display text-base sm:text-lg font-semibold text-cream hover:text-gold-light transition-colors truncate block"
                            >
                              {item.name}
                            </Link>
                            <p className="text-xs text-sand/70 mt-0.5">
                              {item.sizeLabel || item.volume || "12ml Extrait"}
                            </p>
                            <p className="text-xs font-mono text-sand/60 mt-0.5">
                              ${item.price} each
                            </p>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="sm:col-span-3 flex items-center justify-between sm:justify-center gap-4">
                          <div className="flex items-center rounded-xl border border-white/15 bg-black/30 px-1.5 py-1">
                            <button
                              type="button"
                              onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                              className="h-6.5 w-6.5 grid place-items-center rounded-lg text-sand/80 hover:text-cream hover:bg-white/10 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-cream font-mono">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                              className="h-6.5 w-6.5 grid place-items-center rounded-lg text-sand/80 hover:text-cream hover:bg-white/10 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          {/* Mobile-only Total */}
                          <span className="sm:hidden font-display text-base font-semibold text-cream">
                            ${item.price * item.quantity}
                          </span>
                        </div>

                        {/* Line Total & Remove */}
                        <div className="sm:col-span-3 flex items-center justify-end gap-3.5">
                          <span className="hidden sm:block font-display text-base sm:text-lg font-semibold text-cream">
                            ${item.price * item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            className="text-sand/40 hover:text-rose-400 p-2 transition-colors rounded-lg hover:bg-white/5"
                            title="Remove from bag"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Column: Order Summary (5 or 4 cols) */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="rounded-2xl border border-white/15 bg-[#041d14]/85 backdrop-blur-md p-5 space-y-4 shadow-xl">
                <h2 className="font-display text-lg font-medium text-cream pb-3 border-b border-white/10">
                  Order Summary
                </h2>

                {/* Line Items */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-sand">
                    <span>Subtotal ({itemCount} item{itemCount === 1 ? "" : "s"})</span>
                    <span className="font-semibold text-cream">${subtotal}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>VIP Privilege Savings ({discountPercent}%)</span>
                      <span>-${discountAmount}</span>
                    </div>
                  )}

                  <div className="flex items-baseline justify-between pt-3 border-t border-white/10 text-sm">
                    <span className="font-display text-base font-medium text-cream">Total Amount</span>
                    <span className="font-display text-xl font-bold text-cream">
                      ${total}
                    </span>
                  </div>
                </div>

                {/* Checkout CTA Button */}
                <button
                  type="button"
                  onClick={onCheckout}
                  className="group relative w-full flex items-center justify-center gap-3 rounded-full bg-cream px-6 py-3.5 text-xs font-black uppercase tracking-[0.18em] text-[#041d14] shadow-[0_4px_25px_rgba(253,250,242,0.2)] hover:bg-white hover:shadow-[0_6px_30px_rgba(253,250,242,0.35)] transition-all active:scale-[0.99]"
                >
                  <span>Proceed to Secure Checkout</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── YOU MAY ALSO LIKE SECTION ─── */}
        {recommendedProducts.length > 0 && (
          <div className="mt-8 sm:mt-10 pt-6 border-t border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
              <div>
                <span className="eyebrow flex items-center gap-2 text-xs">
                  <Sparkles className="h-3.5 w-3.5 text-gold/80" />
                  You May Also Like
                </span>
                <h2 className="font-display text-xl sm:text-2xl font-medium text-cream mt-1">
                  Curated Olfactory Masterpieces
                </h2>
                <p className="text-xs text-sand/70 mt-0.5 max-w-lg">
                  Hand-selected pure extraits that harmonize effortlessly with your collection.
                </p>
              </div>

              <Link
                to="/collection"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-sand/80 hover:text-gold-light transition-colors"
              >
                <span>View Full Catalog</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Recommendations Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendedProducts.map((product) => {
                const activeSize = getProductActiveSize(product.id);
                const activePrice = getProductPrice(product, activeSize);

                return (
                  <div
                    key={product.id}
                    className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#041d14]/75 backdrop-blur-md p-3.5 transition-all duration-300 hover:border-white/25 hover:bg-[#041d14]/90 hover:shadow-xl"
                  >
                    <div>
                      {/* Image Container */}
                      <Link
                        to={`/product/${product.id}`}
                        className="relative block aspect-square w-full overflow-hidden rounded-xl border border-white/10 bg-[#03140e]"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        {product.isTopSelling && (
                          <span className="absolute top-2.5 left-2.5 rounded-full border border-white/15 bg-black/70 px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-gold-light backdrop-blur-md">
                            Best Seller
                          </span>
                        )}
                      </Link>

                      {/* Content */}
                      <div className="mt-3 space-y-0.5">
                        <Link
                          to={`/product/${product.id}`}
                          className="font-display text-sm font-semibold text-cream hover:text-gold-light transition-colors truncate block"
                        >
                          {product.name}
                        </Link>
                        <p className="text-[11px] text-sand/70 truncate">
                          {product.scentType || product.category}
                        </p>
                      </div>

                      {/* 8ml / 10ml / 12ml Size Selector */}
                      <div className="mt-2.5 pt-2 border-t border-white/5">
                        <div className="flex items-center justify-between text-[10px] text-sand/60 mb-1.5 font-medium">
                          <span>Select Size:</span>
                          <span className="text-cream font-semibold">{activeSize.volume}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1 rounded-lg bg-black/30 p-1 border border-white/10">
                          {ATTAR_SIZES.map((size) => {
                            const isSelected = activeSize.id === size.id;
                            return (
                              <button
                                key={size.id}
                                type="button"
                                onClick={() => handleSelectSize(product.id, size.id)}
                                className={`py-1 text-center rounded-md text-[10.5px] font-bold transition-all ${
                                  isSelected
                                    ? "bg-cream text-[#041d14] shadow-sm font-black"
                                    : "text-sand/70 hover:text-cream hover:bg-white/5"
                                }`}
                              >
                                {size.volume}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Pricing & Add to Bag CTA */}
                    <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between gap-2">
                      <div>
                        <span className="font-display text-base font-bold text-cream">
                          ${activePrice}
                        </span>
                        <span className="text-[10px] text-sand/50 block font-mono">
                          {activeSize.volume} Extrait
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddRecommended(product)}
                        className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-cream hover:bg-cream hover:text-[#041d14] hover:shadow transition-all"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add to Bag</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
