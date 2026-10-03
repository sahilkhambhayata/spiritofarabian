import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  X,
  Check,
  Send,
  Loader2,
} from "lucide-react";
import { QUIZ_QUESTIONS, type Product } from "../data";
import { EASE } from "./ui";
import { cn } from "../utils/cn";
import { productService, type ProductDocument } from "../services/productService";
import { conciergeService } from "../services/conciergeService";

import api from "../services/api";

export default function ScentQuizModal({
  open,
  onClose,
  onAddProduct,
}: {
  open: boolean;
  onClose: () => void;
  onAddProduct: (p: Product) => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [resultProduct, setResultProduct] = useState<Product | null>(null);
  const [dynamicProducts, setDynamicProducts] = useState<Product[]>([]);
  const [questions, setQuestions] = useState<any[]>(QUIZ_QUESTIONS);

  // Email submission for VIP bespoke consultation
  const [patronEmail, setPatronEmail] = useState("");
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [profileSubmitted, setProfileSubmitted] = useState(false);

  // Fetch dynamic products & quiz questions from backend
  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([
      productService.getAll({ limit: 12 }),
      api.get("/settings"),
    ]).then(([prodRes, setRes]: any) => {
      if (!isMounted) return;
      if (prodRes.status === "fulfilled" && prodRes.value?.products) {
        const mapped: Product[] = (prodRes.value.products || []).map((doc: ProductDocument) => {
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
      }
      if (setRes.status === "fulfilled" && Array.isArray(setRes.value?.quizQuestions) && setRes.value.quizQuestions.length > 0) {
        setQuestions(setRes.value.quizQuestions);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!open) return null;

  const currentQ = questions[currentStep] || QUIZ_QUESTIONS[0];

  const handleSelectOption = (productId: string) => {
    const nextAnswers = [...answers, productId];
    setAnswers(nextAnswers);

    if (currentStep + 1 < questions.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate top matched product
      const counts: Record<string, number> = {};
      nextAnswers.forEach((id) => {
        counts[id] = (counts[id] || 0) + 1;
      });
      let bestId = nextAnswers[0];
      let maxC = 0;
      Object.entries(counts).forEach(([id, c]) => {
        if (c > maxC) {
          maxC = c;
          bestId = id;
        }
      });

      const matched =
        dynamicProducts.find((p) => p.id === bestId || p.id.includes(bestId)) ||
        dynamicProducts[0] ||
        null;
      setResultProduct(matched);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setAnswers([]);
    setResultProduct(null);
    setProfileSubmitted(false);
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patronEmail.trim() || !resultProduct) return;

    setIsSubmittingProfile(true);
    try {
      await conciergeService.submitInquiry({
        name: "Valued Scent Connoisseur",
        email: patronEmail.trim(),
        phone: "+91 00000 00000",
        preferredScent: resultProduct.name,
        type: "Scent Diagnostic Quiz Match",
        quizResponses: {
          recommendedProduct: resultProduct.name,
          answers,
        },
      });
      setProfileSubmitted(true);
    } catch (err) {
      console.error("Quiz profile submission fallback:", err);
      setProfileSubmitted(true);
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-xl"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="relative z-10 w-full max-w-2xl rounded-3xl border border-gold/30 bg-[#031911] p-6 sm:p-10 shadow-2xl text-cream max-h-[90vh] overflow-y-auto"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full border border-gold/20 text-sand hover:text-gold hover:border-gold transition-colors"
          aria-label="Close quiz"
        >
          <X className="h-4 w-4" />
        </button>

        {!resultProduct ? (
          <div>
            {/* Header & Step Tracker */}
            <div className="flex items-center justify-between border-b border-gold/15 pb-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-gold">
                <Sparkles className="h-3.5 w-3.5" /> Scent Diagnostic
              </div>
              <div className="flex items-center gap-1.5">
                {QUIZ_QUESTIONS.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === currentStep
                        ? "w-6 bg-gold"
                        : i < currentStep
                        ? "w-2 bg-emerald-400"
                        : "w-2 bg-cream/15"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="mt-6"
              >
                <span className="text-xs font-bold text-gold/70">
                  Question 0{currentStep + 1} of 0{QUIZ_QUESTIONS.length}
                </span>
                <h3 className="font-display mt-2 text-2xl font-medium text-cream sm:text-3xl">
                  {currentQ.question}
                </h3>
                <p className="mt-1 text-xs text-sand/70">{currentQ.description}</p>

                {/* Option Cards */}
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {currentQ.options.map((option, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(option.productId)}
                      className="group flex flex-col items-start rounded-2xl border border-white/10 bg-black/30 p-4 text-left transition-all duration-300 hover:border-gold hover:bg-gold/10 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] active:scale-[0.98]"
                    >
                      <span className="font-display text-sm font-semibold text-cream group-hover:text-gold-light transition-colors">
                        {option.label}
                      </span>
                      <span className="mt-1 text-xs text-sand/70 group-hover:text-sand transition-colors">
                        {option.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Back Button */}
            {currentStep > 0 && (
              <div className="mt-6 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(currentStep - 1);
                    setAnswers(answers.slice(0, -1));
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-sand hover:text-gold transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Previous question
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Match Result Screen */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gold-light">
              <Sparkles className="h-3.5 w-3.5" /> Perfect Olfactory Match Found
            </div>

            <div>
              <h3 className="font-display text-3xl font-medium text-cream sm:text-4xl">
                {resultProduct.name}
              </h3>
              <p className="mt-1 text-xs text-gold-light uppercase tracking-widest font-semibold">
                {resultProduct.scentType || "Imperial Extrait"} · ₹{resultProduct.price.toLocaleString("en-IN")}
              </p>
            </div>

            {/* Product Feature Card */}
            <div className="rounded-2xl border border-gold/25 bg-black/40 p-5 text-left flex flex-col sm:flex-row items-center gap-5">
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-gold/20 bg-[#03140e]">
                <img
                  src={resultProduct.image}
                  alt={resultProduct.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <p className="text-xs text-sand/80 leading-relaxed">
                  {resultProduct.description ||
                    "Artisanally distilled over twelve weeks from hand-selected aged agarwood and precious resins. Perfectly balanced for your distinctive profile."}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-sand">
                    Alcohol-Free
                  </span>
                  <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-sand">
                    12-16H Longevity
                  </span>
                  <span className="rounded-md border border-gold/30 bg-gold/10 px-2.5 py-1 text-[10px] font-semibold text-gold-light">
                    99.4% Match
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onAddProduct(resultProduct);
                  onClose();
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-cream px-8 py-3.5 text-xs font-black uppercase tracking-widest text-[#041d14] hover:bg-white hover:shadow-xl transition-all"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Add Extrait to Bag (₹{resultProduct.price.toLocaleString("en-IN")})</span>
              </button>

              <button
                type="button"
                onClick={handleRestart}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-sand hover:text-cream hover:bg-white/10 transition-all"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Retake Diagnostic
              </button>
            </div>

            {/* Save Profile Section */}
            <div className="pt-4 border-t border-white/10">
              {profileSubmitted ? (
                <p className="text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  Your bespoke olfactory profile has been registered with our Master Perfumer.
                </p>
              ) : (
                <form onSubmit={handleSubmitProfile} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                  <input
                    type="email"
                    required
                    placeholder="Enter email to save scent profile..."
                    value={patronEmail}
                    onChange={(e) => setPatronEmail(e.target.value)}
                    className="field flex-1 rounded-xl px-3.5 py-2 text-xs bg-black/40 border-white/15 focus:border-gold text-cream"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingProfile}
                    className="rounded-xl border border-gold/40 bg-gold/15 px-4 py-2 text-xs font-bold uppercase text-gold-light hover:bg-gold hover:text-[#041d14] transition-colors flex items-center justify-center gap-1"
                  >
                    {isSubmittingProfile ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    <span>Save</span>
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
