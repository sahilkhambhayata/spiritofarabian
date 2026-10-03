import React, { useEffect, useState } from "react";
import { Gift, Plus, Trash2, Edit2, Save, Check, ShieldCheck, Sparkles, Upload } from "lucide-react";
import api from "../services/api";
import adminService from "../services/adminService";

export default function AdminSamples() {
  const [samples, setSamples] = useState<any[]>([]);
  const [discoveryPrice, setDiscoveryPrice] = useState(2999);
  const [voucherCreditAmount, setVoucherCreditAmount] = useState(2999);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New sample form state
  const [newSampleId, setNewSampleId] = useState("");
  const [newSampleName, setNewSampleName] = useState("");
  const [newSampleImage, setNewSampleImage] = useState("/uploads/products/oud-maroki-hero.png");

  const loadSamplesData = async () => {
    try {
      setLoading(true);
      const res: any = await api.get("/settings");
      if (res) {
        setSamples(
          res.freeSamples?.length
            ? res.freeSamples
            : [
                { id: "sample-oud", name: "Oud Impérial Extrait (1ml)", image: "/uploads/products/oud-maroki-hero.png", isActive: true },
                { id: "sample-rose", name: "Rose Sultane Extrait (1ml)", image: "/uploads/products/taif-rose-hero.png", isActive: true },
                { id: "sample-musk", name: "Musk Céleste Extrait (1ml)", image: "/uploads/products/amber-supreme-hero.png", isActive: true },
                { id: "sample-ambre", name: "Ambre Noir Extrait (1ml)", image: "/uploads/products/oud-maroki-hero.png", isActive: true },
              ]
        );
      }
    } catch (err) {
      console.error("Error loading samples:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSamplesData();
  }, []);

  const handleAddSample = () => {
    if (!newSampleName) return;
    const generatedId =
      newSampleId.trim() ||
      `sample-${newSampleName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    setSamples([
      ...samples,
      {
        id: generatedId,
        name: newSampleName.trim(),
        image: newSampleImage,
        isActive: true,
      },
    ]);
    setNewSampleId("");
    setNewSampleName("");
  };

  const handleToggleSample = (idx: number) => {
    const next = [...samples];
    next[idx].isActive = !next[idx].isActive;
    setSamples(next);
  };

  const handleRemoveSample = (idx: number) => {
    setSamples(samples.filter((_, i) => i !== idx));
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      await api.put("/settings", {
        freeSamples: samples,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert("Failed to save samples: " + err?.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Complimentary Samples & Discovery Ritual</h1>
          <p className="text-xs text-slate-500 mt-1">
            Control the 1ml complimentary royal samples offered in bag checkout & Discovery Coffret voucher credits
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-purple-600/20 transition-all cursor-pointer"
          >
            {saveSuccess ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            <span>{saveSuccess ? "Saved Successfully!" : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* Discovery Coffret Rule Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sparkles className="h-4 w-4 text-purple-600" />
          <h3 className="text-sm font-bold text-slate-900">The Discovery Ritual (5 × 2ml Coffret) Rules</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Selling Price (INR ₹)</label>
            <input
              type="number"
              value={discoveryPrice}
              onChange={(e) => setDiscoveryPrice(Number(e.target.value))}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Instant Voucher Credit Back (₹)</label>
            <input
              type="number"
              value={voucherCreditAmount}
              onChange={(e) => setVoucherCreditAmount(Number(e.target.value))}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-purple-700"
            />
          </div>
        </div>
      </div>

      {/* Add New Sample Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100/90 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Add New Complimentary 1ml Royal Sample</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Sample Display Name *</label>
            <input
              type="text"
              value={newSampleName}
              onChange={(e) => setNewSampleName(e.target.value)}
              placeholder="e.g. Royal Taif Rose Extrait (1ml)"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Sample ID</label>
            <input
              type="text"
              value={newSampleId}
              onChange={(e) => setNewSampleId(e.target.value)}
              placeholder="sample-taif-rose"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleAddSample}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Sample</span>
          </button>
        </div>
      </div>

      {/* Active Samples List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {samples.map((s, idx) => (
          <div
            key={s.id || idx}
            className={`bg-white p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
              s.isActive ? "border-purple-200 shadow-xs" : "border-slate-100 opacity-60"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                  1ml
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{s.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">{s.id}</p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveSample(idx)}
                className="p-1 text-slate-400 hover:text-rose-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] font-medium text-slate-500">Checkout Selection</span>
              <button
                onClick={() => handleToggleSample(idx)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                  s.isActive
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {s.isActive ? "Active" : "Disabled"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
