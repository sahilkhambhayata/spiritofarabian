import React, { useEffect, useState } from "react";
import {
  FileText,
  Plus,
  Trash2,
  Edit2,
  Save,
  Check,
  Eye,
  ShieldCheck,
  Truck,
  RotateCcw,
  Lock,
  ExternalLink,
  X,
  Layers,
  Sparkles,
} from "lucide-react";
import api from "../services/api";

interface PolicySection {
  heading: string;
  content: string;
  order?: number;
}

interface PolicyHighlight {
  icon: string;
  title: string;
  description: string;
}

interface InformationPage {
  _id?: string;
  policy_type: "shipping" | "return" | "privacy" | "terms" | "refund" | "custom";
  title: string;
  path: string;
  subtitle?: string;
  sections: PolicySection[];
  highlights: PolicyHighlight[];
  isActive?: boolean;
}

export default function AdminInformation() {
  const [pages, setPages] = useState<InformationPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<InformationPage | null>(null);

  // Form State
  const [policyType, setPolicyType] = useState<string>("shipping");
  const [title, setTitle] = useState("");
  const [path, setPath] = useState("/shipping-policy");
  const [subtitle, setSubtitle] = useState("");
  const [sections, setSections] = useState<PolicySection[]>([]);
  const [highlights, setHighlights] = useState<PolicyHighlight[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadInformationPages = async () => {
    try {
      setLoading(true);
      const res: any = await api.get("/information");
      setPages(Array.isArray(res) ? res : res?.data || []);
    } catch (err) {
      console.error("Error loading information pages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInformationPages();
  }, []);

  const openCreate = () => {
    setEditingPage(null);
    setPolicyType("custom");
    setTitle("");
    setPath("/custom-policy");
    setSubtitle("Maison Spirit of Arabian Terms & Guidelines");
    setSections([
      {
        heading: "1. Overview & Heritage Principle",
        content: "Spirit of Arabian crafts pure botanical attars using centuries-old hydro-distillation.",
        order: 1,
      },
    ]);
    setHighlights([
      {
        icon: "ShieldCheck",
        title: "100% Pure Oils",
        description: "Zero synthetic dilution or alcohol content.",
      },
    ]);
    setIsActive(true);
    setModalOpen(true);
  };

  const openEdit = (page: InformationPage) => {
    setEditingPage(page);
    setPolicyType(page.policy_type || "custom");
    setTitle(page.title || "");
    setPath(page.path || "");
    setSubtitle(page.subtitle || "");
    setSections(page.sections?.length ? page.sections : []);
    setHighlights(page.highlights?.length ? page.highlights : []);
    setIsActive(page.isActive ?? true);
    setModalOpen(true);
  };

  const handleAddSection = () => {
    setSections([
      ...sections,
      {
        heading: `${sections.length + 1}. New Policy Clause`,
        content: "Detail the specific terms, procedures, and conditions here...",
        order: sections.length + 1,
      },
    ]);
  };

  const handleUpdateSection = (index: number, field: "heading" | "content", value: string) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], [field]: value };
    setSections(updated);
  };

  const handleRemoveSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleAddHighlight = () => {
    setHighlights([
      ...highlights,
      {
        icon: "ShieldCheck",
        title: "Purity & Authenticity",
        description: "Sealed with numbered holographic Maison wax stamp.",
      },
    ]);
  };

  const handleUpdateHighlight = (index: number, field: "icon" | "title" | "description", value: string) => {
    const updated = [...highlights];
    updated[index] = { ...updated[index], [field]: value };
    setHighlights(updated);
  };

  const handleRemoveHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        policy_type: policyType,
        title: title.trim(),
        path: path.trim(),
        subtitle: subtitle.trim(),
        sections,
        highlights,
        isActive,
      };

      await api.post("/information", payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      setModalOpen(false);
      loadInformationPages();
    } catch (err: any) {
      alert("Save failed: " + err?.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (page: InformationPage) => {
    if (window.confirm(`Are you sure you want to delete the "${page.title}" information page?`)) {
      try {
        if (page._id) {
          await api.delete(`/information/${page._id}`);
          loadInformationPages();
        }
      } catch (err: any) {
        alert("Delete failed: " + err?.message);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Information & Policy Pages CMS</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete CRUD for legal policies, shipping timelines, return procedures, and brand guidelines
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-purple-600/20 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Information Page</span>
        </button>
      </div>

      {/* Main Pages Table */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-4 px-6">Policy Type</th>
                <th className="py-4 px-4">Title & Subtitle</th>
                <th className="py-4 px-4">URL Route</th>
                <th className="py-4 px-4">Clauses & Highlights</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading information pages...
                  </td>
                </tr>
              ) : pages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No information documents found. Click "Add Information Page" to create one.
                  </td>
                </tr>
              ) : (
                pages.map((p) => (
                  <tr key={p._id || p.policy_type} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-bold text-purple-700 uppercase tracking-wider">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-mono bg-purple-50 text-purple-700">
                        {p.policy_type}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{p.title}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{p.subtitle}</div>
                    </td>
                    <td className="py-4 px-4 font-mono text-[11px] text-slate-600">
                      <a
                        href={p.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-purple-600 inline-flex items-center gap-1"
                      >
                        <span>{p.path}</span>
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </a>
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      <span className="font-semibold text-slate-800">{p.sections?.length || 0}</span> Sections ·{" "}
                      <span className="font-semibold text-slate-800">{p.highlights?.length || 0}</span> Highlights
                    </td>
                    <td className="py-4 px-4">
                      {p.isActive !== false ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Edit Policy"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Policy"
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

      {/* Information Page CRUD Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex justify-center p-4 sm:p-6 lg:p-10 font-sans animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingPage ? `Edit Policy: ${editingPage.title}` : "Create New Information Page"}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure policy document, sections breakdown, and luxury highlight badges
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
              {/* Identity */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  1. Policy Document Identity
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Policy Type *</label>
                    <select
                      value={policyType}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPolicyType(val);
                        if (!editingPage) {
                          if (val === "shipping") {
                            setTitle("Shipping & Royal Delivery Policy");
                            setPath("/shipping-policy");
                          } else if (val === "return") {
                            setTitle("Return & Exchange Policy");
                            setPath("/return-policy");
                          } else if (val === "privacy") {
                            setTitle("Privacy & Data Protection Policy");
                            setPath("/privacy-policy");
                          } else if (val === "terms") {
                            setTitle("Terms & Conditions of Luxury Service");
                            setPath("/terms-of-service");
                          } else if (val === "refund") {
                            setTitle("Refund & Cancellation Policy");
                            setPath("/refund-policy");
                          }
                        }
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                    >
                      <option value="shipping">Shipping Policy</option>
                      <option value="return">Return & Exchange</option>
                      <option value="privacy">Privacy Policy</option>
                      <option value="terms">Terms of Service</option>
                      <option value="refund">Refund Policy</option>
                      <option value="custom">Custom Policy / Brand Doc</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Document Title *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Shipping & Royal Delivery Policy"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">URL Path *</label>
                    <input
                      type="text"
                      required
                      value={path}
                      onChange={(e) => setPath(e.target.value)}
                      placeholder="/shipping-policy"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Document Subtitle</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. Handcrafted handling, express insured dispatch, and temperature-controlled preservation."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* Highlights Row */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    2. Luxury Key Highlights & Guarantees
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddHighlight}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Highlight</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {highlights.map((h, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                    >
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Icon</label>
                        <select
                          value={h.icon}
                          onChange={(e) => handleUpdateHighlight(idx, "icon", e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        >
                          <option value="ShieldCheck">ShieldCheck</option>
                          <option value="Truck">Truck</option>
                          <option value="RotateCcw">RotateCcw</option>
                          <option value="Lock">Lock</option>
                          <option value="FileText">FileText</option>
                        </select>
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Highlight Title</label>
                        <input
                          type="text"
                          value={h.title}
                          onChange={(e) => handleUpdateHighlight(idx, "title", e.target.value)}
                          placeholder="e.g. Insured Express Air"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                        />
                      </div>

                      <div className="sm:col-span-5">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Description</label>
                        <input
                          type="text"
                          value={h.description}
                          onChange={(e) => handleUpdateHighlight(idx, "description", e.target.value)}
                          placeholder="Dispatched within 24-48 business hours..."
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>

                      <div className="sm:col-span-1 flex justify-end pt-3 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => handleRemoveHighlight(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sections Breakdown */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    3. Policy Clauses & Narrative Sections
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Clause Section</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {sections.map((sec, idx) => (
                    <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <input
                          type="text"
                          value={sec.heading}
                          onChange={(e) => handleUpdateSection(idx, "heading", e.target.value)}
                          placeholder="e.g. 1. Order Processing & Verification"
                          className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSection(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <textarea
                        rows={4}
                        value={sec.content}
                        onChange={(e) => handleUpdateSection(idx, "content", e.target.value)}
                        placeholder="Write the detailed policy explanation and instructions..."
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed font-mono"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="px-6 sm:px-8 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-600/20 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2"
              >
                {saveSuccess ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                <span>{saving ? "Saving Policy..." : editingPage ? "Update Policy" : "Create Policy"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
