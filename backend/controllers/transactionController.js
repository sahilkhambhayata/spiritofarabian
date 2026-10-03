const crypto = require("crypto");
const Transaction = require("../models/transaction");
const Order = require("../models/order");
const emailService = require("../services/emailService");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

// Helper: Generate unique transaction ID
const generateTransactionId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `TXN-SOA-${timestamp}${random}`;
};

// @desc    Initiate a Payment Gateway Order (Razorpay / UPI)
// @route   POST /api/transactions/create-order
// @access  Public / Customer
const createPaymentOrder = asyncHandler(async (req, res) => {
  const { orderId, gateway } = req.body;

  if (!orderId) {
    throw new ApiError(400, "Please provide the order ID.");
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  if (order.paymentStatus === "Paid" || order.paymentStatus === "Completed") {
    throw new ApiError(400, "This order has already been paid for.");
  }

  const selectedGateway = gateway || "RAZORPAY";
  const transactionId = generateTransactionId();
  const gatewayOrderId = `order_${Math.random().toString(36).substring(2, 15)}`; // Standard gateway order ref

  const transaction = await Transaction.create({
    order: order._id,
    user: order.user || (req.user ? req.user._id : undefined),
    transactionId,
    gateway: selectedGateway,
    gatewayOrderId,
    amount: order.totalAmount,
    currency: "INR",
    status: "initiated",
  });

  // Link transaction to order
  order.paymentTransactionId = transactionId;
  await order.save();

  return ApiResponse.created(
    res,
    {
      transactionId,
      gatewayOrderId,
      amount: order.totalAmount,
      currency: "INR",
      orderNumber: order.orderNumber,
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_spirit_of_arabian",
    },
    "Payment order initiated successfully."
  );
});

// @desc    Verify Payment Signature & Finalize Order
// @route   POST /api/transactions/verify
// @access  Public / Customer
const verifyPayment = asyncHandler(async (req, res) => {
  const { transactionId, gatewayPaymentId, gatewaySignature, gatewayOrderId, paymentMethodDetails } = req.body;

  if (!transactionId || !gatewayPaymentId) {
    throw new ApiError(400, "Please provide transaction ID and payment ID.");
  }

  const transaction = await Transaction.findOne({ transactionId });
  if (!transaction) {
    throw new ApiError(404, "Transaction not found.");
  }

  if (transaction.status === "successful") {
    return ApiResponse.success(res, transaction, "Payment already verified successfully.");
  }

  // Verify HMAC signature if secret is configured
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (keySecret && gatewaySignature && gatewayOrderId) {
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${gatewayOrderId}|${gatewayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== gatewaySignature) {
      transaction.status = "failed";
      transaction.failureDetails = {
        code: "SIGNATURE_MISMATCH",
        description: "Payment verification signature mismatch.",
        failedAt: new Date(),
      };
      await transaction.save();
      throw new ApiError(400, "Payment verification failed. Invalid signature.");
    }
  }

  // Update Transaction
  transaction.status = "successful";
  transaction.gatewayPaymentId = gatewayPaymentId;
  transaction.gatewaySignature = gatewaySignature || "";
  if (paymentMethodDetails) {
    transaction.paymentMethodDetails = paymentMethodDetails;
  }
  await transaction.save();

  // Update Order Payment Status
  const order = await Order.findById(transaction.order);
  if (order) {
    order.paymentStatus = "Paid";
    order.paymentTransactionId = transactionId;
    order.tracking.history.push({
      status: "Payment Confirmed",
      location: "Royal Treasury Gateway",
      timestamp: new Date(),
      note: `Online payment of ₹${order.totalAmount} verified via ${transaction.gateway}.`,
    });
    await order.save();

    // Send Payment Success Email (Non-blocking)
    emailService.sendPaymentSuccess(order, transaction).catch((err) => {
      console.error("[TransactionController] Failed to send payment success email:", err.message);
    });
  }

  return ApiResponse.success(
    res,
    {
      transactionId: transaction.transactionId,
      status: "successful",
      orderNumber: order?.orderNumber,
      amount: transaction.amount,
    },
    "Payment verified and order confirmed."
  );
});

// @desc    Record Payment Failure Attempt
// @route   POST /api/transactions/failed
// @access  Public / Customer
const handlePaymentFailure = asyncHandler(async (req, res) => {
  const { transactionId, errorCode, errorDescription } = req.body;

  if (!transactionId) {
    throw new ApiError(400, "Transaction ID is required.");
  }

  const transaction = await Transaction.findOne({ transactionId });
  if (!transaction) {
    throw new ApiError(404, "Transaction not found.");
  }

  transaction.status = "failed";
  transaction.failureDetails = {
    code: errorCode || "USER_CANCELLED",
    description: errorDescription || "Payment attempt failed or cancelled by user.",
    failedAt: new Date(),
  };

  await transaction.save();

  // Send Payment Failure Email (Non-blocking)
  if (transaction.order) {
    Order.findById(transaction.order).then((order) => {
      if (order) {
        emailService.sendPaymentFailure(order, transaction.failureDetails.description).catch((err) => {
          console.error("[TransactionController] Failed to send payment failure email:", err.message);
        });
      }
    }).catch((e) => console.error(e));
  }

  return ApiResponse.success(res, transaction, "Payment failure recorded.");
});

// @desc    Get Customer's Transaction History
// @route   GET /api/transactions/my-history
// @access  Private (Customer)
const getMyTransactions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    Transaction.find({ user: req.user._id })
      .populate("order", "orderNumber totalAmount orderStatus")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Transaction.countDocuments({ user: req.user._id }),
  ]);

  return ApiResponse.success(
    res,
    {
      transactions,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    },
    "Transaction history retrieved successfully."
  );
});

// @desc    Get All Transactions (Admin with filters)
// @route   GET /api/transactions/admin/all
// @access  Private (Admin)
const getAllTransactions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const { search, status, gateway } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { transactionId: { $regex: search, $options: "i" } },
      { gatewayOrderId: { $regex: search, $options: "i" } },
      { gatewayPaymentId: { $regex: search, $options: "i" } },
    ];
  }

  if (status) query.status = status;
  if (gateway) query.gateway = gateway;

  const [transactions, total] = await Promise.all([
    Transaction.find(query)
      .populate("order", "orderNumber customerDetails totalAmount")
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Transaction.countDocuments(query),
  ]);

  return ApiResponse.success(
    res,
    {
      transactions,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    },
    "Admin transactions retrieved successfully."
  );
});

// @desc    Process Refund for a Transaction (Admin)
// @route   POST /api/transactions/admin/:id/refund
// @access  Private (Admin)
const processRefund = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { refundAmount, reason } = req.body;

  const transaction = await Transaction.findById(id);
  if (!transaction) {
    throw new ApiError(404, "Transaction not found.");
  }

  if (transaction.status !== "successful") {
    throw new ApiError(400, "Only successful transactions can be refunded.");
  }

  const amountToRefund = Number(refundAmount) || transaction.amount;
  if (amountToRefund > transaction.amount) {
    throw new ApiError(400, "Refund amount cannot exceed original transaction amount.");
  }

  transaction.status = amountToRefund === transaction.amount ? "refunded" : "partially_refunded";
  transaction.refundDetails = {
    refundId: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
    refundAmount: amountToRefund,
    refundReason: reason || "Admin approved refund",
    refundedAt: new Date(),
  };

  await transaction.save();

  // Update order
  const order = await Order.findById(transaction.order);
  if (order) {
    order.paymentStatus = "Refunded";
    order.tracking.history.push({
      status: "Payment Refunded",
      location: "Royal Accounts Treasury",
      timestamp: new Date(),
      note: `Refund of ₹${amountToRefund} processed. Reason: ${reason || "Customer satisfaction guarantee"}`,
    });
    await order.save();
  }

  return ApiResponse.success(res, transaction, `Refund of ₹${amountToRefund} processed successfully.`);
});

module.exports = {
  createPaymentOrder,
  verifyPayment,
  handlePaymentFailure,
  getMyTransactions,
  getAllTransactions,
  processRefund,
};
