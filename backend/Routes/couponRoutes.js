const express = require("express");
const router = express.Router();

const {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/couponController");

const { protect, authorize } = require("../middleware/authMiddleware");

// Public Validation
router.post("/validate", validateCoupon);

// Admin Management
router.get("/admin/all", protect, authorize("admin", "superadmin"), getAllCoupons);
router.post("/", protect, authorize("admin", "superadmin"), createCoupon);
router.put("/:id", protect, authorize("admin", "superadmin"), updateCoupon);
router.delete("/:id", protect, authorize("admin", "superadmin"), deleteCoupon);

module.exports = router;
