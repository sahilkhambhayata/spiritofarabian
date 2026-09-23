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
} from "lucide-react";
import { BOUTIQUES, FAQS } from "../data";
import { Reveal, SectionHead } from "../components/ui";

export default function ConciergePage() {
  // Consultation Form State
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [consultationData, setConsultationData] = useState({
    name: "",
    email: "",
    phone: "",
    preferredScent: "Oud Impérial",
    date: "",
    notes: "",
  });

  // Order Tracker State
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingResult, setTrackingResult] = useState<any>(null);

  const handleConsultationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    setTrackingResult({
      id: trackingNumber.trim().toUpperCase(),
      status: "Dispatched via DHL Express (Insured)",
      carrier: "DHL Express Global",
      estDelivery: "2–4 Business Days",
      origin: "Dubai Atelier Vault",
    });
  };

  return (
    <div className="relative pt-32 sm:pt-36 pb-24 sm:pb-32 text-cream">
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
          copy="Our fragrance advisors in Dubai, Rotterdam, and London are available for bespoke scent matching, private flacon engraving, and order assistance."
        />

        {/* 2-Column: Booking Consultation & Order Tracker */}
        <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Consultation Form */}
          <div className="lg:col-span-7">
            <Reveal>
              <div className="glass-card rounded-3xl p-6 sm:p-10 border border-gold/30">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gold">
                  <Sparkles className="h-3.5 w-3.5" /> Bespoke Appointment
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-medium text-cream mt-1">
                  Request Private Olfactory Consultation
                </h3>
                <p className="text-xs text-sand/75 mt-1 leading-relaxed">
                  Meet virtually or in salon with a SPIRIT OF ARABIAN nose to curate your bespoke scent wardrobe.
                </p>

                {formSubmitted ? (
                  <div className="mt-8 rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-6 text-center space-y-3">
                    <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                    <h4 className="font-display text-xl font-semibold text-cream">
                      Consultation Requested
                    </h4>
                    <p className="text-xs text-sand/80">
                      Our private client director will contact you at <strong className="text-cream">{consultationData.email}</strong> within 4 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleConsultationSubmit} className="mt-6 space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-[11px] font-semibold text-sand">Full Name *</label>
                        <input
                          required
                          type="text"
                          placeholder="Your Name"
                          value={consultationData.name}
                          onChange={(e) => setConsultationData({ ...consultationData, name: e.target.value })}
                          className="field mt-1 w-full rounded-xl px-4 py-2.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-sand">Email Address *</label>
                        <input
                          required
                          type="email"
                          placeholder="your@email.com"
                          value={consultationData.email}
                          onChange={(e) => setConsultationData({ ...consultationData, email: e.target.value })}
                          className="field mt-1 w-full rounded-xl px-4 py-2.5 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-[11px] font-semibold text-sand">Phone / WhatsApp</label>
                        <input
                          type="tel"
                          placeholder="+971 50 ••• ••••"
                          value={consultationData.phone}
                          onChange={(e) => setConsultationData({ ...consultationData, phone: e.target.value })}
                          className="field mt-1 w-full rounded-xl px-4 py-2.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-sand">Preferred Extrait Horizon</label>
                        <select
                          value={consultationData.preferredScent}
                          onChange={(e) => setConsultationData({ ...consultationData, preferredScent: e.target.value })}
                          className="field mt-1 w-full rounded-xl px-4 py-2.5 text-xs text-cream cursor-pointer"
                        >
                          <option value="Oud Impérial" className="bg-ink text-cream">Oud Impérial (Cambodian Agarwood)</option>
                          <option value="Rose Sultane" className="bg-ink text-cream">Rose Sultane (Taif Mountain Rose)</option>
                          <option value="Musk Céleste" className="bg-ink text-cream">Musk Céleste (Florentine Iris)</option>
                          <option value="Ambre Noir" className="bg-ink text-cream">Ambre Noir (Volcanic Amber & Tonka)</option>
                          <option value="Discovery Set" className="bg-ink text-cream">Curated Discovery Wardrobe</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-sand">Preferred Consultation Date</label>
                      <input
                        type="date"
                        value={consultationData.date}
                        onChange={(e) => setConsultationData({ ...consultationData, date: e.target.value })}
                        className="field mt-1 w-full rounded-xl px-4 py-2.5 text-xs text-cream"
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn-gold w-full rounded-full py-3.5 text-xs font-black uppercase tracking-widest mt-2"
                    >
                      Book Private Consultation
                    </button>
                  </form>
                )}
              </div>
            </Reveal>
          </div>

          {/* Right Column: Order Tracker & Quick Contact */}
          <div className="lg:col-span-5 space-y-6">
            {/* Order Tracker Box */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-gold/25 space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gold">
                <Truck className="h-4 w-4" /> Global Dispatch Tracking
              </div>
              <h4 className="font-display text-2xl font-medium text-cream">
                Track Your Shipment
              </h4>
              <p className="text-xs text-sand/75 leading-relaxed">
                Enter your Order Reference Number (e.g., <strong className="text-gold-light font-mono">AUR-108428</strong>) to view live airway bill progress.
              </p>

              <form onSubmit={handleTrackOrder} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter order reference..."
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="field flex-1 rounded-xl px-4 py-2.5 text-xs text-cream uppercase font-mono"
                />
                <button
                  type="submit"
                  className="rounded-xl border border-gold/40 bg-gold/15 px-4 py-2.5 text-xs font-bold uppercase text-gold-light hover:bg-gold hover:text-ink transition-colors"
                >
                  Track
                </button>
              </form>

              {trackingResult && (
                <div className="rounded-2xl border border-gold/20 bg-panel/40 p-4 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sand/70">Order:</span>
                    <strong className="text-gold-light font-mono">{trackingResult.id}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sand/70">Status:</span>
                    <span className="text-emerald-400 font-semibold">{trackingResult.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sand/70">Est. Arrival:</span>
                    <span className="text-cream font-semibold">{trackingResult.estDelivery}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Concierge Contact */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-gold/20 space-y-3 text-xs">
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
                  href="tel:+97148291998"
                  className="flex items-center gap-2.5 text-sand hover:text-gold-light transition-colors"
                >
                  <Phone className="h-4 w-4 text-gold" /> +971 4 829 1998 (Dubai Atelier)
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
              <div key={b.city} className="glass-card rounded-3xl p-6 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-gold-light">
                  <MapPin className="h-4 w-4 text-gold shrink-0" />
                  {b.city}
                </div>
                <p className="text-xs text-sand/80 leading-relaxed">{b.address}</p>
                <div className="border-t border-gold/10 pt-3 space-y-1 text-[11px] text-sand/60">
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
              <div key={f.q} className="glass-card rounded-2xl p-5 space-y-2">
                <h4 className="font-display text-lg font-semibold text-cream">{f.q}</h4>
                <p className="text-xs text-sand/80 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
