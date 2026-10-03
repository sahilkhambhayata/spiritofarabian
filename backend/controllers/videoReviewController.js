const VideoReview = require("../models/videoreview");
const Product = require("../models/product");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Create a new Video Review Reel
// @route   POST /api/video-reviews
// @access  Private (Admin)
const createVideoReview = asyncHandler(async (req, res) => {
  const {
    title,
    videoUrl,
    posterImage,
    duration,
    creator,
    rating,
    badge,
    quote,
    taggedProduct,
    taggedVariantId,
    orderIndex,
    isFeatured,
    isActive,
  } = req.body;

  if (!title || !videoUrl || !posterImage || !quote || !taggedProduct) {
    throw new ApiError(400, "Please provide title, videoUrl, posterImage, quote, and taggedProduct.");
  }

  // Verify tagged product exists
  const productExists = await Product.findOne({ _id: taggedProduct, isDeleted: false });
  if (!productExists) {
    throw new ApiError(404, "Tagged product does not exist.");
  }

  const videoReview = await VideoReview.create({
    title: title.trim(),
    videoUrl: videoUrl.trim(),
    posterImage: posterImage.trim(),
    duration: duration ? duration.trim() : "0:45",
    creator: {
      name: creator?.name ? creator.name.trim() : "Patron of Arabia",
      handle: creator?.handle ? creator.handle.trim() : "@scent.collector",
      avatar: creator?.avatar || "",
      location: creator?.location ? creator.location.trim() : "Dubai, UAE",
    },
    rating: typeof rating === "number" ? Math.min(5, Math.max(1, rating)) : 5,
    badge: badge ? badge.trim() : "Verified Longevity",
    quote: quote.trim(),
    taggedProduct,
    taggedVariantId: taggedVariantId || null,
    orderIndex: typeof orderIndex === "number" ? orderIndex : 0,
    isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : true,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
  });

  return ApiResponse.created(res, videoReview, "Video review reel created successfully.");
});

// @desc    Get all active Video Reviews with Tagged Product info (Storefront)
// @route   GET /api/video-reviews
// @access  Public
const getAllVideoReviews = asyncHandler(async (req, res) => {
  const videoReviews = await VideoReview.find({
    isActive: true,
    isDeleted: false,
  })
    .populate({
      path: "taggedProduct",
      select: "name slug arabicName tagline price variants images notes rating isBestSeller badge",
    })
    .sort({ orderIndex: 1, createdAt: -1 });

  return ApiResponse.success(res, videoReviews, "Shoppable video reviews retrieved successfully.");
});

// @desc    Get Single Video Review by ID (Public)
// @route   GET /api/video-reviews/:id
// @access  Public
const getVideoReviewById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const videoReview = await VideoReview.findOne({ _id: id, isDeleted: false }).populate({
    path: "taggedProduct",
    select: "name slug arabicName tagline price variants images notes rating isBestSeller badge",
  });

  if (!videoReview || !videoReview.isActive) {
    throw new ApiError(404, "Video review reel not found.");
  }

  return ApiResponse.success(res, videoReview, "Video review details retrieved successfully.");
});

// @desc    Increment Video View Count (Engagement)
// @route   PATCH /api/video-reviews/:id/view
// @access  Public
const incrementViews = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const video = await VideoReview.findByIdAndUpdate(
    id,
    { $inc: { viewsCount: 1 } },
    { returnDocument: "after" }
  );

  if (!video || video.isDeleted) {
    throw new ApiError(404, "Video review not found.");
  }

  return ApiResponse.success(res, { viewsCount: video.viewsCount }, "View counted.");
});

// @desc    Like / Unlike Video Review (Engagement)
// @route   PATCH /api/video-reviews/:id/like
// @access  Public
const toggleLike = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'like' or 'unlike'

  const increment = action === "unlike" ? -1 : 1;

  const video = await VideoReview.findById(id);
  if (!video || video.isDeleted) {
    throw new ApiError(404, "Video review not found.");
  }

  video.likesCount = Math.max(0, video.likesCount + increment);
  await video.save();

  return ApiResponse.success(res, { likesCount: video.likesCount }, `Video ${action === "unlike" ? "unliked" : "liked"}.`);
});

// ================= ADMIN VIDEO MANAGEMENT =================

// @desc    Get All Video Reviews for Admin (Pagination & Filters)
// @route   GET /api/video-reviews/admin/all
// @access  Private (Admin)
const getAdminVideoReviews = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const { search, status, productId } = req.query;

  const query = { isDeleted: false };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { "creator.name": { $regex: search, $options: "i" } },
      { "creator.handle": { $regex: search, $options: "i" } },
      { quote: { $regex: search, $options: "i" } },
    ];
  }

  if (status === "active") query.isActive = true;
  if (status === "inactive") query.isActive = false;
  if (productId) query.taggedProduct = productId;

  const [videos, total] = await Promise.all([
    VideoReview.find(query)
      .populate("taggedProduct", "name slug images")
      .sort({ orderIndex: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    VideoReview.countDocuments(query),
  ]);

  return ApiResponse.success(
    res,
    {
      videos,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    },
    "Admin video reviews retrieved successfully."
  );
});

// @desc    Update Video Review
// @route   PUT /api/video-reviews/:id
// @access  Private (Admin)
const updateVideoReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const video = await VideoReview.findById(id);
  if (!video || video.isDeleted) {
    throw new ApiError(404, "Video review not found.");
  }

  if (req.body.taggedProduct) {
    const prod = await Product.findOne({ _id: req.body.taggedProduct, isDeleted: false });
    if (!prod) throw new ApiError(404, "Tagged product does not exist.");
  }

  const updatedVideo = await VideoReview.findByIdAndUpdate(
    id,
    { $set: req.body },
    { returnDocument: "after", runValidators: true }
  ).populate("taggedProduct", "name slug images");

  return ApiResponse.success(res, updatedVideo, "Video review updated successfully.");
});

// @desc    Toggle Video Status / Feature Flag
// @route   PATCH /api/video-reviews/:id/status
// @access  Private (Admin)
const toggleVideoStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { field } = req.body; // 'isActive' or 'isFeatured'

  const targetField = field === "isFeatured" ? "isFeatured" : "isActive";

  const video = await VideoReview.findById(id);
  if (!video || video.isDeleted) {
    throw new ApiError(404, "Video review not found.");
  }

  video[targetField] = !video[targetField];
  await video.save();

  return ApiResponse.success(
    res,
    { _id: video._id, [targetField]: video[targetField] },
    `Video review ${targetField} toggled to ${video[targetField]}.`
  );
});

// @desc    Soft Delete Video Review
// @route   DELETE /api/video-reviews/:id
// @access  Private (Admin)
const deleteVideoReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const video = await VideoReview.findById(id);
  if (!video || video.isDeleted) {
    throw new ApiError(404, "Video review not found.");
  }

  video.isDeleted = true;
  video.isActive = false;
  await video.save();

  return ApiResponse.success(res, null, "Video review deleted successfully.");
});

module.exports = {
  createVideoReview,
  getAllVideoReviews,
  getVideoReviewById,
  incrementViews,
  toggleLike,
  getAdminVideoReviews,
  updateVideoReview,
  toggleVideoStatus,
  deleteVideoReview,
};
