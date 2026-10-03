import React, { useState } from "react";
import { X, Upload, Plus, Trash2, Sparkles, Image as ImageIcon } from "lucide-react";
import adminService from "../services/adminService";

interface AdminProductFormProps {
  product?: any | null;
  categories: any[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminProductForm({
  product,
  categories,
  onClose,
  onSuccess,
}: AdminProductFormProps) {
  const isEditing = !!product;

  const [name, setName] = useState(product?.name || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [arabicName, setArabicName] = useState(product?.arabicName || "");
  const [tagline, setTagline] = useState(product?.tagline || "");
  const [categoryId, setCategoryId] = useState(
    product?.category?._id || product?.category || categories[0]?._id || ""
  );
  const [productType, setProductType] = useState(product?.productType || "single_attar");
  const [shortDescription, setShortDescription] = useState(product?.shortDescription || "");
  const [description, setDescription] = useState(product?.description || "");
  const [badge, setBadge] = useState(product?.badge || "");
  const [isBestSeller, setIsBestSeller] = useState(product?.isBestSeller ?? false);
  const [isNewArrival, setIsNewArrival] = useState(product?.isNewArrival ?? false);
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? true);
  const [isActive, setIsActive] = useState(product?.isActive ?? true);

  // Fragrance profile
  const [gender, setGender] = useState(product?.fragrance?.gender || "Unisex");
  const [longevity, setLongevity] = useState(product?.fragrance?.longevity || "18+ Hours");
  const [sillage, setSillage] = useState(product?.fragrance?.sillage || "Regal Aura (Heavy)");
  const [origin, setOrigin] = useState(product?.fragrance?.origin || "Taif, Saudi Arabia");

  // Olfactory notes
  const [topNotes, setTopNotes] = useState(product?.notes?.top?.join(", ") || "");
  const [heartNotes, setHeartNotes] = useState(product?.notes?.heart?.join(", ") || "");
  const [baseNotes, setBaseNotes] = useState(product?.notes?.base?.join(", ") || "");

  // Variants (3ml, 6ml, 12ml)
  const [variants, setVariants] = useState<any[]>(
    product?.variants?.length
      ? product.variants
      : [
          { size: 3, unit: "ml", label: "3ml Pure Extrait", price: 4200, compareAtPrice: 4800, sku: "SOA-3ML", isDefault: false },
          { size: 6, unit: "ml", label: "6ml Royal Flacon", price: 7800, compareAtPrice: 8900, sku: "SOA-6ML", isDefault: true },
          { size: 12, unit: "ml", label: "12ml Imperial Crystal", price: 14500, compareAtPrice: 16500, sku: "SOA-12ML", isDefault: false },
        ]
  );

  // Images
  const [images, setImages] = useState<any[]>(
    product?.images?.length ? product.images : [{ url: "/uploads/products/oud-maroki-hero.png", isPrimary: true }]
  );
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate slug from name
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  };

  // Upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingImage(true);
      const fileList = Array.from(files);
      const res = await adminService.uploadMultipleMedia(fileList);
      const newImages = res.map((item, idx) => ({
        url: item.url,
        isPrimary: images.length === 0 && idx === 0,
      }));
      setImages((prev) => [...prev, ...newImages]);
    } catch (err: any) {
      alert("Image upload failed: " + err?.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const next = [...variants];
    next[index] = { ...next[index], [field]: value };
    setVariants(next);
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      { size: 12, unit: "ml", label: "Custom Flacon", price: 9900, sku: `SOA-${Date.now().toString().slice(-4)}` },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name,
      slug,
      arabicName,
      tagline,
      category: categoryId,
      productType,
      shortDescription,
      description,
      badge,
      isBestSeller,
      isNewArrival,
      isFeatured,
      isActive,
      fragrance: {
        gender,
        longevity,
        sillage,
        origin,
      },
      notes: {
        top: topNotes.split(",").map((s) => s.trim()).filter(Boolean),
        heart: heartNotes.split(",").map((s) => s.trim()).filter(Boolean),
        base: baseNotes.split(",").map((s) => s.trim()).filter(Boolean),
      },
      variants: variants.map((v) => ({
        ...v,
        price: Number(v.price) || 0,
        compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
      })),
      images: images.map((img, idx) => ({
        url: img.url,
        isPrimary: idx === 0,
        sortOrder: idx,
      })),
    };

    try {
      if (isEditing) {
        await adminService.updateProduct(product._id, payload);
      } else {
        await adminService.createProduct(payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(err?.message || "Failed to save extrait product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex justify-center p-4 sm:p-6 lg:p-10 font-sans animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {isEditing ? `Edit Extrait: ${product.name}` : "Create New Maison Extrait"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure product details, fragrance pyramid, multi-size pricing, and media
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Section 1: General Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              1. General Information & Identity
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Extrait Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Royal Taif Rose Extrait"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="royal-taif-rose"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Arabic Calligraphy Name</label>
                <input
                  type="text"
                  value={arabicName}
                  onChange={(e) => setArabicName(e.target.value)}
                  placeholder="e.g. ورد طائفي ملكي"
                  dir="rtl"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-arabic text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Olfactory Category *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Distilled from the first pre-dawn harvest in the misty peaks of Taif"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Full olfactory description, extraction narrative, and notes breakdown..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: Media Gallery */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              2. Product Media Gallery (Stored in backend/public/uploads)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <div key={idx} className="relative group rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 aspect-square">
                  <img
                    src={img.url}
                    alt="Product preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/uploads/products/oud-maroki-hero.png";
                    }}
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {idx === 0 && (
                    <span className="absolute top-2 left-2 bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                      Primary
                    </span>
                  )}
                </div>
              ))}

              {/* Upload button card */}
              <label className="cursor-pointer border-2 border-dashed border-slate-200 hover:border-purple-500 rounded-2xl aspect-square flex flex-col items-center justify-center gap-2 p-4 text-center transition-colors bg-slate-50/50">
                <Upload className="h-5 w-5 text-purple-600" />
                <span className="text-[11px] font-semibold text-slate-600">
                  {uploadingImage ? "Uploading..." : "Upload Photos"}
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Section 3: Multi-Size Variant Pricing Matrix */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                3. Multi-Size Variants & Pricing Matrix
              </h3>
              <button
                type="button"
                onClick={addVariant}
                className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Size</span>
              </button>
            </div>

            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-5 gap-3 items-center">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Volume (ml)</label>
                    <input
                      type="number"
                      value={v.size}
                      onChange={(e) => updateVariant(idx, "size", Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Label</label>
                    <input
                      type="text"
                      value={v.label}
                      onChange={(e) => updateVariant(idx, "label", e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Selling Price (₹)</label>
                    <input
                      type="number"
                      value={v.price}
                      onChange={(e) => updateVariant(idx, "price", Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Compare Price (₹)</label>
                    <input
                      type="number"
                      value={v.compareAtPrice || ""}
                      onChange={(e) => updateVariant(idx, "compareAtPrice", Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-500"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-3 sm:pt-0">
                    <input
                      type="text"
                      value={v.sku || ""}
                      placeholder="SKU"
                      onChange={(e) => updateVariant(idx, "sku", e.target.value)}
                      className="w-24 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => removeVariant(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Olfactory Scent Pyramid */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              4. Olfactory Pyramid (Notes comma-separated)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Top Notes</label>
                <input
                  type="text"
                  value={topNotes}
                  onChange={(e) => setTopNotes(e.target.value)}
                  placeholder="Taif Rose, Bergamot, Saffron"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Heart Notes</label>
                <input
                  type="text"
                  value={heartNotes}
                  onChange={(e) => setHeartNotes(e.target.value)}
                  placeholder="Damask Rose, Frankincense, Spices"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Base Notes</label>
                <input
                  type="text"
                  value={baseNotes}
                  onChange={(e) => setBaseNotes(e.target.value)}
                  placeholder="Aged Cambodian Oud, Amber, Royal Musk"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Attributes & Badges */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              5. Scent Attributes & Visibility
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Longevity</label>
                <input
                  type="text"
                  value={longevity}
                  onChange={(e) => setLongevity(e.target.value)}
                  placeholder="18+ Hours"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Sillage</label>
                <input
                  type="text"
                  value={sillage}
                  onChange={(e) => setSillage(e.target.value)}
                  placeholder="Regal Aura"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  <option value="Unisex">Unisex</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Badge Text</label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="e.g. Masterpiece"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBestSeller}
                  onChange={(e) => setIsBestSeller(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
                />
                <span>Bestseller Flacon</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNewArrival}
                  onChange={(e) => setIsNewArrival(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
                />
                <span>New Arrival</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
                />
                <span>Active in Live Boutique</span>
              </label>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 sm:px-8 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-600/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {saving ? "Saving Extrait..." : isEditing ? "Update Extrait" : "Create Extrait"}
          </button>
        </div>
      </div>
    </div>
  );
}
