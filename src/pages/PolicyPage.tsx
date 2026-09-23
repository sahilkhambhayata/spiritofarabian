import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  FileText,
  HelpCircle,
  Lock,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Mail,
  Phone,
} from "lucide-react";
import { FAQS } from "../data";
import { cn } from "../utils/cn";

export type PolicyTab =
  | "shipping"
  | "return"
  | "privacy"
  | "terms"
  | "refund"
  | "faqs";

interface PolicyPageProps {
  initialTab?: PolicyTab;
}

const TAB_CONFIG: { id: PolicyTab; label: string; icon: any; path: string }[] = [
  { id: "shipping", label: "Shipping Policy", icon: Truck, path: "/shipping-policy" },
  { id: "return", label: "Return & Exchange", icon: RotateCcw, path: "/return-policy" },
  { id: "privacy", label: "Privacy Policy", icon: Lock, path: "/privacy-policy" },
  { id: "terms", label: "Terms & Condition", icon: FileText, path: "/terms-of-service" },
  { id: "refund", label: "Refund Policy", icon: ShieldCheck, path: "/refund-policy" },
  { id: "faqs", label: "Frequently Asked Questions", icon: HelpCircle, path: "/faqs" },
];

export default function PolicyPage({ initialTab = "shipping" }: PolicyPageProps) {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<PolicyTab>(initialTab);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  // Sync tab with route path
  useEffect(() => {
    const p = location.pathname.toLowerCase();
    if (p.includes("shipping")) setActiveTab("shipping");
    else if (p.includes("return")) setActiveTab("return");
    else if (p.includes("privacy")) setActiveTab("privacy");
    else if (p.includes("terms")) setActiveTab("terms");
    else if (p.includes("refund")) setActiveTab("refund");
    else if (p.includes("faq")) setActiveTab("faqs");
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen pt-28 sm:pt-36 pb-24 text-cream bg-[#041d14]">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[900px] max-w-full rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.12)_0%,rgba(10,61,46,0.35)_60%,transparent_100%)] blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-sand/60">
          <Link to="/" className="hover:text-cream transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-cream font-semibold">Client Care & Policies</span>
        </nav>

        {/* Page Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-gold-light">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            <span>Maison Guarantees & Transparency</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-medium text-cream tracking-tight">
            Client Policies &{" "}
            <span className="italic gold-text">Service Charter</span>
          </h1>

          <p className="text-xs sm:text-sm text-sand/75 leading-relaxed max-w-2xl">
            Everything you need to know regarding our temperature-controlled worldwide shipping, 30-day sillage satisfaction guarantee, privacy integrity, and pure oil stewardship.
          </p>
        </div>

        {/* Policy Tab Navigation Pills */}
        <div className="mt-8 flex flex-wrap items-center gap-2 pb-4 border-b border-white/10">
          {TAB_CONFIG.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200",
                  isActive
                    ? "bg-white text-ink shadow-[0_2px_15px_rgba(255,255,255,0.25)] scale-102 font-black"
                    : "border border-white/15 bg-panel/40 text-sand/80 hover:border-white/30 hover:text-cream hover:bg-panel/70"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5", isActive ? "text-ink" : "text-gold")} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Body */}
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Left / Main Document Area */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. SHIPPING POLICY */}
            {activeTab === "shipping" && (
              <div className="rounded-3xl border border-white/15 bg-panel/40 p-6 sm:p-10 backdrop-blur-md shadow-xl space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold/10 border border-gold/30 text-gold">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-cream">Worldwide Express Shipping Policy</h2>
                    <p className="text-xs text-sand/60">Updated for International Express Deliveries</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-sand/85 leading-relaxed">
                  <h3 className="font-display text-lg font-semibold text-cream">1. Vault Temperature-Controlled Packaging</h3>
                  <p>
                    All SPIRIT OF ARABIAN pure extraits are lipid-bound botanical oils without volatile denatured alcohol. To safeguard the delicate volatile top-notes against heat degradation during international transport, each flacon is secured in a double-walled cedar vault coffret lined with thermal protective velvet.
                  </p>

                  <h3 className="font-display text-lg font-semibold text-cream pt-2">2. Processing & Dispatch Timeline</h3>
                  <p>
                    Orders placed before 2:00 PM GST (Gulf Standard Time) Monday through Friday are drawn from copper alembic aging tanks and packaged within 24 hours. You will receive an automated dispatch notification with real-time DHL Express tracking.
                  </p>

                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-2 font-mono text-xs">
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-sand/70">United Arab Emirates & GCC</span>
                      <span className="text-cream font-bold">1–2 Business Days</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-sand/70">United Kingdom & Europe</span>
                      <span className="text-cream font-bold">2–3 Business Days (Air Express)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-sand/70">United States & Canada</span>
                      <span className="text-cream font-bold">3–4 Business Days (Insured)</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-sand/70">Rest of the World</span>
                      <span className="text-cream font-bold">3–5 Business Days</span>
                    </div>
                  </div>

                  <h3 className="font-display text-lg font-semibold text-cream pt-2">3. Customs, Duties & Tax Inclusions</h3>
                  <p>
                    We operate on a <strong>DDP (Delivered Duty Paid)</strong> basis for all major destinations including the US, UK, EU, Switzerland, GCC, and Australia. You will not be charged unexpected customs clearance fees upon courier arrival.
                  </p>
                </div>
              </div>
            )}

            {/* 2. RETURN & EXCHANGE POLICY */}
            {activeTab === "return" && (
              <div className="rounded-3xl border border-white/15 bg-panel/40 p-6 sm:p-10 backdrop-blur-md shadow-xl space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold/10 border border-gold/30 text-gold">
                    <RotateCcw className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-cream">Return & Exchange Policy</h2>
                    <p className="text-xs text-sand/60">30-Day Sillage & Longevity Assurance</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-sand/85 leading-relaxed">
                  <h3 className="font-display text-lg font-semibold text-cream">1. The 30-Day Olfactory Guarantee</h3>
                  <p>
                    Perfume is deeply personal and evolves dynamically with individual skin chemistry and lipid warmth. If an extrait does not meet your expectations for sillage, longevity, or harmonic profile, you may return the flacon within 30 days of receipt.
                  </p>

                  <h3 className="font-display text-lg font-semibold text-cream pt-2">2. Return Eligibility</h3>
                  <ul className="list-disc pl-5 space-y-2 text-sand/80">
                    <li>Flacons must have at least 85% of their original oil volume remaining.</li>
                    <li>The presentation vault box and gold-plated applicator wand must be returned intact.</li>
                    <li>Discovery coffret sample sets are final sale once all 5 vials have been unsealed.</li>
                  </ul>

                  <h3 className="font-display text-lg font-semibold text-cream pt-2">3. Exchange Process</h3>
                  <p>
                    To initiate an exchange for another extrait profile or category (e.g. trading a Dark Oud for a Floral Taif Rose), simply email our concierge at <a href="mailto:concierge@spiritofarabian.com" className="text-gold-light underline">concierge@spiritofarabian.com</a> with your order number. We will provide a prepaid return courier shipping label.
                  </p>
                </div>
              </div>
            )}

            {/* 3. PRIVACY POLICY */}
            {activeTab === "privacy" && (
              <div className="rounded-3xl border border-white/15 bg-panel/40 p-6 sm:p-10 backdrop-blur-md shadow-xl space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold/10 border border-gold/30 text-gold">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-cream">Privacy Policy & Data Ethics</h2>
                    <p className="text-xs text-sand/60">Strict Client Discretion & 256-Bit SSL Protection</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-sand/85 leading-relaxed">
                  <h3 className="font-display text-lg font-semibold text-cream">1. Commitment to Client Discretion</h3>
                  <p>
                    SPIRIT OF ARABIAN operates with absolute discretion. We never sell, rent, or trade your personal information, address history, or fragrance preference profile to third-party data brokers or advertising networks.
                  </p>

                  <h3 className="font-display text-lg font-semibold text-cream pt-2">2. Information We Collect</h3>
                  <p>
                    We collect only the essential information necessary to commission and deliver your bespoke orders: full name, shipping address, contact email for courier dispatch, and telephone number for customs courier verification.
                  </p>

                  <h3 className="font-display text-lg font-semibold text-cream pt-2">3. Payment Security & Encryption</h3>
                  <p>
                    All credit card and payment transactions are processed through Level 1 PCI-DSS compliant payment gateways with 256-bit SSL encryption. We never store raw card numbers or CVV codes on our servers.
                  </p>
                </div>
              </div>
            )}

            {/* 4. TERMS & CONDITION */}
            {activeTab === "terms" && (
              <div className="rounded-3xl border border-white/15 bg-panel/40 p-6 sm:p-10 backdrop-blur-md shadow-xl space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold/10 border border-gold/30 text-gold">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-cream">Terms & Conditions of Service</h2>
                    <p className="text-xs text-sand/60">Haute Perfumery Purchase & Artisanal Stewardship</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-sand/85 leading-relaxed">
                  <h3 className="font-display text-lg font-semibold text-cream">1. Artisanal Harvest Variations</h3>
                  <p>
                    Because our extraits are derived from single-origin wild harvests (such as Cambodian wild agarwood, Taif dawn-harvested roses, and Mysore sandalwood), subtle natural hue and olfactory nuance variations may occur across distinct vintage distillation batches.
                  </p>

                  <h3 className="font-display text-lg font-semibold text-cream pt-2">2. Topical Application Only</h3>
                  <p>
                    SPIRIT OF ARABIAN extraits are concentrated botanical fragrance oils formulated exclusively for topical external application on unbroken skin and hair. They are not intended for consumption or internal use.
                  </p>

                  <h3 className="font-display text-lg font-semibold text-cream pt-2">3. Intellectual Property</h3>
                  <p>
                    All brand logos, emblem designs, olfactory formulations, and copywriting are the exclusive property of SPIRIT OF ARABIAN Maison d'Attar. Unauthorized reproduction is strictly prohibited.
                  </p>
                </div>
              </div>
            )}

            {/* 5. REFUND POLICY */}
            {activeTab === "refund" && (
              <div className="rounded-3xl border border-white/15 bg-panel/40 p-6 sm:p-10 backdrop-blur-md shadow-xl space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold/10 border border-gold/30 text-gold">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-cream">Refund & Credit Policy</h2>
                    <p className="text-xs text-sand/60">Fast, Frictionless Reimbursements</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-sand/85 leading-relaxed">
                  <h3 className="font-display text-lg font-semibold text-cream">1. Refund Processing Speed</h3>
                  <p>
                    Once a returned flacon is received and inspected at our Dubai or London atelier hub, refunds are credited back to your original payment method (Visa, Mastercard, AMEX, Apple Pay) within <strong>3 to 5 business days</strong>.
                  </p>

                  <h3 className="font-display text-lg font-semibold text-cream pt-2">2. Damaged or Lost Shipments</h3>
                  <p>
                    All international air shipments are 100% insured by SPIRIT OF ARABIAN. In the rare event of transit damage or courier loss, we immediately dispatch an express replacement flacon free of charge or issue an instant 100% refund.
                  </p>
                </div>
              </div>
            )}

            {/* 6. FAQS */}
            {activeTab === "faqs" && (
              <div className="rounded-3xl border border-white/15 bg-panel/40 p-6 sm:p-10 backdrop-blur-md shadow-xl space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold/10 border border-gold/30 text-gold">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-cream">Frequently Asked Questions</h2>
                    <p className="text-xs text-sand/60">Everything About Pure Attar Extraits</p>
                  </div>
                </div>

                {/* Interactive Accordion */}
                <div className="space-y-3 pt-2">
                  {FAQS.map((faq, idx) => {
                    const isOpen = openFaqIdx === idx;
                    return (
                      <div
                        key={idx}
                        className="rounded-2xl border border-white/10 bg-black/20 overflow-hidden transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                          className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-xs sm:text-sm font-semibold text-cream hover:text-gold-light transition-colors"
                        >
                          <span className="pr-4">{faq.q}</span>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 text-gold shrink-0 transition-transform duration-300",
                              isOpen && "rotate-180"
                            )}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-5 text-xs sm:text-sm text-sand/80 leading-relaxed border-t border-white/5 pt-3">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Contact Concierge & Track Order */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Track Order CTA */}
            <div className="rounded-3xl border border-white/15 bg-panel/50 p-6 backdrop-blur-md shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-light">
                <Truck className="h-4 w-4 text-gold" />
                <span>Track Your Shipment</span>
              </div>
              <h3 className="font-display text-lg font-medium text-cream">Looking for Your Order?</h3>
              <p className="text-xs text-sand/75 leading-relaxed">
                Check real-time customs clearance, courier progress, and delivery estimates with your Order ID.
              </p>
              <Link
                to="/track-order"
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-ink hover:bg-cream transition-all shadow"
              >
                <span>Track Order Now</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Direct Support Contacts */}
            <div className="rounded-3xl border border-white/15 bg-panel/40 p-6 backdrop-blur-md shadow-xl space-y-4 text-xs">
              <h3 className="font-display text-base font-semibold text-cream">Direct Client Assistance</h3>

              <div className="space-y-3 text-sand/80">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gold shrink-0" />
                  <a href="mailto:concierge@spiritofarabian.com" className="hover:text-cream transition-colors">
                    concierge@spiritofarabian.com
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gold shrink-0" />
                  <span>+971 4 812 9900 (Dubai Atelier)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10">
                <Link
                  to="/contact"
                  className="text-gold-light hover:underline font-semibold flex items-center gap-1"
                >
                  <span>Book Scent Consultation</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
