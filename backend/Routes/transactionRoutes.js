const express = require("express");
const router = express.Router();

const {
  createPaymentOrder,
  verifyPayment,
  handlePaymentFailure,
  getMyTransactions,
  getAllTransactions,
  processRefund,
} = require("../controllers/transactionController");

const { protect, authorize } = require("../middleware/authMiddleware");

// ================= PUBLIC / CUSTOMER GATEWAY ROUTES =================
router.post("/create-order", createPaymentOrder);
router.post("/verify", verifyPayment);
router.post("/failed", handlePaymentFailure);

// ================= CUSTOMER PRIVATE TRANSACTION HISTORY =================
router.get("/my-history", protect, getMyTransactions);

// ================= ADMIN TRANSACTION MANAGEMENT =================
router.get("/admin/all", protect, authorize("admin", "superadmin"), getAllTransactions);
router.post("/admin/:id/refund", protect, authorize("admin", "superadmin"), processRefund);

module.exports = router;
