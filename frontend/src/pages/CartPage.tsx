import { useMemo, useState, useEffect } from "react";
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
  Tag,
  Check,
  ShieldCheck,
  Truck,
  Loader2,
} from "lucide-react";
import { type CartItem, type Product, type ProductSize } from "../data";
import { Reveal } from "../components/ui";
import { productService, type ProductDocument } from "../services/productService";
import { couponService } from "../services/couponService";

const ATTAR_SIZES = [
  { id: "3ml", volume: "3ml", label: "3ml Travel Flacon", multiplier: 0.54 },
  { id: "6ml", volume: "6ml", label: "6ml Royal Bottle", multiplier: 1.0 },
  { id: "12ml", volume: "12ml", label: "12ml Imperial Extrait", multiplier: 1.78 },
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
  onApplyPromo,
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
  const [dynamicProducts, setDynamicProducts] = useState<Product[]>([]);
  
  // Promo code state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Fetch dynamic products from backend
  useEffect(() => {
    let isMounted = true;
    productService
      .getAll({ limit: 12 })
      .then((res) => {
        if (!isMounted) return;
        const mapped: Product[] = (res.products || []).map((doc: ProductDocument) => {
          const defaultVariant = doc.variants?.find((v) => v.isDefault) || doc.variants?.[0];
          const primaryImg = doc.images?.find((img) => img.isPrimary)?.url || doc.images?.[0]?.url || "/images/cambodian-oud.jpg";
          return {
            id: doc.slug,
            name: doc.name,
            subtitle: doc.subtitle || "Imperial Extrait de Parfum",
            tagline: doc.badge || "Pure Artisanal",
            category: doc.category?.name || "Pure Attar",
            scentType: doc.scentProfile?.intensity ? `${doc.scentProfile.intensity} Extrait` : "Pure Oil",
            price: defaultVariant?.price || 2799,
            rating: doc.rating?.average || 4.9,
            reviewsCount: doc.rating?.count || 48,
            image: primaryImg,
            isTopSelling: doc.isFeatured,
            description: doc.description,
            sizes: (doc.variants || []).map((v) => ({
              id: `${doc.slug}-${v.size}ml`,
              volume: `${v.size}${v.unit}`,
              price: v.price,
              label: v.label || `${v.size}${v.unit} Royal Flacon`,
            })),
          };
        });
        setDynamicProducts(mapped);
      })
      .catch((err) => console.error("Error fetching recommended products:", err));

    return () => {
      isMounted = false;
    };
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Calculate discount (from props discountPercent OR dynamic coupon)
  const propDiscount = Math.round((subtotal * discountPercent) / 100);
  const totalDiscount = Math.max(propDiscount, couponDiscount);
  
  // Free insured express shipping above ₹1,500
  const freeShippingThreshold = 1500;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const shippingFee = items.length > 0 ? (isFreeShipping ? 0 : 150) : 0;
  const grandTotal = Math.max(0, subtotal - totalDiscount + shippingFee);

  // Filter recommendations to show attars not currently in the bag
  const recommendedProducts = useMemo(() => {
    const candidate = dynamicProducts.filter(
      (p) => !items.some((item) => item.productId === p.id)
    );
    return candidate.slice(0, 4);
  }, [items, dynamicProducts]);

  const handleSelectSize = (productId: string, sizeId: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: sizeId }));
  };

  const getProductActiveSize = (productId: string) => {
    const sizeId = selectedSizes[productId] || "6ml";
    return ATTAR_SIZES.find((s) => s.id === sizeId) || ATTAR_SIZES[1];
  };

  const getProductPrice = (product: Product, size: typeof ATTAR_SIZES[0]) => {
    return Math.round(product.price * size.multiplier);
  };

  const handleAddRecommended = (product: Product) => {
    if (onAddProduct) {
      const activeSize = getProductActiveSize(product.id);
      const customSize: ProductSize = {
        id: `${product.id}-${activeSize.id}`,
        label: `${activeSize.volume} Imperial Extrait`,
        volume: activeSize.volume,
        price: getProductPrice(product, activeSize),
      };
      onAddProduct(product, customSize);

      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setIsValidatingCoupon(true);
    setCouponError(null);
    setCouponSuccess(null);

    try {
      const res = await couponService.validate(couponInput.trim(), subtotal);
      setAppliedCoupon(res.code);
      setCouponDiscount(res.discountAmount);
      setCouponSuccess(`Promo '${res.code}' applied! Saved ₹${res.discountAmount.toLocaleString("en-IN")}`);
      if (onApplyPromo) {
        onApplyPromo(res.code);
      }
    } catch (err: any) {
      setCouponError(err?.response?.data?.message || err?.message || "Invalid or expired promo code.");
      setAppliedCoupon(null);
      setCouponDiscount(0);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponInput("");
    setCouponSuccess(null);
    setCouponError(null);
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
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold/15 border border-gold/30 text-gold-light shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-medium tracking-tight text-cream">
                Imperial Shopping Bag
              </h1>
              <p className="text-xs text-sand/70 mt-0.5">
                {itemCount === 0
                  ? "Your bag is currently empty"
                  : `${itemCount} item${itemCount === 1 ? "" : "s"} selected for artisan hand-pouring & packaging`}
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
              <div className="grid h-20 w-20 place-items-center rounded-3xl border border-gold/30 bg-gold/[0.05] text-gold-light mb-5 shadow-[0_0_30px_rgba(212,175,55,0.15)]">
                <ShoppingBag className="h-10 w-10 stroke-[1.2]" />
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-medium text-cream">
                Your Bag is Currently Empty
              </h2>
              <p className="mt-2.5 text-sm text-sand/70 leading-relaxed max-w-sm">
                Explore our collection of pure attar extraits, distilled over twelve weeks without alcohol or synthetic fillers.
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
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-6 py-3.5 text-xs uppercase tracking-widest font-semibold text-cream hover:bg-gold/20 transition-all"
                >
                  <span>Try Discovery Coffret (₹2,999)</span>
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
                          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#03140e]">
                            <img
                              src={item.image || "/images/cambodian-oud.jpg"}
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
                              {item.sizeLabel || item.volume || "6ml Royal Bottle"}
                            </p>
                            <p className="text-xs font-mono text-gold-light mt-0.5 font-semibold">
                              ₹{item.price.toLocaleString("en-IN")} each
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
                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                          </span>
                        </div>

                        {/* Line Total & Remove */}
                        <div className="sm:col-span-3 flex items-center justify-end gap-3.5">
                          <span className="hidden sm:block font-display text-base sm:text-lg font-semibold text-cream">
                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
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

              {/* Free Shipping Progress Indicator */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex items-center gap-3">
                <Truck className="h-5 w-5 text-gold-light shrink-0" />
                <div className="flex-1 min-w-0">
                  {isFreeShipping ? (
                    <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5" />
                      Congratulations! Your order qualifies for Complimentary Insured Express Shipping.
                    </p>
                  ) : (
                    <div>
                      <p className="text-xs text-sand">
                        Add <strong className="text-gold-light">₹{(freeShippingThreshold - subtotal).toLocaleString("en-IN")}</strong> more to unlock <strong className="text-cream">Complimentary Express Shipping</strong> across India.
                      </p>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-black/40 overflow-hidden">
                        <div
                          className="h-full bg-gold transition-all duration-500 rounded-full"
                          style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary (5 or 4 cols) */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-4">
              <div className="rounded-2xl border border-gold/20 bg-[#041d14]/85 backdrop-blur-md p-5 space-y-4 shadow-xl">
                <h2 className="font-display text-lg font-medium text-cream pb-3 border-b border-white/10 flex items-center justify-between">
                  <span>Order Summary</span>
                  <ShieldCheck className="h-4 w-4 text-gold-light" />
                </h2>

                {/* Promo Code Input */}
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <label className="text-[11px] font-semibold text-sand flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-gold" />
                    Maison Privilege Promo Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. ARABIAN10"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      disabled={Boolean(appliedCoupon)}
                      className="field flex-1 rounded-xl px-3.5 py-2 text-xs uppercase tracking-wider font-mono bg-black/30 border border-white/15 focus:border-gold"
                    />
                    {appliedCoupon ? (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 transition-colors"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isValidatingCoupon || !couponInput.trim()}
                        className="px-4 py-2 text-xs font-semibold rounded-xl bg-gold/20 text-gold-light border border-gold/40 hover:bg-gold/30 disabled:opacity-50 transition-colors flex items-center gap-1"
                      >
                        {isValidatingCoupon ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Apply"}
                      </button>
                    )}
                  </div>
                  {couponSuccess && (
                    <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      {couponSuccess}
                    </p>
                  )}
                  {couponError && (
                    <p className="text-[11px] text-rose-400">{couponError}</p>
                  )}
                </form>

                {/* Line Items */}
                <div className="space-y-2.5 text-xs pt-3 border-t border-white/10">
                  <div className="flex justify-between text-sand">
                    <span>Subtotal ({itemCount} item{itemCount === 1 ? "" : "s"})</span>
                    <span className="font-semibold text-cream font-mono">₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>

                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Privilege Savings {appliedCoupon ? `(${appliedCoupon})` : ""}</span>
                      <span className="font-mono font-semibold">-₹{totalDiscount.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sand">
                    <span className="flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5 text-gold-light" />
                      Express Insured Shipping
                    </span>
                    <span className="font-mono">
                      {shippingFee === 0 ? (
                        <span className="text-emerald-400 font-semibold">FREE</span>
                      ) : (
                        `₹${shippingFee}`
                      )}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-3 border-t border-white/10 text-sm">
                    <span className="font-display text-base font-medium text-cream">Grand Total</span>
                    <div className="text-right">
                      <span className="font-display text-xl font-bold text-gold-light font-mono block">
                        ₹{grandTotal.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-sand/60">Includes all luxury excise & duties</span>
                    </div>
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
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
              <div>
                <span className="eyebrow flex items-center gap-2 text-xs">
                  <Sparkles className="h-3.5 w-3.5 text-gold/80" />
                  You May Also Like
                </span>
                <h2 className="font-display text-xl sm:text-2xl font-medium text-cream mt-1">
                  Curated Olfactory Masterpieces
                </h2>
                <p className="text-xs text-sand/70 mt-0.5 max-w-lg">
                  Hand-selected pure extraits that harmonize effortlessly with your chosen signature fragrances.
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
                    className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#041d14]/75 backdrop-blur-md p-3.5 transition-all duration-300 hover:border-gold/30 hover:bg-[#041d14]/90 hover:shadow-xl"
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
                          <span className="absolute top-2.5 left-2.5 rounded-full border border-gold/40 bg-black/80 px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-gold-light backdrop-blur-md">
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

                      {/* 3ml / 6ml / 12ml Size Selector */}
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
                        <span className="font-display text-base font-bold text-cream font-mono">
                          ₹{activePrice.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] text-sand/50 block font-mono">
                          {activeSize.volume} Extrait
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddRecommended(product)}
                        className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold-light hover:bg-gold hover:text-[#041d14] hover:shadow transition-all"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add</span>
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
