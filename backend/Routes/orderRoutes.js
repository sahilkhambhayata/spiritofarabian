const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  trackOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updateTrackingDetails,
  cancelOrder,
} = require("../controllers/orderController");

const { protect, authorize } = require("../middleware/authMiddleware");

// ================= PUBLIC / HYBRID ROUTES =================
router.post("/", (req, res, next) => {
  // Optional auth: If Bearer token provided, verify it; otherwise proceed as guest
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    return protect(req, res, next);
  }
  next();
}, createOrder);

router.get("/track/:orderNumber", trackOrder);

// ================= CUSTOMER PRIVATE ROUTES =================
router.get("/my-orders", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/cancel", protect, cancelOrder);

// ================= ADMIN ROUTES =================
router.get("/admin/all", protect, authorize("admin", "superadmin"), getAllOrders);
router.put("/admin/:id/status", protect, authorize("admin", "superadmin"), updateOrderStatus);
router.put("/admin/:id/tracking", protect, authorize("admin", "superadmin"), updateTrackingDetails);

module.exports = router;
