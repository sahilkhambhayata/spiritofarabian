const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const { uploadSingle, uploadMultiple } = require("../controllers/uploadController");

// Public/Admin upload endpoints
router.post("/single", upload.single("file"), uploadSingle);
router.post("/image", upload.single("image"), uploadSingle);
router.post("/multiple", upload.array("files", 10), uploadMultiple);
router.post("/images", upload.array("images", 10), uploadMultiple);

module.exports = router;
