const shippingService = require("../services/shipping/shippingService");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Check destination serviceability & product restrictions
// @route   POST /api/shipping/check-serviceability
// @access  Public
const checkServiceability = asyncHandler(async (req, res) => {
  const { country, pincode, items, cod } = req.body;

  if (!pincode) {
    throw new ApiError(400, "Please provide a valid destination postal / pincode.");
  }

  const result = await shippingService.checkServiceability({
    country: country || "India",
    pincode: pincode.trim(),
    items: items || [],
    cod: Boolean(cod),
  });

  return ApiResponse.success(res, result, "Serviceability check completed.");
});

// @desc    Calculate live shipping rates and courier options
// @route   POST /api/shipping/calculate-rates
// @access  Public
const calculateRates = asyncHandler(async (req, res) => {
  const { country, pincode, items, cod, subTotal } = req.body;

  if (!pincode) {
    throw new ApiError(400, "Please provide a valid destination postal / pincode.");
  }

  const result = await shippingService.calculateShippingOptions({
    country: country || "India",
    pincode: pincode.trim(),
    items: items || [],
    cod: Boolean(cod),
    subTotal: Number(subTotal) || 0,
  });

  return ApiResponse.success(res, result, "Shipping options calculated successfully.");
});

// @desc    Live track shipment by AWB or Order Number
// @route   GET /api/shipping/track/:identifier
// @access  Public
const trackShipment = asyncHandler(async (req, res) => {
  const { identifier } = req.params;

  if (!identifier) {
    throw new ApiError(400, "Please provide an AWB or Order Number to track.");
  }

  const trackingInfo = await shippingService.trackShipment(identifier);
  return ApiResponse.success(res, trackingInfo, "Live tracking details retrieved.");
});

// ================= ADMIN SHIPMENT MANAGEMENT =================

// @desc    Create shipment with courier provider (Admin)
// @route   POST /api/shipping/admin/create
// @access  Private (Admin)
const createShipment = asyncHandler(async (req, res) => {
  const { orderId, pickupLocation } = req.body;

  if (!orderId) {
    throw new ApiError(400, "Please provide orderId.");
  }

  const shipment = await shippingService.createShipmentForOrder(orderId, { pickupLocation });
  return ApiResponse.created(res, shipment, "Shipment booked with logistics provider.");
});

// @desc    Generate AWB for shipment (Admin)
// @route   POST /api/shipping/admin/generate-awb
// @access  Private (Admin)
const generateAwb = asyncHandler(async (req, res) => {
  const { shipmentId, courierId } = req.body;

  if (!shipmentId) {
    throw new ApiError(400, "Please provide shipmentId.");
  }

  const shipment = await shippingService.generateAwbForShipment(shipmentId, courierId);
  return ApiResponse.success(res, shipment, "AWB assigned successfully.");
});

// @desc    Generate shipping label (Admin)
// @route   POST /api/shipping/admin/generate-label
// @access  Private (Admin)
const generateLabel = asyncHandler(async (req, res) => {
  const { shipmentId } = req.body;

  if (!shipmentId) {
    throw new ApiError(400, "Please provide shipmentId.");
  }

  const shipment = await shippingService.generateLabelForShipment(shipmentId);
  return ApiResponse.success(res, shipment, "Shipping label generated.");
});

// @desc    Request carrier pickup (Admin)
// @route   POST /api/shipping/admin/request-pickup
// @access  Private (Admin)
const requestPickup = asyncHandler(async (req, res) => {
  const { shipmentId, pickupDate } = req.body;

  if (!shipmentId) {
    throw new ApiError(400, "Please provide shipmentId.");
  }

  const shipment = await shippingService.requestPickupForShipment(shipmentId, pickupDate);
  return ApiResponse.success(res, shipment, "Carrier pickup scheduled successfully.");
});

// @desc    Cancel shipment (Admin)
// @route   POST /api/shipping/admin/cancel
// @access  Private (Admin)
const cancelShipment = asyncHandler(async (req, res) => {
  const { shipmentId, reason } = req.body;

  if (!shipmentId) {
    throw new ApiError(400, "Please provide shipmentId.");
  }

  const shipment = await shippingService.cancelShipment(shipmentId, reason);
  return ApiResponse.success(res, shipment, "Shipment cancelled successfully.");
});

// ================= WEBHOOKS =================

// @desc    Shiprocket Tracking Webhook
// @route   POST /api/shipping/webhook/shiprocket
// @access  Public (Webhook)
const shiprocketWebhook = asyncHandler(async (req, res) => {
  const result = await shippingService.handleWebhook("shiprocket", req.body, req.headers);
  return ApiResponse.success(res, result, "Shiprocket webhook processed.");
});

// @desc    DHL Tracking Webhook
// @route   POST /api/shipping/webhook/dhl
// @access  Public (Webhook)
const dhlWebhook = asyncHandler(async (req, res) => {
  const result = await shippingService.handleWebhook("dhl", req.body, req.headers);
  return ApiResponse.success(res, result, "DHL webhook processed.");
});

module.exports = {
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
};
