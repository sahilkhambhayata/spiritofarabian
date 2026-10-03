const express = require("express");
const router = express.Router();
const {
  syncCart,
  getAbandonedCarts,
  sendManualReminder,
  recoverCartByToken,
} = require("../controllers/cartController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Public routes
router.post("/sync", syncCart);
router.get("/recover/:token", recoverCartByToken);

// Admin routes
router.get("/abandoned", protect, authorize("admin", "superadmin"), getAbandonedCarts);
router.post("/abandoned/:id/send-reminder", protect, authorize("admin", "superadmin"), sendManualReminder);

module.exports = router;
