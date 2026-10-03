const mongoose = require("mongoose");

const conciergeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      trim: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email address"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    preferredScent: {
      type: String,
      trim: true,
      default: "Oud Impérial",
    },
    preferredDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "Private Fragrance Consultation",
        "Bespoke Custom Attar",
        "Bridal Scent Styling",
        "Corporate VIP Gifting",
      ],
      default: "Private Fragrance Consultation",
      index: true,
    },
    quizResponses: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "Scheduled", "Completed", "Cancelled"],
      default: "New",
      index: true,
    },
    adminNotes: {
      type: String,
      trim: true,
    },
    assignedMasterPerfumer: {
      type: String,
      default: "Senior Artisan Flaconist",
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

conciergeSchema.index({ status: 1, isDeleted: 1, createdAt: -1 });

module.exports = mongoose.model("Concierge", conciergeSchema);
