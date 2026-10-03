import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Play,
  Pause,
  ShoppingBag,
  Sparkles,
  Star,
  Volume2,
  VolumeX,
  X,
  Check,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { PRODUCTS, type Product, type ProductSize } from "../data";
import { cn } from "../utils/cn";

export interface VideoReview {
  id: string;
  title: string;
  creator: string;
  handle: string;
  location: string;
  avatar: string;
  duration: string;
  badge: string;
  rating: number;
  quote: string;
  videoUrl: string;
  posterImage: string;
  productId: string;
}

export const VIDEO_REVIEWS: VideoReview[] = [
  {
    id: "video-1",
    title: "14-Hour Longevity Test in 42°C Dubai Heat",
    creator: "Yasmin Al-Maktoum",
    handle: "@yasmin.scents",
    location: "Dubai, UAE",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    duration: "0:45",
    badge: "14h Wear Verified",
    rating: 5,
    quote:
      "One swipe on the wrist at 8 AM. It was still projecting a rich amber-oud sillage at 11 PM after walking outdoors in the Dubai sun. 0% alcohol makes an unbelievable difference.",
    videoUrl: "https://cdn.pixabay.com/video/2020/05/25/40134-424754593_large.mp4",
    posterImage: "/images/arabian-vault-box.jpg",
    productId: "oud-imperial",
  },
  {
    id: "video-2",
    title: "Unboxing the 12ml Crystal Flacon & Glass Wand",
    creator: "Tariq V. Kensington",
    handle: "@tariq.fragrance",
    location: "London, UK",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    duration: "0:38",
    badge: "Vault Unboxing",
    rating: 5,
    quote:
      "The weight of this heavy lead crystal flacon is pure royalty. The glass dip wand delivers exactly the right micro-drop of Rose Sultane without wasting a single drop.",
    videoUrl: "https://cdn.pixabay.com/video/2020/07/28/45773-445899478_large.mp4",
    posterImage: "/images/arabian-brand-assets.jpg",
    productId: "rose-sultane",
  },
  {
    id: "video-3",
    title: "The Pure Extrait Ritual: 1 Drop Behind Each Ear",
    creator: "Soraya Chen",
    handle: "@soraya.luxe",
    location: "Singapore",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
    duration: "0:52",
    badge: "Application Ritual",
    rating: 5,
    quote:
      "Musk Céleste warms up as your pulse beats. People on the train kept asking what scent I was wearing. It feels like a second skin rather than synthetic perfume spray.",
    videoUrl: "https://cdn.pixabay.com/video/2021/04/12/70868-536488349_large.mp4",
    posterImage: "/images/arabian-flacon-box.jpg",
    productId: "musk-celeste",
  },
  {
    id: "video-4",
    title: "Why 0% Alcohol Attar Smells Richer on Warm Skin",
    creator: "Marc-Antoine Laurent",
    handle: "@niche.perfumer",
    location: "Paris, France",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    duration: "1:04",
    badge: "Nose Masterclass",
    rating: 5,
    quote:
      "Ambre Noir has no alcohol top-note blast. What you smell immediately is aged Zanzibar tonka and smoked fossil resin in their purest botanical form.",
    videoUrl: "https://cdn.pixabay.com/video/2023/10/22/186088-877478635_large.mp4",
    posterImage: "/images/ambre-noir.jpg",
    productId: "ambre-noir",
  },
];

import { videoService, type VideoReviewDocument } from "../services/videoService";

export default function RealResultsVideos({
  onAddProduct,
}: {
  onAddProduct?: (product: Product, size?: ProductSize) => void;
}) {
  const [videos, setVideos] = useState<VideoReview[]>(VIDEO_REVIEWS);
  const [activeVideo, setActiveVideo] = useState<VideoReview | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const modalVideoRef = useRef<HTMLVideoElement>(null);

  // Load dynamic video reviews from backend
  useEffect(() => {
    let isMounted = true;
    const fetchVideos = async () => {
      try {
        const data = await videoService.getVideoReviews();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const mapped: VideoReview[] = data.map((v: VideoReviewDocument) => ({
            id: v._id,
            title: v.title,
            creator: v.creator?.name || "Patron Connoisseur",
            handle: v.creator?.handle || "@spiritofarabian",
            location: v.creator?.location || "Dubai / London",
            avatar: v.creator?.avatar || "/images/arabian-brand-assets.jpg",
            duration: v.duration || "0:45",
            badge: v.badge || "Verified Extrait",
            rating: v.rating || 5,
            quote: v.quote || "0% alcohol makes an unbelievable difference to sillage.",
            videoUrl: v.videoUrl,
            posterImage: v.posterImage || "/images/arabian-vault-box.jpg",
            productId: v.taggedProduct?.slug || "oud-imperial",
          }));
          setVideos(mapped);
        }
      } catch (err) {
        console.warn("[RealResultsVideos] Fallback to default reels");
      }
    };

    fetchVideos();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleQuickAdd = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product || !onAddProduct) return;

    const size = product.sizes[1] || product.sizes[0];
    onAddProduct(product, size);

    setAddedIds((prev) => ({ ...prev, [productId]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [productId]: false }));
    }, 1800);
  };

  const toggleModalPlay = () => {
    if (!modalVideoRef.current) return;
    if (isPlaying) {
      modalVideoRef.current.pause();
      setIsPlaying(false);
    } else {
      modalVideoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleModalMute = () => {
    if (!modalVideoRef.current) return;
    modalVideoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <section className="relative py-16 sm:py-24 border-t border-gold/15 bg-ink-2/60 overflow-hidden" aria-label="Real Results - Shop From Videos">
      {/* Background Ambience */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[800px] rounded-full bg-gradient-to-r from-gold/10 via-emerald-600/10 to-transparent blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 pb-10 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-gold-light mb-3">
              <Sparkles className="h-3 w-3 text-gold" />
              <span>Verified Patron Experiences</span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl font-medium tracking-tight text-cream">
              REAL RESULTS —{" "}
              <em className="italic text-sand font-normal">Shop From Videos</em>
            </h2>

            <p className="mt-3 text-xs sm:text-sm text-sand/80 max-w-2xl leading-relaxed">
              Watch honest patron sillage experiments, 14-hour wear tests, and ritual unboxings. Tap any video to watch in high definition or quick-add the featured extrait directly into your imperial bag.
            </p>
          </div>

          <Link
            to="/collection"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-panel/50 px-6 py-3 text-xs font-bold uppercase tracking-wider text-cream hover:bg-white hover:text-ink transition-all shrink-0 self-start sm:self-auto shadow-md"
          >
            <span>Explore All Extraits</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 4 Video Reels Grid */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {videos.map((review) => {
            const product = PRODUCTS.find((p) => p.id === review.productId);
            const isAdded = addedIds[review.productId];

            return (
              <div
                key={review.id}
                onClick={() => {
                  setActiveVideo(review);
                  setIsPlaying(true);
                  setIsMuted(false);
                }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-ink-3 shadow-xl transition-all duration-500 hover:border-gold/50 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] hover:-translate-y-1.5 cursor-pointer aspect-[9/15]"
              >
                {/* Background Video Preview / Poster */}
                <div className="absolute inset-0 z-0 bg-ink">
                  <video
                    src={review.videoUrl}
                    poster={review.posterImage}
                    muted
                    loop
                    playsInline
                    autoPlay
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-80 group-hover:opacity-100"
                  />
                  {/* Subtle Dark Vignette Gradients */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-black/60 pointer-events-none" />
                </div>

                {/* Top Overlay: Badge & Creator Header */}
                <div className="relative z-10 p-4 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={review.avatar}
                      alt={review.creator}
                      className="h-8 w-8 rounded-full border border-gold/40 object-cover shadow"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-cream truncate leading-tight drop-shadow">
                        {review.creator}
                      </p>
                      <p className="text-[10px] text-sand/80 truncate drop-shadow">
                        {review.location}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full border border-gold/40 bg-ink-2/90 px-2.5 py-0.5 text-[10px] font-bold text-gold-light backdrop-blur-md shadow">
                    {review.badge}
                  </span>
                </div>

                {/* Center Play Button Pulse */}
                <div className="relative z-10 flex items-center justify-center my-auto">
                  <div className="grid h-12 w-12 place-items-center rounded-full border border-white/30 bg-ink/70 text-white backdrop-blur-md shadow-2xl transition-all duration-300 group-hover:scale-115 group-hover:border-gold group-hover:bg-gold group-hover:text-ink">
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Bottom Overlay: Video Title, Review Snippet & Shoppable Product Card */}
                <div className="relative z-10 p-4 space-y-3 bg-gradient-to-t from-ink-3 via-ink-3/95 to-transparent pt-6">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-gold text-gold" />
                      ))}
                    </div>
                    <h3 className="font-display text-sm font-semibold text-cream line-clamp-1 group-hover:text-white transition-colors">
                      {review.title}
                    </h3>
                    <p className="text-[11px] text-sand/80 line-clamp-2 mt-1 leading-relaxed italic">
                      "{review.quote}"
                    </p>
                  </div>

                  {/* Shoppable Product Card on the Video */}
                  {product && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-between gap-2.5 rounded-xl border border-white/15 bg-ink-2/95 p-2 backdrop-blur-md shadow-lg transition-all hover:border-gold/40 hover:bg-ink-2"
                    >
                      <Link
                        to={`/product/${product.id}`}
                        className="flex items-center gap-2.5 min-w-0"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-10 w-10 rounded-lg object-cover bg-ink border border-white/10 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-display text-xs font-semibold text-cream truncate hover:text-gold-light transition-colors">
                            {product.name}
                          </p>
                          <p className="text-[10px] text-gold-light font-bold">
                            ${product.price}
                          </p>
                        </div>
                      </Link>

                      <button
                        type="button"
                        onClick={(e) => handleQuickAdd(e, product.id)}
                        className={cn(
                          "shrink-0 flex items-center gap-1 rounded-full px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wider transition-all shadow",
                          isAdded
                            ? "bg-emerald-400 text-ink"
                            : "border border-white/20 bg-white text-ink hover:bg-cream active:scale-95"
                        )}
                        title={`Add ${product.name} to bag`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="h-3 w-3 stroke-[3]" /> Added
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="h-3 w-3" /> Shop
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full-Screen Video Modal Player */}
      <AnimatePresence>
        {activeVideo && (
          <div
            className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveVideo(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-lg"
            />

            {/* Modal Dialog Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative z-10 flex flex-col md:flex-row w-full max-w-3xl overflow-hidden rounded-3xl border border-gold/30 bg-ink-2 shadow-2xl text-cream max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 z-20 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/60 text-sand hover:text-cream hover:bg-black/90 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Video Player Column */}
              <div className="relative w-full md:w-1/2 aspect-[9/16] md:aspect-auto md:min-h-[480px] bg-black">
                <video
                  ref={modalVideoRef}
                  src={activeVideo.videoUrl}
                  poster={activeVideo.posterImage}
                  autoPlay
                  playsInline
                  loop
                  muted={isMuted}
                  className="h-full w-full object-cover"
                />

                {/* Video Controls Bar */}
                <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between gap-3 rounded-full bg-black/60 px-4 py-2 backdrop-blur-md">
                  <button
                    type="button"
                    onClick={toggleModalPlay}
                    className="flex items-center gap-2 text-xs font-bold text-cream hover:text-gold transition-colors"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
                    <span>{isPlaying ? "Pause" : "Play"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={toggleModalMute}
                    className="flex items-center gap-1.5 text-xs text-sand hover:text-cream transition-colors"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
                    <span>{isMuted ? "Unmute" : "Sound On"}</span>
                  </button>
                </div>
              </div>

              {/* Video Review & Product Information Details */}
              <div className="flex flex-col justify-between w-full md:w-1/2 p-6 sm:p-8 space-y-6 overflow-y-auto">
                <div>
                  {/* Creator Header */}
                  <div className="flex items-center gap-3">
                    <img
                      src={activeVideo.avatar}
                      alt={activeVideo.creator}
                      className="h-12 w-12 rounded-full border-2 border-gold/40 object-cover shadow"
                    />
                    <div>
                      <h4 className="font-display text-lg font-bold text-cream">
                        {activeVideo.creator}
                      </h4>
                      <p className="text-xs text-sand/70 font-medium">
                        {activeVideo.handle} · {activeVideo.location}
                      </p>
                    </div>
                  </div>

                  {/* Rating Stars & Badge */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[...Array(activeVideo.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                      ))}
                    </div>
                    <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-0.5 text-[10.5px] font-bold text-gold-light">
                      {activeVideo.badge}
                    </span>
                  </div>

                  {/* Video Title */}
                  <h3 className="font-display text-xl font-semibold text-cream mt-3">
                    {activeVideo.title}
                  </h3>

                  {/* Full Patron Review Quote */}
                  <blockquote className="mt-3 text-xs sm:text-sm text-sand/85 leading-relaxed italic border-l-2 border-gold/40 pl-3 py-1">
                    "{activeVideo.quote}"
                  </blockquote>
                </div>

                {/* Featured Product Card in Modal */}
                {(() => {
                  const product = PRODUCTS.find((p) => p.id === activeVideo.productId);
                  if (!product) return null;
                  const isAdded = addedIds[product.id];

                  return (
                    <div className="rounded-2xl border border-gold/20 bg-panel/40 p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-14 w-14 rounded-xl object-cover bg-ink border border-gold/30 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-sand/70">
                            Featured Extrait
                          </p>
                          <h4 className="font-display text-base font-semibold text-cream truncate">
                            {product.name}
                          </h4>
                          <p className="text-xs text-gold-light font-bold">
                            ${product.price} ({product.ml || "12ml Extrait"})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={(e) => handleQuickAdd(e, product.id)}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 rounded-full py-3 text-xs font-black uppercase tracking-wider transition-all shadow-lg",
                            isAdded
                              ? "bg-emerald-400 text-ink"
                              : "bg-white text-ink hover:bg-cream active:scale-98"
                          )}
                        >
                          {isAdded ? (
                            <>
                              <Check className="h-4 w-4 stroke-[3]" /> Added to Bag
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="h-4 w-4" /> Add to Bag (${product.price})
                            </>
                          )}
                        </button>

                        <Link
                          to={`/product/${product.id}`}
                          onClick={() => setActiveVideo(null)}
                          className="rounded-full border border-white/20 bg-panel/60 px-4 py-3 text-xs font-bold uppercase tracking-wider text-cream hover:bg-white hover:text-ink transition-colors text-center"
                        >
                          Details
                        </Link>
                      </div>

                      <div className="flex items-center justify-center gap-2 text-[10.5px] text-sand/60 pt-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-gold" />
                        <span>30-Day Sillage Guarantee · Worldwide Express Delivery</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
