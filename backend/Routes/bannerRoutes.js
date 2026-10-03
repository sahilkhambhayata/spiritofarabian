const express = require("express");
const router = express.Router();

const {
  getActiveBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} = require("../controllers/bannerController");

const { protect, authorize } = require("../middleware/authMiddleware");

// Public
router.get("/", getActiveBanners);

// Admin
router.post("/", protect, authorize("admin", "superadmin"), createBanner);
router.put("/:id", protect, authorize("admin", "superadmin"), updateBanner);
router.delete("/:id", protect, authorize("admin", "superadmin"), deleteBanner);

module.exports = router;
