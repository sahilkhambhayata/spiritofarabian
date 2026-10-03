import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Upload, Sparkles, Image as ImageIcon, X, Check, ExternalLink } from "lucide-react";
import adminService from "../services/adminService";
import api from "../services/api";

export default function AdminBanners() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any | null>(null);

  // Announcement bar state
  const [announcementText, setAnnouncementText] = useState("");
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [tickerSuccess, setTickerSuccess] = useState(false);

  // Banner modal state
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [badge, setBadge] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [mobileImageUrl, setMobileImageUrl] = useState("");
  const [ctaText, setCtaText] = useState("Explore Masterpieces");
  const [ctaLink, setCtaLink] = useState("/collection");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const [res, settingsRes]: any = await Promise.all([
        adminService.getBanners().catch(() => []),
        api.get("/settings").catch(() => ({})),
      ]);
      const rawBanners = res?.banners || res?.data || (Array.isArray(res) ? res : []);
      setBanners(Array.isArray(rawBanners) ? rawBanners : []);

      if (settingsRes?.announcementBarText || settingsRes?.announcement) {
        setAnnouncementText(settingsRes.announcementBarText || settingsRes.announcement || "");
      }
    } catch (err) {
      console.error("Error loading banners:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const openCreate = () => {
    setEditingBanner(null);
    setTitle("");
    setSubtitle("");
    setBadge("Royal Reserve");
    setImageUrl("/uploads/hero-bottle.jpg");
    setMobileImageUrl("/uploads/hero-bottle.jpg");
    setCtaText("Explore Masterpieces");
    setCtaLink("/collection");
    setSortOrder(banners.length + 1);
    setIsActive(true);
    setModalOpen(true);
  };

  const openEdit = (b: any) => {
    setEditingBanner(b);
    setTitle(b.title || "");
    setSubtitle(b.subtitle || "");
    setBadge(b.badge || "");
    setImageUrl(b.desktopImage || b.imageUrl || b.image || "/uploads/hero-bottle.jpg");
    setMobileImageUrl(b.mobileImage || b.mobileImageUrl || b.desktopImage || "");
    setCtaText(b.ctaText || "Explore Masterpieces");
    setCtaLink(b.ctaLink || "/collection");
    setSortOrder(b.orderIndex ?? b.sortOrder ?? 0);
    setIsActive(b.isActive !== false);
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMobile = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const res = await adminService.uploadMedia(file);
      if (isMobile) {
        setMobileImageUrl(res.url);
      } else {
        setImageUrl(res.url);
      }
    } catch (err: any) {
      alert("Upload failed: " + err?.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title,
        subtitle,
        badge,
        desktopImage: imageUrl || "/uploads/hero-bottle.jpg",
        mobileImage: mobileImageUrl || imageUrl || "/uploads/hero-bottle.jpg",
        ctaText,
        ctaLink,
        position: "hero_slider",
        orderIndex: Number(sortOrder) || 0,
        isActive,
      };

      if (editingBanner) {
        await adminService.updateBanner(editingBanner._id, payload);
      } else {
        await adminService.createBanner(payload);
      }
      setModalOpen(false);
      await loadBanners();
    } catch (err: any) {
      alert("Save failed: " + err?.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, titleStr: string) => {
    if (window.confirm(`Delete hero slide "${titleStr}"?`)) {
      try {
        await adminService.deleteBanner(id);
        await loadBanners();
      } catch (err: any) {
        alert("Delete failed: " + err?.message);
      }
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Top Announcement Bar Editor */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span>Header Announcement Bar Ticker</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-semibold bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
            Storefront Header
          </span>
        </div>
        <p className="text-xs text-slate-500">
          This promotional notice scrolls smoothly at the very top of the live boutique header
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            placeholder="e.g. Complimentary Pure Velvet Pouch & 3ml Sample on All Orders Above ₹2,999"
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
          />
          <button
            type="button"
            onClick={async () => {
              try {
                setSavingAnnouncement(true);
                await api.put("/settings", {
                  announcementBarText: announcementText,
                  announcement: announcementText,
                });
                setTickerSuccess(true);
                setTimeout(() => setTickerSuccess(false), 3000);
              } catch (err: any) {
                alert("Failed to update ticker: " + err?.message);
              } finally {
                setSavingAnnouncement(false);
              }
            }}
            disabled={savingAnnouncement}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>{savingAnnouncement ? "Saving..." : tickerSuccess ? "Ticker Updated!" : "Update Ticker"}</span>
          </button>
        </div>
      </div>

      {/* Hero Banners Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hero Slides & Visual Merchandising</h1>
          <p className="text-xs text-slate-500 mt-1">
            Control the homepage carousel, high-res photography banners, and campaign CTA buttons
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-purple-600/20 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Hero Slide</span>
        </button>
      </div>

      {/* Banners Grid with Vivid High-Res Visual Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 py-16 text-center text-xs text-slate-400">Loading hero slides...</div>
        ) : banners.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            No hero slides found. Click "Add Hero Slide" above to create your first visual campaign.
          </div>
        ) : (
          banners.map((b) => {
            const displayImg = b.desktopImage || b.imageUrl || b.image || "/uploads/hero-bottle.jpg";

            return (
              <div
                key={b._id}
                className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow"
              >
                {/* Visual Banner Media Preview */}
                <div className="h-56 relative overflow-hidden bg-slate-900">
                  <img
                    src={displayImg}
                    alt={b.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/uploads/arabian-vault-box.jpg";
                    }}
                  />
                  {/* Gentle Gradient for Rich Contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-end p-5 text-white">
                    {b.badge && (
                      <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 mb-1.5 drop-shadow-sm">
                        {b.badge}
                      </span>
                    )}
                    <h4 className="text-lg font-bold text-white tracking-tight leading-snug drop-shadow-sm">
                      {b.title}
                    </h4>
                    <p className="text-xs text-slate-200 line-clamp-2 mt-1 drop-shadow-xs leading-relaxed">
                      {b.subtitle}
                    </p>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-4 flex items-center justify-between border-t border-slate-100 text-xs bg-slate-50/50">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-slate-800">CTA: {b.ctaText || "Explore Masterpieces"}</span>
                    <span className="text-slate-400 font-mono text-[11px] truncate">({b.ctaLink || "/collection"})</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEdit(b)}
                      className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit slide"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(b._id, b.title)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete slide"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Banner Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingBanner ? "Edit Hero Slide" : "Create Hero Slide"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              {/* Slide Title */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Slide Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Maison Spirit of Arabian — Royal Attar Oils"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subtitle / Descriptor</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. 100% Pure Botanical Lipids · Zero Synthetic Dilution"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. Royal Reserve"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Order Index</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              {/* Desktop Banner Image */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Desktop High-Res Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="/uploads/hero-bottle.jpg"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                  />
                  <label className="cursor-pointer px-3 py-2 bg-purple-50 text-purple-600 rounded-xl font-semibold hover:bg-purple-100 flex items-center gap-1.5 shrink-0 transition-colors">
                    <Upload className="h-3.5 w-3.5" />
                    <span>{uploading ? "Uploading..." : "Upload"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, false)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Thumbnail Preview */}
                {imageUrl && (
                  <div className="mt-2 h-24 rounded-xl overflow-hidden border border-slate-200 relative">
                    <img
                      src={imageUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/uploads/arabian-vault-box.jpg";
                      }}
                    />
                    <span className="absolute bottom-1 right-2 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">
                      Live Preview
                    </span>
                  </div>
                )}
              </div>

              {/* CTA Details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="Explore Masterpieces"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CTA Target Link</label>
                  <input
                    type="text"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    placeholder="/collection"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {saving ? "Saving..." : "Save Slide"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
