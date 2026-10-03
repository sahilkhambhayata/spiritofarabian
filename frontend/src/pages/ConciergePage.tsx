import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Truck,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { BOUTIQUES, FAQS } from "../data";
import { Reveal, SectionHead } from "../components/ui";
import { conciergeService } from "../services/conciergeService";
import { shippingService, type LiveShipmentData } from "../services/shippingService";

export default function ConciergePage() {
  // Consultation Form State
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [consultationData, setConsultationData] = useState({
    name: "",
    email: "",
    phone: "",
    preferredScent: "Oud Impérial 25-Year",
    date: "",
    notes: "",
  });

  // Order Tracker State
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [trackingResult, setTrackingResult] = useState<LiveShipmentData | null>(null);

  const handleConsultationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await conciergeService.submitInquiry({
        name: consultationData.name,
        email: consultationData.email,
        phone: consultationData.phone,
        preferredScent: consultationData.preferredScent,
        preferredDate: consultationData.date ? consultationData.date : undefined,
        notes: consultationData.notes,
        type: "Private Fragrance Consultation",
      });
      setFormSubmitted(true);
    } catch (err: any) {
      console.error("Consultation booking error:", err);
      setSubmitError(err?.response?.data?.message || err?.message || "Failed to submit booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setIsTracking(true);
    setTrackingError(null);
    setTrackingResult(null);

    try {
      const data = await shippingService.trackShipment(trackingNumber.trim());
      setTrackingResult(data);
    } catch (err: any) {
      console.error("Tracking lookup error:", err);
      setTrackingError(err?.response?.data?.message || err?.message || "No active shipment found with this reference.");
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <div className="relative pt-32 sm:pt-36 pb-24 sm:pb-32 text-cream bg-[#041d14]">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-sand/60">
          <Link to="/" className="hover:text-gold-light transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gold-light font-semibold">Client Care & Concierge</span>
        </nav>

        {/* Section Head */}
        <SectionHead
          eyebrow="Private Fragrance Consultation"
          title={
            <>
              At Your Service, <em className="gold-text font-semibold italic">Day and Night.</em>
            </>
          }
          copy="Our master fragrance advisors in Dubai, Mumbai, and London are available for bespoke scent matching, private flacon engraving, and live order assistance."
        />

        {/* 2-Column: Booking Consultation & Order Tracker */}
        <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Consultation Form */}
          <div className="lg:col-span-7">
            <Reveal>
              <div className="rounded-3xl p-6 sm:p-10 border border-gold/30 bg-[#031911]/90 backdrop-blur-md shadow-2xl">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gold">
                  <Sparkles className="h-3.5 w-3.5" /> Bespoke Appointment
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-medium text-cream mt-1">
                  Request Private Olfactory Consultation
                </h3>
                <p className="text-xs text-sand/75 mt-1 leading-relaxed">
                  Meet virtually or in salon with a SPIRIT OF ARABIAN nose to curate your bespoke scent wardrobe.
                </p>

                {submitError && (
                  <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {formSubmitted ? (
                  <div className="mt-8 rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-6 text-center space-y-3">
                    <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                    <h4 className="font-display text-xl font-semibold text-cream">
                      Consultation Requested
                    </h4>
                    <p className="text-xs text-sand/80 leading-relaxed">
                      Your appointment has been registered with our private atelier. Our client director will contact you at <strong className="text-cream">{consultationData.email}</strong> within 4 hours.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setFormSubmitted(false);
                        setConsultationData({
                          name: "",
                          email: "",
                          phone: "",
                          preferredScent: "Oud Impérial 25-Year",
                          date: "",
                          notes: "",
                        });
                      }}
                      className="mt-3 text-xs text-gold-light underline hover:text-gold"
                    >
                      Book another appointment
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleConsultationSubmit} className="mt-6 space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-[11px] font-semibold text-sand">Full Name *</label>
                        <input
                          required
                          type="text"
                          placeholder="Lord / Lady Alexandre Vance"
                          value={consultationData.name}
                          onChange={(e) => setConsultationData({ ...consultationData, name: e.target.value })}
                          className="field mt-1 w-full rounded-xl px-4 py-2.5 text-xs bg-black/40 border-white/15 focus:border-gold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-sand">Email Address *</label>
                        <input
                          required
                          type="email"
                          placeholder="alexandre@domain.com"
                          value={consultationData.email}
                          onChange={(e) => setConsultationData({ ...consultationData, email: e.target.value })}
                          className="field mt-1 w-full rounded-xl px-4 py-2.5 text-xs bg-black/40 border-white/15 focus:border-gold"
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-[11px] font-semibold text-sand">Phone / WhatsApp *</label>
                        <input
                          required
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={consultationData.phone}
                          onChange={(e) => setConsultationData({ ...consultationData, phone: e.target.value })}
                          className="field mt-1 w-full rounded-xl px-4 py-2.5 text-xs bg-black/40 border-white/15 focus:border-gold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-sand">Preferred Extrait Horizon</label>
                        <select
                          value={consultationData.preferredScent}
                          onChange={(e) => setConsultationData({ ...consultationData, preferredScent: e.target.value })}
                          className="field mt-1 w-full rounded-xl px-4 py-2.5 text-xs text-cream bg-[#03140e] border-white/15 focus:border-gold cursor-pointer"
                        >
                          <option value="Oud Impérial 25-Year">Oud Impérial 25-Year (Cambodian Agarwood)</option>
                          <option value="Royal Ambergris Royale">Royal Ambergris Royale (Oceanic Fossilized)</option>
                          <option value="Taif Rose Extrait">Taif Rose Extrait (Mountain Ward Rose)</option>
                          <option value="Musk Céleste">Musk Céleste (Florentine Iris & Pure Musk)</option>
                          <option value="Discovery Coffret">Discovery Coffret Consultation</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-sand">Preferred Consultation Date</label>
                      <input
                        type="date"
                        value={consultationData.date}
                        onChange={(e) => setConsultationData({ ...consultationData, date: e.target.value })}
                        className="field mt-1 w-full rounded-xl px-4 py-2.5 text-xs text-cream bg-black/40 border-white/15 focus:border-gold"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-sand">Special Olfactory Notes or Requests (Optional)</label>
                      <textarea
                        rows={3}
                        placeholder="Tell our master perfumer about your preferred scent notes, occasions, or custom flacon engraving requests..."
                        value={consultationData.notes}
                        onChange={(e) => setConsultationData({ ...consultationData, notes: e.target.value })}
                        className="field mt-1 w-full rounded-xl px-4 py-2.5 text-xs bg-black/40 border-white/15 focus:border-gold text-cream"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 rounded-full bg-cream py-3.5 text-xs font-black uppercase tracking-widest text-[#041d14] hover:bg-white hover:shadow-xl transition-all disabled:opacity-50 mt-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Reserving Appointment...</span>
                        </>
                      ) : (
                        <span>Book Private Consultation</span>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </Reveal>
          </div>

          {/* Right Column: Order Tracker & Quick Contact */}
          <div className="lg:col-span-5 space-y-6">
            {/* Order Tracker Box */}
            <div className="rounded-3xl p-6 sm:p-8 border border-gold/25 bg-[#031911]/90 backdrop-blur-md shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gold">
                <Truck className="h-4 w-4" /> Global Dispatch Tracking
              </div>
              <h4 className="font-display text-2xl font-medium text-cream">
                Track Your Shipment
              </h4>
              <p className="text-xs text-sand/75 leading-relaxed">
                Enter your Order Reference Number (e.g. <strong className="text-gold-light font-mono">SOA-89421</strong>) or Airway Bill to view live courier status.
              </p>

              <form onSubmit={handleTrackOrder} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. SOA-89421"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="field flex-1 rounded-xl px-4 py-2.5 text-xs text-cream uppercase font-mono bg-black/40 border-white/15 focus:border-gold"
                />
                <button
                  type="submit"
                  disabled={isTracking || !trackingNumber.trim()}
                  className="rounded-xl border border-gold/40 bg-gold/15 px-4 py-2.5 text-xs font-bold uppercase text-gold-light hover:bg-gold hover:text-[#041d14] disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  {isTracking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Track"}
                </button>
              </form>

              {trackingError && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                  {trackingError}
                </div>
              )}

              {trackingResult && (
                <div className="rounded-2xl border border-gold/20 bg-black/40 p-4 text-xs space-y-2.5">
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-sand/70">Order / AWB:</span>
                    <strong className="text-gold-light font-mono">{trackingResult.orderNumber || trackingNumber}</strong>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-sand/70">Carrier:</span>
                    <span className="text-cream font-semibold">{trackingResult.tracking?.carrier || "Shiprocket Express"}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-sand/70">Current Status:</span>
                    <span className="text-emerald-400 font-semibold">{trackingResult.orderStatus || "In Transit"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sand/70">Destination:</span>
                    <span className="text-cream font-semibold truncate max-w-[180px]">
                      {trackingResult.shippingAddress?.city}, {trackingResult.shippingAddress?.country}
                    </span>
                  </div>
                  <div className="pt-2">
                    <Link
                      to={`/track-order?query=${trackingResult.orderNumber || trackingNumber}`}
                      className="inline-flex items-center gap-1.5 text-xs text-gold-light hover:underline font-semibold"
                    >
                      <span>Open Full Tracking Timeline</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Concierge Contact */}
            <div className="rounded-3xl p-6 sm:p-8 border border-gold/20 bg-[#031911]/90 backdrop-blur-md shadow-xl space-y-3 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold block">
                Direct Contact Channels
              </span>
              <div className="space-y-2 pt-1">
                <a
                  href="mailto:concierge@arabianspirit.com"
                  className="flex items-center gap-2.5 text-sand hover:text-gold-light transition-colors"
                >
                  <Mail className="h-4 w-4 text-gold" /> concierge@arabianspirit.com
                </a>
                <a
                  href="tel:+919876543210"
                  className="flex items-center gap-2.5 text-sand hover:text-gold-light transition-colors"
                >
                  <Phone className="h-4 w-4 text-gold" /> +91 98765 43210 (Client Care Atelier)
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Boutique Atelier Locations */}
        <section className="mt-24 border-t border-gold/15 pt-16">
          <SectionHead
            eyebrow="Physical Ateliers & Salons"
            title={
              <>
                Visit Our <em className="gold-text font-semibold italic">Flagship Sanctuaries.</em>
              </>
            }
          />

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {BOUTIQUES.map((b) => (
              <div key={b.city} className="rounded-3xl p-6 border border-white/10 bg-[#031911]/70 backdrop-blur-md space-y-3 shadow-lg">
                <div className="flex items-center gap-2 text-xs font-bold text-gold-light">
                  <MapPin className="h-4 w-4 text-gold shrink-0" />
                  {b.city}
                </div>
                <p className="text-xs text-sand/80 leading-relaxed">{b.address}</p>
                <div className="border-t border-white/10 pt-3 space-y-1 text-[11px] text-sand/60">
                  <p className="flex items-center gap-1.5"><Clock className="h-3 w-3 text-gold" /> {b.hours}</p>
                  <p className="flex items-center gap-1.5"><Phone className="h-3 w-3 text-gold" /> {b.phone}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="mt-24 border-t border-gold/15 pt-16">
          <SectionHead
            eyebrow="Knowledge Base"
            title={
              <>
                Frequently Answered <em className="gold-text font-semibold italic">Inquiries.</em>
              </>
            }
          />

          <div className="mt-10 max-w-3xl mx-auto space-y-3">
            {FAQS.map((f) => (
              <div key={f.q} className="rounded-2xl p-5 border border-white/10 bg-[#031911]/70 backdrop-blur-md space-y-2">
                <h4 className="font-display text-base sm:text-lg font-semibold text-cream">{f.q}</h4>
                <p className="text-xs text-sand/80 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
