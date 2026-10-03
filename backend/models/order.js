const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  variantId: {
    type: mongoose.Schema.Types.Mixed,
  },
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
  },
  size: {
    type: String,
    required: true,
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
  },
  itemType: {
    type: String,
    enum: ["single", "single_attar", "combo", "gift_box", "discovery_set"],
    default: "single_attar",
  },
  // Snapshot of included items at checkout time (for combos & gift sets)
  comboItemsSnapshot: [
    {
      productName: { type: String },
      size: { type: String },
      quantity: { type: Number, default: 1 },
    },
  ],
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    }, // e.g. "SOA-94821"
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    customerDetails: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, default: "Maharashtra" },
      pincode: { type: String, required: true },
      country: { type: String, default: "India" },
    },

    // 🎀 Special Gifting & Personal Message Options
    giftOptions: {
      isGift: { type: Boolean, default: false },
      recipientName: { type: String },
      giftMessage: { type: String },
      includeRibbon: { type: Boolean, default: false },
    },

    items: [orderItemSchema],

    // Pricing & Totals
    subTotal: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    couponApplied: { type: String, default: "" },
    shippingFee: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },

    // Payment Details
    paymentMethod: {
      type: String,
      enum: ["COD", "RAZORPAY", "STRIPE", "UPI"],
      required: true,
      default: "COD",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    paymentTransactionId: { type: String },

    // Order Stages & Status
    orderStatus: {
      type: String,
      enum: [
        "Order Confirmed",
        "Distilling & Bottling",
        "Artisan Packaging",
        "Dispatched",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Order Confirmed",
      index: true,
    },

    // Live Tracking & History
    tracking: {
      carrier: { type: String, default: "BlueDart Express" },
      trackingNumber: { type: String, default: "" },
      trackingUrl: { type: String, default: "" },
      estimatedDelivery: { type: Date },
      history: [
        {
          status: { type: String, required: true },
          location: { type: String, default: "Dubai Atelier Vault" },
          timestamp: { type: Date, default: Date.now },
          note: { type: String, default: "" },
        },
      ],
    },

    cancelledReason: { type: String },
    cancelledAt: { type: Date },

    // Integrated Shipment Document Reference (Provider Agnostic)
    shipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shipment",
      index: true,
    },
    shippingTier: {
      type: String,
      enum: ["standard", "express", "royal_insured"],
      default: "standard",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
