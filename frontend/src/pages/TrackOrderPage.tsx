import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "../utils/cn";
import { shippingService, type LiveShipmentData } from "../services/shippingService";

interface TrackingEvent {
  title: string;
  location: string;
  timestamp: string;
  description: string;
  completed: boolean;
  current?: boolean;
}

interface TrackingData {
  orderId: string;
  trackingNumber: string;
  status: string;
  statusPercent: number;
  carrier: string;
  origin: string;
  destination: string;
  estimatedDelivery: string;
  vaultTemperature: string;
  items: { name: string; size: string; quantity: number; image: string }[];
  events: TrackingEvent[];
}

export default function TrackOrderPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("order") || "SOA-89421";
  
  const [inputCode, setInputCode] = useState(initialQuery);
  const [activeTracking, setActiveTracking] = useState<TrackingData | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const calculatePercentFromStatus = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("delivered")) return 100;
    if (s.includes("out for delivery") || s.includes("ofd")) return 85;
    if (s.includes("in transit") || s.includes("shipped")) return 65;
    if (s.includes("pickup") || s.includes("dispatched")) return 45;
    if (s.includes("bottling") || s.includes("packaging")) return 30;
    return 15;
  };

  const performTracking = async (code: string) => {
    const query = code.trim().toUpperCase();
    if (!query) {
      setErrorMsg("Please enter an Order ID or AWB Tracking Number.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const data: LiveShipmentData = await shippingService.trackShipment(query);

      const itemsList =
        data.order?.items?.map((it) => ({
          name: it.name,
          size: it.size || "6ml Extrait",
          quantity: it.quantity || 1,
          image: it.image || "/images/oud-imperial.jpg",
        })) || [
          {
            name: "Spirit of Arabian Pure Extrait",
            size: "6ml Royal Bottle",
            quantity: 1,
            image: "/images/oud-imperial.jpg",
          },
        ];

      const eventsList: TrackingEvent[] = (data.trackingEvents || []).map((ev, idx, arr) => ({
        title: ev.status ? ev.status.replace(/_/g, " ").toUpperCase() : "LOGISTICS SCAN",
        location: ev.location || "Logistics Transit Station",
        timestamp: new Date(ev.timestamp).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        description: ev.description || "Package in express courier transit network.",
        completed: idx < arr.length - 1 || data.status === "delivered",
        current: idx === arr.length - 1 && data.status !== "delivered",
      }));

      // Fallback events if empty
      if (eventsList.length === 0) {
        eventsList.push({
          title: "ORDER COMMISSIONED",
          location: "Atelier Vault Hub",
          timestamp: new Date().toLocaleDateString(),
          description: "Order verified and bottled under pure nitrogen blanketing.",
          completed: true,
          current: true,
        });
      }

      const statusText = (data.status || "In Transit").replace(/_/g, " ").toUpperCase();
      const percent = calculatePercentFromStatus(data.status || "");

      const destinationStr = data.order?.shippingAddress
        ? `${data.order.shippingAddress.city}, ${data.order.shippingAddress.country}`
        : "Direct Destination";

      setActiveTracking({
        orderId: data.orderNumber || query,
        trackingNumber: data.awbCode || data.orderNumber || `AWB-${query}`,
        status: statusText,
        statusPercent: percent,
        carrier: data.courierName || "BlueDart Express Air / DHL",
        origin: "Dubai Royal Atelier Vault, UAE",
        destination: destinationStr,
        estimatedDelivery: "2–4 Business Days (Insured)",
        vaultTemperature: "18.4°C (Botanical Equilibrium)",
        items: itemsList,
        events: eventsList,
      });

      setHasSearched(true);
    } catch (err: any) {
      console.warn("Tracking query lookup error:", err.message);
      setErrorMsg(err.message || `No active tracking record found for '${query}'.`);
      setActiveTracking(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      performTracking(initialQuery);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performTracking(inputCode);
  };

  const handleQuickLoad = (code: string) => {
    setInputCode(code);
    performTracking(code);
  };

  return (
    <div className="relative min-h-screen pt-28 sm:pt-36 pb-24 text-cream bg-[#041d14]">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[450px] w-[900px] max-w-full rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.12)_0%,rgba(10,61,46,0.3)_60%,transparent_100%)] blur-[100px]" />
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-sand/60">
          <Link to="/" className="hover:text-cream transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-cream font-semibold">Track Express Shipment</span>
        </nav>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-gold-light">
            <Truck className="h-3.5 w-3.5 text-gold" />
            <span>Live Shipment Telemetry</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-medium text-cream tracking-tight">
            Track Your <span className="italic gold-text">Imperial Order</span>
          </h1>

          <p className="text-xs sm:text-sm text-sand/75 leading-relaxed">
            Enter your order confirmation number (e.g. <code>SOA-89421</code>) or DHL tracking code to inspect real-time vault packaging, customs clearance, and courier handoff status.
          </p>
        </div>

        {/* Search Box */}
        <div className="mt-8 max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="relative flex items-center group">
            <Search className="absolute left-4.5 h-4.5 w-4.5 text-sand/60 transition-colors group-focus-within:text-gold pointer-events-none" />
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Enter Order ID (e.g. SOA-89421) or Tracking Number..."
              className="w-full rounded-2xl border border-white/15 bg-panel/70 pl-12 pr-32 py-4 text-xs sm:text-sm text-cream placeholder-sand/45 backdrop-blur-md focus:border-gold/50 focus:bg-panel/90 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all shadow-xl"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-black uppercase tracking-wider text-ink hover:bg-cream disabled:opacity-50 transition-all shadow"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-ink" />
                  <span>Tracking...</span>
                </>
              ) : (
                <span>Track Parcel</span>
              )}
            </button>
          </form>

          {errorMsg && (
            <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300 backdrop-blur-md">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Demo Pre-sets */}
          <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-sand/60">
            <span>Sample Verified Order:</span>
            <button
              type="button"
              onClick={() => handleQuickLoad("SOA-89421")}
              className="font-mono text-gold-light hover:underline bg-white/5 px-2 py-0.5 rounded border border-white/10"
            >
              SOA-89421 (Express Courier)
            </button>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="mt-12 rounded-3xl border border-white/15 bg-panel/40 p-12 text-center backdrop-blur-md max-w-xl mx-auto">
            <Loader2 className="h-8 w-8 animate-spin text-gold mx-auto mb-4" />
            <p className="font-serif text-sm text-sand/80">Querying Global Carrier & Vault Registry...</p>
          </div>
        )}

        {/* Tracking Live Dashboard */}
        {!loading && hasSearched && activeTracking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-10 space-y-6"
          >
            {/* Overview Status Banner Card */}
            <div className="rounded-3xl border border-white/15 bg-panel/50 p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2.5 text-xs text-sand/60 font-mono">
                    <span>Order #{activeTracking.orderId}</span>
                    <span>·</span>
                    <span className="text-gold-light">{activeTracking.trackingNumber}</span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-medium text-cream mt-1">
                    {activeTracking.status}
                  </h2>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sand/60 block">
                    Estimated Delivery
                  </span>
                  <span className="font-display text-lg sm:text-xl font-bold text-emerald-400">
                    {activeTracking.estimatedDelivery}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs text-sand/70 mb-2 font-medium">
                  <span>Dispatch & Flight Progress</span>
                  <span className="text-gold-light font-mono font-bold">
                    {activeTracking.statusPercent}% Completed
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/40 border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-gold to-emerald-400 transition-all duration-700 rounded-full"
                    style={{ width: `${activeTracking.statusPercent}%` }}
                  />
                </div>
              </div>

              {/* Courier & Origin Metrics Pill Row */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-2 text-xs">
                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <span className="text-[10px] text-sand/50 uppercase block font-bold">Courier</span>
                  <span className="font-semibold text-cream truncate block mt-0.5">
                    {activeTracking.carrier}
                  </span>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <span className="text-[10px] text-sand/50 uppercase block font-bold">Origin Atelier</span>
                  <span className="font-semibold text-cream truncate block mt-0.5">
                    {activeTracking.origin}
                  </span>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <span className="text-[10px] text-sand/50 uppercase block font-bold">Destination</span>
                  <span className="font-semibold text-cream truncate block mt-0.5">
                    {activeTracking.destination}
                  </span>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <span className="text-[10px] text-sand/50 uppercase block font-bold">Vault Security</span>
                  <span className="font-semibold text-gold-light truncate block mt-0.5">
                    {activeTracking.vaultTemperature}
                  </span>
                </div>
              </div>
            </div>

            {/* 2-Column: Timeline Details & Items in Package */}
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Timeline Column */}
              <div className="lg:col-span-8 rounded-3xl border border-white/15 bg-panel/40 p-6 sm:p-8 backdrop-blur-md shadow-xl space-y-6">
                <h3 className="font-display text-xl font-medium text-cream flex items-center gap-2">
                  <Clock className="h-4.5 w-4.5 text-gold" />
                  <span>Shipment Timeline & Scan History</span>
                </h3>

                <div className="relative pl-6 space-y-8 border-l border-white/15 ml-2 pt-2">
                  {activeTracking.events.map((evt, idx) => (
                    <div key={idx} className="relative">
                      {/* Node circle */}
                      <div
                        className={cn(
                          "absolute -left-[31px] top-0 grid h-5 w-5 place-items-center rounded-full border shadow-sm",
                          evt.current
                            ? "border-emerald-400 bg-emerald-400 text-ink ring-4 ring-emerald-400/20"
                            : evt.completed
                            ? "border-gold bg-gold text-ink"
                            : "border-white/20 bg-ink-2 text-sand/40"
                        )}
                      >
                        {evt.completed ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h4
                            className={cn(
                              "font-display text-base font-semibold",
                              evt.current ? "text-emerald-400" : evt.completed ? "text-cream" : "text-sand/50"
                            )}
                          >
                            {evt.title}
                          </h4>
                          <span className="font-mono text-[11px] text-sand/60">{evt.timestamp}</span>
                        </div>

                        <p className="text-xs text-sand/60 flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-gold/70" /> {evt.location}
                        </p>

                        <p className="text-xs text-sand/80 leading-relaxed pt-0.5">{evt.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Items in Parcel & Help Sidebar */}
              <div className="lg:col-span-4 space-y-6">
                {/* Parcel Contents */}
                <div className="rounded-3xl border border-white/15 bg-panel/40 p-6 backdrop-blur-md shadow-xl space-y-4">
                  <h3 className="font-display text-base font-semibold text-cream flex items-center gap-2">
                    <Package className="h-4 w-4 text-gold" />
                    <span>Package Contents</span>
                  </h3>

                  <div className="space-y-3 pt-1">
                    {activeTracking.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 p-2.5"
                      >
                        <div className="h-12 w-12 rounded-xl overflow-hidden bg-ink-2 shrink-0 border border-white/10">
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-display text-sm font-semibold text-cream truncate">
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-sand/60">
                            {item.size} · Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Need Assistance Card */}
                <div className="rounded-3xl border border-gold/30 bg-gradient-to-br from-gold/15 to-transparent p-6 backdrop-blur-md shadow-xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-gold-light uppercase tracking-wider">
                    <Sparkles className="h-3.5 w-3.5 text-gold" />
                    <span>VIP Concierge Support</span>
                  </div>
                  <h4 className="font-display text-lg font-medium text-cream">
                    Need Help With Your Shipment?
                  </h4>
                  <p className="text-xs text-sand/80 leading-relaxed">
                    Our dedicated logistics team is on standby 24/7 to reschedule deliveries, update addresses, or coordinate courier security instructions.
                  </p>
                  <Link
                    to="/contact"
                    className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-xs font-bold uppercase tracking-wider text-ink hover:bg-cream transition-all"
                  >
                    <span>Contact Concierge</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
