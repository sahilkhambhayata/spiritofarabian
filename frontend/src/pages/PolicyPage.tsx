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
  Clock,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { FAQS } from "../data";
import { cn } from "../utils/cn";
import { policyService, type PolicyDocument, type SiteSettings } from "../services/policyService";

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

const ICON_MAP: Record<string, any> = {
  Truck,
  ShieldCheck,
  RotateCcw,
  Lock,
  FileText,
  HelpCircle,
  Clock,
  Sparkles,
  CheckCircle2,
};

export default function PolicyPage({ initialTab = "shipping" }: PolicyPageProps) {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<PolicyTab>(initialTab);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  
  const [policies, setPolicies] = useState<PolicyDocument[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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

  // Fetch Policies and Settings from Backend
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [fetchedPolicies, fetchedSettings] = await Promise.allSettled([
          policyService.getAllPolicies(),
          policyService.getSettings(),
        ]);

        if (isMounted) {
          if (fetchedPolicies.status === "fulfilled" && Array.isArray(fetchedPolicies.value)) {
            setPolicies(fetchedPolicies.value);
          }
          if (fetchedSettings.status === "fulfilled" && fetchedSettings.value) {
            setSettings(fetchedSettings.value);
          }
        }
      } catch (err) {
        console.error("Error loading policy data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Find current active policy from dynamic data
  const currentPolicy = policies.find((p) => p.policy_type === activeTab);

  // Support Contacts
  const supportEmail = settings?.supportEmail || "concierge@spiritofarabian.com";
  const supportPhone = settings?.supportPhone || "+971 4 812 9900 (Dubai Atelier)";

  // FAQs source (API settings with fallback to local FAQS)
  const faqItems =
    settings?.faqs && settings.faqs.length > 0
      ? settings.faqs.map((f) => ({ q: f.question, a: f.answer }))
      : FAQS;

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
            {loading && !currentPolicy && activeTab !== "faqs" ? (
              <div className="rounded-3xl border border-white/15 bg-panel/40 p-12 text-center backdrop-blur-md">
                <Loader2 className="h-8 w-8 animate-spin text-gold mx-auto mb-4" />
                <p className="text-sm font-serif text-sand/80">Loading Maison Policy...</p>
              </div>
            ) : activeTab === "faqs" ? (
              /* FAQS TAB */
              <div className="rounded-3xl border border-white/15 bg-panel/40 p-6 sm:p-10 backdrop-blur-md shadow-xl space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold/10 border border-gold/30 text-gold">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-cream">Frequently Asked Questions</h2>
                    <p className="text-xs text-sand/60">Everything About Pure Attar Extraits & Ordering</p>
                  </div>
                </div>

                {/* Interactive Accordion */}
                <div className="space-y-3 pt-2">
                  {faqItems.map((faq, idx) => {
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
            ) : currentPolicy ? (
              /* DYNAMIC POLICY CONTENT (From Backend MongoDB) */
              <div className="rounded-3xl border border-white/15 bg-panel/40 p-6 sm:p-10 backdrop-blur-md shadow-xl space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold/10 border border-gold/30 text-gold">
                    {(() => {
                      const tabConf = TAB_CONFIG.find((t) => t.id === activeTab);
                      const Icon = tabConf ? tabConf.icon : FileText;
                      return <Icon className="h-5 w-5" />;
                    })()}
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-cream">{currentPolicy.title}</h2>
                    {currentPolicy.subtitle && (
                      <p className="text-xs text-sand/60">{currentPolicy.subtitle}</p>
                    )}
                  </div>
                </div>

                {/* Highlights Grid if present */}
                {currentPolicy.highlights && currentPolicy.highlights.length > 0 && (
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {currentPolicy.highlights.map((hl, i) => {
                      const HIcon = (hl.icon && ICON_MAP[hl.icon]) || CheckCircle2;
                      return (
                        <div key={i} className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-1">
                          <div className="flex items-center gap-2 text-gold">
                            <HIcon className="h-4 w-4" />
                            <span className="text-xs font-bold text-cream">{hl.title}</span>
                          </div>
                          <p className="text-[11px] text-sand/70 leading-normal">{hl.description}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Policy Sections */}
                <div className="space-y-6 text-xs sm:text-sm text-sand/85 leading-relaxed">
                  {currentPolicy.sections.map((section, idx) => (
                    <div key={section._id || idx} className="space-y-2">
                      <h3 className="font-display text-lg font-semibold text-cream flex items-center gap-2">
                        <span className="text-gold-light text-sm font-mono font-bold">{(idx + 1).toString().padStart(2, '0')}.</span>
                        <span>{section.heading}</span>
                      </h3>
                      <p className="whitespace-pre-line text-sand/80">{section.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Fallback if no backend entry found */
              <div className="rounded-3xl border border-white/15 bg-panel/40 p-8 sm:p-10 backdrop-blur-md shadow-xl text-center space-y-4">
                <FileText className="h-10 w-10 text-gold/60 mx-auto" />
                <h2 className="font-display text-xl text-cream font-medium">Policy Information</h2>
                <p className="text-xs text-sand/70 max-w-md mx-auto">
                  For inquiries regarding this charter, please reach out to our client concierge team directly.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-5 py-2 text-xs font-bold uppercase tracking-wider text-gold-light hover:bg-gold/10"
                >
                  Contact Concierge
                </Link>
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
                  <a href={`mailto:${supportEmail}`} className="hover:text-cream transition-colors">
                    {supportEmail}
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gold shrink-0" />
                  <span>{supportPhone}</span>
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
