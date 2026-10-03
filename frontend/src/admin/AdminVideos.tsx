import React, { useEffect, useState } from "react";
import { Plus, Video, Trash2, Edit2, Upload, X, Play, Tag } from "lucide-react";
import adminService from "../services/adminService";

import api from "../services/api";

export default function AdminVideos() {
  const [videos, setVideos] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any | null>(null);

  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [patronName, setPatronName] = useState("");
  const [patronCity, setPatronCity] = useState("");
  const [reviewQuote, setReviewQuote] = useState("");
  const [rating, setRating] = useState(5);
  const [taggedProductId, setTaggedProductId] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vRes, pRes]: any = await Promise.all([
        adminService.getVideos().catch(() => ({ videos: [] })),
        api.get("/products?limit=50").catch(() => ({ products: [] })),
      ]);
      setVideos(vRes?.videos || vRes || []);
      const rawProducts = pRes?.products || pRes?.data?.products || (Array.isArray(pRes) ? pRes : []);
      setProducts(Array.isArray(rawProducts) ? rawProducts : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditingVideo(null);
    setTitle("");
    setVideoUrl("https://assets.mixkit.co/videos/preview/mixkit-perfume-bottle-and-rose-petals-40348-large.mp4");
    setPosterUrl("/uploads/products/oud-maroki-hero.png");
    setPatronName("Amina Al-Mansoor");
    setPatronCity("Dubai");
    setReviewQuote("The sillage of this Taif rose is royal. Lasts over 24 hours on silk.");
    setRating(5);
    setTaggedProductId(products[0]?._id || "");
    setSortOrder(videos.length + 1);
    setModalOpen(true);
  };

  const openEdit = (v: any) => {
    setEditingVideo(v);
    setTitle(v.title || "");
    setVideoUrl(v.videoUrl || "");
    setPosterUrl(v.posterUrl || "");
    setPatronName(v.patronName || "");
    setPatronCity(v.patronCity || "");
    setReviewQuote(v.reviewQuote || "");
    setRating(v.rating || 5);
    setTaggedProductId(v.taggedProduct?._id || v.taggedProduct || "");
    setSortOrder(v.sortOrder || 0);
    setModalOpen(true);
  };

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingPoster(true);
      const res = await adminService.uploadMedia(file);
      setPosterUrl(res.url);
    } catch (err: any) {
      alert("Upload failed: " + err?.message);
    } finally {
      setUploadingPoster(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title,
        videoUrl,
        posterUrl,
        patronName,
        patronCity,
        reviewQuote,
        rating: Number(rating),
        taggedProduct: taggedProductId || undefined,
        sortOrder: Number(sortOrder),
      };

      if (editingVideo) {
        await adminService.updateVideo(editingVideo._id, payload);
      } else {
        await adminService.createVideo(payload);
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      alert("Save failed: " + err?.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this shoppable video reel?")) {
      try {
        await adminService.deleteVideo(id);
        loadData();
      } catch (err: any) {
        alert("Delete failed: " + err?.message);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Shoppable UGC Video Reels</h1>
          <p className="text-xs text-slate-500 mt-1">
            Reel-style customer unboxings & reviews with direct "Shop This Look" product tagging
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-purple-600/20 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Video Reel</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? (
          <div className="col-span-4 py-12 text-center text-slate-400">Loading videos...</div>
        ) : (
          videos.map((v) => (
            <div
              key={v._id}
              className="bg-white rounded-2xl border border-slate-100/90 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              <div className="relative aspect-[9/14] bg-slate-900 overflow-hidden">
                <img
                  src={v.posterUrl || "/uploads/products/oud-maroki-hero.png"}
                  alt={v.patronName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-between p-3.5 text-white">
                  <div className="flex items-center justify-between">
                    <span className="bg-purple-600/90 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      ★ {v.rating || 5}.0
                    </span>
                    <Play className="h-4 w-4 fill-white opacity-80" />
                  </div>
                  <div>
                    <p className="font-bold text-xs">{v.patronName}</p>
                    <p className="text-[10px] text-slate-300">{v.patronCity}</p>
                    <p className="text-[10px] text-slate-200 mt-1 line-clamp-2 italic">"{v.reviewQuote}"</p>
                  </div>
                </div>
              </div>

              <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] font-semibold text-purple-700 truncate max-w-[120px]">
                  {v.taggedProduct?.name || "Tagged Extrait"}
                </span>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => openEdit(v)} className="p-1 text-purple-600 hover:bg-purple-50 rounded">
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(v._id)} className="p-1 text-rose-500 hover:bg-rose-50 rounded">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Video Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingVideo ? "Edit Video Reel" : "Add Shoppable UGC Reel"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Patron Name *</label>
                <input
                  type="text"
                  required
                  value={patronName}
                  onChange={(e) => setPatronName(e.target.value)}
                  placeholder="e.g. Amina Al-Mansoor"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Patron City / Location</label>
                <input
                  type="text"
                  value={patronCity}
                  onChange={(e) => setPatronCity(e.target.value)}
                  placeholder="e.g. Dubai, UAE"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Video Stream URL (.mp4)</label>
                <input
                  type="text"
                  required
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cover Thumbnail Image</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={posterUrl}
                    onChange={(e) => setPosterUrl(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                  <label className="cursor-pointer px-3 py-2 bg-purple-50 text-purple-600 rounded-xl font-semibold hover:bg-purple-100 flex items-center gap-1.5">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={handlePosterUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tagged Product ("Shop This Scent")</label>
                <select
                  value={taggedProductId}
                  onChange={(e) => setTaggedProductId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="">-- Select Product --</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer Quote</label>
                <textarea
                  rows={2}
                  value={reviewQuote}
                  onChange={(e) => setReviewQuote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 font-semibold text-slate-600">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-5 py-2 bg-purple-600 text-white rounded-xl font-semibold shadow-xs">
                  {saving ? "Saving..." : "Save Reel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
