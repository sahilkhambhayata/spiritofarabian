import React, { useEffect, useState } from "react";
import { Star, CheckCircle, Trash2, MessageSquare, ShieldCheck } from "lucide-react";
import adminService from "../services/adminService";

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res: any = await adminService.getReviews();
      setReviews(res?.reviews || res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await adminService.approveReview(id);
      loadReviews();
    } catch (err: any) {
      alert("Approval error: " + err?.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this review?")) {
      try {
        await adminService.deleteReview(id);
        loadReviews();
      } catch (err: any) {
        alert("Delete failed: " + err?.message);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Reviews Moderation</h1>
        <p className="text-xs text-slate-500 mt-1">
          Moderate verified patron feedback, star ratings, and publish testimonials
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-4 px-6">Reviewer</th>
                <th className="py-4 px-4">Rating</th>
                <th className="py-4 px-4">Title & Feedback</th>
                <th className="py-4 px-4">Product</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">Loading reviews...</td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">No reviews pending moderation.</td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{r.user?.name || r.userName || "VIP Patron"}</div>
                      <div className="text-[10px] text-slate-400">{r.user?.email}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center text-amber-500 gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < (r.rating || 5) ? "fill-amber-400 text-amber-400" : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 max-w-sm">
                      {r.title && <div className="font-bold text-slate-900 mb-0.5">{r.title}</div>}
                      <p className="text-slate-600 line-clamp-2">{r.comment || r.content}</p>
                    </td>
                    <td className="py-4 px-4 font-semibold text-purple-700">
                      {r.product?.name || "Pure Attar"}
                    </td>
                    <td className="py-4 px-4">
                      {r.isApproved ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-2">
                        {!r.isApproved && (
                          <button
                            onClick={() => handleApprove(r._id)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Approve Review"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(r._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Review"
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
    </div>
  );
}
