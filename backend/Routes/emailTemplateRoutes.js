const express = require("express");
const router = express.Router();
const {
  getAllTemplates,
  getTemplateByKey,
  updateTemplate,
  sendTestTemplateEmail,
  resetTemplatesToDefaults,
} = require("../controllers/emailTemplateController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Admin Protected Routes
router.get("/", protect, authorize("admin", "superadmin"), getAllTemplates);
router.get("/:key", protect, authorize("admin", "superadmin"), getTemplateByKey);
router.put("/:key", protect, authorize("admin", "superadmin"), updateTemplate);
router.post("/:key/test", protect, authorize("admin", "superadmin"), sendTestTemplateEmail);
router.post("/reset-defaults", protect, authorize("admin", "superadmin"), resetTemplatesToDefaults);

module.exports = router;
