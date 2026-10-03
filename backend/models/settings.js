const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    category: { type: String, default: "General", trim: true },
    orderIndex: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);

const freeSampleSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, default: "/uploads/products/oud-maroki-hero.png" },
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);

const quizOptionSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    description: { type: String, default: "" },
    tag: { type: String, default: "" },
    productId: { type: String, default: "oud-imperial" },
  },
  { _id: true }
);

const quizQuestionSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    question: { type: String, required: true },
    subtitle: { type: String, default: "" },
    options: [quizOptionSchema],
  },
  { _id: true }
);

const heritageTimelineSchema = new mongoose.Schema(
  {
    year: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { _id: true }
);

const boutiqueSchema = new mongoose.Schema(
  {
    city: { type: String, required: true },
    address: { type: String, required: true },
    hours: { type: String, default: "10:00 AM – 9:00 PM" },
    phone: { type: String, default: "" },
  },
  { _id: true }
);

const socialPlatformSchema = new mongoose.Schema(
  {
    url: { type: String, default: "", trim: true },
    enabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const smtpSchema = new mongoose.Schema(
  {
    host: { type: String, default: "", trim: true },
    port: { type: Number, default: 587 },
    username: { type: String, default: "", trim: true },
    password: { type: String, default: "", trim: true }, // stored securely
    encryption: { type: String, enum: ["None", "TLS", "SSL"], default: "TLS" },
    fromEmail: { type: String, default: "", trim: true },
    fromName: { type: String, default: "SPIRIT OF ARABIAN — Maison d'Attar", trim: true },
    isEnabled: { type: Boolean, default: false },
  },
  { _id: false }
);

const abandonedCartSettingsSchema = new mongoose.Schema(
  {
    isEnabled: { type: Boolean, default: true },
    firstReminderDelayHours: { type: Number, default: 1 },
    secondReminderDelayHours: { type: Number, default: 24 },
    maxReminders: { type: Number, default: 2 },
    minCartValue: { type: Number, default: 0 },
    discountCode: { type: String, default: "ROYALRESERVE10", trim: true },
    discountPercent: { type: Number, default: 10 },
    emailSubject: { type: String, default: "Your Artisanal Reserve is Waiting at the Atelier", trim: true },
  },
  { _id: false }
);

const siteSettingSchema = new mongoose.Schema(
  {
    announcementBarText: {
      type: String,
      default: "Complimentary Worldwide Express Shipping on Orders Above ₹12,000 | 2 Free Royal Samples with every order",
      trim: true,
    },
    freeShippingThreshold: {
      type: Number,
      default: 12000,
    },
    freeShippingThresholdUSD: {
      type: Number,
      default: 150,
    },
    standardShippingFee: {
      type: Number,
      default: 150,
    },
    supportEmail: {
      type: String,
      default: "concierge@spiritofarabian.com",
      trim: true,
    },
    supportPhone: {
      type: String,
      default: "+971 4 800 2882",
      trim: true,
    },
    boutiqueAddress: {
      type: String,
      default: "Alserkal Avenue, Unit 42, Al Quoz 1, Dubai, UAE",
      trim: true,
    },

    // 1. Social Media Management
    socialMedia: {
      instagram: {
        type: socialPlatformSchema,
        default: () => ({ url: "https://instagram.com/spiritofarabian", enabled: true }),
      },
      facebook: {
        type: socialPlatformSchema,
        default: () => ({ url: "https://facebook.com/spiritofarabian", enabled: true }),
      },
      youtube: {
        type: socialPlatformSchema,
        default: () => ({ url: "https://youtube.com/spiritofarabian", enabled: true }),
      },
      twitter: {
        type: socialPlatformSchema,
        default: () => ({ url: "https://x.com/spiritofarabian", enabled: true }),
      },
    },

    // Legacy backward-compatibility mapping
    socialLinks: {
      instagram: { type: String, default: "https://instagram.com/spiritofarabian" },
      facebook: { type: String, default: "https://facebook.com/spiritofarabian" },
      youtube: { type: String, default: "https://youtube.com/spiritofarabian" },
      whatsapp: { type: String, default: "+971501234567" },
    },

    // 2. SMTP Configuration
    smtp: {
      type: smtpSchema,
      default: () => ({
        host: process.env.SMTP_HOST || "",
        port: Number(process.env.SMTP_PORT) || 587,
        username: process.env.SMTP_USER || "",
        password: process.env.SMTP_PASS || "",
        encryption: process.env.SMTP_SECURE === "true" ? "SSL" : "TLS",
        fromEmail: process.env.SMTP_FROM || "concierge@spiritofarabian.com",
        fromName: "SPIRIT OF ARABIAN — Maison d'Attar",
        isEnabled: Boolean(process.env.SMTP_HOST),
      }),
    },

    // 3. Abandoned Cart Configuration
    abandonedCartSettings: {
      type: abandonedCartSettingsSchema,
      default: () => ({
        isEnabled: true,
        firstReminderDelayHours: 1,
        secondReminderDelayHours: 24,
        maxReminders: 2,
        minCartValue: 0,
        discountCode: "ROYALRESERVE10",
        discountPercent: 10,
        emailSubject: "Your Artisanal Reserve is Waiting at the Atelier",
      }),
    },

    freeSamples: [freeSampleSchema],
    quizQuestions: [quizQuestionSchema],
    heritageTimeline: [heritageTimelineSchema],
    boutiques: [boutiqueSchema],
    pressMentions: [{ type: String }],
    brandPillars: [
      {
        number: { type: String, default: "28+" },
        label: { type: String, default: "Years of Mastery" },
        description: { type: String, default: "Preserving ancient copper alembic hydro-distillation." },
      },
    ],
    faqs: [faqSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("SiteSetting", siteSettingSchema);
