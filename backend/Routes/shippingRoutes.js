const express = require("express");
const router = express.Router();
const {
  checkServiceability,
  calculateRates,
  trackShipment,
  createShipment,
  generateAwb,
  generateLabel,
  requestPickup,
  cancelShipment,
  shiprocketWebhook,
  dhlWebhook,
} = require("../controllers/shippingController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Public routes for checkout & tracking
router.post("/check-serviceability", checkServiceability);
router.post("/calculate-rates", calculateRates);
router.get("/track/:identifier", trackShipment);

// Webhook endpoints
router.post("/webhook/shiprocket", shiprocketWebhook);
router.post("/webhook/dhl", dhlWebhook);

// Protected Admin Logistics Operations
router.use("/admin", protect, authorize("admin", "superadmin"));
router.post("/admin/create", createShipment);
router.post("/admin/generate-awb", generateAwb);
router.post("/admin/generate-label", generateLabel);
router.post("/admin/request-pickup", requestPickup);
router.post("/admin/cancel", cancelShipment);

module.exports = router;
