const Coupon = require("../models/coupon");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Validate Promo Code at Checkout
// @route   POST /api/coupons/validate
// @access  Public / Customer
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;

  if (!code) {
    throw new ApiError(400, "Please provide a coupon code.");
  }

  const subTotal = Number(orderAmount) || 0;

  const coupon = await Coupon.findOne({
    code: code.trim().toUpperCase(),
    isActive: true,
    isDeleted: false,
  });

  if (!coupon) {
    throw new ApiError(404, "Invalid or expired promo code.");
  }

  // Check Expiry
  if (new Date(coupon.expiryDate) < new Date()) {
    throw new ApiError(400, "This promo code has expired.");
  }

  // Check Usage Limit
  if (coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, "This promo code has reached its maximum usage limit.");
  }

  // Check Minimum Order Value
  if (subTotal < coupon.minOrderValue) {
    throw new ApiError(
      400,
      `Minimum cart subtotal of ₹${coupon.minOrderValue} required for this promo code.`
    );
  }

  // Calculate Discount Amount
  let discount = 0;
  if (coupon.discountType === "percentage") {
    discount = (subTotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0) {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }
  } else {
    // Flat discount
    discount = Math.min(subTotal, coupon.discountValue);
  }

  discount = Math.round(discount);

  return ApiResponse.success(
    res,
    {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: discount,
      finalAmount: Math.max(0, subTotal - discount),
    },
    `Promo code '${coupon.code}' applied successfully. You saved ₹${discount}!`
  );
});

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons/admin/all
// @access  Private (Admin)
const getAllCoupons = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const coupons = await Coupon.find({ isDeleted: false })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Coupon.countDocuments({ isDeleted: false });

  return ApiResponse.success(
    res,
    {
      coupons,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    },
    "Coupons retrieved successfully."
  );
});

// @desc    Create Coupon (Admin)
// @route   POST /api/coupons
// @access  Private (Admin)
const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    discountType,
    discountValue,
    minOrderValue,
    maxDiscountAmount,
    expiryDate,
    usageLimit,
    description,
    isActive,
  } = req.body;

  if (!code || !discountValue || !expiryDate) {
    throw new ApiError(400, "Please provide code, discountValue, and expiryDate.");
  }

  const existing = await Coupon.findOne({ code: code.trim().toUpperCase(), isDeleted: false });
  if (existing) {
    throw new ApiError(400, `Coupon code '${code}' already exists.`);
  }

  const coupon = await Coupon.create({
    code: code.trim().toUpperCase(),
    discountType: discountType || "percentage",
    discountValue: Number(discountValue),
    minOrderValue: Number(minOrderValue) || 0,
    maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
    expiryDate: new Date(expiryDate),
    usageLimit: Number(usageLimit) || 100,
    description: description ? description.trim() : "",
    isActive: isActive !== undefined ? Boolean(isActive) : true,
  });

  return ApiResponse.created(res, coupon, "Coupon created successfully.");
});

// @desc    Update Coupon (Admin)
// @route   PUT /api/coupons/:id
// @access  Private (Admin)
const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.body.code) req.body.code = req.body.code.trim().toUpperCase();

  const coupon = await Coupon.findByIdAndUpdate(
    id,
    { $set: req.body },
    { returnDocument: "after", runValidators: true }
  );

  if (!coupon || coupon.isDeleted) {
    throw new ApiError(404, "Coupon not found.");
  }

  return ApiResponse.success(res, coupon, "Coupon updated successfully.");
});

// @desc    Delete Coupon (Admin Soft Delete)
// @route   DELETE /api/coupons/:id
// @access  Private (Admin)
const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const coupon = await Coupon.findById(id);
  if (!coupon || coupon.isDeleted) {
    throw new ApiError(404, "Coupon not found.");
  }

  coupon.isDeleted = true;
  coupon.isActive = false;
  await coupon.save();

  return ApiResponse.success(res, null, "Coupon deleted successfully.");
});

module.exports = {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
