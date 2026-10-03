import React, { useEffect, useState } from "react";
import {
  ShoppingCart,
  Mail,
  Send,
  CheckCircle2,
  Clock,
  Eye,
  AlertCircle,
  RefreshCw,
  Search,
  ExternalLink,
  DollarSign,
  TrendingUp,
  Percent,
  X,
  User,
  Package,
} from "lucide-react";
import adminService from "../services/adminService";

export default function AdminAbandonedCarts() {
  const [carts, setCarts] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalAbandoned: 0,
    totalRecovered: 0,
    recoveryRate: "0.00",
    abandonedRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCart, setSelectedCart] = useState<any | null>(null);
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadCarts = async () => {
    try {
      setLoading(true);
      const res: any = await adminService.getAbandonedCarts({
        search: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });

      if (res?.carts) {
        setCarts(res.carts);
        setSummary(res.summary || summary);
      } else if (Array.isArray(res)) {
        setCarts(res);
      }
    } catch (err) {
      console.error("Failed to load abandoned carts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCarts();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCarts();
  };

  const handleSendReminder = async (cartId: string) => {
    try {
      setSendingReminderId(cartId);
      setActionMessage(null);
      const res: any = await adminService.sendCartReminder(cartId);
      setActionMessage({
        type: "success",
        text: res?.message || "Luxury recovery email dispatched successfully to customer!",
      });
      setTimeout(() => setActionMessage(null), 4000);
      await loadCarts();
      if (selectedCart && selectedCart._id === cartId) {
        // Update open modal
        const updated = carts.find((c) => c._id === cartId);
        if (updated) setSelectedCart(updated);
      }
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: err?.response?.data?.message || err?.message || "Failed to dispatch reminder email.",
      });
    } finally {
      setSendingReminderId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "recovered":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" /> Recovered
          </span>
        );
      case "abandoned":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="h-3 w-3" /> Abandoned
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <CheckCircle2 className="h-3 w-3" /> Converted
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Active Cart
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShoppingCart className="h-6 w-6 text-purple-600" />
            Abandoned Cart Intelligence & Recovery
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track incomplete boutique reservations, monitor automated reminder dispatches, and trigger manual VIP recovery incentives.
          </p>
        </div>

        <button
          onClick={loadCarts}
          className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-purple-600" : ""}`} />
          <span>Refresh Live Carts</span>
        </button>
      </div>

      {/* Global Action Message Toast */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-3 animate-fadeIn ${
            actionMessage.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-rose-50 border border-rose-200 text-rose-800"
          }`}
        >
          {actionMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Abandoned Carts</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{summary.totalAbandoned}</h3>
            <p className="text-[10px] text-amber-600 mt-0.5 font-medium">Unfinished checkout sessions</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
            <ShoppingCart className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Recovered Carts</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{summary.totalRecovered}</h3>
            <p className="text-[10px] text-emerald-600 mt-0.5 font-medium">Returned & ordered</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Recovery Rate</p>
            <h3 className="text-2xl font-extrabold text-purple-600 mt-1">{summary.recoveryRate}%</h3>
            <p className="text-[10px] text-purple-600 mt-0.5 font-medium">Automated email conversion</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
            <Percent className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Recoverable Value</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              ₹{(summary.abandonedRevenue || 0).toLocaleString("en-IN")}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Potential revenue in vault</p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {["all", "abandoned", "recovered", "completed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab === "all" ? "All Carts" : tab}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-72">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by patron email/name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-purple-500/20 outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Carts Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Customer / Session</th>
                <th className="py-3.5 px-4">Cart Flacons</th>
                <th className="py-3.5 px-4">Cart Value</th>
                <th className="py-3.5 px-4">Last Active</th>
                <th className="py-3.5 px-4">Reminders Sent</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-purple-600 mb-2" />
                    <span>Loading abandoned cart intelligence...</span>
                  </td>
                </tr>
              ) : carts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <ShoppingCart className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No abandoned cart sessions found</p>
                    <p className="text-[11px] text-slate-400 mt-1">Carts will appear here when patrons add items and leave checkout.</p>
                  </td>
                </tr>
              ) : (
                carts.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-slate-900">{c.customer?.name || "Anonymous Patron"}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{c.customer?.email || "No email captured"}</p>
                        {c.customer?.phone && <p className="text-[10px] text-slate-400">{c.customer?.phone}</p>}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2 overflow-hidden">
                          {(c.items || []).slice(0, 3).map((it: any, idx: number) => (
                            <img
                              key={idx}
                              src={it.image || "/logo.png"}
                              alt={it.name}
                              className="inline-block h-7 w-7 rounded-lg ring-2 ring-white object-cover bg-slate-100"
                            />
                          ))}
                        </div>
                        <span className="font-medium text-slate-700">
                          {c.items?.length || 0} {c.items?.length === 1 ? "item" : "items"}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900">₹{(c.totalAmount || c.subtotal || 0).toLocaleString("en-IN")}</span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {c.lastActivityAt ? new Date(c.lastActivityAt).toLocaleString("en-IN") : "Just now"}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        <Mail className="h-3 w-3 text-purple-600" />
                        {c.remindersSent || 0} / 2
                      </span>
                    </td>

                    <td className="py-3.5 px-4">{getStatusBadge(c.status)}</td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedCart(c)}
                          className="p-1.5 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                          title="View Cart Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {c.customer?.email && c.status !== "recovered" && c.status !== "completed" && (
                          <button
                            onClick={() => handleSendReminder(c._id)}
                            disabled={sendingReminderId === c._id}
                            className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                            title="Dispatch Instant Recovery Email"
                          >
                            {sendingReminderId === c._id ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <Send className="h-3 w-3" />
                            )}
                            <span>Send Email</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cart Detail Modal */}
      {selectedCart && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-6 max-h-[90vh] overflow-y-auto animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Cart Reservation Breakdown</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Token: {selectedCart.recoveryToken || selectedCart._id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCart(null)}
                className="text-slate-400 hover:text-slate-600 text-xl leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Customer & Status Header */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
              <div>
                <p className="font-semibold text-slate-500">Patron Information</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedCart.customer?.name || "Guest Visitor"}</p>
                <p className="text-slate-600 font-mono mt-0.5">{selectedCart.customer?.email || "No email available"}</p>
                {selectedCart.customer?.phone && <p className="text-slate-500 mt-0.5">Phone: {selectedCart.customer?.phone}</p>}
              </div>
              <div>
                <p className="font-semibold text-slate-500">Timeline & Activity</p>
                <p className="text-slate-700 mt-0.5">
                  <strong>Last Active:</strong> {new Date(selectedCart.lastActivityAt || selectedCart.updatedAt).toLocaleString("en-IN")}
                </p>
                {selectedCart.abandonedAt && (
                  <p className="text-slate-700 mt-0.5">
                    <strong>Marked Abandoned:</strong> {new Date(selectedCart.abandonedAt).toLocaleString("en-IN")}
                  </p>
                )}
                <div className="mt-2">{getStatusBadge(selectedCart.status)}</div>
              </div>
            </div>

            {/* Items List */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Reserved Flacons in Bag</h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {(selectedCart.items || []).map((it: any, idx: number) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between bg-white hover:bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <img
                        src={it.image || "/logo.png"}
                        alt={it.name}
                        className="h-10 w-10 rounded-lg object-cover bg-slate-100 border border-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{it.name}</p>
                        <p className="text-[11px] text-slate-500">
                          Size: {it.size || "Standard"} · Qty: {it.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 text-xs">
                        ₹{((it.price || 0) * (it.quantity || 1)).toLocaleString("en-IN")}
                      </p>
                      <p className="text-[10px] text-slate-400">₹{(it.price || 0).toLocaleString("en-IN")} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Total & Recovery Link */}
            <div className="flex items-center justify-between p-4 bg-purple-50/60 border border-purple-100 rounded-xl text-xs">
              <div>
                <p className="text-[11px] text-purple-700 font-semibold">Total Recoverable Value</p>
                <p className="text-lg font-extrabold text-purple-900">
                  ₹{(selectedCart.totalAmount || selectedCart.subtotal || 0).toLocaleString("en-IN")}
                </p>
              </div>

              {selectedCart.customer?.email && (
                <button
                  onClick={() => handleSendReminder(selectedCart._id)}
                  disabled={sendingReminderId === selectedCart._id}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/20 cursor-pointer disabled:opacity-50"
                >
                  {sendingReminderId === selectedCart._id ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  <span>Dispatch Luxury Reminder</span>
                </button>
              )}
            </div>

            {/* Reminder Timeline Log */}
            {selectedCart.reminderHistory && selectedCart.reminderHistory.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Reminder Dispatch Log</h4>
                <div className="space-y-2">
                  {selectedCart.reminderHistory.map((rh: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-800">
                          Reminder #{rh.reminderNumber} to {rh.email}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">{new Date(rh.sentAt).toLocaleString("en-IN")}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full">
                        {rh.status || "Delivered"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
