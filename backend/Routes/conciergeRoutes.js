const express = require("express");
const router = express.Router();

const {
  submitInquiry,
  getMyInquiries,
  getAdminInquiries,
  getInquiryById,
  updateInquiry,
  deleteInquiry,
} = require("../controllers/conciergeController");

const { protect, authorize } = require("../middleware/authMiddleware");

// Public
router.post("/", submitInquiry);

// Customer Private
router.get("/my-inquiries", protect, getMyInquiries);

// Admin Management
router.get("/admin/all", protect, authorize("admin", "superadmin"), getAdminInquiries);
router.get("/admin/:id", protect, authorize("admin", "superadmin"), getInquiryById);
router.put("/admin/:id", protect, authorize("admin", "superadmin"), updateInquiry);
router.delete("/admin/:id", protect, authorize("admin", "superadmin"), deleteInquiry);

module.exports = router;
