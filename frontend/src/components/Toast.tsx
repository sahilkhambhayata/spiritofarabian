import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Info, Sparkles, X } from "lucide-react";
import { EASE } from "./ui";

export type ToastMessage = {
  id: string;
  title: string;
  description?: string;
  type?: "success" | "info" | "gold";
  actionLink?: string;
  actionText?: string;
};

export default function Toast({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none max-w-sm w-full px-4">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="pointer-events-auto flex items-start gap-3.5 rounded-2xl border border-white/15 bg-[#041d14]/95 p-4 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10"
            role="alert"
          >
            <div className="shrink-0 mt-0.5">
              {t.type === "gold" ? (
                <Sparkles className="h-4 w-4 text-gold/90" />
              ) : t.type === "info" ? (
                <Info className="h-4 w-4 text-gold" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-cream">
                {t.title}
              </p>
              {t.description && (
                <p className="mt-1 text-xs text-sand/80 leading-snug">
                  {t.description}
                </p>
              )}
              {t.actionLink && (
                <Link
                  to={t.actionLink}
                  onClick={() => onDismiss(t.id)}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-cream underline underline-offset-4 hover:text-gold-light transition-colors"
                >
                  <span>{t.actionText || "View Bag"}</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>

            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              className="text-sand/50 hover:text-cream transition-colors p-1"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
