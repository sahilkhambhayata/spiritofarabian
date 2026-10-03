const mongoose = require("mongoose");

const videoReviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Video review title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    videoUrl: {
      type: String,
      required: [true, "Video URL is required"],
      trim: true,
    },
    posterImage: {
      type: String,
      required: [true, "Poster/Thumbnail image URL is required"],
      trim: true,
    },
    duration: {
      type: String,
      default: "0:45",
      trim: true,
    },

    // Creator / Customer Profile
    creator: {
      name: {
        type: String,
        required: [true, "Creator name is required"],
        trim: true,
      },
      handle: {
        type: String,
        trim: true,
        default: "@verified.patron",
      },
      avatar: {
        type: String,
        default: "",
      },
      location: {
        type: String,
        default: "Dubai, UAE",
        trim: true,
      },
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 5,
    },
    badge: {
      type: String,
      default: "14h Wear Verified",
      trim: true,
    },
    quote: {
      type: String,
      required: [true, "Review quote text is required"],
      trim: true,
    },

    // Tagged Product (powers live shop-from-video popup & add-to-cart)
    taggedProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Please tag a product to this video review"],
      index: true,
    },
    taggedVariantId: {
      type: mongoose.Schema.Types.Mixed,
    },

    viewsCount: {
      type: Number,
      default: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    orderIndex: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: true,
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

videoReviewSchema.index({ isActive: 1, isDeleted: 1, orderIndex: 1 });

module.exports = mongoose.model("VideoReview", videoReviewSchema);
