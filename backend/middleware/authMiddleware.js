const jwt = require("jsonwebtoken");
const User = require("../models/user");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

// Protect routes - verifies JWT Token
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Not authorized to access this route. No token provided.");
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "super_secret_spirit_of_arabian_jwt_key_2026_luxury_perfume"
    );

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      throw new ApiError(401, "User belonging to this token no longer exists.");
    }

    if (!user.isActive || user.isDeleted) {
      throw new ApiError(403, "Your account has been deactivated or removed. Please contact support.");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, "Invalid or expired authorization token.");
  }
});

// Authorize specific user roles (e.g. 'admin', 'superadmin')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Forbidden. Role '${req.user ? req.user.role : "Guest"}' is not authorized to perform this action.`
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
