const mongoose = require("mongoose");

const journalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    }, // Rich Markdown / HTML content
    coverImage: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      default: "Master Perfumer",
      trim: true,
    },
    category: {
      type: String,
      default: "Artisan Heritage",
      trim: true,
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    readTime: {
      type: String,
      default: "4 min read",
      trim: true,
    },
    isPublished: {
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

journalSchema.index({ isPublished: 1, isDeleted: 1, createdAt: -1 });

module.exports = mongoose.model("Journal", journalSchema);
