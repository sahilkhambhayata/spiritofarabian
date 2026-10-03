const express = require("express");
const router = express.Router();

const {
  getAllPolicies,
  getPolicyByIdentifier,
  upsertPolicy,
  deletePolicy,
} = require("../controllers/informationController");

const { protect, authorize } = require("../middleware/authMiddleware");

// Public routes
router.get("/", getAllPolicies);
router.get("/:identifier", getPolicyByIdentifier);

// Admin routes
router.post("/", protect, authorize("admin", "superadmin"), upsertPolicy);
router.delete("/:id", protect, authorize("admin", "superadmin"), deletePolicy);

module.exports = router;
