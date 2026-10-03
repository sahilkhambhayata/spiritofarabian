const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    }, // e.g. "TXN-SOA-2026-94821"

    gateway: {
      type: String,
      enum: ["RAZORPAY", "STRIPE", "COD", "UPI_MANUAL"],
      required: true,
      default: "RAZORPAY",
    },
    gatewayOrderId: { type: String }, // razorpay_order_id / stripe payment intent
    gatewayPaymentId: { type: String }, // razorpay_payment_id / stripe charge id
    gatewaySignature: { type: String }, // razorpay_signature

    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
    },
    gatewayFee: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["initiated", "pending", "successful", "failed", "refunded", "partially_refunded"],
      default: "initiated",
      index: true,
    },

    paymentMethodDetails: {
      method: { type: String, default: "upi" }, // 'card', 'upi', 'netbanking', 'wallet', 'cod'
      bank: { type: String },
      cardLast4: { type: String },
      upiVpa: { type: String },
    },

    refundDetails: {
      refundId: { type: String },
      refundAmount: { type: Number, default: 0 },
      refundReason: { type: String },
      refundedAt: { type: Date },
    },

    failureDetails: {
      code: { type: String },
      description: { type: String },
      failedAt: { type: Date },
    },

    gatewayResponse: { type: mongoose.Schema.Types.Mixed }, // Raw audit response from gateway
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
