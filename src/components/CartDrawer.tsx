import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Gift, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck, X } from "lucide-react";
import { FREE_SAMPLES, type CartItem } from "../data";
import { EASE } from "./ui";
import { cn } from "../utils/cn";

const FREE_SHIPPING_THRESHOLD = 95;

export default function CartDrawer({
  open,
  onClose,
  items,
  onUpdateQty,
  onRemoveItem,
  onCheckout,
  discountPercent,
  onApplyPromo,
  selectedSample,
  onSelectSample,
}: {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQty: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  discountPercent: number;
  onApplyPromo: (code: string) => boolean;
  selectedSample: string;
  onSelectSample: (sampleId: string) => void;
}) {
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const total = Math.max(0, subtotal - discountAmount);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    if (!promoInput.trim()) return;
    const ok = onApplyPromo(promoInput.trim());
    if (ok) {
      setPromoSuccess(true);
      setPromoError("");
    } else {
      setPromoError("Invalid code. Try 'ARABIAN15' for 15% off.");
      setPromoSuccess(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex justify-end" role="dialog" aria-modal="true" aria-label="Shopping Bag">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: EASE }}
            className="relative z-10 flex h-full w-full max-w-md flex-col bg-ink-2 border-l border-gold/20 shadow-2xl text-cream"
          >
            {/* Header */}
            <div className="flex h-20 items-center justify-between border-b border-gold/15 px-6">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5 text-gold" />
                <h2 className="font-display text-2xl font-medium tracking-wide text-cream">
                  Imperial Bag
                </h2>
                <span className="grid h-6 min-w-6 place-items-center rounded-full bg-gold/15 border border-gold/30 px-1.5 text-xs font-bold text-gold">
                  {items.reduce((s, i) => s + i.quantity, 0)}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid h-10 w-10 place-items-center rounded-full border border-gold/20 text-sand hover:text-gold hover:border-gold transition-colors"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Free Shipping Progress Bar */}
            <div className="border-b border-gold/10 bg-gold/[0.04] px-6 py-3.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-gold-light">
                  <Truck className="h-3.5 w-3.5 text-gold" />
                  {freeShippingProgress >= 100
                    ? "Complimentary insured worldwide shipping unlocked!"
                    : `Add $${remainingForFreeShipping} more for Free Worldwide Shipping`}
                </span>
                <span className="text-[11px] text-sand/60">{freeShippingProgress}%</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-cream/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-2 transition-all duration-500"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>

            {/* Cart Items or Empty State */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center py-16">
                  <div className="grid h-16 w-16 place-items-center rounded-full border border-gold/25 bg-gold/[0.05] text-gold/60">
                    <ShoppingBag className="h-8 w-8" />
                  </div>
                  <h3 className="font-display mt-5 text-2xl font-medium text-cream">
                    Your bag is empty
                  </h3>
                  <p className="mt-2 max-w-xs text-xs text-sand/70 leading-relaxed">
                    Discover our collection of rare attar extraits, distilled over twelve weeks without alcohol.
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-gold mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs uppercase tracking-widest font-bold"
                  >
                    Explore Collection
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="group flex gap-4 rounded-2xl border border-gold/15 bg-panel/30 p-3.5 transition-all hover:border-gold/30 hover:bg-panel/50"
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gold/20 bg-ink">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="flex flex-1 flex-col justify-between min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="font-display text-base font-semibold text-cream truncate">
                              {item.name}
                            </h4>
                            <p className="text-[11px] font-semibold text-gold/70">
                              {item.sizeLabel}
                            </p>
                          </div>
                          <p className="font-display text-base font-semibold text-gold-light shrink-0">
                            ${item.price * item.quantity}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gold/10">
                          {/* Qty controller */}
                          <div className="flex items-center rounded-lg border border-gold/25 bg-ink-2/80 px-1 py-0.5">
                            <button
                              type="button"
                              onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                              className="p-1 text-sand hover:text-gold transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-7 text-center text-xs font-bold text-cream">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                              className="p-1 text-sand hover:text-gold transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            className="text-sand/40 hover:text-rose-400 transition-colors p-1"
                            aria-label={`Remove ${item.name} from bag`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Free Sample Gift Selection */}
                  <div className="rounded-2xl border border-gold/20 bg-gold/[0.03] p-4 mt-6">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-light">
                      <Gift className="h-4 w-4 text-gold" />
                      Select 1 Free 1ml Extrait Sample
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {FREE_SAMPLES.map((sample) => (
                        <button
                          key={sample.id}
                          type="button"
                          onClick={() => onSelectSample(sample.id)}
                          className={cn(
                            "flex items-center justify-between gap-1 rounded-xl border p-2.5 text-left text-[11px] font-semibold transition-all",
                            selectedSample === sample.id
                              ? "border-gold bg-gold/15 text-gold-light shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                              : "border-gold/15 bg-ink/40 text-sand/70 hover:border-gold/30 hover:text-cream"
                          )}
                        >
                          <span className="truncate">{sample.name}</span>
                          {selectedSample === sample.id && (
                            <Check className="h-3.5 w-3.5 shrink-0 text-gold" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Promo Code Form */}
                  <div className="pt-2">
                    <form onSubmit={handlePromoSubmit} className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="Promo code (e.g. ARABIAN15)"
                        className="field flex-1 rounded-xl px-4 py-2.5 text-xs text-cream uppercase placeholder:normal-case"
                      />
                      <button
                        type="submit"
                        className="rounded-xl border border-gold/30 bg-gold/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gold-light hover:bg-gold hover:text-ink transition-colors"
                      >
                        Apply
                      </button>
                    </form>
                    {promoError && (
                      <p className="mt-1.5 text-[11px] text-rose-400 font-medium">
                        {promoError}
                      </p>
                    )}
                    {(promoSuccess || discountPercent > 0) && (
                      <p className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <Check className="h-3 w-3" /> {discountPercent}% Royal VIP discount active!
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {items.length > 0 && (
              <div className="border-t border-gold/15 bg-ink-2/95 p-6 space-y-4">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-sand">
                    <span>Subtotal</span>
                    <span className="font-semibold text-cream">${subtotal}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>VIP Privilege Discount ({discountPercent}%)</span>
                      <span>-${discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sand">
                    <span>Worldwide Insured Shipping</span>
                    <span className="font-semibold text-cream">
                      {freeShippingProgress >= 100 ? "FREE" : "$15"}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-2 border-t border-gold/15">
                    <span className="font-display text-lg font-semibold text-cream">Total</span>
                    <span className="font-display text-2xl font-bold text-gold-light">
                      ${total + (freeShippingProgress >= 100 ? 0 : 15)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onCheckout();
                  }}
                  className="btn-gold w-full flex items-center justify-center gap-2.5 rounded-full py-4 text-xs font-black uppercase tracking-[0.2em]"
                >
                  Proceed to Secure Checkout
                  <ArrowRight className="h-4 w-4" />
                </button>

                <div className="flex items-center justify-center gap-3 text-[10.5px] text-sand/60">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-gold" /> 256-bit Encrypted
                  </span>
                  <span>•</span>
                  <span>30-Day Sillage Guarantee</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
