const express = require("express");
const router = express.Router();

const {
  createProduct,
  getAllProducts,
  getProductBySlug,
  getShowcaseProducts,
  getAdminProducts,
  getProductById,
  updateProduct,
  toggleProductFlag,
  deleteProduct,
} = require("../controllers/productController");

const { protect, authorize } = require("../middleware/authMiddleware");

// ================= PUBLIC STOREFRONT ROUTES =================
router.get("/", getAllProducts);
router.get("/showcase/featured", getShowcaseProducts);
router.get("/:slug", getProductBySlug);

// ================= ADMIN ROUTES =================
router.post("/", protect, authorize("admin", "superadmin"), createProduct);
router.get("/admin/all", protect, authorize("admin", "superadmin"), getAdminProducts);
router.get("/admin/:id", protect, authorize("admin", "superadmin"), getProductById);
router.put("/:id", protect, authorize("admin", "superadmin"), updateProduct);
router.patch("/:id/flag", protect, authorize("admin", "superadmin"), toggleProductFlag);
router.delete("/:id", protect, authorize("admin", "superadmin"), deleteProduct);

module.exports = router;
