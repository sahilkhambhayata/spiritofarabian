const Cart = require("../models/cart");
const Order = require("../models/order");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const emailService = require("../services/emailService");

// @desc    Sync cart from storefront (Guest or Logged-in user)
// @route   POST /api/cart/sync
// @access  Public
const syncCart = asyncHandler(async (req, res) => {
  const { sessionId, items, subtotal, totalAmount, customer, user, utmSource, utmMedium, utmCampaign } = req.body;

  if (!sessionId) {
    throw new ApiError(400, "Session ID is required to sync cart.");
  }

  // If cart is empty, find and mark active cart
  if (!items || items.length === 0) {
    const existing = await Cart.findOne({ sessionId, status: "active" });
    if (existing) {
      existing.items = [];
      existing.subtotal = 0;
      existing.totalAmount = 0;
      existing.lastActivityAt = new Date();
      await existing.save();
      return ApiResponse.success(res, existing, "Cart cleared.");
    }
    return ApiResponse.success(res, null, "Cart is empty.");
  }

  const normalizedCustomer = {
    name: customer?.name ? String(customer.name).trim() : "",
    email: customer?.email ? String(customer.email).toLowerCase().trim() : "",
    phone: customer?.phone ? String(customer.phone).trim() : "",
  };

  const calculatedSubtotal =
    typeof subtotal === "number"
      ? subtotal
      : items.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 1), 0);

  const calculatedTotal = typeof totalAmount === "number" ? totalAmount : calculatedSubtotal;

  let cart = await Cart.findOne({ sessionId, status: { $in: ["active", "abandoned"] } });

  if (cart) {
    cart.items = items;
    cart.subtotal = calculatedSubtotal;
    cart.totalAmount = calculatedTotal;
    if (normalizedCustomer.email) cart.customer.email = normalizedCustomer.email;
    if (normalizedCustomer.name) cart.customer.name = normalizedCustomer.name;
    if (normalizedCustomer.phone) cart.customer.phone = normalizedCustomer.phone;
    if (user) cart.user = user;
    cart.lastActivityAt = new Date();
    await cart.save();
  } else {
    cart = await Cart.create({
      sessionId,
      items,
      subtotal: calculatedSubtotal,
      totalAmount: calculatedTotal,
      customer: normalizedCustomer,
      user: user || null,
      status: "active",
      lastActivityAt: new Date(),
      utmSource: utmSource || "",
      utmMedium: utmMedium || "",
      utmCampaign: utmCampaign || "",
    });
  }

  return ApiResponse.success(res, cart, "Cart synchronized successfully.");
});

// @desc    Get all abandoned carts with analytics (Admin)
// @route   GET /api/cart/abandoned
// @access  Private (Admin)
const getAbandonedCarts = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;

  const query = {};

  if (status && status !== "all") {
    query.status = status;
  } else {
    query.status = { $in: ["abandoned", "active", "recovered", "completed"] };
  }

  if (search) {
    query.$or = [
      { "customer.name": { $regex: search, $options: "i" } },
      { "customer.email": { $regex: search, $options: "i" } },
      { "customer.phone": { $regex: search, $options: "i" } },
      { "items.name": { $regex: search, $options: "i" } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [carts, total, stats] = await Promise.all([
    Cart.find(query).sort({ lastActivityAt: -1 }).skip(skip).limit(limitNum).lean(),
    Cart.countDocuments(query),
    Cart.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalValue: { $sum: "$totalAmount" },
        },
      },
    ]),
  ]);

  const summary = {
    totalAbandoned: 0,
    abandonedValue: 0,
    totalRecovered: 0,
    recoveredValue: 0,
    totalActive: 0,
    recoveryRate: 0,
  };

  stats.forEach((s) => {
    if (s._id === "abandoned") {
      summary.totalAbandoned = s.count;
      summary.abandonedValue = s.totalValue;
    } else if (s._id === "recovered") {
      summary.totalRecovered = s.count;
      summary.recoveredValue = s.totalValue;
    } else if (s._id === "active") {
      summary.totalActive = s.count;
    }
  });

  const totalClosed = summary.totalAbandoned + summary.totalRecovered;
  summary.recoveryRate = totalClosed > 0 ? Math.round((summary.totalRecovered / totalClosed) * 100) : 0;

  return ApiResponse.success(
    res,
    {
      carts,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      summary,
    },
    "Abandoned carts retrieved successfully."
  );
});

// @desc    Trigger manual abandoned cart reminder email (Admin)
// @route   POST /api/cart/abandoned/:id/send-reminder
// @access  Private (Admin)
const sendManualReminder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const cart = await Cart.findById(id);
  if (!cart) {
    throw new ApiError(404, "Cart not found.");
  }

  if (!cart.customer?.email) {
    throw new ApiError(400, "This cart does not have a customer email address attached.");
  }

  const reminderNum = (cart.remindersSent || 0) + 1;
  const result = await emailService.sendAbandonedCartReminder(cart, reminderNum);

  if (!result.success) {
    throw new ApiError(500, `Failed to dispatch reminder: ${result.error || "Email service error"}`);
  }

  cart.status = "abandoned";
  cart.abandonedAt = cart.abandonedAt || new Date();
  cart.remindersSent = reminderNum;
  cart.lastReminderSentAt = new Date();
  cart.reminderHistory.push({
    sentAt: new Date(),
    reminderNumber: reminderNum,
    email: cart.customer.email,
    status: "delivered",
  });
  await cart.save();

  return ApiResponse.success(res, cart, `Reminder #${reminderNum} sent to ${cart.customer.email}`);
});

// @desc    Recover cart by token (Public recovery link from email)
// @route   GET /api/cart/recover/:token
// @access  Public
const recoverCartByToken = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const cart = await Cart.findOne({ recoveryToken: token });
  if (!cart) {
    throw new ApiError(404, "Recovery link is invalid or has expired.");
  }

  return ApiResponse.success(
    res,
    {
      sessionId: cart.sessionId,
      items: cart.items,
      customer: cart.customer,
      subtotal: cart.subtotal,
      totalAmount: cart.totalAmount,
    },
    "Cart recovered successfully."
  );
});

module.exports = {
  syncCart,
  getAbandonedCarts,
  sendManualReminder,
  recoverCartByToken,
};
