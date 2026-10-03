import React, { useEffect, useState } from "react";
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Eye,
  Edit3,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  User,
  ShoppingBag,
  CreditCard,
  ShoppingCart,
  Bell,
  Sliders,
  ExternalLink,
  X,
  Plus,
} from "lucide-react";
import adminService from "../services/adminService";

export default function AdminEmailTemplates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Live Test Email State
  const [testEmailRecipient, setTestEmailRecipient] = useState("concierge@spiritofarabian.com");
  const [sendingTest, setSendingTest] = useState(false);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const res: any = await adminService.getEmailTemplates();
      setTemplates(Array.isArray(res) ? res : res?.data || []);
    } catch (err: any) {
      console.error("Failed loading email templates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleToggleEnable = async (template: any, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updatedStatus = !template.isEnabled;
      await adminService.updateEmailTemplate(template.templateKey, {
        isEnabled: updatedStatus,
      });
      setTemplates((prev) =>
        prev.map((t) => (t.templateKey === template.templateKey ? { ...t, isEnabled: updatedStatus } : t))
      );
      if (editingTemplate && editingTemplate.templateKey === template.templateKey) {
        setEditingTemplate({ ...editingTemplate, isEnabled: updatedStatus });
      }
      setActionMessage({
        type: "success",
        text: `Template '${template.name}' ${updatedStatus ? "activated" : "disabled"} successfully.`,
      });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      alert("Status update failed: " + err?.message);
    }
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    try {
      setSaving(true);
      await adminService.updateEmailTemplate(editingTemplate.templateKey, editingTemplate);
      setActionMessage({
        type: "success",
        text: `Email template '${editingTemplate.name}' saved and synced with live dispatcher!`,
      });
      setTimeout(() => setActionMessage(null), 3500);
      await loadTemplates();
      setEditingTemplate(null);
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: err?.response?.data?.message || err?.message || "Failed to update email template.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!editingTemplate || !testEmailRecipient) return;

    try {
      setSendingTest(true);
      const res: any = await adminService.testEmailTemplate(editingTemplate.templateKey, {
        targetEmail: testEmailRecipient,
        customConfig: editingTemplate,
      });
      setActionMessage({
        type: "success",
        text: res?.message || `Test verification email dispatched to ${testEmailRecipient}!`,
      });
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: err?.response?.data?.message || err?.message || "Test email delivery failed.",
      });
    } finally {
      setSendingTest(false);
    }
  };

  const handleResetToDefault = async (key: string) => {
    if (!window.confirm("Reset this email template to factory default master copy?")) return;
    try {
      setSaving(true);
      await adminService.resetEmailTemplates(key);
      setActionMessage({
        type: "success",
        text: `Template has been restored to master atelier defaults.`,
      });
      setTimeout(() => setActionMessage(null), 3000);
      await loadTemplates();
      const updated = await adminService.getEmailTemplate(key);
      if (updated) setEditingTemplate(updated);
    } catch (err: any) {
      alert("Reset failed: " + err?.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyTag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 1800);
  };

  const filteredTemplates = templates.filter((t) => {
    const matchesCat =
      activeCategory === "all" ||
      t.category?.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch =
      !search ||
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.subject?.toLowerCase().includes(search.toLowerCase()) ||
      t.templateKey?.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Authentication":
        return <ShieldCheck className="h-4 w-4 text-emerald-600" />;
      case "Orders & Shipping":
        return <ShoppingBag className="h-4 w-4 text-purple-600" />;
      case "Payments":
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      case "Abandoned Cart & Recovery":
        return <ShoppingCart className="h-4 w-4 text-amber-600" />;
      case "Admin Alerts":
        return <Bell className="h-4 w-4 text-rose-600" />;
      default:
        return <Mail className="h-4 w-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Mail className="h-6 w-6 text-purple-600" />
            Email Studio & Template Customizer
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Customize subjects, message bodies, action buttons, and control recipient triggers for all automated boutique emails.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleResetToDefault("")}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset All to Master Defaults"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset All Defaults</span>
          </button>

          <button
            onClick={loadTemplates}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-purple-600" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Global Action Message */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-3 animate-fadeIn ${
            actionMessage.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-rose-50 border border-rose-200 text-rose-800"
          }`}
        >
          {actionMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Templates" },
            { id: "Authentication", label: "Authentication" },
            { id: "Orders & Shipping", label: "Orders & Shipping" },
            { id: "Payments", label: "Payments" },
            { id: "Abandoned Cart & Recovery", label: "Cart Recovery" },
            { id: "Admin Alerts", label: "Admin Alerts" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search email templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-purple-500/20 outline-none"
          />
        </div>
      </div>

      {/* Template Cards Grid */}
      {loading ? (
        <div className="bg-white p-16 rounded-2xl border border-slate-200 text-center text-slate-400">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-purple-600 mb-3" />
          <p className="font-semibold text-slate-700">Loading Atelier Email Templates...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
          <Mail className="h-8 w-8 mx-auto text-slate-300 mb-2" />
          <p className="font-semibold text-slate-700">No templates found matching your criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((t) => (
            <div
              key={t.templateKey}
              onClick={() => setEditingTemplate(t)}
              className={`bg-white rounded-2xl border p-5 transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between group ${
                t.isEnabled ? "border-slate-200/80 hover:border-purple-300" : "border-slate-200 bg-slate-50/60 opacity-75"
              }`}
            >
              <div className="space-y-3">
                {/* Card Top */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-purple-50 transition-colors">
                      {getCategoryIcon(t.category)}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {t.category}
                      </span>
                    </div>
                  </div>

                  {/* Enable Switch */}
                  <label
                    onClick={(e) => e.stopPropagation()}
                    className="relative inline-flex items-center cursor-pointer"
                    title={t.isEnabled ? "Email Active" : "Email Disabled"}
                  >
                    <input
                      type="checkbox"
                      checked={t.isEnabled}
                      onChange={(e) => handleToggleEnable(t, e as any)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                    {t.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {t.description || "Automated transactional email template."}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/90 text-xs">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Subject Line</p>
                  <p className="text-slate-800 font-medium truncate mt-0.5">{t.subject}</p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 font-semibold text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  <User className="h-3 w-3" />
                  {t.recipient || "Customer"}
                </span>

                <button className="text-purple-600 font-bold text-xs flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Customize</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Template Studio / Editor Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-700">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{editingTemplate.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">Key: {editingTemplate.templateKey}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleResetToDefault(editingTemplate.templateKey)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl font-medium flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Default</span>
                </button>

                <button
                  onClick={() => setEditingTemplate(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer text-lg leading-none"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Modal Body - 2 Columns (Editor vs Live Preview) */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
              {/* Left Column: Form Editor */}
              <form onSubmit={handleSaveTemplate} className="lg:col-span-7 p-6 space-y-5">
                {/* Status Toggle & Recipient Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Email Status</p>
                      <p className="text-[10px] text-slate-500">Enable or disable delivery</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingTemplate.isEnabled}
                        onChange={(e) =>
                          setEditingTemplate({
                            ...editingTemplate,
                            isEnabled: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">Recipient Channel</label>
                    <select
                      value={editingTemplate.recipient || "Customer"}
                      onChange={(e) =>
                        setEditingTemplate({
                          ...editingTemplate,
                          recipient: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500/20 outline-none"
                    >
                      <option value="Customer">Customer Patron</option>
                      <option value="Admin Concierge">Admin Concierge</option>
                      <option value="Both">Both (Customer & Admin)</option>
                    </select>
                  </div>
                </div>

                {/* Subject Line */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Email Subject Line <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingTemplate.subject || ""}
                    onChange={(e) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        subject: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-purple-500/20 outline-none"
                  />
                </div>

                {/* Email Gold Heading */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Inner Gold Heading</label>
                  <input
                    type="text"
                    placeholder="e.g. Your Order is Confirmed"
                    value={editingTemplate.heading || ""}
                    onChange={(e) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        heading: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-purple-500/20 outline-none"
                  />
                </div>

                {/* Email Body / HTML */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800">
                      Message Body (HTML / Text) <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Supports standard HTML & Merge Tags</span>
                  </div>
                  <textarea
                    rows={6}
                    required
                    value={editingTemplate.body || ""}
                    onChange={(e) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        body: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:ring-2 focus:ring-purple-500/20 outline-none leading-relaxed"
                  />
                </div>

                {/* Action CTA Button */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">CTA Button Text</label>
                    <input
                      type="text"
                      placeholder="e.g. Track Your Order"
                      value={editingTemplate.buttonText || ""}
                      onChange={(e) =>
                        setEditingTemplate({
                          ...editingTemplate,
                          buttonText: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-purple-500/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">CTA Button URL</label>
                    <input
                      type="text"
                      placeholder="e.g. {{trackOrderUrl}} or {{frontendUrl}}/cart"
                      value={editingTemplate.buttonUrl || ""}
                      onChange={(e) =>
                        setEditingTemplate({
                          ...editingTemplate,
                          buttonUrl: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:ring-2 focus:ring-purple-500/20 outline-none"
                    />
                  </div>
                </div>

                {/* Available Dynamic Placeholders / Merge Tags */}
                {editingTemplate.availablePlaceholders && editingTemplate.availablePlaceholders.length > 0 && (
                  <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                    <p className="text-[11px] font-bold text-purple-900 uppercase tracking-wider mb-2">
                      Available Dynamic Variables (Click to copy)
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {editingTemplate.availablePlaceholders.map((ph: any, idx: number) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleCopyTag(ph.tag)}
                          className="px-2.5 py-1 bg-white hover:bg-purple-100 text-purple-700 font-mono text-[11px] font-bold rounded-lg border border-purple-200 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                          title={ph.description}
                        >
                          <span>{ph.tag}</span>
                          {copiedTag === ph.tag ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-2.5 w-2.5 text-purple-400" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Test Email Dispatch Section */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="email"
                    placeholder="Enter email to test dispatch..."
                    value={testEmailRecipient}
                    onChange={(e) => setTestEmailRecipient(e.target.value)}
                    className="w-full sm:flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-purple-500/20 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSendTest}
                    disabled={sendingTest || !testEmailRecipient}
                    className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {sendingTest ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5 text-purple-600" />}
                    <span>{sendingTest ? "Sending..." : "Send Test to Inbox"}</span>
                  </button>
                </div>
              </form>

              {/* Right Column: Live Luxury Atelier Preview Frame */}
              <div className="lg:col-span-5 p-6 bg-[#040c09] text-cream flex flex-col justify-between overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gold/20 pb-3">
                    <span className="text-[10px] font-bold tracking-[0.2em] text-gold uppercase">
                      Live Atelier Preview
                    </span>
                    <span className="text-[10px] text-sand/60">Responsive HTML</span>
                  </div>

                  {/* Mock Luxury Container */}
                  <div className="rounded-2xl border border-gold/30 bg-gradient-to-b from-[#0b241c] to-[#061410] p-6 shadow-2xl space-y-5">
                    {/* Header */}
                    <div className="text-center border-b border-gold/20 pb-4">
                      <div className="brand-gold-title text-sm font-bold tracking-[0.25em] text-gold uppercase">
                        SPIRIT OF ARABIAN
                      </div>
                      <div className="text-[7.5px] font-bold tracking-[0.4em] text-sand/70 uppercase mt-0.5">
                        MAISON D'ATTAR · HAUTE PARFUMERIE
                      </div>
                    </div>

                    {/* Content Preview */}
                    <div className="space-y-3 text-xs leading-relaxed text-[#e5dec9]">
                      {editingTemplate.heading && (
                        <h2 className="text-base font-bold text-[#f3e5ab] leading-snug">
                          {editingTemplate.heading.replace("{{customerName}}", "Alexandre Vance")}
                        </h2>
                      )}

                      <div
                        className="space-y-2 text-[12px] opacity-90"
                        dangerouslySetInnerHTML={{
                          __html: editingTemplate.body
                            ?.replace("{{customerName}}", "Alexandre Vance")
                            ?.replace("{{orderNumber}}", "SOA-84912")
                            ?.replace("{{totalAmount}}", "₹4,200")
                            ?.replace("{{discountCode}}", "ROYALRESERVE10")
                            ?.replace("{{discountPercent}}", "10")
                            ?.replace("{{otpCode}}", "849201") || "",
                        }}
                      />

                      {editingTemplate.buttonText && (
                        <div className="text-center pt-3">
                          <span className="inline-block bg-gradient-to-r from-[#d4af37] to-[#aa820a] text-[#06100c] text-[11px] font-extrabold uppercase tracking-wider px-5 py-2.5 rounded-full shadow-md">
                            {editingTemplate.buttonText.replace("{{discountPercent}}", "10")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="text-center border-t border-gold/15 pt-4 text-[9.5px] text-sand/50 leading-relaxed">
                      <p>Confidential communication from the private atelier of Spirit of Arabian.</p>
                      <p className="text-gold/80 mt-0.5">Dubai · London · Mumbai</p>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-4 text-[10px] text-sand/40">
                  Changes render in real-time as you type in the editor
                </div>
              </div>
            </div>

            {/* Modal Footer Save Bar */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <button
                type="button"
                onClick={() => setEditingTemplate(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveTemplate}
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                <span>{saving ? "Saving Template..." : "Save Template Changes"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
