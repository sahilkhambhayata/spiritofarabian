const SiteSetting = require("../models/settings");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");
const emailService = require("../services/emailService");

// Helper to get or initialize singleton site settings
const getOrCreateSettings = async () => {
  let settings = await SiteSetting.findOne();
  if (!settings) {
    settings = await SiteSetting.create({
      announcementBarText: "Complimentary Pure Velvet Pouch & 3ml Sample on All Orders Above ₹2,999",
      freeShippingThreshold: 1500,
      standardShippingFee: 150,
      supportEmail: "concierge@spiritofarabian.com",
      supportPhone: "+91 98765 43210",
      boutiqueAddress: "The Dubai Mall, Fashion Avenue, Level 2, Downtown Dubai, UAE",
      socialMedia: {
        instagram: { url: "https://instagram.com/spiritofarabian", enabled: true },
        facebook: { url: "https://facebook.com/spiritofarabian", enabled: true },
        youtube: { url: "https://youtube.com/spiritofarabian", enabled: true },
        twitter: { url: "https://x.com/spiritofarabian", enabled: true },
      },
      smtp: {
        host: process.env.SMTP_HOST || "",
        port: Number(process.env.SMTP_PORT) || 587,
        username: process.env.SMTP_USER || "",
        password: process.env.SMTP_PASS || "",
        encryption: process.env.SMTP_SECURE === "true" ? "SSL" : "TLS",
        fromEmail: process.env.SMTP_FROM || "concierge@spiritofarabian.com",
        fromName: "SPIRIT OF ARABIAN — Maison d'Attar",
        isEnabled: Boolean(process.env.SMTP_HOST),
      },
      abandonedCartSettings: {
        isEnabled: true,
        firstReminderDelayHours: 1,
        secondReminderDelayHours: 24,
        maxReminders: 2,
        minCartValue: 0,
        discountCode: "ROYALRESERVE10",
        discountPercent: 10,
        emailSubject: "Your Artisanal Reserve is Waiting at the Atelier",
      },
      faqs: [
        {
          question: "How long do pure artisan attars last on skin?",
          answer: "Because our attars are 100% pure concentrated perfume oils with 0% alcohol, a single swipe lasts 12 to 18+ hours on pulse points.",
          category: "Longevity & Application",
        },
        {
          question: "Are your ingredients ethically and sustainably sourced?",
          answer: "Yes, our wild agarwood and Taif rose harvests follow strict ethical stewardship standards certified across Dubai and India.",
          category: "Heritage & Craft",
        },
      ],
    });
  }
  return settings;
};

// @desc    Get Global Site Settings & FAQs (Public)
// @route   GET /api/settings
// @access  Public
const getSiteSettings = asyncHandler(async (req, res) => {
  const settingsDoc = await getOrCreateSettings();
  const settings = settingsDoc.toObject();

  // Security: Mask SMTP password so it is NEVER exposed to the frontend or public
  if (settings.smtp) {
    const rawPass = settings.smtp.password;
    settings.smtp.hasPassword = Boolean(rawPass && rawPass.length > 0);
    settings.smtp.password = settings.smtp.hasPassword ? "••••••••" : "";
  }

  return ApiResponse.success(res, settings, "Site settings retrieved successfully.");
});

// @desc    Update Site Settings (Admin)
// @route   PUT /api/settings
// @access  Private (Admin)
const updateSiteSettings = asyncHandler(async (req, res) => {
  const currentSettings = await getOrCreateSettings();
  const updateData = { ...req.body };

  // Security: If SMTP password was not altered (masked or empty), preserve existing saved password
  if (updateData.smtp) {
    if (!updateData.smtp.password || updateData.smtp.password === "••••••••") {
      updateData.smtp.password = currentSettings.smtp?.password || "";
    }
  }

  const updatedSettings = await SiteSetting.findByIdAndUpdate(
    currentSettings._id,
    { $set: updateData },
    { returnDocument: "after", runValidators: true }
  );

  const responseObj = updatedSettings.toObject();
  if (responseObj.smtp) {
    responseObj.smtp.hasPassword = Boolean(responseObj.smtp.password);
    responseObj.smtp.password = responseObj.smtp.hasPassword ? "••••••••" : "";
  }

  return ApiResponse.success(res, responseObj, "Site settings updated successfully.");
});

// @desc    Test SMTP Email Configuration (Admin)
// @route   POST /api/settings/test-smtp
// @access  Private (Admin)
const testSmtp = asyncHandler(async (req, res) => {
  const { targetEmail, smtpConfig } = req.body;

  if (!targetEmail) {
    throw new ApiError(400, "Please provide a target email address for verification.");
  }

  // If testing with existing saved config and password is masked, retrieve real password from DB
  let resolvedConfig = null;
  if (smtpConfig) {
    resolvedConfig = { ...smtpConfig };
    if (!resolvedConfig.password || resolvedConfig.password === "••••••••") {
      const current = await SiteSetting.findOne().lean();
      resolvedConfig.password = current?.smtp?.password || "";
    }
  }

  try {
    const result = await emailService.sendTestEmail(targetEmail, resolvedConfig);
    if (!result.success) {
      throw new Error(result.error || "Failed to deliver test email");
    }
    return ApiResponse.success(res, result, `Test verification email dispatched successfully to ${targetEmail}`);
  } catch (err) {
    throw new ApiError(400, `SMTP Connection Error: ${err.message}`);
  }
});

// @desc    Add FAQ (Admin)
// @route   POST /api/settings/faqs
// @access  Private (Admin)
const addFaq = asyncHandler(async (req, res) => {
  const { question, answer, category, orderIndex } = req.body;

  if (!question || !answer) {
    throw new ApiError(400, "Please provide question and answer.");
  }

  const settings = await getOrCreateSettings();

  settings.faqs.push({
    question: question.trim(),
    answer: answer.trim(),
    category: category ? category.trim() : "General",
    orderIndex: typeof orderIndex === "number" ? orderIndex : 0,
    isActive: true,
  });

  await settings.save();

  return ApiResponse.created(res, settings.faqs, "FAQ added successfully.");
});

// @desc    Delete FAQ (Admin)
// @route   DELETE /api/settings/faqs/:faqId
// @access  Private (Admin)
const deleteFaq = asyncHandler(async (req, res) => {
  const { faqId } = req.params;

  const settings = await getOrCreateSettings();
  settings.faqs = settings.faqs.filter((f) => f._id.toString() !== faqId);

  await settings.save();

  return ApiResponse.success(res, settings.faqs, "FAQ removed successfully.");
});

module.exports = {
  getSiteSettings,
  updateSiteSettings,
  testSmtp,
  addFaq,
  deleteFaq,
};
