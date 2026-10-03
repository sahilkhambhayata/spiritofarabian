const express = require("express");
const router = express.Router();

const {
  createCategory,
  getAllCategories,
  getCategoryBySlug,
  getAdminCategories,
  getCategoryById,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
} = require("../controllers/categoryController");

const { protect, authorize } = require("../middleware/authMiddleware");

// ================= PUBLIC ROUTES =================
router.get("/", getAllCategories);
router.get("/:slug", getCategoryBySlug);

// ================= ADMIN ROUTES =================
router.post("/", protect, authorize("admin", "superadmin"), createCategory);
router.get("/admin/all", protect, authorize("admin", "superadmin"), getAdminCategories);
router.get("/admin/:id", protect, authorize("admin", "superadmin"), getCategoryById);
router.put("/:id", protect, authorize("admin", "superadmin"), updateCategory);
router.patch("/:id/status", protect, authorize("admin", "superadmin"), toggleCategoryStatus);
router.delete("/:id", protect, authorize("admin", "superadmin"), deleteCategory);

module.exports = router;
