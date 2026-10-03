import React, { useEffect, useState } from "react";
import { HelpCircle, FileText, Plus, Trash2, Edit2, Save, Check } from "lucide-react";
import adminService from "../services/adminService";
import api from "../services/api";

export default function AdminFaqPolicy() {
  const [activeSubTab, setActiveSubTab] = useState<"faqs" | "policies">("faqs");
  const [faqs, setFaqs] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any>({
    shippingPolicy: "",
    returnPolicy: "",
    privacyPolicy: "",
    termsOfService: "",
    refundPolicy: "",
  });
  const [selectedPolicyTab, setSelectedPolicyTab] = useState<string>("shippingPolicy");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New FAQ form
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newCategory, setNewCategory] = useState("Pure Oils & Attar Care");

  const loadData = async () => {
    try {
      setLoading(true);
      const [infoRes, settingsRes]: any = await Promise.all([
        adminService.getInformation().catch(() => null),
        api.get("/settings").catch(() => null),
      ]);
      const loadedFaqs = settingsRes?.faqs?.length
        ? settingsRes.faqs
        : infoRes?.faqs?.length
        ? infoRes.faqs
        : [];
      setFaqs(loadedFaqs);
      if (infoRes?.policies) setPolicies(infoRes.policies);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSavePolicies = async () => {
    try {
      setSaving(true);
      await Promise.all([
        adminService.updateInformation({ policies, faqs }),
        api.put("/settings", { faqs }),
      ]);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert("Failed to save: " + err?.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddFaq = () => {
    if (!newQuestion || !newAnswer) return;
    setFaqs([...faqs, { question: newQuestion, answer: newAnswer, category: newCategory }]);
    setNewQuestion("");
    setNewAnswer("");
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">FAQs & Legal Policies CMS</h1>
          <p className="text-xs text-slate-500 mt-1">
            Control customer knowledge base questions and Maison luxury legal documents
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab("faqs")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === "faqs"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50"
            }`}
          >
            FAQ Accordion
          </button>
          <button
            onClick={() => setActiveSubTab("policies")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === "policies"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50"
            }`}
          >
            Legal Policies
          </button>
        </div>
      </div>

      {/* ================= FAQs TAB ================= */}
      {activeSubTab === "faqs" && (
        <div className="space-y-6">
          {/* Add FAQ Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100/90 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Add New FAQ Item</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Question *</label>
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="e.g. How do I properly apply pure attar oil?"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Pure Oils & Attar Care">Pure Oils & Attar Care</option>
                  <option value="Orders & Payment">Orders & Payment</option>
                  <option value="Shipping & Customs">Shipping & Customs</option>
                  <option value="Authenticity & Purity">Authenticity & Purity</option>
                </select>
              </div>
              <div className="sm:col-span-3">
                <label className="block font-semibold text-slate-700 mb-1">Answer *</label>
                <textarea
                  rows={2}
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="Detailed answer explaining the ritual..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleAddFaq}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Question</span>
              </button>
            </div>
          </div>

          {/* Existing FAQs List */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Current FAQ Database ({faqs.length})</h3>
              <button
                onClick={handleSavePolicies}
                disabled={saving}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                {savedSuccess ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                <span>{savedSuccess ? "Saved Successfully!" : "Save FAQ Changes"}</span>
              </button>
            </div>

            <div className="space-y-3">
              {faqs.map((f, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                        {f.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-0.5">{f.question}</h4>
                    </div>
                    <button
                      onClick={() => handleRemoveFaq(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{f.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= LEGAL POLICIES TAB ================= */}
      {activeSubTab === "policies" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100/90 shadow-xs space-y-6">
          {/* Policy Selector Pills */}
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            {[
              { id: "shippingPolicy", label: "Shipping Policy" },
              { id: "returnPolicy", label: "Return & Exchange" },
              { id: "privacyPolicy", label: "Privacy Policy" },
              { id: "termsOfService", label: "Terms of Service" },
              { id: "refundPolicy", label: "Refund Policy" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPolicyTab(p.id)}
                className={`px-3.5 py-2 rounded-xl transition-all ${
                  selectedPolicyTab === p.id
                    ? "bg-slate-900 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              {selectedPolicyTab.replace(/([A-Z])/g, " $1")} Content
            </label>
            <textarea
              rows={12}
              value={policies[selectedPolicyTab] || ""}
              onChange={(e) => setPolicies({ ...policies, [selectedPolicyTab]: e.target.value })}
              placeholder="Write policy terms..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSavePolicies}
              disabled={saving}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-600/20 flex items-center gap-2"
            >
              {savedSuccess ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              <span>{savedSuccess ? "Policies Saved!" : "Save Policy"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
