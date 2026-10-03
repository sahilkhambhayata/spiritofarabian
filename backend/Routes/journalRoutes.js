const express = require("express");
const router = express.Router();

const {
  getAllArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
} = require("../controllers/journalController");

const { protect, authorize } = require("../middleware/authMiddleware");

// Public
router.get("/", getAllArticles);
router.get("/:slug", getArticleBySlug);

// Admin
router.post("/", protect, authorize("admin", "superadmin"), createArticle);
router.put("/:id", protect, authorize("admin", "superadmin"), updateArticle);
router.delete("/:id", protect, authorize("admin", "superadmin"), deleteArticle);

module.exports = router;
