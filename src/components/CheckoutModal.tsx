import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, CreditCard, Lock, Package, Sparkles, Truck, X } from "lucide-react";
import { FREE_SAMPLES, type CartItem } from "../data";
import { EASE } from "./ui";
import { cn } from "../utils/cn";

export default function CheckoutModal({
  open,
  onClose,
  items: _items,
  totalPrice,
  selectedSample,
  onClearCart,
}: {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  totalPrice: number;
  selectedSample: string;
  onClearCart: () => void;
}) {
  const [step, setStep] = useState<"form" | "processing" | "success">("form");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "apple" | "cod">("card");
  const [orderNumber, setOrderNumber] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "United States",
    postalCode: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    giftWrap: true,
  });

  const sampleName = FREE_SAMPLES.find((s) => s.id === selectedSample)?.name || "Oud Impérial Extrait (1ml)";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("processing");
    const genOrderNo = `AUR-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderNumber(genOrderNo);

    setTimeout(() => {
      setStep("success");
      onClearCart();
    }, 2200);
  };

  const handleReset = () => {
    setStep("form");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={step === "processing" ? undefined : handleReset}
        className="fixed inset-0 bg-black/85 backdrop-blur-xl"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="relative z-10 w-full max-w-2xl rounded-3xl border border-gold/25 bg-ink-2 p-6 sm:p-10 shadow-2xl text-cream max-h-[90vh] overflow-y-auto"
      >
        {step !== "processing" && (
          <button
            type="button"
            onClick={handleReset}
            className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full border border-gold/20 text-sand hover:text-gold hover:border-gold transition-colors"
            aria-label="Close checkout"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <AnimatePresence mode="wait">
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center sm:text-left">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold">
                  Maison Imperial Checkout
                </p>
                <h3 className="font-display mt-1 text-3xl font-medium text-cream sm:text-4xl">
                  Reserve Your Flacon
                </h3>
                <p className="mt-1 text-xs text-sand/70">
                  Total: <strong className="text-gold-light">${totalPrice} USD</strong> · Free Insured Express Delivery Included
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                {/* Contact & Shipping */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gold-light flex items-center gap-2">
                    <Truck className="h-4 w-4 text-gold" /> 1. Shipping Details
                  </h4>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-[11px] font-semibold text-sand">Full Name *</label>
                      <input
                        required
                        type="text"
                        placeholder="Lord / Lady Alexandre Vance"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="field mt-1 w-full rounded-xl px-4 py-2.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-sand">Email Address *</label>
                      <input
                        required
                        type="email"
                        placeholder="alexandre@domain.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="field mt-1 w-full rounded-xl px-4 py-2.5 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-sand">Delivery Address *</label>
                    <input
                      required
                      type="text"
                      placeholder="740 Park Avenue, Penthouse B"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="field mt-1 w-full rounded-xl px-4 py-2.5 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-sand">City *</label>
                      <input
                        required
                        type="text"
                        placeholder="New York"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="field mt-1 w-full rounded-xl px-4 py-2.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-sand">Country</label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="field mt-1 w-full rounded-xl px-4 py-2.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-sand">Postal Code *</label>
                      <input
                        required
                        type="text"
                        placeholder="10021"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        className="field mt-1 w-full rounded-xl px-4 py-2.5 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Selection */}
                <div className="space-y-4 pt-4 border-t border-gold/15">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gold-light flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gold" /> 2. Payment Method
                  </h4>

                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {[
                      { id: "card", label: "Credit Card", icon: CreditCard },
                      { id: "apple", label: "Apple / Google Pay", icon: Sparkles },
                      { id: "cod", label: "Cash on Delivery", icon: Package },
                    ].map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-2xl border p-3.5 text-center text-xs font-bold transition-all",
                          paymentMethod === method.id
                            ? "border-gold bg-gold/15 text-gold-light shadow-[0_0_20px_rgba(212,175,55,0.25)]"
                            : "border-gold/15 bg-ink/50 text-sand hover:border-gold/30 hover:text-cream"
                        )}
                      >
                        <method.icon className="h-4 w-4 text-gold" />
                        <span>{method.label}</span>
                      </button>
                    ))}
                  </div>

                  {paymentMethod === "card" && (
                    <div className="space-y-3 rounded-2xl border border-gold/15 bg-panel/30 p-4">
                      <div>
                        <label className="text-[11px] font-semibold text-sand">Card Number</label>
                        <input
                          required
                          type="text"
                          placeholder="4532 •••• •••• 8892"
                          value={formData.cardNumber}
                          onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                          className="field mt-1 w-full rounded-xl px-4 py-2.5 text-xs font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-sand">Expiry (MM/YY)</label>
                          <input
                            required
                            type="text"
                            placeholder="08/28"
                            value={formData.expiry}
                            onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                            className="field mt-1 w-full rounded-xl px-4 py-2.5 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-sand">Security CVC</label>
                          <input
                            required
                            type="text"
                            placeholder="789"
                            maxLength={4}
                            value={formData.cvv}
                            onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                            className="field mt-1 w-full rounded-xl px-4 py-2.5 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Packaging & Samples */}
                <div className="rounded-2xl border border-gold/15 bg-gold/[0.03] p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between text-sand">
                    <span>Complimentary 1ml Sample:</span>
                    <strong className="text-gold-light">{sampleName}</strong>
                  </div>
                  <label className="flex items-center gap-2 text-sand cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={formData.giftWrap}
                      onChange={(e) => setFormData({ ...formData, giftWrap: e.target.checked })}
                      className="accent-gold h-4 w-4 rounded"
                    />
                    <span>Complimentary gilded black box gift packaging with wax seal</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-3 rounded-full bg-white px-8 py-4 text-xs font-black uppercase tracking-[0.22em] text-ink shadow-[0_4px_25px_rgba(255,255,255,0.25)] hover:bg-cream hover:shadow-[0_6px_30px_rgba(255,255,255,0.4)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
                >
                  <Lock className="h-4 w-4" />
                  Confirm & Place Imperial Order (${totalPrice})
                </button>
              </form>
            </motion.div>
          )}

          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-16 text-center space-y-6"
            >
              <div className="relative mx-auto h-20 w-20">
                <div className="absolute inset-0 rounded-full border-2 border-gold/30 animate-ping" />
                <div className="grid h-full w-full place-items-center rounded-full border-2 border-gold bg-gold/10">
                  <Sparkles className="h-8 w-8 text-gold animate-spin-slow" />
                </div>
              </div>
              <h3 className="font-display text-3xl font-medium text-cream">
                Encrypting & Sealing Order
              </h3>
              <p className="mx-auto max-w-sm text-xs text-sand/70 leading-relaxed">
                Contacting our private atelier vault and preparing your numbered certificate of authenticity...
              </p>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-8 text-center space-y-6"
            >
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border-2 border-emerald-400/80 bg-emerald-400/10 text-emerald-400 shadow-[0_0_40px_rgba(52,211,153,0.3)]">
                <CheckCircle2 className="h-10 w-10" />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-gold">
                  Order Confirmed
                </p>
                <h3 className="font-display mt-2 text-3xl font-medium text-cream sm:text-4xl">
                  Welcome to SPIRIT OF ARABIAN
                </h3>
                <p className="mt-2 text-xs text-sand/80">
                  Order Reference: <strong className="text-gold-light font-mono text-sm">{orderNumber}</strong>
                </p>
              </div>

              <div className="rounded-2xl border border-gold/20 bg-panel/40 p-5 text-left text-xs space-y-3">
                <div className="flex justify-between border-b border-gold/10 pb-2.5">
                  <span className="text-sand">Recipient:</span>
                  <span className="font-semibold text-cream">{formData.name || "Alexandre Vance"}</span>
                </div>
                <div className="flex justify-between border-b border-gold/10 pb-2.5">
                  <span className="text-sand">Delivery Destination:</span>
                  <span className="font-semibold text-cream truncate max-w-[200px]">{formData.city || "New York"}, {formData.country}</span>
                </div>
                <div className="flex justify-between border-b border-gold/10 pb-2.5">
                  <span className="text-sand">Estimated Dispatch:</span>
                  <span className="font-semibold text-gold-light">Within 24 Hours via DHL Express</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sand">Complimentary Sample:</span>
                  <span className="font-semibold text-gold-light">{sampleName}</span>
                </div>
              </div>

              <p className="text-xs text-sand/60">
                A confirmation note and tracked airway bill have been dispatched to <strong className="text-cream">{formData.email || "your address"}</strong>.
              </p>

              <button
                type="button"
                onClick={handleReset}
                className="btn-gold inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-xs font-bold uppercase tracking-widest"
              >
                Return to Maison
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
