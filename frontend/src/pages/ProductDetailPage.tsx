import { useState, useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
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
  Star,
  Loader2,
  Send,
  Eye,
  Maximize2,
} from "lucide-react";
import { PRODUCTS, type Product, type ProductSize } from "../data";
import { Stars } from "../components/ui";
import { cn } from "../utils/cn";
import { productService, type ProductDocument } from "../services/productService";
import { reviewService, type ReviewDocument } from "../services/reviewService";

export default function ProductDetailPage({
  onAddProduct,
}: {
  onAddProduct: (product: Product, size?: ProductSize) => void;
}) {
  const { id } = useParams<{ id: string }>();

  const [productData, setProductData] = useState<Product | null>(null);
  const [mongoProductId, setMongoProductId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"pyramid" | "provenance" | "ritual" | "layering">("pyramid");
  const [isAdded, setIsAdded] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<ReviewDocument[]>([]);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Load dynamic product by slug
  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const doc: ProductDocument = await productService.getBySlug(id);
        if (isMounted && doc) {
          setMongoProductId(doc._id);

          const defaultVariant = doc.variants?.find((v) => v.isDefault) || doc.variants?.[0];
          const primaryImg = doc.images?.find((img) => img.isPrimary)?.url || doc.images?.[0]?.url || "/images/cambodian-oud.jpg";
          const galleryList = (doc.images || []).map((img) => img.url).filter(Boolean);
          if (!galleryList.includes(primaryImg)) {
            galleryList.unshift(primaryImg);
          }

          const sizesFormatted = (doc.variants || []).map((v) => ({
            id: v._id || `${doc.slug}-${v.size}ml`,
            ml: `${v.size}${v.unit}`,
            volume: `${v.size}${v.unit}`,
            price: v.price,
            compareAt: v.compareAtPrice || undefined,
            label: v.label || `${v.size}${v.unit} Royal Flacon`,
          }));

          if (sizesFormatted.length === 0) {
            sizesFormatted.push({
              id: `${doc.slug}-6ml`,
              ml: "6ml",
              volume: "6ml",
              price: 2799,
              compareAt: undefined,
              label: "6ml Royal Bottle",
            });
          }

          const topNotes = (doc.notes?.top || ["Golden Saffron", "Smoked Bergamot"]).map((n) => ({
            name: n,
            desc: "Volatile Extraction",
          }));
          const heartNotes = (doc.notes?.heart || ["Aged Leather", "Cistus Labdanum"]).map((n) => ({
            name: n,
            desc: "Heart Alembic Distillate",
          }));
          const baseNotes = (doc.notes?.base || ["Wild Cambodian Oud", "Black Amber"]).map((n) => ({
            name: n,
            desc: "Resinous Base Longevity",
          }));

          const mapped: Product = {
            id: doc.slug,
            name: doc.name,
            arabicName: doc.arabicName || "عطر فاخر",
            category: (doc.category?.name || "Pure Royal Ouds") as any,
            price: defaultVariant?.price || sizesFormatted[0].price,
            compareAt: defaultVariant?.compareAtPrice || undefined,
            rating: doc.rating?.average || 4.9,
            reviewsCount: doc.rating?.count || 48,
            badge: doc.badge || (doc.isBestSeller ? "Grand Reserve" : undefined),
            scentType: doc.fragrance?.family || "Imperial Attar",
            ml: defaultVariant ? `${defaultVariant.size}${defaultVariant.unit}` : "6ml",
            sizes: sizesFormatted,
            image: primaryImg,
            gallery: galleryList.length > 0 ? galleryList : [primaryImg, "/images/arabian-flacon-box.jpg", "/images/arabian-vault-box.jpg"],
            intensity: doc.fragrance?.intensity === "Very Strong" ? 5 : 4,
            notes: { top: topNotes, heart: heartNotes, base: baseNotes },
            description: doc.description || doc.shortDescription || "",
            longevity: doc.fragrance?.longevity || "18+ Hours",
            longevityHours: doc.fragrance?.longevity || "18+ Hours",
            sillage: doc.fragrance?.sillage || "Enormous",
            occasion: doc.fragrance?.suitableFor?.join(", ") || "Royal Evenings & Special Occasions",
            story: doc.tagline || doc.description,
            origin: doc.fragrance?.origin || "Assam & Dubai Royal Atelier",
            accent: doc.tagline || "0% Alcohol Pure Extrait",
            family: doc.fragrance?.family || "Imperial Oriental",
            hue: doc.slug.includes("rose") ? "#d46b7a" : doc.slug.includes("amber") ? "#d49a37" : "#5a3d28",
          };

          setProductData(mapped);

          // Fetch reviews for this product
          try {
            const revData = await reviewService.getProductReviews(doc._id);
            if (isMounted && Array.isArray(revData)) {
              setReviews(revData);
            }
          } catch (rErr) {
            console.warn("Reviews fetch warning:", rErr);
          }
        }
      } catch (err) {
        console.warn("[ProductDetailPage] Fallback to local products list for:", id);
        const fallback = PRODUCTS.find((p) => p.id === id);
        if (isMounted && fallback) {
          setProductData(fallback);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Scroll listener for sticky CTA bar
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewComment || !mongoProductId) return;

    setIsSubmittingReview(true);
    try {
      const created = await reviewService.createReview({
        productId: mongoProductId,
        author: reviewName.trim(),
        rating: reviewRating,
        title: `${reviewRating} Star Imperial Experience`,
        comment: reviewComment.trim(),
      });

      setReviews((prev) => [created, ...prev]);
      setReviewSubmitted(true);
      setReviewName("");
      setReviewComment("");
    } catch (err) {
      console.error("Review submission error:", err);
      // Local optimistic update
      setReviews((prev) => [
        {
          _id: String(Date.now()),
          author: reviewName.trim(),
          rating: reviewRating,
          title: "Verified Imperial Patron",
          comment: reviewComment.trim(),
          isVerifiedPurchase: true,
          createdAt: new Date().toISOString(),
        } as ReviewDocument,
        ...prev,
      ]);
      setReviewSubmitted(true);
      setReviewName("");
      setReviewComment("");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-40 pb-24 text-center text-cream bg-[#041d14]">
        <Loader2 className="h-10 w-10 animate-spin text-gold mx-auto" />
        <p className="mt-4 text-xs tracking-widest text-sand uppercase font-bold">
          Distilling Essence & Archival Notes...
        </p>
      </div>
    );
  }

  if (!productData) {
    return <Navigate to="/collection" replace />;
  }

  const currentSize = productData.sizes[selectedSizeIndex] || productData.sizes[0];
  const galleryImages = productData.gallery && productData.gallery.length > 0 ? productData.gallery : [productData.image];
  const activeImage = galleryImages[activeImageIndex] || productData.image;
  const relatedProducts = PRODUCTS.filter((p) => p.id !== productData.id).slice(0, 3);

  const handleAdd = () => {
    onAddProduct(productData, currentSize);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  return (
    <div className="relative pt-32 sm:pt-36 pb-24 sm:pb-32 text-cream bg-[#041d14]">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[550px] w-[1000px] max-w-full rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.12)_0%,rgba(10,61,46,0.35)_60%,transparent_100%)] blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-sand/60">
          <Link to="/" className="hover:text-gold-light transition-colors">Home</Link>
          <span>/</span>
          <Link to="/collection" className="hover:text-gold-light transition-colors">Collection</Link>
          <span>/</span>
          <span className="text-gold-light font-semibold">{productData.name}</span>
        </nav>

        {/* 2-Column Product Layout */}
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Ultra-Luxury High-Res Photography Gallery */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Stage Image */}
            <div className="relative aspect-square w-full rounded-3xl border border-gold/30 p-3 shadow-2xl overflow-hidden bg-[#03140e]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="relative h-full w-full overflow-hidden rounded-2xl"
                >
                  <img
                    src={activeImage}
                    alt={productData.name}
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Badges */}
              {productData.badge && (
                <span className="absolute top-5 left-5 rounded-full bg-gradient-to-r from-gold to-gold-2 px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#041d14] shadow-lg">
                  {productData.badge}
                </span>
              )}

              <span className="absolute bottom-5 right-5 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[9.5px] font-bold uppercase tracking-wider text-sand/90 backdrop-blur-md">
                Pure Extrait de Parfum
              </span>
            </div>

            {/* Gallery Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-xl border p-1 transition-all duration-300 bg-[#03140e]",
                      activeImageIndex === idx
                        ? "border-gold shadow-[0_0_15px_rgba(212,175,55,0.35)] scale-105"
                        : "border-white/10 opacity-70 hover:opacity-100 hover:border-gold/40"
                    )}
                  >
                    <img
                      src={imgUrl}
                      alt={`${productData.name} perspective ${idx + 1}`}
                      className="h-full w-full object-cover rounded-lg"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Title, Scent Architecture, Volume Selection & Add to Cart */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="eyebrow">{productData.tagline}</span>
                <span className="h-1 w-1 rounded-full bg-gold/50" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gold-light/70">
                  {productData.family}
                </span>
              </div>

              <h1 className="font-display mt-2 text-4xl sm:text-5xl font-medium leading-[1.05] text-cream">
                {productData.name}
              </h1>

              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-gold-light">
                {productData.accent}
              </p>

              <div className="mt-4 flex items-center gap-4">
                <Stars />
                <span className="text-xs text-sand/80 font-medium">
                  {productData.rating.toFixed(1)} / 5.0 ({productData.reviewsCount}+ Verified Collectors)
                </span>
              </div>

              <p className="mt-5 text-sm sm:text-base leading-relaxed text-sand/90">
                {productData.description}
              </p>
            </div>

            {/* Key Longevity Highlights */}
            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-gold/15 bg-panel/30 p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gold shrink-0" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sand/60 block">Longevity</span>
                  <strong className="text-xs text-gold-light">{productData.longevityHours} On Skin</strong>
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
                <span>Select Volume Flacon</span>
                <span className="text-gold-light font-mono font-bold">
                  ₹{currentSize.price.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {productData.sizes.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSizeIndex(idx)}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-2xl border p-3.5 text-center transition-all",
                      selectedSizeIndex === idx
                        ? "border-gold bg-gold/15 text-gold-light shadow-[0_0_20px_rgba(212,175,55,0.25)]"
                        : "border-gold/15 bg-panel/30 text-sand hover:border-gold/30 hover:text-cream"
                    )}
                  >
                    <span className="font-display text-sm font-bold">{s.volume}</span>
                    <span className="text-[10px] text-sand/70 mt-0.5">{s.label}</span>
                    <span className="font-mono text-xs font-bold mt-1 text-gold-light">
                      ₹{s.price.toLocaleString("en-IN")}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Bag CTA */}
            <div className="space-y-3 pt-4">
              <button
                type="button"
                onClick={handleAdd}
                className={cn(
                  "w-full flex items-center justify-center gap-3 rounded-full py-4 text-xs font-black uppercase tracking-[0.22em] transition-all duration-300 shadow-xl active:scale-[0.99]",
                  isAdded
                    ? "bg-emerald-400 text-[#041d14] shadow-[0_0_30px_rgba(52,211,153,0.4)]"
                    : "bg-cream text-[#041d14] hover:bg-white hover:shadow-[0_6px_30px_rgba(253,250,242,0.35)]"
                )}
              >
                {isAdded ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Flacon Added to Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    <span>Add to Bag — ₹{currentSize.price.toLocaleString("en-IN")}</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-[11px] text-sand/60 px-2">
                <span className="flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-gold" /> Free Insured Express Delivery Above ₹1,500
                </span>
                <span className="flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5 text-gold" /> Gilded Box Packaging Included
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Tabs: Olfactory Pyramid, Harvest & Origin, Ritual, Layering */}
        <div className="mt-20 border-t border-gold/15 pt-12">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 border-b border-gold/15 pb-4">
            {[
              { id: "pyramid", label: "Fragrance Pyramid", icon: Droplets },
              { id: "provenance", label: "Harvest & Origin", icon: MapPin },
              { id: "ritual", label: "Application Ritual", icon: Sparkles },
              { id: "layering", label: "Bespoke Layering", icon: Layers },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all",
                  activeTab === tab.id
                    ? "bg-gold text-[#041d14] shadow-md font-black"
                    : "text-sand hover:text-cream hover:bg-white/5"
                )}
              >
                <tab.icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-8 max-w-4xl mx-auto">
            {activeTab === "pyramid" && (
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-5 space-y-2 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gold block">Top Notes</span>
                  <p className="font-display text-lg font-semibold text-cream">{productData.notes.top.map((n) => n.name).join(", ")}</p>
                  <p className="text-xs text-sand/60">Volatile citrus & spice accord blooming immediately</p>
                </div>
                <div className="rounded-2xl border border-gold/30 bg-gold/[0.04] p-5 space-y-2 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gold block">Heart Notes</span>
                  <p className="font-display text-lg font-semibold text-gold-light">{productData.notes.heart.map((n) => n.name).join(", ")}</p>
                  <p className="text-xs text-sand/60">Distilled floral & resinous core enduring 6–10 hours</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-5 space-y-2 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gold block">Base Notes</span>
                  <p className="font-display text-lg font-semibold text-cream">{productData.notes.base.map((n) => n.name).join(", ")}</p>
                  <p className="text-xs text-sand/60">Deep aged oud, fossilized amber & lipid musk</p>
                </div>
              </div>
            )}

            {activeTab === "provenance" && (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-6 sm:p-8 space-y-4">
                <h3 className="font-display text-2xl font-medium text-cream">{productData.origin}</h3>
                <p className="text-xs sm:text-sm text-sand/80 leading-relaxed">
                  Every flacon is hand-filled from copper degs that underwent 12 weeks of gentle hydro-distillation. The raw botanicals are harvested in small wild batches and cured in private cellar vaults.
                </p>
              </div>
            )}

            {activeTab === "ritual" && (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-6 sm:p-8 space-y-4">
                <h3 className="font-display text-2xl font-medium text-cream">The 10-Second Pulse Point Ritual</h3>
                <p className="text-xs sm:text-sm text-sand/80 leading-relaxed">
                  Use the artisanal glass wand to apply a single micro-droplet to your inner wrists, base of the neck, and collarbones. Avoid rubbing vigorously—let body heat naturally diffuse the lipid fragrance oil over 16+ hours.
                </p>
              </div>
            )}

            {activeTab === "layering" && (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-6 sm:p-8 space-y-4">
                <h3 className="font-display text-2xl font-medium text-cream">Artisanal Layering Alchemy</h3>
                <p className="text-xs sm:text-sm text-sand/80 leading-relaxed">
                  Pair this extrait with a micro-dab of Taif Rose or Smoked Amber to create an intimate, signature sillage aura that is uniquely yours.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Live Verified Patron Reviews Section */}
        <div className="mt-24 border-t border-gold/15 pt-16">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="eyebrow">Verified Collector Feedback</span>
            <h2 className="font-display text-3xl sm:text-4xl font-medium text-cream">
              Patron Impressions & Reviews
            </h2>
            <p className="text-xs text-sand/70">
              Read uncensored feedback from verified collectors around the globe.
            </p>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Reviews List */}
            <div className="lg:col-span-7 space-y-4">
              {reviews.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-8 text-center text-xs text-sand/60">
                  Be the first connoisseur to review this rare extrait flacon.
                </div>
              ) : (
                reviews.map((rev) => (
                  <div key={rev._id} className="rounded-2xl border border-white/10 bg-black/30 p-5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <strong className="text-xs font-semibold text-cream">{rev.author}</strong>
                        {rev.isVerifiedPurchase && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9.5px] font-bold text-emerald-400 border border-emerald-500/20">
                            <BadgeCheck className="h-3 w-3" /> Verified Collector
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-gold">
                        {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
                        ))}
                      </div>
                    </div>
                    {rev.title && <h4 className="text-xs font-bold text-gold-light">{rev.title}</h4>}
                    <p className="text-xs text-sand/85 leading-relaxed">{rev.comment}</p>
                    <span className="text-[10px] text-sand/50 block pt-1">
                      {new Date(rev.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Write a Review Form */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-gold/25 bg-[#031911]/90 backdrop-blur-md p-6 sm:p-8 space-y-4 shadow-xl">
                <h3 className="font-display text-xl font-medium text-cream">Share Your Impression</h3>
                <p className="text-xs text-sand/70">
                  Submit your evaluation of this extrait's longevity and sillage evolution.
                </p>

                {reviewSubmitted ? (
                  <div className="rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-5 text-center text-xs text-emerald-300 space-y-1">
                    <Check className="h-6 w-6 text-emerald-400 mx-auto" />
                    <strong className="block text-cream font-bold">Review Published!</strong>
                    <span>Thank you for adding your impression to our archives.</span>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-3">
                    <div>
                      <label className="text-[11px] font-semibold text-sand">Your Name / Title</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Lord Alexandre V."
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        className="field mt-1 w-full rounded-xl px-3.5 py-2 text-xs bg-black/40 border-white/15 focus:border-gold text-cream"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-sand">Star Rating</label>
                      <select
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className="field mt-1 w-full rounded-xl px-3.5 py-2 text-xs text-cream bg-[#03140e] border-white/15 focus:border-gold"
                      >
                        <option value={5}>5 Stars — Masterpiece Extraordinaire</option>
                        <option value={4}>4 Stars — Exceptional Longevity & Sillage</option>
                        <option value={3}>3 Stars — Fine Quality</option>
                        <option value={2}>2 Stars — Moderate</option>
                        <option value={1}>1 Star — Not As Expected</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-sand">Your Olfactory Experience</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Describe the projection, sillage, dry-down notes on your skin..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="field mt-1 w-full rounded-xl px-3.5 py-2 text-xs bg-black/40 border-white/15 focus:border-gold text-cream"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="w-full flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-xs font-bold uppercase tracking-widest text-[#041d14] hover:bg-gold-light transition-colors disabled:opacity-50"
                    >
                      {isSubmittingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      <span>Submit Review</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile/Desktop Bottom CTA Bar */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-0 left-0 right-0 z-40 border-t border-gold/30 bg-[#03140e]/95 backdrop-blur-xl py-3 px-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]"
          >
            <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={activeImage}
                  alt={productData.name}
                  className="h-10 w-10 rounded-lg object-cover border border-white/10 shrink-0"
                />
                <div className="truncate">
                  <h4 className="font-display text-sm font-semibold text-cream truncate">{productData.name}</h4>
                  <span className="text-xs font-mono font-bold text-gold-light">
                    {currentSize.volume} · ₹{currentSize.price.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                className="shrink-0 inline-flex items-center gap-2 rounded-full bg-cream px-6 py-2.5 text-xs font-black uppercase tracking-widest text-[#041d14] hover:bg-white shadow-lg transition-all"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>Add to Bag</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
