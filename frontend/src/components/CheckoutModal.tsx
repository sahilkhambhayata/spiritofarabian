import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  CreditCard,
  Lock,
  Package,
  Sparkles,
  Truck,
  X,
  Loader2,
  MapPin,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import { FREE_SAMPLES, type CartItem } from "../data";
import { EASE } from "./ui";
import { cn } from "../utils/cn";
import { orderService, type OrderDocument } from "../services/orderService";
import { shippingService, type ShippingRateTier } from "../services/shippingService";
import cartService from "../services/cartService";
import api from "../services/api";

export default function CheckoutModal({
  open,
  onClose,
  items,
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
  const [paymentMethod, setPaymentMethod] = useState<"Razorpay" | "Stripe" | "COD">("Razorpay");
  const [confirmedOrder, setConfirmedOrder] = useState<OrderDocument | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sampleOptions, setSampleOptions] = useState<any[]>(FREE_SAMPLES);

  // Shipping Rates & Serviceability State
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [availableTiers, setAvailableTiers] = useState<ShippingRateTier[]>([]);
  const [selectedTier, setSelectedTier] = useState<string>("shiprocket_surface");
  const [shippingFee, setShippingFee] = useState<number>(0);

  const [formData, setFormData] = useState({
    name: "Alexandre Vance",
    email: "alexandre.vance@luxuryperfume.com",
    phone: "+91 98765 43210",
    street: "740 Park Avenue, Royal Suite 4B",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    pincode: "400001",
    giftWrap: true,
  });

  useEffect(() => {
    let isMounted = true;
    api.get("/settings")
      .then((res: any) => {
        if (!isMounted || !res) return;
        if (Array.isArray(res.freeSamples) && res.freeSamples.length > 0) {
          setSampleOptions(res.freeSamples.filter((s: any) => s.isActive !== false));
        }
      })
      .catch((err) => console.warn("Free samples settings fetch:", err));

    return () => {
      isMounted = false;
    };
  }, []);

  const sampleName = sampleOptions.find((s) => s.id === selectedSample)?.name || "Oud Impérial Extrait (1ml)";

  // Subtotal calculation
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Sync abandoned cart session & customer details
  useEffect(() => {
    if (open && items.length > 0) {
      if (formData.email) {
        localStorage.setItem("soa_checkout_email", formData.email);
        localStorage.setItem("soa_checkout_name", formData.name);
        localStorage.setItem("soa_checkout_phone", formData.phone);
      }
      cartService.syncCart(items, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });
    }
  }, [open, items, formData.email, formData.name, formData.phone]);

  // Auto-calculate shipping rates when country or pincode changes
  useEffect(() => {
    if (!open || !formData.pincode || formData.pincode.length < 3) return;

    let isMounted = true;
    const fetchRates = async () => {
      setCalculatingShipping(true);
      try {
        const payload = {
          country: formData.country,
          pincode: formData.pincode,
          subTotal: subtotal,
          items: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        };

        const res = await shippingService.calculateRates(payload);
        if (isMounted && res && res.options && res.options.length > 0) {
          const mappedTiers = res.options.map((opt) => ({
            tierId: String(opt.courierId),
            name: opt.courierName,
            courierPartner: opt.serviceType || "Express Courier",
            rate: opt.finalShippingFee,
            estimatedDays: String(opt.estimatedDays) + " Business Days",
          }));
          setAvailableTiers(mappedTiers);
          setSelectedTier(mappedTiers[0].tierId);
          setShippingFee(mappedTiers[0].rate);
        }
      } catch (err) {
        console.error("Shipping rate calculation fallback:", err);
        // Fallback default
        if (formData.country.toLowerCase() === "india") {
          setShippingFee(subtotal >= 1500 ? 0 : 150);
        } else {
          setShippingFee(1850);
        }
      } finally {
        if (isMounted) setCalculatingShipping(false);
      }
    };

    fetchRates();

    return () => {
      isMounted = false;
    };
  }, [open, formData.pincode, formData.country, subtotal, items]);

  const grandTotal = Math.max(0, subtotal + shippingFee);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    setStep("processing");

    try {
      const orderPayload = {
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          size: item.volume || item.sizeLabel || "6ml",
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        customerDetails: {
          fullName: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
        },
        shippingAddress: {
          street: formData.street.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
          country: formData.country.trim(),
        },
        giftOptions: {
          isGift: formData.giftWrap,
          giftWrap: formData.giftWrap,
          giftMessage: formData.giftWrap ? `Complimentary luxury flacon gift box with ${sampleName}` : "",
        },
        paymentMethod,
        shippingFee,
        shippingTier: selectedTier as any,
      };

      const createdOrder = await orderService.createOrder(orderPayload);
      setConfirmedOrder(createdOrder);

      setTimeout(() => {
        setStep("success");
        onClearCart();
      }, 1500);
    } catch (err: any) {
      console.error("Order creation failed:", err);
      setErrorMsg(err?.response?.data?.message || err?.message || "Could not reserve flacon. Please check details.");
      setStep("form");
    } finally {
      setIsSubmitting(false);
    }
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
        className="relative z-10 w-full max-w-2xl rounded-3xl border border-gold/30 bg-[#031911] p-6 sm:p-10 shadow-2xl text-cream max-h-[90vh] overflow-y-auto"
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
                  Reserve Your Artisanal Flacons
                </h3>
                <p className="mt-1 text-xs text-sand/70">
                  Total: <strong className="text-gold-light font-mono">₹{grandTotal.toLocaleString("en-IN")}</strong> · Free Insured Express Delivery Above ₹1,500
                </p>
              </div>

              {errorMsg && (
                <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                {/* Contact & Shipping */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gold-light flex items-center gap-2">
                    <Truck className="h-4 w-4 text-gold" /> 1. Shipping Destination & Recipient
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
                        className="field mt-1 w-full rounded-xl px-4 py-2.5 text-xs bg-black/40 border-white/15 focus:border-gold"
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
                        className="field mt-1 w-full rounded-xl px-4 py-2.5 text-xs bg-black/40 border-white/15 focus:border-gold"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-[11px] font-semibold text-sand">Mobile Phone Number *</label>
                      <input
                        required
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="field mt-1 w-full rounded-xl px-4 py-2.5 text-xs bg-black/40 border-white/15 focus:border-gold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-sand">Country / Territory *</label>
                      <select
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="field mt-1 w-full rounded-xl px-4 py-2.5 text-xs bg-[#03140e] border-white/15 focus:border-gold text-cream"
                      >
                        <option value="India">India (Shiprocket Domestic)</option>
                        <option value="United Arab Emirates">United Arab Emirates (DHL Express)</option>
                        <option value="United States">United States (DHL Express)</option>
                        <option value="United Kingdom">United Kingdom (DHL Express)</option>
                        <option value="Saudi Arabia">Saudi Arabia (DHL Express)</option>
                        <option value="Singapore">Singapore (DHL Express)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-sand">Delivery Address (Apartment / Villa, Street) *</label>
                    <input
                      required
                      type="text"
                      placeholder="740 Park Avenue, Royal Suite 4B"
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      className="field mt-1 w-full rounded-xl px-4 py-2.5 text-xs bg-black/40 border-white/15 focus:border-gold"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-sand">City *</label>
                      <input
                        required
                        type="text"
                        placeholder="Mumbai"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="field mt-1 w-full rounded-xl px-4 py-2.5 text-xs bg-black/40 border-white/15 focus:border-gold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-sand">State</label>
                      <input
                        type="text"
                        placeholder="Maharashtra"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="field mt-1 w-full rounded-xl px-4 py-2.5 text-xs bg-black/40 border-white/15 focus:border-gold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-sand">Postal Code / PIN *</label>
                      <input
                        required
                        type="text"
                        placeholder="400001"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        className="field mt-1 w-full rounded-xl px-4 py-2.5 text-xs bg-black/40 border-white/15 focus:border-gold"
                      />
                    </div>
                  </div>

                  {/* Available Courier Tiers */}
                  {availableTiers.length > 0 && (
                    <div className="pt-2 space-y-2">
                      <label className="text-[11px] font-semibold text-sand flex items-center justify-between">
                        <span>Courier Service Option</span>
                        {calculatingShipping && <Loader2 className="h-3 w-3 animate-spin text-gold" />}
                      </label>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {availableTiers.map((tier) => (
                          <div
                            key={tier.tierId}
                            onClick={() => {
                              setSelectedTier(tier.tierId);
                              if (formData.country.toLowerCase() === "india" && subtotal >= 1500) {
                                setShippingFee(0);
                              } else {
                                setShippingFee(tier.rate);
                              }
                            }}
                            className={cn(
                              "cursor-pointer rounded-xl border p-3 text-xs transition-all",
                              selectedTier === tier.tierId
                                ? "border-gold bg-gold/10 text-cream shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                                : "border-white/10 bg-black/20 text-sand hover:border-white/20"
                            )}
                          >
                            <div className="flex justify-between font-semibold">
                              <span>{tier.name}</span>
                              <span className="font-mono text-gold-light">
                                {formData.country.toLowerCase() === "india" && subtotal >= 1500 ? "FREE" : `₹${tier.rate}`}
                              </span>
                            </div>
                            <p className="text-[10px] text-sand/60 mt-0.5">
                              {tier.estimatedDays} · {tier.courierPartner}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Selection */}
                <div className="space-y-4 pt-4 border-t border-gold/15">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gold-light flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gold" /> 2. Imperial Payment Settlement
                  </h4>

                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {[
                      { id: "Razorpay", label: "UPI & NetBanking", icon: Sparkles },
                      { id: "Stripe", label: "Credit / Debit Card", icon: CreditCard },
                      { id: "COD", label: "Cash on Delivery", icon: Package },
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
                </div>

                {/* Packaging & Samples */}
                <div className="rounded-2xl border border-gold/20 bg-gold/[0.04] p-4 text-xs space-y-2">
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
                    <span>Complimentary gilded black box gift packaging with gold wax seal</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-3 rounded-full bg-cream px-8 py-4 text-xs font-black uppercase tracking-[0.22em] text-[#041d14] shadow-[0_4px_25px_rgba(253,250,242,0.25)] hover:bg-white hover:shadow-[0_6px_30px_rgba(253,250,242,0.4)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-50"
                >
                  <Lock className="h-4 w-4" />
                  <span>Confirm & Place Imperial Order (₹{grandTotal.toLocaleString("en-IN")})</span>
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

          {step === "success" && confirmedOrder && (
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
                  Order Reference: <strong className="text-gold-light font-mono text-base">{confirmedOrder.orderNumber}</strong>
                </p>
              </div>

              <div className="rounded-2xl border border-gold/20 bg-black/40 p-5 text-left text-xs space-y-3">
                <div className="flex justify-between border-b border-white/10 pb-2.5">
                  <span className="text-sand">Recipient:</span>
                  <span className="font-semibold text-cream">{confirmedOrder.customerDetails.fullName}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2.5">
                  <span className="text-sand">Delivery Destination:</span>
                  <span className="font-semibold text-cream truncate max-w-[220px]">
                    {confirmedOrder.shippingAddress.city}, {confirmedOrder.shippingAddress.country}
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2.5">
                  <span className="text-sand">Carrier & Tracking:</span>
                  <span className="font-semibold text-gold-light font-mono">
                    {confirmedOrder.tracking?.carrier || "Shiprocket Express"} ({confirmedOrder.tracking?.trackingNumber || "Assigned Upon Dispatch"})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sand">Complimentary Sample:</span>
                  <span className="font-semibold text-gold-light">{sampleName}</span>
                </div>
              </div>

              <p className="text-xs text-sand/60">
                A confirmation note and tracked airway bill have been dispatched to <strong className="text-cream">{confirmedOrder.customerDetails.email}</strong>.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  to={`/track-order?query=${confirmedOrder.orderNumber}`}
                  onClick={handleReset}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gold px-7 py-3 text-xs uppercase font-bold tracking-widest text-[#041d14] hover:bg-gold-light transition-all"
                >
                  <Truck className="h-4 w-4" />
                  <span>Track Live Airway Bill</span>
                </Link>
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-xs uppercase font-semibold text-cream hover:bg-white/10 transition-all"
                >
                  Return to Maison
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
