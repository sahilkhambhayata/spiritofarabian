const express = require("express");
const router = express.Router();

const {
  getProductReviews,
  createReview,
  getAdminReviews,
  deleteReview,
} = require("../controllers/reviewController");

const { protect, authorize } = require("../middleware/authMiddleware");

// Public routes
router.get("/product/:productId", getProductReviews);
router.post("/", (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    return protect(req, res, next);
  }
  next();
}, createReview);

// Admin routes
router.get("/admin/all", protect, authorize("admin", "superadmin"), getAdminReviews);
router.delete("/:id", protect, authorize("admin", "superadmin"), deleteReview);

module.exports = router;
