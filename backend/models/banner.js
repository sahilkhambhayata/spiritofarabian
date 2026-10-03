const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    badge: {
      type: String,
      trim: true,
    }, // e.g. "Limited Reserve", "Royal Launch"
    desktopImage: {
      type: String,
      required: true,
      trim: true,
    },
    mobileImage: {
      type: String,
      trim: true,
    },
    ctaText: {
      type: String,
      default: "Explore Collection",
      trim: true,
    },
    ctaLink: {
      type: String,
      default: "/collection",
      trim: true,
    },
    position: {
      type: String,
      enum: ["hero_slider", "top_announcement", "middle_promo", "bottom_cta"],
      default: "hero_slider",
      index: true,
    },
    orderIndex: {
      type: Number,
      default: 0,
    },
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

bannerSchema.index({ isActive: 1, isDeleted: 1, position: 1, orderIndex: 1 });

module.exports = mongoose.model("Banner", bannerSchema);
