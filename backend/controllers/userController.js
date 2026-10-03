const crypto = require("crypto");
const User = require("../models/user");
require("../models/product");
const emailService = require("../services/emailService");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Please provide name, email, and password.");
  }

  // Check if user already exists
  const userExists = await User.findOne({ email: email.toLowerCase().trim() });
  if (userExists) {
    throw new ApiError(400, "An account with this email address already exists.");
  }

  // Create user
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    phone: phone ? phone.trim() : undefined,
    role: "customer",
  });

  const token = user.generateAuthToken();

  // Send Welcome Email (Non-blocking)
  emailService.sendWelcomeEmail(user).catch((err) => {
    console.error("[UserController] Failed to send welcome email:", err.message);
  });

  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    addresses: user.addresses,
    wishlist: user.wishlist,
    createdAt: user.createdAt,
  };

  return ApiResponse.created(res, { user: userData, token }, "Account registered successfully.");
});

// @desc    Request Email Verification OTP
// @route   POST /api/users/request-otp
// @access  Public
const requestOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Email address is required.");
  }

  const cleanEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: cleanEmail });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  if (user) {
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();
  }

  // Dispatch OTP Email
  emailService.sendOtpEmail(cleanEmail, otp, user?.name || "Esteemed Patron").catch((err) => {
    console.error("[UserController] Failed to send OTP email:", err.message);
  });

  return ApiResponse.success(res, null, `Verification code dispatched to ${cleanEmail}.`);
});

// @desc    Verify OTP
// @route   POST /api/users/verify-otp
// @access  Public
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    throw new ApiError(400, "Please provide email and OTP code.");
  }

  const user = await User.findOne({
    email: email.toLowerCase().trim(),
    otp: otp.trim(),
    otpExpires: { $gt: new Date() },
  }).select("+otp +otpExpires");

  if (!user) {
    throw new ApiError(400, "Invalid or expired verification code.");
  }

  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  return ApiResponse.success(res, { verified: true }, "Email verified successfully.");
});

// @desc    Forgot Password Request
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Please provide your email address.");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim(), isDeleted: false });
  if (!user) {
    // Return standard success to prevent user enumeration
    return ApiResponse.success(res, null, "If an account exists with this email, a reset link has been dispatched.");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 mins
  await user.save();

  emailService.sendPasswordResetEmail(user, resetToken).catch((err) => {
    console.error("[UserController] Failed to send password reset email:", err.message);
  });

  return ApiResponse.success(res, null, "If an account exists with this email, a reset link has been dispatched.");
});

// @desc    Reset Password with Token
// @route   POST /api/users/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    throw new ApiError(400, "Token and new password are required.");
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters.");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  }).select("+password +resetPasswordToken +resetPasswordExpires");

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token.");
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return ApiResponse.success(res, null, "Password reset successfully. You may now log in.");
});

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Please provide both email and password.");
  }

  // Find user with password selected
  const user = await User.findOne({
    email: email.toLowerCase().trim(),
    isDeleted: false,
  }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Your account has been deactivated. Please contact support.");
  }

  // Check password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const token = user.generateAuthToken();

  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    addresses: user.addresses,
    wishlist: user.wishlist,
    createdAt: user.createdAt,
  };

  return ApiResponse.success(res, { user: userData, token }, "Logged in successfully.");
});

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist", "name slug price images variants");
  if (!user) {
    throw new ApiError(404, "User profile not found.");
  }

  return ApiResponse.success(res, user, "User profile fetched successfully.");
});

// @desc    Update user profile (name, phone)
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const { name, phone } = req.body;
  if (name) user.name = name.trim();
  if (phone !== undefined) user.phone = phone.trim();

  await user.save();

  const updatedUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    addresses: user.addresses,
    wishlist: user.wishlist,
  };

  return ApiResponse.success(res, updatedUser, "Profile updated successfully.");
});

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Please provide both current and new password.");
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, "New password must be at least 6 characters long.");
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(400, "Current password is incorrect.");
  }

  user.password = newPassword;
  await user.save();

  return ApiResponse.success(res, null, "Password changed successfully.");
});

// ================= ADDRESS MANAGEMENT =================

// @desc    Add delivery address
// @route   POST /api/users/address
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
  const { fullName, phone, street, city, state, pincode, country, isDefault } = req.body;

  if (!fullName || !phone || !street || !city || !state || !pincode) {
    throw new ApiError(400, "Please provide all required address fields.");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  // If this address is set as default, unset existing defaults
  if (isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  } else if (user.addresses.length === 0) {
    // If it's the first address, make it default automatically
    req.body.isDefault = true;
  }

  user.addresses.push({
    fullName: fullName.trim(),
    phone: phone.trim(),
    street: street.trim(),
    city: city.trim(),
    state: state.trim(),
    pincode: pincode.trim(),
    country: country ? country.trim() : "India",
    isDefault: req.body.isDefault || false,
  });

  await user.save();

  return ApiResponse.created(res, user.addresses, "Address added successfully.");
});

// @desc    Update delivery address
// @route   PUT /api/users/address/:addressId
// @access  Private
const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const { fullName, phone, street, city, state, pincode, country, isDefault } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const address = user.addresses.id(addressId);
  if (!address) {
    throw new ApiError(404, "Address not found.");
  }

  if (isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
    address.isDefault = true;
  }

  if (fullName) address.fullName = fullName.trim();
  if (phone) address.phone = phone.trim();
  if (street) address.street = street.trim();
  if (city) address.city = city.trim();
  if (state) address.state = state.trim();
  if (pincode) address.pincode = pincode.trim();
  if (country) address.country = country.trim();

  await user.save();

  return ApiResponse.success(res, user.addresses, "Address updated successfully.");
});

// @desc    Delete delivery address
// @route   DELETE /api/users/address/:addressId
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const initialLength = user.addresses.length;
  user.addresses = user.addresses.filter((addr) => addr._id.toString() !== addressId);

  if (user.addresses.length === initialLength) {
    throw new ApiError(404, "Address not found.");
  }

  // If we deleted the default address, make the first one default if exists
  const hasDefault = user.addresses.some((a) => a.isDefault);
  if (!hasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();

  return ApiResponse.success(res, user.addresses, "Address deleted successfully.");
});

// ================= WISHLIST MANAGEMENT =================

// @desc    Toggle product in wishlist (Add/Remove)
// @route   POST /api/users/wishlist/:productId
// @access  Private
const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const existsIndex = user.wishlist.findIndex((id) => id.toString() === productId);
  let action = "added";

  if (existsIndex > -1) {
    // Remove from wishlist
    user.wishlist.splice(existsIndex, 1);
    action = "removed";
  } else {
    // Add to wishlist
    user.wishlist.push(productId);
    action = "added";
  }

  await user.save();

  return ApiResponse.success(
    res,
    { wishlist: user.wishlist, action },
    `Product ${action} ${action === "added" ? "to" : "from"} wishlist successfully.`
  );
});

// ================= ADMIN USER MANAGEMENT =================

// @desc    Get all users (Admin)
// @route   GET /api/users/admin/all
// @access  Private (Admin)
const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  const search = req.query.search || "";
  const role = req.query.role;

  const query = { isDeleted: false };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  if (role) {
    query.role = role;
  }

  const [users, total] = await Promise.all([
    User.find(query).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(query),
  ]);

  return ApiResponse.success(
    res,
    {
      users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    },
    "Users retrieved successfully."
  );
});

// @desc    Update user role / status (Admin)
// @route   PUT /api/users/admin/:userId
// @access  Private (Admin)
const updateUserByAdmin = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role, isActive } = req.body;

  const user = await User.findById(userId);
  if (!user || user.isDeleted) {
    throw new ApiError(404, "User not found.");
  }

  if (role) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;

  await user.save();

  return ApiResponse.success(
    res,
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
    "User updated successfully by admin."
  );
});

// @desc    Soft delete user (Admin)
// @route   DELETE /api/users/admin/:userId
// @access  Private (Admin)
const deleteUserByAdmin = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (req.user._id.toString() === userId) {
    throw new ApiError(400, "You cannot delete your own admin account.");
  }

  const user = await User.findById(userId);
  if (!user || user.isDeleted) {
    throw new ApiError(404, "User not found.");
  }

  user.isDeleted = true;
  user.isActive = false;
  await user.save();

  return ApiResponse.success(res, null, "User deleted successfully.");
});

module.exports = {
  registerUser,
  loginUser,
  requestOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  changePassword,
  addAddress,
  updateAddress,
  deleteAddress,
  toggleWishlist,
  getAllUsers,
  updateUserByAdmin,
  deleteUserByAdmin,
};
