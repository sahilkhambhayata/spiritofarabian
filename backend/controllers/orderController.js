const Order = require("../models/order");
const Product = require("../models/product");
const Coupon = require("../models/coupon");
const Cart = require("../models/cart");
const emailService = require("../services/emailService");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

// Helper: Generate unique order number (e.g. SOA-84912)
const generateOrderNumber = () => {
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  return `SOA-${randomDigits}`;
};

// @desc    Create a new Order (Checkout)
// @route   POST /api/orders
// @access  Public / Customer
const createOrder = asyncHandler(async (req, res) => {
  const {
    items,
    customerDetails,
    shippingAddress,
    giftOptions,
    paymentMethod,
    couponApplied,
    discountAmount,
    shippingFee,
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "Your shopping cart is empty.");
  }

  if (!customerDetails || !customerDetails.fullName || !customerDetails.email || !customerDetails.phone) {
    throw new ApiError(400, "Please provide complete customer details (name, email, phone).");
  }

  if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.pincode) {
    throw new ApiError(400, "Please provide a complete delivery address.");
  }

  let calculatedSubTotal = 0;
  const processedItems = [];

  // Verify and snapshot each item
  for (const item of items) {
    let product;
    const prodRef = item.product || item.productId;
    if (require("mongoose").Types.ObjectId.isValid(prodRef)) {
      product = await Product.findById(prodRef);
    }
    if (!product && prodRef) {
      product = await Product.findOne({ slug: prodRef, isDeleted: false });
    }
    if (!product || product.isDeleted || !product.isActive) {
      throw new ApiError(404, `Product '${item.name || "Item"}' is no longer available.`);
    }

    const price = Number(item.price);
    const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
    calculatedSubTotal += price * quantity;

    let comboSnapshot = [];
    if (product.productType === "combo" || product.productType === "gift_box") {
      if (product.bundle && Array.isArray(product.bundle.includedProducts)) {
        comboSnapshot = product.bundle.includedProducts.map((inc) => ({
          productName: inc.productName || "Attar Flacon",
          size: inc.size || "6ml",
          quantity: inc.quantity || 1,
        }));
      }
    }

    processedItems.push({
      product: product._id,
      variantId: item.variantId || null,
      name: product.name,
      slug: product.slug,
      size: item.size || "6ml",
      price,
      quantity,
      image: item.image || (product.images?.[0]?.url || ""),
      itemType: product.productType || "single_attar",
      comboItemsSnapshot: comboSnapshot,
    });
  }

  const finalDiscount = Number(discountAmount) || 0;
  const finalShipping = calculatedSubTotal >= 1500 ? 0 : (Number(shippingFee) || 150);
  const finalTotal = Math.max(0, calculatedSubTotal - finalDiscount + finalShipping);

  // Generate unique order number
  let orderNumber = generateOrderNumber();
  while (await Order.findOne({ orderNumber })) {
    orderNumber = generateOrderNumber();
  }

  const initialHistory = [
    {
      status: "Order Confirmed",
      location: "Dubai Atelier Vault",
      timestamp: new Date(),
      note: "Your artisan fragrance reservation has been placed and confirmed.",
    },
  ];

  const order = await Order.create({
    orderNumber,
    user: req.user ? req.user._id : undefined,
    customerDetails: {
      fullName: customerDetails.fullName.trim(),
      email: customerDetails.email.toLowerCase().trim(),
      phone: customerDetails.phone.trim(),
    },
    shippingAddress: {
      street: shippingAddress.street.trim(),
      city: shippingAddress.city.trim(),
      state: shippingAddress.state?.trim() || "Maharashtra",
      pincode: shippingAddress.pincode.trim(),
      country: shippingAddress.country?.trim() || "India",
    },
    giftOptions: giftOptions || { isGift: false },
    items: processedItems,
    subTotal: calculatedSubTotal,
    discountAmount: finalDiscount,
    couponApplied: couponApplied ? couponApplied.trim().toUpperCase() : "",
    shippingFee: finalShipping,
    totalAmount: finalTotal,
    paymentMethod: paymentMethod || "COD",
    paymentStatus: paymentMethod === "COD" ? "Pending" : "Pending",
    orderStatus: "Order Confirmed",
    tracking: {
      carrier: "BlueDart Express Insured",
      trackingNumber: `BD-${Math.floor(100000000 + Math.random() * 900000000)}`,
      trackingUrl: "",
      estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // +4 Days
      history: initialHistory,
    },
  });

  // If coupon applied, increment coupon usage count
  if (couponApplied) {
    await Coupon.findOneAndUpdate(
      { code: couponApplied.trim().toUpperCase() },
      { $inc: { usedCount: 1 } }
    );
  }

  // Mark abandoned/active cart as recovered/completed
  try {
    const customerEmail = customerDetails.email.toLowerCase().trim();
    const activeCart = await Cart.findOne({
      $or: [
        { "customer.email": customerEmail },
        ...(req.user ? [{ user: req.user._id }] : []),
      ],
      status: { $in: ["active", "abandoned"] },
    }).sort({ updatedAt: -1 });

    if (activeCart) {
      activeCart.status = activeCart.status === "abandoned" ? "recovered" : "completed";
      activeCart.completedAt = new Date();
      if (activeCart.status === "recovered") {
        activeCart.recoveredAt = new Date();
      }
      activeCart.convertedOrder = order._id;
      await activeCart.save();
    }
  } catch (cartErr) {
    console.error("[OrderController] Error linking cart to completed order:", cartErr.message);
  }

  // Dispatch Order Confirmation and Admin Alert Emails (Non-blocking)
  emailService.sendOrderConfirmation(order).catch((err) => {
    console.error("[OrderController] Failed to send order confirmation email:", err.message);
  });
  emailService.sendAdminOrderAlert(order).catch((err) => {
    console.error("[OrderController] Failed to send admin order alert email:", err.message);
  });

  return ApiResponse.created(res, order, "Order placed successfully.");
});

// @desc    Get logged in customer's order history
// @route   GET /api/orders/my-orders
// @access  Private (Customer)
const getMyOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments({ user: req.user._id }),
  ]);

  return ApiResponse.success(
    res,
    {
      orders,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    },
    "My orders fetched successfully."
  );
});

// @desc    Track order by orderNumber (Public Live Tracking)
// @route   GET /api/orders/track/:orderNumber
// @access  Public
const trackOrder = asyncHandler(async (req, res) => {
  const { orderNumber } = req.params;

  const order = await Order.findOne({
    orderNumber: orderNumber.trim().toUpperCase(),
  }).select("orderNumber customerDetails items orderStatus tracking totalAmount createdAt");

  if (!order) {
    throw new ApiError(404, `No order found with tracking number '${orderNumber}'.`);
  }

  return ApiResponse.success(res, order, "Order tracking details retrieved successfully.");
});

// @desc    Get Single Order by ID
// @route   GET /api/orders/:id
// @access  Private (Customer / Admin)
const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id).populate("items.product", "name slug images");

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  // If customer, verify ownership
  if (req.user.role === "customer" && order.user?.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to view this order.");
  }

  return ApiResponse.success(res, order, "Order details retrieved successfully.");
});

// ================= ADMIN ORDER MANAGEMENT =================

// @desc    Get all orders (Admin with filters, search & pagination)
// @route   GET /api/orders/admin/all
// @access  Private (Admin)
const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const { search, status, paymentStatus, paymentMethod } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { orderNumber: { $regex: search, $options: "i" } },
      { "customerDetails.fullName": { $regex: search, $options: "i" } },
      { "customerDetails.email": { $regex: search, $options: "i" } },
      { "customerDetails.phone": { $regex: search, $options: "i" } },
    ];
  }

  if (status) query.orderStatus = status;
  if (paymentStatus) query.paymentStatus = paymentStatus;
  if (paymentMethod) query.paymentMethod = paymentMethod;

  const [orders, total] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(query),
  ]);

  return ApiResponse.success(
    res,
    {
      orders,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    },
    "Orders retrieved successfully."
  );
});

// @desc    Update Order Status & Append Tracking Step (Admin)
// @route   PUT /api/orders/admin/:id/status
// @access  Private (Admin)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, location, note } = req.body;

  const allowedStatuses = [
    "Order Confirmed",
    "Distilling & Bottling",
    "Artisan Packaging",
    "Dispatched",
    "Shipped",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
  ];

  if (!status || !allowedStatuses.includes(status)) {
    throw new ApiError(400, `Invalid status. Allowed: ${allowedStatuses.join(", ")}`);
  }

  const order = await Order.findById(id);
  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  const previousStatus = order.orderStatus;
  order.orderStatus = status;

  // Append new step to tracking history
  order.tracking.history.push({
    status,
    location: location || "Express Logistics Hub",
    timestamp: new Date(),
    note: note || `Order status updated to ${status}.`,
  });

  if (status === "Delivered") {
    if (order.paymentMethod === "COD") {
      order.paymentStatus = "Paid";
    }
  }

  await order.save();

  // Send Order Status Update Email (Non-blocking)
  emailService.sendOrderStatusUpdate(order, previousStatus, status, {
    courier: order.tracking?.carrier,
    trackingNumber: order.tracking?.trackingNumber,
    trackingUrl: order.tracking?.trackingUrl,
  }).catch((err) => {
    console.error("[OrderController] Failed to send status update email:", err.message);
  });

  return ApiResponse.success(res, order, `Order status updated to '${status}'.`);
});

// @desc    Update Courier Tracking Details (Admin)
// @route   PUT /api/orders/admin/:id/tracking
// @access  Private (Admin)
const updateTrackingDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { carrier, trackingNumber, trackingUrl, estimatedDelivery } = req.body;

  const order = await Order.findById(id);
  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  if (carrier) order.tracking.carrier = carrier.trim();
  if (trackingNumber) order.tracking.trackingNumber = trackingNumber.trim();
  if (trackingUrl !== undefined) order.tracking.trackingUrl = trackingUrl.trim();
  if (estimatedDelivery) order.tracking.estimatedDelivery = new Date(estimatedDelivery);

  await order.save();

  return ApiResponse.success(res, order.tracking, "Courier tracking details updated successfully.");
});

// @desc    Cancel Order (Customer or Admin)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const order = await Order.findById(id);
  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  // If customer, ensure it's their order and not already dispatched
  if (req.user.role === "customer") {
    if (order.user?.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You cannot cancel this order.");
    }
    if (["Dispatched", "Shipped", "Out for Delivery", "Delivered"].includes(order.orderStatus)) {
      throw new ApiError(400, "Order cannot be cancelled as it has already been dispatched.");
    }
  }

  order.orderStatus = "Cancelled";
  order.cancelledReason = reason || "Cancelled by user request";
  order.cancelledAt = new Date();

  order.tracking.history.push({
    status: "Cancelled",
    location: "Order Processing Unit",
    timestamp: new Date(),
    note: order.cancelledReason,
  });

  await order.save();

  // Send Order Cancellation Email (Non-blocking)
  emailService.sendOrderCancellation(order, order.cancelledReason).catch((err) => {
    console.error("[OrderController] Failed to send order cancellation email:", err.message);
  });

  return ApiResponse.success(res, order, "Order cancelled successfully.");
});

module.exports = {
  createOrder,
  getMyOrders,
  trackOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updateTrackingDetails,
  cancelOrder,
};
