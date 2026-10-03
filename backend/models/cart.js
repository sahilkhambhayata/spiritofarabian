const mongoose = require("mongoose");
const crypto = require("crypto");

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    productId: {
      type: String,
      default: function () {
        return this.slug || (this.product ? this.product.toString() : "item_" + Math.random().toString(36).substring(2, 9));
      },
    },
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      default: "",
    },
    size: {
      type: String,
      default: "6ml",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    image: {
      type: String,
      default: "/uploads/products/oud-maroki-hero.png",
    },
  },
  { _id: true }
);

const reminderLogSchema = new mongoose.Schema(
  {
    sentAt: { type: Date, default: Date.now },
    reminderNumber: { type: Number, required: true },
    email: { type: String, required: true },
    subject: { type: String },
    status: { type: String, enum: ["delivered", "failed"], default: "delivered" },
    error: { type: String },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    recoveryToken: {
      type: String,
      unique: true,
      index: true,
      default: () => crypto.randomBytes(24).toString("hex"),
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    customer: {
      name: { type: String, default: "", trim: true },
      email: { type: String, default: "", lowercase: true, trim: true, index: true },
      phone: { type: String, default: "", trim: true },
    },
    items: [cartItemSchema],
    subtotal: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "abandoned", "recovered", "completed", "cancelled"],
      default: "active",
      index: true,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    abandonedAt: {
      type: Date,
    },
    recoveredAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    convertedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    remindersSent: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastReminderSentAt: {
      type: Date,
    },
    reminderHistory: [reminderLogSchema],
    utmSource: { type: String, default: "" },
    utmMedium: { type: String, default: "" },
    utmCampaign: { type: String, default: "" },
  },
  { timestamps: true }
);

// Indexes for high performance queries
cartSchema.index({ status: 1, lastActivityAt: 1, remindersSent: 1 });
cartSchema.index({ "customer.email": 1, status: 1 });

module.exports = mongoose.model("Cart", cartSchema);
