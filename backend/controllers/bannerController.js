const Banner = require("../models/banner");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Get active banners (Public)
// @route   GET /api/banners
// @access  Public
const getActiveBanners = asyncHandler(async (req, res) => {
  const { position } = req.query;

  const query = { isActive: true, isDeleted: false };
  if (position) query.position = position;

  const banners = await Banner.find(query).sort({ orderIndex: 1, createdAt: -1 });

  return ApiResponse.success(res, banners, "Banners retrieved successfully.");
});

// @desc    Create Banner (Admin)
// @route   POST /api/banners
// @access  Private (Admin)
const createBanner = asyncHandler(async (req, res) => {
  const { title, subtitle, badge, desktopImage, mobileImage, ctaText, ctaLink, position, orderIndex, isActive } = req.body;

  if (!title || !desktopImage) {
    throw new ApiError(400, "Please provide banner title and desktop image URL.");
  }

  const banner = await Banner.create({
    title: title.trim(),
    subtitle: subtitle ? subtitle.trim() : "",
    badge: badge ? badge.trim() : "",
    desktopImage: desktopImage.trim(),
    mobileImage: mobileImage ? mobileImage.trim() : desktopImage.trim(),
    ctaText: ctaText ? ctaText.trim() : "Explore Collection",
    ctaLink: ctaLink ? ctaLink.trim() : "/collection",
    position: position || "hero_slider",
    orderIndex: typeof orderIndex === "number" ? orderIndex : 0,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
  });

  return ApiResponse.created(res, banner, "Banner created successfully.");
});

// @desc    Update Banner (Admin)
// @route   PUT /api/banners/:id
// @access  Private (Admin)
const updateBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const banner = await Banner.findByIdAndUpdate(
    id,
    { $set: req.body },
    { returnDocument: "after", runValidators: true }
  );

  if (!banner || banner.isDeleted) {
    throw new ApiError(404, "Banner not found.");
  }

  return ApiResponse.success(res, banner, "Banner updated successfully.");
});

// @desc    Delete Banner (Admin Soft Delete)
// @route   DELETE /api/banners/:id
// @access  Private (Admin)
const deleteBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const banner = await Banner.findById(id);
  if (!banner || banner.isDeleted) {
    throw new ApiError(404, "Banner not found.");
  }

  banner.isDeleted = true;
  banner.isActive = false;
  await banner.save();

  return ApiResponse.success(res, null, "Banner deleted successfully.");
});

module.exports = {
  getActiveBanners,
  createBanner,
  updateBanner,
  deleteBanner,
};
