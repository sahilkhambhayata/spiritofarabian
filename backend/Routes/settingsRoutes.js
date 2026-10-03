const express = require("express");
const router = express.Router();

const {
  getSiteSettings,
  updateSiteSettings,
  testSmtp,
  addFaq,
  deleteFaq,
} = require("../controllers/settingsController");

const { protect, authorize } = require("../middleware/authMiddleware");

// Public
router.get("/", getSiteSettings);

// Admin
router.put("/", protect, authorize("admin", "superadmin"), updateSiteSettings);
router.post("/test-smtp", protect, authorize("admin", "superadmin"), testSmtp);
router.post("/faqs", protect, authorize("admin", "superadmin"), addFaq);
router.delete("/faqs/:faqId", protect, authorize("admin", "superadmin"), deleteFaq);

module.exports = router;
