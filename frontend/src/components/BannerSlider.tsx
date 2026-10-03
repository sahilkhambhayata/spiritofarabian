import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EASE } from "./ui";
import { bannerService, type BannerDocument } from "../services/bannerService";

interface BannerSlide {
  id: string;
  type: "banner" | "video";
  eyebrow: string;
  titleMain: string;
  titleAccent: string;
  description: string;
  bgImage: string;
  videoUrl?: string;
  ctaText: string;
  ctaLink: string;
  badge?: string;
  discountPill?: string;
}

const BANNER_SLIDES: BannerSlide[] = [
  {
    id: "bogo-banner",
    type: "banner",
    eyebrow: "GRAND ARTISANAL FESTIVAL · EXCLUSIVE VAULT",
    titleMain: "BUY 1 GET 1",
    titleAccent: "FREE",
    description:
      "Purchase any 12ml Imperial Extrait flacon and receive your second complimentary signature extrait of choice at checkout.",
    bgImage: "/images/arabian-vault-box.jpg",
    ctaText: "Claim Buy 1 Get 1 Free",
    ctaLink: "/collection",
    badge: "Limited Allotment",
    discountPill: "Code: MAISONDUO · Auto Applied",
  },
  {
    id: "attar-video",
    type: "video",
    eyebrow: "CINEMATIC EXTRACTION · 100% PURE BOTANICAL OIL",
    titleMain: "Sacred Essence,",
    titleAccent: "Immortal Sillage.",
    description:
      "Hydro-distilled in traditional copper alembics for twelve weeks. 0% alcohol, lipid-bound to bloom dynamically with your body warmth.",
    bgImage: "/images/arabian-brand-assets.jpg",
    videoUrl: "https://cdn.pixabay.com/video/2020/05/25/40134-424754593_large.mp4",
    ctaText: "Experience The Collection",
    ctaLink: "/collection",
    badge: "14+ Hours Wear",
  },
  {
    id: "imperial-reserve-banner",
    type: "banner",
    eyebrow: "NEW HARVEST RELEASES · NUMBERED FLACONS",
    titleMain: "The Imperial",
    titleAccent: "Extrait Vault",
    description:
      "Featuring rare Cambodian Agarwood, Al-Hada Mountain Taif Roses, and Zanzibar Tonka Smoked Amber in heavy crystal flacons.",
    bgImage: "/images/arabian-flacon-box.jpg",
    ctaText: "Explore Signature Vault",
    ctaLink: "/collection",
    badge: "Artisanal Reserve",
    discountPill: "Free Worldwide Express Delivery",
  },
];

const AUTO_SLIDE_INTERVAL = 6000; // 6 seconds

export default function BannerSlider({ onShop: _onShop }: { onShop?: () => void } = {}) {
  const [slides, setSlides] = useState<BannerSlide[]>(BANNER_SLIDES);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Fetch active banners from API
  useEffect(() => {
    let isMounted = true;
    const fetchBanners = async () => {
      try {
        const fetched = await bannerService.getActiveBanners("hero_slider");
        if (isMounted && Array.isArray(fetched) && fetched.length > 0) {
          const mapped: BannerSlide[] = fetched.map((b: BannerDocument) => ({
            id: b._id,
            type: "banner",
            eyebrow: b.subtitle || "GRAND ARTISANAL FESTIVAL · EXCLUSIVE VAULT",
            titleMain: b.title,
            titleAccent: "",
            description: b.subtitle || "Hydro-distilled pure botanical oils. 0% alcohol, lipid-bound to bloom dynamically with your body warmth.",
            bgImage: b.desktopImage || "/images/arabian-vault-box.jpg",
            ctaText: b.ctaText || "Explore Collection",
            ctaLink: b.ctaLink || "/collection",
            badge: b.badge || "Maison Reserve",
          }));
          setSlides(mapped);
        }
      } catch (err) {
        console.warn("[BannerSlider] API fetch fallback to default slides");
      }
    };

    fetchBanners();
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (isHovered || slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % slides.length);
    }, AUTO_SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [isHovered, currentIdx, slides.length]);

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % slides.length);
  };

  const slide = slides[currentIdx] || BANNER_SLIDES[0];

  return (
    <section
      className="relative w-full overflow-hidden bg-ink"
      aria-label="Promotional Banners and Video Showcase"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-[560px] sm:h-[650px] lg:h-[720px] w-full overflow-hidden bg-ink-2">
        {/* Slide Media Background with Transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="absolute inset-0 h-full w-full"
          >
            {slide.type === "video" && slide.videoUrl && !videoError ? (
              <video
                src={slide.videoUrl}
                poster={slide.bgImage}
                autoPlay
                loop
                muted
                playsInline
                onError={() => setVideoError(true)}
                className="h-full w-full object-cover object-center opacity-45 filter brightness-90 contrast-110"
              />
            ) : (
              <img
                src={slide.bgImage}
                alt={slide.titleMain}
                className="h-full w-full object-cover object-center opacity-45 filter brightness-95 contrast-105"
              />
            )}

            {/* Clear, balanced ambient overlay for readability while keeping the background clear and vivid */}
            <div className="absolute inset-0 bg-ink/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/60" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-ink/30 to-transparent sm:w-2/3" />
          </motion.div>
        </AnimatePresence>

        {/* Slide Foreground Content: ONLY Title and Description */}
        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-6 sm:px-12 lg:px-16 pt-16 sm:pt-20">
          <div className="max-w-3xl space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="space-y-4"
              >
                {/* Big Bold Headline */}
                <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-cream leading-[1.05] drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]">
                  {slide.titleMain}{" "}
                  <span className="gold-text italic block sm:inline">{slide.titleAccent}</span>
                </h1>

                {/* Description */}
                <p className="text-base sm:text-lg lg:text-xl leading-relaxed text-sand/95 max-w-2xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)]">
                  {slide.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Left Navigation Arrow (Image 2 style) */}
        <button
          type="button"
          onClick={handlePrev}
          className="group absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-cream/15 text-cream border border-cream/20 shadow-xl backdrop-blur-md hover:bg-gold hover:text-ink hover:border-gold transition-all duration-300"
          aria-label="Previous Banner Slide"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:-translate-x-0.5" />
        </button>

        {/* Right Navigation Arrow (Image 2 style) */}
        <button
          type="button"
          onClick={handleNext}
          className="group absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-cream/15 text-cream border border-cream/20 shadow-xl backdrop-blur-md hover:bg-gold hover:text-ink hover:border-gold transition-all duration-300"
          aria-label="Next Banner Slide"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:translate-x-0.5" />
        </button>

        {/* Bottom Slide Indicator Dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {BANNER_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentIdx(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === currentIdx
                  ? "w-8 bg-gold shadow-[0_0_10px_rgba(212,175,55,0.8)]"
                  : "w-2 bg-cream/30 hover:bg-cream/60"
                }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
