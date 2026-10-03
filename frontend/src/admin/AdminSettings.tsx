import React, { useEffect, useState } from "react";
import {
  Settings,
  Save,
  Shield,
  Key,
  Truck,
  Globe,
  Check,
  Phone,
  Mail,
  Share2,
  Send,
  ShoppingCart,
  Clock,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import adminService from "../services/adminService";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Test Email Modal State
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState("");
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [settings, setSettings] = useState({
    storeName: "SPIRIT OF ARABIAN",
    tagline: "Haute Parfumerie & Pure Botanical Attars",
    supportEmail: "concierge@spiritofarabian.com",
    supportPhone: "+91 98765 43210",
    whatsappNumber: "+971501234567",
    instagramHandle: "spiritofarabian",
    freeShippingThresholdINR: 12000,
    freeShippingThresholdUSD: 150,
    domesticShippingFee: 150,
    internationalShippingFee: 1500,
    razorpayKeyId: "rzp_live_m7q8821948291",
    stripePublicKey: "pk_live_51P9...",
    shiprocketApiToken: "eyJhbGciOi...",
    dhlApiKey: "dhl_live_key_98214",

    // 1. Social Media Management
    socialMedia: {
      instagram: { url: "https://instagram.com/spiritofarabian", enabled: true },
      facebook: { url: "https://facebook.com/spiritofarabian", enabled: true },
      youtube: { url: "https://youtube.com/spiritofarabian", enabled: true },
      twitter: { url: "https://x.com/spiritofarabian", enabled: true },
    },

    // 2. SMTP Configuration
    smtp: {
      host: "smtp.mailgun.org",
      port: 587,
      username: "postmaster@spiritofarabian.com",
      password: "••••••••",
      encryption: "TLS",
      fromEmail: "concierge@spiritofarabian.com",
      fromName: "SPIRIT OF ARABIAN — Maison d'Attar",
      isEnabled: true,
      hasPassword: true,
    },

    // 3. Abandoned Cart Configuration
    abandonedCartSettings: {
      isEnabled: true,
      firstReminderDelayHours: 1,
      secondReminderDelayHours: 24,
      maxReminders: 2,
      minCartValue: 0,
      discountCode: "ROYALRESERVE10",
      discountPercent: 10,
      emailSubject: "Your Artisanal Reserve is Waiting at the Atelier",
    },
  });

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res: any = await adminService.getSettings();
      if (res) {
        setSettings((prev) => ({
          ...prev,
          ...res,
          socialMedia: {
            ...prev.socialMedia,
            ...(res.socialMedia || {}),
          },
          smtp: {
            ...prev.smtp,
            ...(res.smtp || {}),
          },
          abandonedCartSettings: {
            ...prev.abandonedCartSettings,
            ...(res.abandonedCartSettings || {}),
          },
        }));
        if (res.supportEmail) {
          setTestEmailRecipient(res.supportEmail);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await adminService.updateSettings(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
      loadSettings(); // Reload to refresh masked passwords & state
    } catch (err: any) {
      alert("Settings update failed: " + (err?.response?.data?.message || err?.message));
    } finally {
      setSaving(false);
    }
  };

  const handleTestSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailRecipient) return;

    try {
      setTestingSmtp(true);
      setTestResult(null);
      const res: any = await adminService.testSmtp({
        targetEmail: testEmailRecipient,
        smtpConfig: settings.smtp,
      });
      setTestResult({
        success: true,
        message: res?.message || `Verification email dispatched successfully to ${testEmailRecipient}!`,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.response?.data?.message || err?.message || "Failed to deliver test email.",
      });
    } finally {
      setTestingSmtp(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Settings className="h-6 w-6 text-purple-600" />
            Global Atelier Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure social media channels, secure SMTP dispatch pipeline, abandoned cart recovery, and logistics APIs.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : savedSuccess ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          <span>{saving ? "Saving Changes..." : savedSuccess ? "Settings Saved!" : "Save All Settings"}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3 animate-fadeIn">
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Atelier configuration and security parameters updated successfully across the live environment.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Social Media Management */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Share2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Social Media Channels</h3>
                <p className="text-[11px] text-slate-500">Enable/disable platforms and configure official boutique profile URLs</p>
              </div>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
              Frontend Footer Sync Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Instagram */}
            <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                  <span className="text-xs font-bold text-slate-900">Instagram</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.socialMedia?.instagram?.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        socialMedia: {
                          ...settings.socialMedia,
                          instagram: {
                            ...settings.socialMedia?.instagram,
                            enabled: e.target.checked,
                          },
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-600"></div>
                </label>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Profile URL</label>
                <input
                  type="url"
                  placeholder="https://instagram.com/spiritofarabian"
                  value={settings.socialMedia?.instagram?.url || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialMedia: {
                        ...settings.socialMedia,
                        instagram: {
                          ...settings.socialMedia?.instagram,
                          url: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                />
              </div>
            </div>

            {/* Facebook */}
            <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  <span className="text-xs font-bold text-slate-900">Facebook</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.socialMedia?.facebook?.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        socialMedia: {
                          ...settings.socialMedia,
                          facebook: {
                            ...settings.socialMedia?.facebook,
                            enabled: e.target.checked,
                          },
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Page URL</label>
                <input
                  type="url"
                  placeholder="https://facebook.com/spiritofarabian"
                  value={settings.socialMedia?.facebook?.url || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialMedia: {
                        ...settings.socialMedia,
                        facebook: {
                          ...settings.socialMedia?.facebook,
                          url: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                />
              </div>
            </div>

            {/* YouTube */}
            <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                  <span className="text-xs font-bold text-slate-900">YouTube</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.socialMedia?.youtube?.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        socialMedia: {
                          ...settings.socialMedia,
                          youtube: {
                            ...settings.socialMedia?.youtube,
                            enabled: e.target.checked,
                          },
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Channel URL</label>
                <input
                  type="url"
                  placeholder="https://youtube.com/@spiritofarabian"
                  value={settings.socialMedia?.youtube?.url || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialMedia: {
                        ...settings.socialMedia,
                        youtube: {
                          ...settings.socialMedia?.youtube,
                          url: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                />
              </div>
            </div>

            {/* X / Twitter */}
            <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>
                  <span className="text-xs font-bold text-slate-900">X (formerly Twitter)</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.socialMedia?.twitter?.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        socialMedia: {
                          ...settings.socialMedia,
                          twitter: {
                            ...settings.socialMedia?.twitter,
                            enabled: e.target.checked,
                          },
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
                </label>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Handle / Profile URL</label>
                <input
                  type="url"
                  placeholder="https://x.com/spiritofarabian"
                  value={settings.socialMedia?.twitter?.url || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialMedia: {
                        ...settings.socialMedia,
                        twitter: {
                          ...settings.socialMedia?.twitter,
                          url: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: SMTP Configuration & Verification */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">SMTP Server & Transactional Email Dispatch</h3>
                <p className="text-[11px] text-slate-500">
                  Credentials are encrypted securely. Passwords are never revealed in API responses.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setTestModalOpen(true);
                  setTestResult(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="h-3.5 w-3.5 text-purple-600" />
                <span>Test Email Dispatch</span>
              </button>

              <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  checked={settings.smtp?.isEnabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      smtp: { ...settings.smtp, isEnabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-xs font-bold text-slate-800">
                  {settings.smtp?.isEnabled ? "Email Service Active" : "Disabled"}
                </span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">SMTP Host</label>
              <input
                type="text"
                placeholder="smtp.mailgun.org / smtp.sendgrid.net"
                value={settings.smtp?.host || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    smtp: { ...settings.smtp, host: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:ring-2 focus:ring-purple-500/20 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">SMTP Port</label>
              <input
                type="number"
                placeholder="587 / 465 / 2525"
                value={settings.smtp?.port || 587}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    smtp: { ...settings.smtp, port: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:ring-2 focus:ring-purple-500/20 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Security / Encryption</label>
              <select
                value={settings.smtp?.encryption || "TLS"}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    smtp: { ...settings.smtp, encryption: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs focus:bg-white focus:ring-2 focus:ring-purple-500/20 outline-none"
              >
                <option value="TLS">STARTTLS / TLS (Port 587)</option>
                <option value="SSL">SSL / Direct TLS (Port 465)</option>
                <option value="NONE">None / Unencrypted (Local Dev)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">SMTP Username / API User</label>
              <input
                type="text"
                placeholder="apikey / postmaster@domain.com"
                value={settings.smtp?.username || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    smtp: { ...settings.smtp, username: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:ring-2 focus:ring-purple-500/20 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>SMTP Password / API Key</span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  <span>{showPassword ? "Hide" : "Reveal"}</span>
                </button>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password to update"
                value={settings.smtp?.password || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    smtp: { ...settings.smtp, password: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:ring-2 focus:ring-purple-500/20 outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Leave as <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">••••••••</code> to preserve existing password.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">From Sender Email</label>
              <input
                type="email"
                placeholder="concierge@spiritofarabian.com"
                value={settings.smtp?.fromEmail || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    smtp: { ...settings.smtp, fromEmail: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs focus:bg-white focus:ring-2 focus:ring-purple-500/20 outline-none"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block font-semibold text-slate-700 mb-1">Sender Display Name</label>
              <input
                type="text"
                placeholder="SPIRIT OF ARABIAN — Maison d'Attar"
                value={settings.smtp?.fromName || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    smtp: { ...settings.smtp, fromName: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs focus:bg-white focus:ring-2 focus:ring-purple-500/20 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Abandoned Cart Recovery Automation */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <ShoppingCart className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Abandoned Cart Automation & Rules</h3>
                <p className="text-[11px] text-slate-500">Automated 15-minute background cron worker and recovery incentive rules</p>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                checked={settings.abandonedCartSettings?.isEnabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    abandonedCartSettings: {
                      ...settings.abandonedCartSettings,
                      isEnabled: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-xs font-bold text-slate-800">
                {settings.abandonedCartSettings?.isEnabled ? "Cron Worker Active" : "Automation Disabled"}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">1st Reminder Delay (Hours)</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={settings.abandonedCartSettings?.firstReminderDelayHours || 1}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    abandonedCartSettings: {
                      ...settings.abandonedCartSettings,
                      firstReminderDelayHours: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Triggered after cart inactivity</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">2nd Reminder Delay (Hours)</label>
              <input
                type="number"
                min="1"
                step="1"
                value={settings.abandonedCartSettings?.secondReminderDelayHours || 24}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    abandonedCartSettings: {
                      ...settings.abandonedCartSettings,
                      secondReminderDelayHours: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Optional final reminder</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Max Reminders per Cart</label>
              <select
                value={settings.abandonedCartSettings?.maxReminders || 2}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    abandonedCartSettings: {
                      ...settings.abandonedCartSettings,
                      maxReminders: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value={1}>1 Reminder Only</option>
                <option value={2}>2 Reminders (Recommended)</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">Caps follow-ups to prevent spam</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Minimum Cart Value (₹)</label>
              <input
                type="number"
                min="0"
                value={settings.abandonedCartSettings?.minCartValue || 0}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    abandonedCartSettings: {
                      ...settings.abandonedCartSettings,
                      minCartValue: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">0 for all carts</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Recovery Promo Coupon Code</label>
              <input
                type="text"
                placeholder="ROYALRESERVE10"
                value={settings.abandonedCartSettings?.discountCode || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    abandonedCartSettings: {
                      ...settings.abandonedCartSettings,
                      discountCode: e.target.value.toUpperCase(),
                    },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-xs uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Discount Savings (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.abandonedCartSettings?.discountPercent || 10}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    abandonedCartSettings: {
                      ...settings.abandonedCartSettings,
                      discountPercent: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Reminder Email Subject Line</label>
              <input
                type="text"
                placeholder="Your Artisanal Reserve is Waiting at the Atelier"
                value={settings.abandonedCartSettings?.emailSubject || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    abandonedCartSettings: {
                      ...settings.abandonedCartSettings,
                      emailSubject: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Brand & Contact Info */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Brand Identity & Support Desk</h3>
              <p className="text-[11px] text-slate-500">Official customer concierge channels</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Maison Name</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Support Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Support Phone</label>
              <input
                type="text"
                value={settings.supportPhone}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">VIP WhatsApp Number</label>
              <input
                type="text"
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Logistics & Free Shipping Rules */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Truck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Shipping Rates & Free Delivery Rules</h3>
              <p className="text-[11px] text-slate-500">Threshold calculations for national and international delivery</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Free Shipping (India ₹)</label>
              <input
                type="number"
                value={settings.freeShippingThresholdINR}
                onChange={(e) => setSettings({ ...settings, freeShippingThresholdINR: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Free Shipping (Global $)</label>
              <input
                type="number"
                value={settings.freeShippingThresholdUSD}
                onChange={(e) => setSettings({ ...settings, freeShippingThresholdUSD: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Domestic Standard Fee (₹)</label>
              <input
                type="number"
                value={settings.domesticShippingFee}
                onChange={(e) => setSettings({ ...settings, domesticShippingFee: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">International DHL Fee (₹)</label>
              <input
                type="number"
                value={settings.internationalShippingFee}
                onChange={(e) => setSettings({ ...settings, internationalShippingFee: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>
        </div>

        {/* Section 6: Payment & Logistics API Credentials */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Key className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Payment & Courier Gateway Secrets</h3>
              <p className="text-[11px] text-slate-500">Live API keys for automated checkout and label generation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Razorpay Key ID</label>
              <input
                type="text"
                value={settings.razorpayKeyId}
                onChange={(e) => setSettings({ ...settings, razorpayKeyId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Stripe Public Key</label>
              <input
                type="text"
                value={settings.stripePublicKey}
                onChange={(e) => setSettings({ ...settings, stripePublicKey: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Shiprocket API Auth Token</label>
              <input
                type="password"
                value={settings.shiprocketApiToken}
                onChange={(e) => setSettings({ ...settings, shiprocketApiToken: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">DHL Express API Key</label>
              <input
                type="password"
                value={settings.dhlApiKey}
                onChange={(e) => setSettings({ ...settings, dhlApiKey: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || loading}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/25 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : savedSuccess ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            <span>{saving ? "Saving All Settings..." : savedSuccess ? "Settings Successfully Saved!" : "Save Atelier Settings"}</span>
          </button>
        </div>
      </form>

      {/* Test SMTP Email Modal */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <Send className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Verify SMTP Configuration</h3>
              </div>
              <button
                onClick={() => setTestModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Send an authenticated test dispatch to verify that your SMTP host, port, username, and credentials establish a valid TLS/SSL handshake.
            </p>

            <form onSubmit={handleTestSmtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Recipient Test Email</label>
                <input
                  type="email"
                  required
                  placeholder="admin@example.com"
                  value={testEmailRecipient}
                  onChange={(e) => setTestEmailRecipient(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-purple-500/20 outline-none"
                />
              </div>

              {testResult && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                    testResult.success ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {testResult.success ? (
                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-relaxed">{testResult.message}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTestModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={testingSmtp || !testEmailRecipient}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {testingSmtp ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  <span>{testingSmtp ? "Dispatching..." : "Send Verification"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
