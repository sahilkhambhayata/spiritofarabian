const mongoose = require("mongoose");

const emailTemplateSchema = new mongoose.Schema(
  {
    templateKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "Authentication",
        "Orders & Shipping",
        "Payments",
        "Abandoned Cart & Recovery",
        "Admin Alerts",
        "Marketing",
      ],
      default: "Orders & Shipping",
      index: true,
    },
    recipient: {
      type: String,
      enum: ["Customer", "Admin Concierge", "Both"],
      default: "Customer",
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    heading: {
      type: String,
      default: "",
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    buttonText: {
      type: String,
      default: "",
      trim: true,
    },
    buttonUrl: {
      type: String,
      default: "",
      trim: true,
    },
    availablePlaceholders: [
      {
        tag: { type: String, required: true },
        description: { type: String, required: true },
        example: { type: String, default: "" },
      },
    ],
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmailTemplate", emailTemplateSchema);
