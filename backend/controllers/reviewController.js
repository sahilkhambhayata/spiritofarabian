const Review = require("../models/review");
const Product = require("../models/product");
const Order = require("../models/order");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

// Helper to recalculate and update product rating average and count
const updateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId, isApproved: true, isDeleted: false });
  const count = reviews.length;
  const average = count > 0 ? reviews.reduce((acc, item) => acc + item.rating, 0) / count : 5.0;

  await Product.findByIdAndUpdate(productId, {
    $set: {
      "rating.average": Math.round(average * 10) / 10,
      "rating.count": count,
    },
  });
};

// @desc    Get Reviews for a Product
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const reviews = await Review.find({
    product: productId,
    isApproved: true,
    isDeleted: false,
  })
    .sort({ createdAt: -1 })
    .populate("user", "name");

  return ApiResponse.success(res, reviews, "Product reviews retrieved successfully.");
});

// @desc    Submit a Review for a Product
// @route   POST /api/reviews
// @access  Public / Customer
const createReview = asyncHandler(async (req, res) => {
  const { productId, name, rating, title, comment, images } = req.body;

  if (!productId || !name || !rating || !comment) {
    throw new ApiError(400, "Please provide productId, name, rating (1-5), and comment.");
  }

  const product = await Product.findOne({ _id: productId, isDeleted: false });
  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  // Check if logged-in user has verified purchase
  let isVerified = false;
  if (req.user) {
    const purchased = await Order.findOne({
      user: req.user._id,
      "items.product": productId,
      paymentStatus: "Paid",
    });
    if (purchased) isVerified = true;
  }

  const review = await Review.create({
    product: productId,
    user: req.user ? req.user._id : undefined,
    name: name.trim(),
    rating: Number(rating),
    title: title ? title.trim() : "",
    comment: comment.trim(),
    images: images || [],
    isVerifiedPurchase: isVerified,
    isApproved: true,
  });

  // Recalculate average rating
  await updateProductRating(productId);

  return ApiResponse.created(res, review, "Review submitted successfully.");
});

// @desc    Get all reviews for Admin
// @route   GET /api/reviews/admin/all
// @access  Private (Admin)
const getAdminReviews = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({ isDeleted: false })
      .populate("product", "name slug images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ isDeleted: false }),
  ]);

  return ApiResponse.success(
    res,
    {
      reviews,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    },
    "Admin reviews retrieved successfully."
  );
});

// @desc    Delete Review (Admin Soft Delete)
// @route   DELETE /api/reviews/:id
// @access  Private (Admin)
const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await Review.findById(id);
  if (!review || review.isDeleted) {
    throw new ApiError(404, "Review not found.");
  }

  review.isDeleted = true;
  await review.save();

  // Recalculate rating
  await updateProductRating(review.product);

  return ApiResponse.success(res, null, "Review deleted successfully.");
});

module.exports = {
  getProductReviews,
  createReview,
  getAdminReviews,
  deleteReview,
};
