import React, { useEffect, useState } from "react";
import { Landmark, MapPin, Newspaper, Plus, Trash2, Edit2, Save, Check, Award } from "lucide-react";
import api from "../services/api";

export default function AdminHeritage() {
  const [activeSubTab, setActiveSubTab] = useState<"timeline" | "boutiques" | "press">("timeline");
  const [timeline, setTimeline] = useState<any[]>([]);
  const [boutiques, setBoutiques] = useState<any[]>([]);
  const [press, setPress] = useState<string[]>([]);
  const [brandPillars, setBrandPillars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Timeline Item
  const [newYear, setNewYear] = useState("2026");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // New Boutique
  const [newCity, setNewCity] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newHours, setNewHours] = useState("Mon – Sun: 10:00 AM – 9:00 PM");
  const [newPhone, setNewPhone] = useState("");

  // New Press
  const [newPressName, setNewPressName] = useState("");

  const loadHeritageData = async () => {
    try {
      setLoading(true);
      const res: any = await api.get("/settings");
      if (res) {
        setTimeline(
          res.heritageTimeline?.length
            ? res.heritageTimeline
            : [
                { year: "1998", title: "The First Copper Alembic", description: "Founded in Kannauj and Dubai with two antique copper deg-bapka stills, dedicated to preserving 1,000-year-old hydro-distillation techniques." },
                { year: "2008", title: "Taif Cooperative Alliance", description: "Established our exclusive grower partnership with mountain families in Al-Hada to secure pristine dawn-harvest Damask rose harvests." },
                { year: "2016", title: "The French Oak Maturation Vault", description: "Pioneered the multi-year barrel aging of CITES-certified wild agarwood in bespoke oak casks." },
                { year: "2024", title: "Global Maison Expansion", description: "Opening private consultation salons and delivery ateliers across Dubai, Rotterdam, and London." },
              ]
        );
        setBoutiques(
          res.boutiques?.length
            ? res.boutiques
            : [
                { city: "Dubai Flagship Atelier", address: "Alserkal Avenue, Unit 42, Al Quoz 1, Dubai, UAE", hours: "Mon – Sun: 10:00 AM – 9:00 PM", phone: "+971 4 829 1998" },
                { city: "Rotterdam Private Salon", address: "Westersingel 88, 3015 LC Rotterdam, Netherlands", hours: "Tue – Sat: 11:00 AM – 7:00 PM", phone: "+31 10 742 0988" },
                { city: "London Concierge Office", address: "24 Berkeley Square, Mayfair, London W1J 6HE, UK", hours: "Mon – Fri: 9:00 AM – 6:00 PM", phone: "+44 20 7946 0912" },
              ]
        );
        setPress(
          res.pressMentions?.length
            ? res.pressMentions
            : ["VOGUE", "GQ", "ESQUIRE", "HARPER'S BAZAAR", "ROBB REPORT", "ELLE LUXURY", "TATLER", "VANITY FAIR"]
        );
        setBrandPillars(
          res.brandPillars?.length
            ? res.brandPillars
            : [
                { number: "28+", label: "Years of Mastery", description: "Generational copper still distillation." },
                { number: "100%", label: "Pure Lipid Oil", description: "0% alcohol or synthetic carriers." },
                { number: "12", label: "Weeks Cold-Aged", description: "Resting in French oak casks." },
              ]
        );
      }
    } catch (err) {
      console.error("Error loading heritage settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHeritageData();
  }, []);

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      await api.put("/settings", {
        heritageTimeline: timeline,
        boutiques,
        pressMentions: press,
        brandPillars,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert("Failed to save heritage data: " + err?.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddTimelineItem = () => {
    if (!newYear || !newTitle) return;
    setTimeline([...timeline, { year: newYear, title: newTitle, description: newDesc }]);
    setNewTitle("");
    setNewDesc("");
  };

  const handleAddBoutique = () => {
    if (!newCity || !newAddress) return;
    setBoutiques([...boutiques, { city: newCity, address: newAddress, hours: newHours, phone: newPhone }]);
    setNewCity("");
    setNewAddress("");
    setNewPhone("");
  };

  const handleAddPress = () => {
    if (!newPressName) return;
    setPress([...press, newPressName.toUpperCase()]);
    setNewPressName("");
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Maison Heritage, Boutiques & Press</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage the brand story timeline, global salon locations, and prestigious press features
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-purple-600/20 transition-all cursor-pointer"
          >
            {saveSuccess ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            <span>{saveSuccess ? "Heritage Saved!" : "Save All Changes"}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 text-xs font-semibold text-slate-600">
        <button
          onClick={() => setActiveSubTab("timeline")}
          className={`px-3.5 py-2 rounded-xl transition-all ${
            activeSubTab === "timeline" ? "bg-purple-600 text-white shadow-xs" : "bg-white border border-slate-200"
          }`}
        >
          Heritage Timeline ({timeline.length})
        </button>
        <button
          onClick={() => setActiveSubTab("boutiques")}
          className={`px-3.5 py-2 rounded-xl transition-all ${
            activeSubTab === "boutiques" ? "bg-purple-600 text-white shadow-xs" : "bg-white border border-slate-200"
          }`}
        >
          Boutiques & Salons ({boutiques.length})
        </button>
        <button
          onClick={() => setActiveSubTab("press")}
          className={`px-3.5 py-2 rounded-xl transition-all ${
            activeSubTab === "press" ? "bg-purple-600 text-white shadow-xs" : "bg-white border border-slate-200"
          }`}
        >
          Press Mentions ({press.length})
        </button>
      </div>

      {/* ================= TIMELINE TAB ================= */}
      {activeSubTab === "timeline" && (
        <div className="space-y-6">
          {/* Add Timeline Item */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100/90 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Add Timeline Milestone</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Year *</label>
                <input
                  type="text"
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                  placeholder="e.g. 1998"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block font-semibold text-slate-700 mb-1">Milestone Title *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. The First Copper Alembic"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>
              <div className="sm:col-span-4">
                <label className="block font-semibold text-slate-700 mb-1">Description Narrative</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Historic significance and story..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleAddTimelineItem}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Milestone</span>
              </button>
            </div>
          </div>

          {/* List of Milestones */}
          <div className="space-y-3">
            {timeline.map((item, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100/90 shadow-xs flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <span className="font-mono font-bold text-lg text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl">
                    {item.year}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setTimeline(timeline.filter((_, i) => i !== idx))}
                  className="p-1.5 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= BOUTIQUES TAB ================= */}
      {activeSubTab === "boutiques" && (
        <div className="space-y-6">
          {/* Add Boutique */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100/90 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Add Boutique or Concierge Location</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">City / Atelier Title *</label>
                <input
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  placeholder="e.g. Dubai Flagship Atelier"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Telephone / Hotline</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+971 4 829 1998"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Full Physical Address *</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Alserkal Avenue, Unit 42, Al Quoz 1, Dubai, UAE"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Operating Hours</label>
                <input
                  type="text"
                  value={newHours}
                  onChange={(e) => setNewHours(e.target.value)}
                  placeholder="Mon – Sun: 10:00 AM – 9:00 PM"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleAddBoutique}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Boutique</span>
              </button>
            </div>
          </div>

          {/* List of Boutiques */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {boutiques.map((b, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100/90 shadow-xs flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{b.city}</span>
                    <button
                      onClick={() => setBoutiques(boutiques.filter((_, i) => i !== idx))}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">{b.address}</p>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">{b.hours}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 text-xs font-semibold text-purple-700">
                  {b.phone || "VIP Consultation"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= PRESS TAB ================= */}
      {activeSubTab === "press" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100/90 shadow-xs space-y-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={newPressName}
              onChange={(e) => setNewPressName(e.target.value)}
              placeholder="e.g. ROBB REPORT"
              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase"
            />
            <button
              onClick={handleAddPress}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold"
            >
              Add Press Feature
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            {press.map((pName, idx) => (
              <div
                key={idx}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 text-xs font-bold text-slate-800 tracking-wider"
              >
                <span>{pName}</span>
                <button
                  onClick={() => setPress(press.filter((_, i) => i !== idx))}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
