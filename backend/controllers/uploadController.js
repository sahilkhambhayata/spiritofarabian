const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Upload Single Image / Video
// @route   POST /api/upload/single
// @access  Public / Admin
const uploadSingle = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Please select an image or video file to upload.");
  }

  const relativePath = `/uploads/${req.file.filename}`;
  const fullUrl = `${req.protocol}://${req.get("host")}${relativePath}`;

  return ApiResponse.created(
    res,
    {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      path: relativePath,
      url: relativePath,
      fullUrl,
    },
    "Media uploaded successfully."
  );
});

// @desc    Upload Multiple Images / Media
// @route   POST /api/upload/multiple
// @access  Public / Admin
const uploadMultiple = asyncHandler(async (req, res) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw new ApiError(400, "Please select files to upload.");
  }

  const uploadedMedia = req.files.map((file) => {
    const relativePath = `/uploads/${file.filename}`;
    const fullUrl = `${req.protocol}://${req.get("host")}${relativePath}`;
    return {
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      path: relativePath,
      url: relativePath,
      fullUrl,
    };
  });

  return ApiResponse.created(
    res,
    uploadedMedia,
    `${uploadedMedia.length} files uploaded successfully.`
  );
});

module.exports = {
  uploadSingle,
  uploadMultiple,
};
