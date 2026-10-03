import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Users,
  Sparkles,
  MapPin,
  Calendar,
  RotateCcw,
} from "lucide-react";
import adminService from "../services/adminService";
import api from "../services/api";

type PresetRange = "7d" | "30d" | "this_month" | "6m" | "this_year" | "all" | "custom";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [allReviews, setAllReviews] = useState<any[]>([]);

  // Date Filter State
  const [preset, setPreset] = useState<PresetRange>("6m");
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 5);
    d.setDate(1);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });

  // Chart Tooltip Hover State
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [ordersRes, prodData, conciergeRes, reviewsRes]: any = await Promise.all([
          adminService.getAllOrders({ limit: 500 }).catch(() => ({ orders: [] })),
          api.get("/products?limit=100").catch(() => ({ data: { products: [] } })),
          api.get("/concierge").catch(() => ({ leads: [] })),
          api.get("/reviews").catch(() => ({ reviews: [] })),
        ]);

        const rawOrders = ordersRes?.orders || ordersRes?.data || ordersRes || [];
        const rawProducts = prodData?.products || prodData?.data?.products || [];
        const rawLeads = conciergeRes?.leads || conciergeRes || [];
        const rawReviews = reviewsRes?.reviews || reviewsRes || [];

        setAllOrders(Array.isArray(rawOrders) ? rawOrders : []);
        setProducts(Array.isArray(rawProducts) ? rawProducts : []);
        setAllLeads(Array.isArray(rawLeads) ? rawLeads : []);
        setAllReviews(Array.isArray(rawReviews) ? rawReviews : []);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  // Handle Preset Changes cleanly without lag or excessive historical spans
  const handlePresetChange = (newPreset: PresetRange) => {
    setPreset(newPreset);
    setHoveredIdx(null);
    const today = new Date();
    const endStr = today.toISOString().split("T")[0];
    setEndDate(endStr);

    if (newPreset === "7d") {
      const d = new Date(today);
      d.setDate(today.getDate() - 6);
      setStartDate(d.toISOString().split("T")[0]);
    } else if (newPreset === "30d") {
      const d = new Date(today);
      d.setDate(today.getDate() - 29);
      setStartDate(d.toISOString().split("T")[0]);
    } else if (newPreset === "this_month") {
      const d = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(d.toISOString().split("T")[0]);
    } else if (newPreset === "6m") {
      const d = new Date(today.getFullYear(), today.getMonth() - 5, 1);
      setStartDate(d.toISOString().split("T")[0]);
    } else if (newPreset === "this_year") {
      const d = new Date(today.getFullYear(), 0, 1);
      setStartDate(d.toISOString().split("T")[0]);
    } else if (newPreset === "all") {
      // Find earliest order date or default to last 12 months for clean visualization
      if (allOrders.length > 0) {
        const timestamps = allOrders
          .map((o) => (o.createdAt ? new Date(o.createdAt).getTime() : 0))
          .filter((t) => t > 0);
        if (timestamps.length > 0) {
          const earliest = new Date(Math.min(...timestamps));
          earliest.setDate(1);
          setStartDate(earliest.toISOString().split("T")[0]);
          return;
        }
      }
      const d = new Date(today.getFullYear(), today.getMonth() - 11, 1);
      setStartDate(d.toISOString().split("T")[0]);
    }
  };

  // Filter Orders & Leads by Date Range
  const filteredOrders = useMemo(() => {
    if (!startDate && !endDate) return allOrders;
    const start = startDate ? new Date(startDate + "T00:00:00") : new Date(0);
    const end = endDate ? new Date(endDate + "T23:59:59") : new Date();

    return allOrders.filter((o) => {
      const oDate = o.createdAt ? new Date(o.createdAt) : new Date();
      return oDate >= start && oDate <= end;
    });
  }, [allOrders, startDate, endDate]);

  const filteredLeads = useMemo(() => {
    if (!startDate && !endDate) return allLeads;
    const start = startDate ? new Date(startDate + "T00:00:00") : new Date(0);
    const end = endDate ? new Date(endDate + "T23:59:59") : new Date();

    return allLeads.filter((l) => {
      const lDate = l.createdAt ? new Date(l.createdAt) : new Date();
      return lDate >= start && lDate <= end;
    });
  }, [allLeads, startDate, endDate]);

  // Aggregated Stats
  const totalOrdersCount = filteredOrders.length;
  const totalRevenue = filteredOrders.reduce(
    (sum: number, o: any) => sum + (o.pricing?.finalTotal || o.totalAmount || 0),
    0
  );

  const uniqueEmails = new Set(
    filteredOrders
      .map((o: any) => o.shippingAddress?.email || o.customerDetails?.email || o.user?.email)
      .filter(Boolean)
  );
  const totalCustomerCount = uniqueEmails.size || (filteredOrders.length > 0 ? filteredOrders.length : 0);

  // Dynamic Chart Points Generation
  const chartData = useMemo(() => {
    const start = startDate ? new Date(startDate + "T00:00:00") : new Date();
    const end = endDate ? new Date(endDate + "T23:59:59") : new Date();
    const diffDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    const isDaily = diffDays <= 31;
    const buckets: {
      key: string;
      label: string;
      fullDate: string;
      prepaid: number;
      cod: number;
      total: number;
      ordersCount: number;
    }[] = [];

    if (isDaily) {
      for (let i = 0; i < diffDays; i++) {
        const cur = new Date(start);
        cur.setDate(start.getDate() + i);
        if (cur > end) break;
        const key = cur.toISOString().split("T")[0];
        const label = cur.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        const fullDate = cur.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
        buckets.push({ key, label, fullDate, prepaid: 0, cod: 0, total: 0, ordersCount: 0 });
      }
    } else {
      let cur = new Date(start.getFullYear(), start.getMonth(), 1);
      const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

      while (cur <= endMonth) {
        const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}`;
        const label = cur.toLocaleString("default", { month: "short" });
        const fullDate = cur.toLocaleString("default", { month: "long", year: "numeric" });
        buckets.push({ key, label, fullDate, prepaid: 0, cod: 0, total: 0, ordersCount: 0 });
        cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
      }
    }

    if (buckets.length === 0) {
      buckets.push({
        key: "now",
        label: "Today",
        fullDate: new Date().toLocaleDateString("en-IN"),
        prepaid: 0,
        cod: 0,
        total: 0,
        ordersCount: 0,
      });
    }

    filteredOrders.forEach((o) => {
      const orderDate = o.createdAt ? new Date(o.createdAt) : new Date();
      let matchKey = "";
      if (isDaily) {
        matchKey = orderDate.toISOString().split("T")[0];
      } else {
        matchKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, "0")}`;
      }

      const target = buckets.find((b) => b.key === matchKey);
      if (target) {
        const amt = o.pricing?.finalTotal || o.totalAmount || 0;
        const isCod =
          String(o.paymentMethod || "").toUpperCase() === "COD" ||
          String(o.payment?.paymentMethod || "").toUpperCase() === "COD";

        if (isCod) {
          target.cod += amt;
        } else {
          target.prepaid += amt;
        }
        target.total += amt;
        target.ordersCount += 1;
      }
    });

    return { isDaily, buckets };
  }, [filteredOrders, startDate, endDate]);

  const { isDaily, buckets } = chartData;
  const maxVal = Math.max(...buckets.map((b) => Math.max(b.prepaid, b.cod)), 500);
  const chartWidth = 560;
  const chartHeight = 150;
  const paddingX = 35;
  const stepX = buckets.length > 1 ? (chartWidth - paddingX * 2) / (buckets.length - 1) : 0;

  const prepaidPoints = buckets.map((b, idx) => {
    const x = buckets.length === 1 ? chartWidth / 2 : paddingX + idx * stepX;
    const y = chartHeight - 15 - (b.prepaid / maxVal) * (chartHeight - 40);
    return { x, y, data: b };
  });

  const codPoints = buckets.map((b, idx) => {
    const x = buckets.length === 1 ? chartWidth / 2 : paddingX + idx * stepX;
    const y = chartHeight - 15 - (b.cod / maxVal) * (chartHeight - 40);
    return { x, y, data: b };
  });

  const generateSpline = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return "";
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpx1 = p0.x + (p1.x - p0.x) / 2;
      const cpy1 = p0.y;
      const cpx2 = p0.x + (p1.x - p0.x) / 2;
      const cpy2 = p1.y;
      d += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const prepaidPath = generateSpline(prepaidPoints);
  const codPath = generateSpline(codPoints);

  // Dynamic Location Breakdown
  const locationCounts: Record<string, number> = {};
  filteredOrders.forEach((o) => {
    const city =
      o.shippingAddress?.city ||
      o.customerDetails?.city ||
      o.shippingAddress?.state ||
      "Direct Online";
    const amt = o.pricing?.finalTotal || o.totalAmount || 0;
    locationCounts[city] = (locationCounts[city] || 0) + amt;
  });

  const locationEntries = Object.entries(locationCounts).sort((a, b) => b[1] - a[1]);
  const displayLocations = locationEntries.slice(0, 5).map(([city, amt]) => ({
    city,
    sales: amt,
    percentage: totalRevenue > 0 ? Math.min(100, Math.round((amt / totalRevenue) * 100)) : 0,
  }));

  // Dynamic Channel Breakdown
  const codOrdersCount = filteredOrders.filter(
    (o) =>
      String(o.paymentMethod || "").toUpperCase() === "COD" ||
      String(o.payment?.paymentMethod || "").toUpperCase() === "COD"
  ).length;
  const prepaidOrdersCount = filteredOrders.length - codOrdersCount;

  const prepaidPercent = totalOrdersCount > 0 ? Math.round((prepaidOrdersCount / totalOrdersCount) * 100) : 0;
  const codPercent = totalOrdersCount > 0 ? 100 - prepaidPercent : 0;

  // Active Hovered Bucket for Tooltip
  const activeBucket = hoveredIdx !== null && buckets[hoveredIdx] ? buckets[hoveredIdx] : null;
  const activePrepaidPoint = hoveredIdx !== null && prepaidPoints[hoveredIdx] ? prepaidPoints[hoveredIdx] : null;

  return (
    <div className="space-y-7 pb-12 select-none">
      {/* ================= PAGE HEADER & STABLE DATE RANGE FILTER BAR ================= */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Report Analysis</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                Live Data
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time boutique sales, orders, and customer analytics filtered by date range
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/admin/products"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-purple-600/20 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Manage Catalog ({products.length})</span>
            </Link>
          </div>
        </div>

        {/* Date Range Filter Bar with Zero Layout Shifts */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Presets Pills with Fixed Geometry (No width jumping) */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100/70 p-1 rounded-xl border border-slate-200/70">
            {[
              { id: "7d", label: "7 Days" },
              { id: "30d", label: "30 Days" },
              { id: "this_month", label: "This Month" },
              { id: "6m", label: "6 Months" },
              { id: "this_year", label: "This Year" },
              { id: "all", label: "All Time" },
              { id: "custom", label: "Custom" },
            ].map((p) => {
              const isActive = preset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePresetChange(p.id as PresetRange)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 ${
                    isActive
                      ? "bg-white text-purple-700 shadow-xs border border-purple-200/70"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50 border border-transparent"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Start Date & End Date Inputs */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
            <Calendar className="h-3.5 w-3.5 text-purple-600 shrink-0" />
            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
              <span className="text-[11px] text-slate-400">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPreset("custom");
                }}
                className="bg-transparent border-0 text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
              />
              <span className="text-slate-300">—</span>
              <span className="text-[11px] text-slate-400">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPreset("custom");
                }}
                className="bg-transparent border-0 text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
              />
            </div>
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => handlePresetChange("6m")}
                title="Reset to 6 Months"
                className="p-1 hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 rounded-md transition-colors ml-1"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= 4 STAT CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Filtered Sales</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
            <div className="flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md">
              <span>{totalOrdersCount} orders</span>
            </div>
            <span className="text-slate-400 font-normal">in chosen range</span>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Orders Count</span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <ShoppingBag className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {totalOrdersCount.toLocaleString()}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-purple-600">
            <div className="flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded-md">
              <ShoppingBag className="h-3 w-3" />
              <span>
                {filteredOrders.filter((o) => o.orderStatus === "shipped" || o.orderStatus === "delivered").length} Dispatched
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Total Extraits in Catalog */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Catalog Flacons</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Package className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {products.length}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-amber-600">
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md">
              <Package className="h-3 w-3" />
              <span>{products.filter((p) => p.isBestSeller).length} Bestsellers</span>
            </div>
          </div>
        </div>

        {/* Card 4: VIP Inquiries & Patrons */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">VIP Patrons & Leads</span>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Users className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {totalCustomerCount + filteredLeads.length}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600">
            <div className="flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-md">
              <Users className="h-3 w-3" />
              <span>{filteredLeads.length} Leads in Range</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MIDDLE ROW: CHARTS WITH TOOLTIPS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Dynamic Revenue Trajectory Chart (lg:col-span-6) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-100/90 shadow-xs flex flex-col justify-between relative min-h-[380px]">
          {/* Header & Legends */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Revenue Trajectory</h3>
              <p className="text-[11px] text-slate-400">
                {isDaily ? "Daily interval trajectory" : "Monthly interval trajectory"} · Hover for breakdown
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600 font-medium">
                  Prepaid: <strong className="text-slate-900">{prepaidPercent}%</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-600" />
                <span className="text-slate-600 font-medium">
                  COD: <strong className="text-slate-900">{codPercent}%</strong>
                </span>
              </div>
            </div>
          </div>

          {/* SVG Graph Area with Tooltip */}
          <div className="w-full relative my-auto py-2">
            <div className="h-44 w-full relative">
              <svg
                key={`${preset}-${startDate}-${endDate}`}
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-full overflow-visible"
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <defs>
                  <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#9333ea" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#9333ea" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="greenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                <line x1="10" y1="20" x2={chartWidth - 10} y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
                <line x1="10" y1="65" x2={chartWidth - 10} y2="65" stroke="#f1f5f9" strokeDasharray="3 3" />
                <line x1="10" y1="110" x2={chartWidth - 10} y2="110" stroke="#f1f5f9" strokeDasharray="3 3" />

                {/* Vertical Guideline on Hover */}
                {hoveredIdx !== null && activePrepaidPoint && (
                  <line
                    x1={activePrepaidPoint.x}
                    y1="10"
                    x2={activePrepaidPoint.x}
                    y2={chartHeight - 10}
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                )}

                {/* COD Spline (Purple) */}
                <path
                  d={codPath}
                  fill="none"
                  stroke="#9333ea"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Prepaid Spline (Green) */}
                <path
                  d={prepaidPath}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Interactive Node Circles & Hover Hit Areas */}
                {buckets.map((b, i) => {
                  const ptPrep = prepaidPoints[i];
                  const ptCod = codPoints[i];
                  if (!ptPrep || !ptCod) return null;

                  return (
                    <g key={b.key} onMouseEnter={() => setHoveredIdx(i)} className="cursor-pointer">
                      <rect
                        x={ptPrep.x - (stepX || 40) / 2}
                        y="0"
                        width={stepX || 80}
                        height={chartHeight}
                        fill="transparent"
                      />

                      {/* COD Point */}
                      <circle
                        cx={ptCod.x}
                        cy={ptCod.y}
                        r={hoveredIdx === i ? 6 : 4}
                        fill="#9333ea"
                        className={hoveredIdx === i ? "ring-4 ring-purple-200" : ""}
                      />

                      {/* Prepaid Point */}
                      <circle
                        cx={ptPrep.x}
                        cy={ptPrep.y}
                        r={hoveredIdx === i ? 6 : 4}
                        fill="#10b981"
                        className={hoveredIdx === i ? "ring-4 ring-emerald-200" : ""}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Floating Interactive Tooltip Card */}
              {hoveredIdx !== null && activeBucket && activePrepaidPoint && (
                <div
                  className="absolute pointer-events-none z-30 transform -translate-x-1/2 -translate-y-full bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-xl shadow-xl border border-slate-700/60 min-w-[160px] text-xs"
                  style={{
                    left: `${(activePrepaidPoint.x / chartWidth) * 100}%`,
                    top: `${Math.max(20, Math.min(activePrepaidPoint.y, codPoints[hoveredIdx]?.y || 80)) - 12}px`,
                  }}
                >
                  <div className="text-[11px] font-bold text-slate-200 border-b border-slate-700/80 pb-1 mb-1.5 flex items-center justify-between">
                    <span>{activeBucket.fullDate}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{activeBucket.ordersCount} ord</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between font-bold text-amber-300">
                      <span>Total:</span>
                      <span>₹{activeBucket.total.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-emerald-400">
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Prepaid:
                      </span>
                      <span>₹{activeBucket.prepaid.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-purple-300">
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                        COD:
                      </span>
                      <span>₹{activeBucket.cod.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dynamic Bottom Axis Labels - Smartly Spaced */}
            <div className="flex justify-between text-[11px] font-medium text-slate-500 pt-3 px-2 border-t border-slate-100/80">
              {buckets.map((b, idx) => {
                // If more than 10 points (e.g. 30 days), show evenly spaced labels so they don't crowd
                const shouldShow =
                  buckets.length <= 10 ||
                  idx === 0 ||
                  idx === buckets.length - 1 ||
                  idx % Math.ceil(buckets.length / 7) === 0;

                return (
                  <div key={b.key || idx} className={`text-center ${shouldShow ? "opacity-100" : "opacity-0 invisible"}`}>
                    <span className={`block font-semibold ${hoveredIdx === idx ? "text-purple-600" : "text-slate-700"}`}>
                      {b.label}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                      ₹{b.total.toLocaleString("en-IN")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dynamic Sales By Location (lg:col-span-3) */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-100/90 shadow-xs flex flex-col justify-between min-h-[380px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Sales By Location</h3>
              <p className="text-[11px] text-slate-400">Order delivery destinations</p>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
              {displayLocations.length} Regions
            </span>
          </div>

          <div className="space-y-3.5 my-auto">
            {displayLocations.length > 0 ? (
              displayLocations.map((loc, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span className="flex items-center gap-1.5 truncate max-w-[130px]">
                      <MapPin className="h-3 w-3 text-purple-500 shrink-0" />
                      <span className="truncate">{loc.city}</span>
                    </span>
                    <span className="text-slate-900 font-mono">₹{loc.sales.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(8, loc.percentage)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                No orders in this date range. Real delivery locations will appear automatically upon purchase.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Range Sales Volume</span>
            <span className="font-bold text-slate-900 font-mono">₹{totalRevenue.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Dynamic Payment Channels Donut (lg:col-span-3) */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-100/90 shadow-xs flex flex-col justify-between min-h-[380px]">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Payment Channels</h3>
              <p className="text-[11px] text-slate-400">Prepaid vs Cash on Delivery</p>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
              {totalOrdersCount} Orders
            </span>
          </div>

          {/* Donut graphic */}
          <div className="flex justify-center my-3">
            <div className="relative h-28 w-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.8"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {totalOrdersCount > 0 && (
                  <>
                    <path
                      className="text-emerald-500 transition-all duration-500"
                      strokeDasharray={`${prepaidPercent}, 100`}
                      strokeWidth="3.8"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-purple-600 transition-all duration-500"
                      strokeDasharray={`${codPercent}, 100`}
                      strokeDashoffset={`-${prepaidPercent}`}
                      strokeWidth="3.8"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </>
                )}
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xs font-bold text-slate-800">
                  {totalOrdersCount > 0 ? `${prepaidPercent}%` : "0%"}
                </span>
                <span className="text-[9px] text-slate-400">Prepaid</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Prepaid ({prepaidOrdersCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-purple-600" />
              <span>COD ({codOrdersCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>{filteredLeads.length} VIP Leads</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              <span>{allReviews.length} Reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM TABLE: TOP SELLING FLACONS ================= */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Maison Extraits Catalog</h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time inventory and pricing per flacon</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/admin/products"
              className="px-3 py-1.5 text-purple-600 hover:text-purple-700 text-xs font-semibold hover:underline"
            >
              See All ({products.length})
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-6">Extrait Flacon</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Starting Price</th>
                <th className="py-3.5 px-6">Variants</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {products.slice(0, 6).map((p: any, idx: number) => {
                const firstVariant = p.variants?.[0] || {};
                const price = firstVariant.price || p.price || 2799;
                const variantCount = p.variants?.length || 3;

                return (
                  <tr key={p._id || idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6 flex items-center gap-3">
                      <img
                        src={p.images?.[0]?.url || p.image || "/uploads/products/oud-maroki-hero.png"}
                        alt={p.name}
                        className="h-9 w-9 rounded-lg object-cover border border-slate-100 bg-slate-50 shrink-0"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/uploads/products/oud-maroki-hero.png";
                        }}
                      />
                      <div>
                        <div className="font-semibold text-slate-900 truncate max-w-xs">{p.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{p.slug}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-slate-500 font-medium">{p.category?.name || "Pure Attar Oils"}</td>
                    <td className="py-3.5 px-6 font-bold text-slate-900">₹{price.toLocaleString("en-IN")}</td>
                    <td className="py-3.5 px-6 font-medium text-slate-600">{variantCount} Sizes</td>
                    <td className="py-3.5 px-6">
                      {p.isActive !== false ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <Link
                        to={`/admin/products`}
                        className="text-purple-600 hover:text-purple-800 font-semibold"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
