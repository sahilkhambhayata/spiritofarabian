import React, { useEffect, useState } from "react";
import {
  ShoppingBag,
  Truck,
  Eye,
  CheckCircle2,
  Clock,
  Printer,
  ExternalLink,
  X,
  Send,
  AlertTriangle,
} from "lucide-react";
import adminService from "../services/adminService";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // Tracking form modal state
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackingCourier, setTrackingCourier] = useState("Shiprocket Express");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [updatingTracking, setUpdatingTracking] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res: any = await adminService.getAllOrders({ limit: 50 });
      setOrders(res?.orders || res || []);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (activeTab === "all") return true;
    return o.orderStatus?.toLowerCase() === activeTab.toLowerCase();
  });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      await loadOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
      }
    } catch (err: any) {
      alert("Status update failed: " + err?.message);
    }
  };

  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      setUpdatingTracking(true);
      await adminService.updateOrderTracking(selectedOrder._id, {
        courierName: trackingCourier,
        trackingNumber: trackingNumber || `AWB-${Date.now().toString().slice(-8)}`,
        trackingUrl: trackingUrl || `https://track.shiprocket.in/`,
      });
      setTrackingModalOpen(false);
      await loadOrders();
    } catch (err: any) {
      alert("Tracking update error: " + err?.message);
    } finally {
      setUpdatingTracking(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    if (s === "delivered") {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
          Delivered
        </span>
      );
    }
    if (s === "shipped") {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
          Shipped
        </span>
      );
    }
    if (s === "cancelled") {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
          Cancelled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
        Processing
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Orders & Fulfillment</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage patrons' luxury orders, Shiprocket/DHL AWB tracking, and commercial invoices
          </p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 overflow-x-auto text-xs font-semibold text-slate-600">
        {[
          { id: "all", label: "All Orders" },
          { id: "pending", label: "Pending Verification" },
          { id: "confirmed", label: "Confirmed / Processing" },
          { id: "shipped", label: "Shipped & Dispatched" },
          { id: "delivered", label: "Delivered" },
          { id: "cancelled", label: "Cancelled / Refunded" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/70"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-4 px-6">Order ID</th>
                <th className="py-4 px-4">Patron Name</th>
                <th className="py-4 px-4">Items / Flacons</th>
                <th className="py-4 px-4">Total Amount</th>
                <th className="py-4 px-4">Payment</th>
                <th className="py-4 px-4">Fulfillment</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading Maison orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No orders found in this status category.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const itemsCount = o.items?.reduce((s: number, i: any) => s + (i.quantity || 1), 0) || 1;
                  const total = o.pricing?.finalTotal || o.totalAmount || 0;
                  const recipient = o.shippingAddress?.fullName || o.user?.name || "VIP Patron";

                  return (
                    <tr key={o._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-purple-700">
                        {o.orderNumber || `#SOA-${o._id.slice(-6).toUpperCase()}`}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900">{recipient}</div>
                        <div className="text-[10px] text-slate-400">{o.shippingAddress?.city || "India"}</div>
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-600">
                        {itemsCount} {itemsCount > 1 ? "Flacons" : "Flacon"}
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-900">
                        ₹{total.toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {o.paymentMethod === "cod" ? "COD" : "Prepaid"}
                        </span>
                      </td>
                      <td className="py-4 px-4">{getStatusBadge(o.orderStatus)}</td>
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="View Order Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details & Fulfillment Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex justify-center p-4 sm:p-6 lg:p-10 font-sans animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-sm text-purple-700">
                  {selectedOrder.orderNumber || `#SOA-${selectedOrder._id.slice(-6).toUpperCase()}`}
                </span>
                {getStatusBadge(selectedOrder.orderStatus)}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsInvoiceOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Invoice</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Patron & Shipping Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Patron Credentials
                  </h4>
                  <p className="font-bold text-sm text-slate-900">
                    {selectedOrder.shippingAddress?.fullName || selectedOrder.user?.name}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {selectedOrder.shippingAddress?.phone || "No phone provided"}
                  </p>
                  <p className="text-xs text-slate-500">{selectedOrder.shippingAddress?.email || selectedOrder.user?.email}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Delivery Destination
                  </h4>
                  <p className="text-xs text-slate-700 font-medium">
                    {selectedOrder.shippingAddress?.streetAddress || selectedOrder.shippingAddress?.addressLine1}
                  </p>
                  <p className="text-xs text-slate-600">
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} -{" "}
                    {selectedOrder.shippingAddress?.pincode || selectedOrder.shippingAddress?.postalCode}
                  </p>
                  <p className="text-xs font-semibold text-slate-800 mt-1">
                    {selectedOrder.shippingAddress?.country || "India"}
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Ordered Extraits & Rituals
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 flex items-center justify-between bg-white">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image || "/uploads/products/oud-maroki-hero.png"}
                          alt={item.name}
                          className="h-10 w-10 rounded-xl object-cover border border-slate-100"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {item.sizeLabel || `${item.volume || "6ml"}`} × {item.quantity || 1}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-slate-900">
                        ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Courier & AWB Actions */}
              <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
                    <Truck className="h-4 w-4 text-purple-600" />
                    <span>Courier Logistics & Live AWB Tracking</span>
                  </div>
                  <button
                    onClick={() => setTrackingModalOpen(true)}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Update AWB
                  </button>
                </div>
                {selectedOrder.tracking?.trackingNumber ? (
                  <div className="text-xs text-slate-700 space-y-1">
                    <p>
                      Courier: <strong>{selectedOrder.tracking.courierName}</strong>
                    </p>
                    <p>
                      AWB Number: <strong className="font-mono text-purple-700">{selectedOrder.tracking.trackingNumber}</strong>
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    No AWB tracking generated yet. Click "Update AWB" to assign Shiprocket/DHL tracking.
                  </p>
                )}
              </div>

              {/* Status Update Quick Buttons */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Update Order Pipeline Stage
                </h4>
                <div className="flex flex-wrap gap-2">
                  {["confirmed", "shipped", "delivered", "cancelled"].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(selectedOrder._id, st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                        selectedOrder.orderStatus === st
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      Mark as {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AWB Tracking Modal */}
      {trackingModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Update Courier & AWB Tracking</h3>
            <form onSubmit={handleSaveTracking} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Courier Partner</label>
                <input
                  type="text"
                  value={trackingCourier}
                  onChange={(e) => setTrackingCourier(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">AWB / Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. SR-893472918"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tracking URL</label>
                <input
                  type="text"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  placeholder="https://track.shiprocket.in/..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTrackingModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingTracking}
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold"
                >
                  {updatingTracking ? "Saving..." : "Save Tracking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
