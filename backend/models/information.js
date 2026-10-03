const mongoose = require("mongoose");

const policySectionSchema = new mongoose.Schema(
  {
    heading: { type: String, required: true, trim: true },
    content: { type: String, required: true }, // HTML or Markdown formatted content
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const informationSchema = new mongoose.Schema(
  {
    policy_type: {
      type: String,
      enum: ["shipping", "return", "privacy", "terms", "refund", "custom"],
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    }, // e.g. "Shipping & Royal Delivery Policy"
    path: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    }, // e.g. "/shipping-policy", "/return-policy", "/privacy-policy", "/terms-of-service", "/refund-policy"
    subtitle: {
      type: String,
      trim: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    sections: [policySectionSchema],
    highlights: [
      {
        icon: { type: String, default: "ShieldCheck" }, // e.g. "Truck", "RotateCcw", "Lock", "FileText", "ShieldCheck"
        title: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Information", informationSchema);
