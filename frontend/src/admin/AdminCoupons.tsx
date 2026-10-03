import React, { useEffect, useState } from "react";
import { Plus, TicketPercent, Trash2, Edit2, X, CheckCircle2 } from "lucide-react";
import adminService from "../services/adminService";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any | null>(null);

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState(15);
  const [minOrderValue, setMinOrderValue] = useState(0);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [usageLimit, setUsageLimit] = useState(500);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const res: any = await adminService.getCoupons();
      setCoupons(res?.coupons || res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const openCreate = () => {
    setEditingCoupon(null);
    setCode("");
    setDiscountType("percentage");
    setDiscountValue(15);
    setMinOrderValue(0);
    setMaxDiscountAmount("");
    setDescription("");
    setUsageLimit(500);
    setIsActive(true);
    setModalOpen(true);
  };

  const openEdit = (c: any) => {
    setEditingCoupon(c);
    setCode(c.code || "");
    setDiscountType(c.discountType || "percentage");
    setDiscountValue(c.discountValue || 15);
    setMinOrderValue(c.minOrderValue || 0);
    setMaxDiscountAmount(c.maxDiscountAmount || "");
    setDescription(c.description || "");
    setUsageLimit(c.usageLimit || 500);
    setIsActive(c.isActive ?? true);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minOrderValue: Number(minOrderValue) || 0,
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
        description,
        usageLimit: Number(usageLimit) || 1000,
        isActive,
      };

      if (editingCoupon) {
        await adminService.updateCoupon(editingCoupon._id, payload);
      } else {
        await adminService.createCoupon(payload);
      }
      setModalOpen(false);
      loadCoupons();
    } catch (err: any) {
      alert("Save failed: " + err?.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, codeStr: string) => {
    if (window.confirm(`Delete coupon "${codeStr}"?`)) {
      try {
        await adminService.deleteCoupon(id);
        loadCoupons();
      } catch (err: any) {
        alert("Delete failed: " + err?.message);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Flash Sales & Coupons</h1>
          <p className="text-xs text-slate-500 mt-1">
            Create VIP privilege codes, percentage discounts, and order limits
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-purple-600/20 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-4 px-6">Coupon Code</th>
                <th className="py-4 px-4">Discount</th>
                <th className="py-4 px-4">Min Order</th>
                <th className="py-4 px-4">Usage Count</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading coupons...
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No active coupons found. Click "Create Coupon" to create your first promotion.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-purple-700">
                      {c.code}
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-900">
                      {c.discountType === "percentage" ? `${c.discountValue}% OFF` : `₹${c.discountValue} Flat OFF`}
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      {c.minOrderValue ? `₹${c.minOrderValue.toLocaleString("en-IN")}` : "No minimum"}
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      {c.usedCount || 0} / {c.usageLimit || "∞"}
                    </td>
                    <td className="py-4 px-4">
                      {c.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c._id, c.code)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coupon Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingCoupon ? "Edit Promotion Coupon" : "Create New Coupon"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ROYAL15"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-purple-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e: any) => setDiscountType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Minimum Order Value (₹)</label>
                <input
                  type="number"
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(Number(e.target.value))}
                  placeholder="0 for any amount"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="couponActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-purple-600"
                />
                <label htmlFor="couponActive" className="font-medium text-slate-700">
                  Active & usable at checkout
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  {saving ? "Saving..." : "Save Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
