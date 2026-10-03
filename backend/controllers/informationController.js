const Information = require("../models/information");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Get all active Policies / Information Pages (Public)
// @route   GET /api/information
// @access  Public
const getAllPolicies = asyncHandler(async (req, res) => {
  const policies = await Information.find({
    isActive: true,
    isDeleted: false,
  }).sort({ createdAt: 1 });

  return ApiResponse.success(res, policies, "Policies retrieved successfully.");
});

// @desc    Get Policy by Type or Path (Public)
// @route   GET /api/information/:identifier
// @access  Public
const getPolicyByIdentifier = asyncHandler(async (req, res) => {
  const { identifier } = req.params;
  const cleanId = identifier.trim().toLowerCase();

  // Match either policy_type (e.g. 'shipping') or path (e.g. 'shipping-policy' or '/shipping-policy')
  const pathVariant = cleanId.startsWith("/") ? cleanId : `/${cleanId}`;

  const policy = await Information.findOne({
    $or: [
      { policy_type: cleanId },
      { path: cleanId },
      { path: pathVariant },
    ],
    isActive: true,
    isDeleted: false,
  });

  if (!policy) {
    throw new ApiError(404, `Policy '${identifier}' not found.`);
  }

  return ApiResponse.success(res, policy, "Policy details retrieved successfully.");
});

// @desc    Create or Update Policy Page (Admin)
// @route   POST /api/information
// @access  Private (Admin)
const upsertPolicy = asyncHandler(async (req, res) => {
  const { policy_type, title, path, subtitle, sections, highlights, isActive } = req.body;

  if (!policy_type || !title || !path) {
    throw new ApiError(400, "Please provide policy_type, title, and path.");
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  const policy = await Information.findOneAndUpdate(
    { policy_type, isDeleted: false },
    {
      $set: {
        policy_type,
        title: title.trim(),
        path: cleanPath.trim(),
        subtitle: subtitle ? subtitle.trim() : "",
        sections: sections || [],
        highlights: highlights || [],
        lastUpdated: new Date(),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    },
    { returnDocument: "after", upsert: true, runValidators: true }
  );

  return ApiResponse.success(res, policy, `Policy '${policy_type}' saved successfully.`);
});

// @desc    Delete Policy (Admin Soft Delete)
// @route   DELETE /api/information/:id
// @access  Private (Admin)
const deletePolicy = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const policy = await Information.findById(id);
  if (!policy || policy.isDeleted) {
    throw new ApiError(404, "Policy not found.");
  }

  policy.isDeleted = true;
  policy.isActive = false;
  await policy.save();

  return ApiResponse.success(res, null, "Policy deleted successfully.");
});

module.exports = {
  getAllPolicies,
  getPolicyByIdentifier,
  upsertPolicy,
  deletePolicy,
};
