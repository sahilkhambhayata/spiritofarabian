import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, RotateCcw, ShoppingBag, Sparkles, X } from "lucide-react";
import { PRODUCTS, QUIZ_QUESTIONS, type Product } from "../data";
import { EASE } from "./ui";
import { cn } from "../utils/cn";

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

  if (!open) return null;

  const currentQ = QUIZ_QUESTIONS[currentStep];

  const handleSelectOption = (productId: string) => {
    const nextAnswers = [...answers, productId];
    setAnswers(nextAnswers);

    if (currentStep + 1 < QUIZ_QUESTIONS.length) {
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
      const matched = PRODUCTS.find((p) => p.id === bestId) || PRODUCTS[0];
      setResultProduct(matched);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setAnswers([]);
    setResultProduct(null);
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
        className="relative z-10 w-full max-w-2xl rounded-3xl border border-gold/30 bg-ink-2 p-6 sm:p-10 shadow-2xl text-cream max-h-[90vh] overflow-y-auto"
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
                <h3 className="font-display mt-1 text-2xl sm:text-3xl font-medium text-cream">
                  {currentQ.question}
                </h3>
                <p className="mt-1 text-xs text-sand/70">
                  {currentQ.subtitle}
                </p>

                {/* Options */}
                <div className="mt-6 space-y-3">
                  {currentQ.options.map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => handleSelectOption(opt.productId)}
                      className="group flex w-full items-start justify-between gap-4 rounded-2xl border border-gold/15 bg-panel/30 p-4 text-left transition-all duration-300 hover:border-gold hover:bg-panel/70 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display text-base font-semibold text-cream group-hover:text-gold-light">
                            {opt.label}
                          </span>
                          <span className="rounded-full bg-gold/10 border border-gold/20 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold">
                            {opt.tag}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-sand/70">
                          {opt.description}
                        </p>
                      </div>
                      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-gold/20 text-sand group-hover:border-gold group-hover:text-gold">
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </button>
                  ))}
                </div>

                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(currentStep - 1);
                      setAnswers(answers.slice(0, -1));
                    }}
                    className="mt-6 flex items-center gap-2 text-xs font-semibold text-sand/60 hover:text-gold transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Previous Question
                  </button>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          /* Result Card */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.5em] text-gold">
              <Sparkles className="h-3.5 w-3.5" /> Olfactory Match Revealed
            </div>

            <h3 className="font-display mt-2 text-3xl sm:text-4xl font-medium text-cream">
              Your Signature Extrait: <span className="gold-text italic font-bold">{resultProduct.name}</span>
            </h3>
            <p className="mt-2 text-xs text-sand/80 max-w-md mx-auto leading-relaxed">
              Based on your ritual preferences, {resultProduct.name} seamlessly aligns with your desired mood and longevity expectation.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center gap-6 rounded-3xl border border-gold/25 bg-panel/40 p-6 text-left">
              <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-2xl border border-gold/20 bg-ink">
                <img
                  src={resultProduct.image}
                  alt={resultProduct.name}
                  className="h-full w-full object-cover"
                />
                {resultProduct.badge && (
                  <span className="absolute top-2 left-2 rounded-full bg-gold px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-ink">
                    {resultProduct.badge}
                  </span>
                )}
              </div>

              <div className="flex-1 space-y-2.5 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gold/70">
                  {resultProduct.tagline}
                </p>
                <h4 className="font-display text-2xl font-semibold text-cream">
                  {resultProduct.name}
                </h4>
                <p className="text-xs text-sand/80 line-clamp-2">
                  {resultProduct.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {resultProduct.notes.heart.map((n) => (
                    <span
                      key={n.name}
                      className="rounded-full border border-gold/15 bg-gold/[0.05] px-2.5 py-1 text-[10px] font-semibold text-gold-light"
                    >
                      {n.name}
                    </span>
                  ))}
                </div>

                <div className="flex items-baseline gap-3 pt-2">
                  <span className="font-display text-2xl font-bold text-gold-light">
                    ${resultProduct.price}
                  </span>
                  <span className="text-[11px] text-sand/60">
                    12ml Imperial Extrait ({resultProduct.longevityHours})
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onAddProduct(resultProduct);
                  onClose();
                }}
                className="btn-gold w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-xs font-bold uppercase tracking-wider"
              >
                <ShoppingBag className="h-4 w-4" />
                Add {resultProduct.name} to Imperial Bag
              </button>

              <button
                type="button"
                onClick={handleRestart}
                className="btn-ghost w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-xs font-semibold"
              >
                <RotateCcw className="h-3.5 w-3.5 text-gold" />
                Retake Diagnostic
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
