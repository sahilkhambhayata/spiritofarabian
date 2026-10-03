import React, { useEffect, useState } from "react";
import { Plus, BookOpen, Edit2, Trash2, Upload, X, Eye } from "lucide-react";
import adminService from "../services/adminService";

export default function AdminJournal() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [category, setCategory] = useState("Haute Parfumerie");
  const [authorName, setAuthorName] = useState("Master Distiller Tariq");
  const [readTimeMinutes, setReadTimeMinutes] = useState(5);
  const [isPublished, setIsPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const res: any = await adminService.getArticles();
      setArticles(res?.articles || res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const openCreate = () => {
    setEditingArticle(null);
    setTitle("");
    setSlug("");
    setExcerpt("");
    setContent("");
    setCoverImage("/uploads/banners/hero-perfume-bg.png");
    setCategory("Haute Parfumerie");
    setAuthorName("Master Distiller Tariq");
    setReadTimeMinutes(5);
    setIsPublished(true);
    setModalOpen(true);
  };

  const openEdit = (a: any) => {
    setEditingArticle(a);
    setTitle(a.title || "");
    setSlug(a.slug || "");
    setExcerpt(a.excerpt || "");
    setContent(a.content || "");
    setCoverImage(a.coverImage || "");
    setCategory(a.category || "Haute Parfumerie");
    setAuthorName(a.author?.name || a.authorName || "Master Distiller");
    setReadTimeMinutes(a.readTimeMinutes || 5);
    setIsPublished(a.isPublished ?? true);
    setModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingArticle) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const res = await adminService.uploadMedia(file);
      setCoverImage(res.url);
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
        slug,
        excerpt,
        content,
        coverImage,
        category,
        author: { name: authorName, role: "Master Artisan" },
        readTimeMinutes: Number(readTimeMinutes),
        isPublished,
      };

      if (editingArticle) {
        await adminService.updateArticle(editingArticle._id, payload);
      } else {
        await adminService.createArticle(payload);
      }
      setModalOpen(false);
      loadArticles();
    } catch (err: any) {
      alert("Save failed: " + err?.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, titleStr: string) => {
    if (window.confirm(`Delete article "${titleStr}"?`)) {
      try {
        await adminService.deleteArticle(id);
        loadArticles();
      } catch (err: any) {
        alert("Delete failed: " + err?.message);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Maison Journal & Blog CMS</h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish educational attar guides, olfactory histories, and distillation stories
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-purple-600/20 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Write Article</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-slate-400">Loading articles...</div>
        ) : (
          articles.map((a) => (
            <div
              key={a._id}
              className="bg-white rounded-2xl border border-slate-100/90 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              <div className="h-40 bg-slate-900 relative overflow-hidden">
                <img
                  src={a.coverImage || "/uploads/banners/hero-perfume-bg.png"}
                  alt={a.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 bg-purple-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {a.category || "Journal"}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{a.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{a.excerpt}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[10px]">{a.readTimeMinutes || 5} min read</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEdit(a)}
                      className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(a._id, a.title)}
                      className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Article Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingArticle ? "Edit Journal Article" : "Write New Journal Article"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. The Secrets of Hydro-Distillation"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cover Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                  <label className="cursor-pointer px-3 py-2 bg-purple-50 text-purple-600 rounded-xl font-semibold hover:bg-purple-100 flex items-center gap-1.5">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Excerpt / Brief Summary</label>
                <textarea
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Article Narrative (Markdown supported)</label>
                <textarea
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write the article content..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 font-semibold text-slate-600">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-5 py-2 bg-purple-600 text-white rounded-xl font-semibold shadow-xs">
                  {saving ? "Saving..." : "Publish Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
