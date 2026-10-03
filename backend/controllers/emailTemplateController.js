const EmailTemplate = require("../models/emailTemplate");
const DEFAULT_EMAIL_TEMPLATES = require("../data/defaultEmailTemplates");
const emailService = require("../services/emailService");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

// Helper: Seed templates if collection is empty
const ensureTemplatesSeeded = async () => {
  const count = await EmailTemplate.countDocuments();
  if (count === 0) {
    await EmailTemplate.insertMany(DEFAULT_EMAIL_TEMPLATES);
  } else {
    // Check if any default template is missing and insert it
    for (const def of DEFAULT_EMAIL_TEMPLATES) {
      const exists = await EmailTemplate.findOne({ templateKey: def.templateKey });
      if (!exists) {
        await EmailTemplate.create(def);
      }
    }
  }
};

// @desc    Get all Email Templates (Admin)
// @route   GET /api/email-templates
// @access  Private (Admin)
const getAllTemplates = asyncHandler(async (req, res) => {
  await ensureTemplatesSeeded();
  const templates = await EmailTemplate.find().sort({ category: 1, name: 1 });
  return ApiResponse.success(res, templates, "Email templates retrieved successfully.");
});

// @desc    Get Single Template by Key (Admin)
// @route   GET /api/email-templates/:key
// @access  Private (Admin)
const getTemplateByKey = asyncHandler(async (req, res) => {
  const { key } = req.params;
  await ensureTemplatesSeeded();

  const template = await EmailTemplate.findOne({ templateKey: key });
  if (!template) {
    throw new ApiError(404, `Email template '${key}' not found.`);
  }

  return ApiResponse.success(res, template, "Email template retrieved successfully.");
});

// @desc    Update Email Template (Admin)
// @route   PUT /api/email-templates/:key
// @access  Private (Admin)
const updateTemplate = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const { subject, heading, body, buttonText, buttonUrl, isEnabled, recipient } = req.body;

  let template = await EmailTemplate.findOne({ templateKey: key });
  if (!template) {
    throw new ApiError(404, `Email template '${key}' not found.`);
  }

  if (subject !== undefined) template.subject = subject.trim();
  if (heading !== undefined) template.heading = heading.trim();
  if (body !== undefined) template.body = body;
  if (buttonText !== undefined) template.buttonText = buttonText.trim();
  if (buttonUrl !== undefined) template.buttonUrl = buttonUrl.trim();
  if (isEnabled !== undefined) template.isEnabled = isEnabled;
  if (recipient !== undefined) template.recipient = recipient;

  await template.save();

  return ApiResponse.success(res, template, `Template '${template.name}' updated successfully.`);
});

// @desc    Send Test Email for Specific Template (Admin)
// @route   POST /api/email-templates/:key/test
// @access  Private (Admin)
const sendTestTemplateEmail = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const { targetEmail, customConfig } = req.body;

  if (!targetEmail) {
    throw new ApiError(400, "Please provide a recipient email address.");
  }

  let template = await EmailTemplate.findOne({ templateKey: key });
  if (!template) {
    template = DEFAULT_EMAIL_TEMPLATES.find((t) => t.templateKey === key);
  }

  if (!template) {
    throw new ApiError(404, "Template not found.");
  }

  // Use custom payload overrides if passed from the live editor
  const finalSubject = customConfig?.subject || template.subject;
  const finalHeading = customConfig?.heading || template.heading;
  const finalBody = customConfig?.body || template.body;
  const finalBtnText = customConfig?.buttonText || template.buttonText;
  const finalBtnUrl = customConfig?.buttonUrl || template.buttonUrl;

  // Replace mock merge tags
  const mockReplacements = {
    "{{customerName}}": "Lord Alexandre Vance",
    "{{customerEmail}}": targetEmail,
    "{{customerPhone}}": "+91 98765 43210",
    "{{orderNumber}}": "SOA-88492",
    "{{totalAmount}}": "₹4,200",
    "{{subTotal}}": "₹4,200",
    "{{paymentMethod}}": "Prepaid UPI (Razorpay)",
    "{{paymentDate}}": new Date().toLocaleString("en-IN"),
    "{{transactionId}}": "TXN-SOA-992144",
    "{{failureReason}}": "Bank payment gateway timeout",
    "{{newStatus}}": "Shipped & Dispatched",
    "{{previousStatus}}": "Distilling & Bottling",
    "{{cancellationReason}}": "Patron requested fragrance change",
    "{{courierName}}": "BlueDart Insured Air",
    "{{trackingNumber}}": "BD-982184912",
    "{{otpCode}}": "849201",
    "{{resetUrl}}": `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=mock_test_token_2026`,
    "{{trackOrderUrl}}": `${process.env.FRONTEND_URL || "http://localhost:5173"}/track-order?order=SOA-88492`,
    "{{checkoutUrl}}": `${process.env.FRONTEND_URL || "http://localhost:5173"}/checkout`,
    "{{frontendUrl}}": process.env.FRONTEND_URL || "http://localhost:5173",
    "{{shippingAddress}}": "The Penthouse Suite, Altamount Road, Mumbai, Maharashtra - 400026",
    "{{shippingCity}}": "Mumbai",
    "{{shippingState}}": "Maharashtra",
    "{{itemsCount}}": "2",
    "{{discountCode}}": "ROYALRESERVE10",
    "{{discountPercent}}": "10",
    "{{recoveryUrl}}": `${process.env.FRONTEND_URL || "http://localhost:5173"}/cart?recovery=mock_token&coupon=ROYALRESERVE10`,
    "{{orderSummaryTable}}": `
      <div style="background: rgba(0,0,0,0.35); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 14px; padding: 18px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #e5dec9;">
          <thead>
            <tr style="border-bottom: 1px solid rgba(212, 175, 55, 0.2); color: rgba(243, 229, 171, 0.7); font-size: 11px; text-transform: uppercase;">
              <th style="text-align: left; padding: 6px;">Flacon</th>
              <th style="text-align: center; padding: 6px;">Qty</th>
              <th style="text-align: right; padding: 6px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <td style="padding: 8px 6px; color: #f3e5ab; font-weight: 600;">Taif Rose Sublime (6ml)</td>
              <td style="padding: 8px 6px; text-align: center;">1</td>
              <td style="padding: 8px 6px; text-align: right; color: #f3e5ab;">₹4,200</td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
    "{{cartItemsBox}}": `
      <div style="background: rgba(0,0,0,0.35); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 14px; padding: 18px; margin: 20px 0;">
        <div style="display: flex; justify-content: space-between; padding: 6px 0; color: #f3e5ab; font-weight: 600;">
          <span>Musc Impérial (6ml Flacon) × 1</span>
          <span>₹4,200</span>
        </div>
      </div>
    `,
    "{{trackingBox}}": `
      <div style="background: rgba(0,0,0,0.35); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 14px; padding: 16px; margin: 20px 0; font-size: 13px;">
        <div style="font-size: 11px; font-weight: 700; color: #d4af37; margin-bottom: 6px;">LIVE AIR LOGISTICS</div>
        <div><strong>Courier:</strong> BlueDart Express Insured</div>
        <div><strong>AWB Number:</strong> <span style="font-family: monospace; color: #f3e5ab;">BD-982184912</span></div>
      </div>
    `,
  };

  let renderedSubject = finalSubject;
  let renderedHeading = finalHeading;
  let renderedBody = finalBody;
  let renderedBtnUrl = finalBtnUrl;

  Object.entries(mockReplacements).forEach(([keyTag, val]) => {
    renderedSubject = renderedSubject.split(keyTag).join(val);
    renderedHeading = renderedHeading.split(keyTag).join(val);
    renderedBody = renderedBody.split(keyTag).join(val);
    renderedBtnUrl = renderedBtnUrl.split(keyTag).join(val);
  });

  const btnHtml = finalBtnText
    ? `<div style="text-align: center; margin: 32px 0;"><a href="${renderedBtnUrl}" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #aa820a 100%); color: #06100c !important; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 0.12em; text-decoration: none; padding: 14px 34px; border-radius: 9999px;">${finalBtnText}</a></div>`
    : "";

  const contentHtml = `
    ${renderedHeading ? `<h2 style="color: #f3e5ab; font-size: 22px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">${renderedHeading}</h2>` : ""}
    <div style="line-height: 1.65; font-size: 14px; color: #e5dec9;">
      ${renderedBody}
    </div>
    ${btnHtml}
  `;

  const { getEmailLayout } = require("../services/emailService");
  const fullHtml = getEmailLayout(renderedSubject, contentHtml);

  const result = await emailService.sendEmail({
    to: targetEmail,
    subject: `[TEST PREVIEW] ${renderedSubject}`,
    html: fullHtml,
  });

  return ApiResponse.success(res, result, `Test preview email dispatched to ${targetEmail}`);
});

// @desc    Reset all or single template to factory defaults (Admin)
// @route   POST /api/email-templates/reset-defaults
// @access  Private (Admin)
const resetTemplatesToDefaults = asyncHandler(async (req, res) => {
  const { key } = req.body;

  if (key) {
    const defaultData = DEFAULT_EMAIL_TEMPLATES.find((t) => t.templateKey === key);
    if (!defaultData) {
      throw new ApiError(404, "Default template not found.");
    }
    await EmailTemplate.findOneAndUpdate({ templateKey: key }, { $set: defaultData }, { upsert: true });
    return ApiResponse.success(res, null, `Template '${key}' reset to master defaults.`);
  }

  for (const def of DEFAULT_EMAIL_TEMPLATES) {
    await EmailTemplate.findOneAndUpdate({ templateKey: def.templateKey }, { $set: def }, { upsert: true });
  }

  return ApiResponse.success(res, null, "All email templates reset to master luxury defaults.");
});

module.exports = {
  getAllTemplates,
  getTemplateByKey,
  updateTemplate,
  sendTestTemplateEmail,
  resetTemplatesToDefaults,
};
