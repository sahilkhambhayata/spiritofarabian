const express = require("express");
const router = express.Router();

const {
  createVideoReview,
  getAllVideoReviews,
  getVideoReviewById,
  incrementViews,
  toggleLike,
  getAdminVideoReviews,
  updateVideoReview,
  toggleVideoStatus,
  deleteVideoReview,
} = require("../controllers/videoReviewController");

const { protect, authorize } = require("../middleware/authMiddleware");

// ================= PUBLIC STOREFRONT ROUTES =================
router.get("/", getAllVideoReviews);
router.get("/:id", getVideoReviewById);
router.patch("/:id/view", incrementViews);
router.patch("/:id/like", toggleLike);

// ================= ADMIN MANAGEMENT ROUTES =================
router.post("/", protect, authorize("admin", "superadmin"), createVideoReview);
router.get("/admin/all", protect, authorize("admin", "superadmin"), getAdminVideoReviews);
router.put("/:id", protect, authorize("admin", "superadmin"), updateVideoReview);
router.patch("/:id/status", protect, authorize("admin", "superadmin"), toggleVideoStatus);
router.delete("/:id", protect, authorize("admin", "superadmin"), deleteVideoReview);

module.exports = router;
