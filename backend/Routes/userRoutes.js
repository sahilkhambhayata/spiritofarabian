const express = require("express");
const router = express.Router();

const {
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
} = require("../controllers/userController");

const { protect, authorize } = require("../middleware/authMiddleware");

// ================= PUBLIC AUTH ROUTES =================
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// ================= PRIVATE USER PROFILE ROUTES =================
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.put("/change-password", protect, changePassword);

// ================= ADDRESS MANAGEMENT =================
router.post("/address", protect, addAddress);
router.put("/address/:addressId", protect, updateAddress);
router.delete("/address/:addressId", protect, deleteAddress);

// ================= WISHLIST MANAGEMENT =================
router.post("/wishlist/:productId", protect, toggleWishlist);

// ================= ADMIN ROUTES =================
router.get("/admin/all", protect, authorize("admin", "superadmin"), getAllUsers);
router.put("/admin/:userId", protect, authorize("admin", "superadmin"), updateUserByAdmin);
router.delete("/admin/:userId", protect, authorize("admin", "superadmin"), deleteUserByAdmin);

module.exports = router;
