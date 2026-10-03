const Concierge = require("../models/concierge");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Submit a VIP Consultation or Scent Quiz Inquiry
// @route   POST /api/concierge
// @access  Public
const submitInquiry = asyncHandler(async (req, res) => {
  const { name, email, phone, preferredScent, preferredDate, notes, type, quizResponses } = req.body;

  if (!name || !email || !phone) {
    throw new ApiError(400, "Please provide your name, email address, and phone number.");
  }

  const inquiry = await Concierge.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    preferredScent: preferredScent ? preferredScent.trim() : "Oud Impérial",
    preferredDate: preferredDate ? new Date(preferredDate) : undefined,
    notes: notes ? notes.trim() : "",
    type: type || "Private Fragrance Consultation",
    quizResponses: quizResponses || null,
    status: "New",
  });

  return ApiResponse.created(
    res,
    inquiry,
    "Your private fragrance consultation inquiry has been received. Our Master Perfumer will contact you shortly."
  );
});

// @desc    Get Inquiries submitted by logged in customer
// @route   GET /api/concierge/my-inquiries
// @access  Private (Customer)
const getMyInquiries = asyncHandler(async (req, res) => {
  const inquiries = await Concierge.find({
    email: req.user.email.toLowerCase(),
    isDeleted: false,
  }).sort({ createdAt: -1 });

  return ApiResponse.success(res, inquiries, "My consultation inquiries retrieved successfully.");
});

// @desc    Get All Inquiries for Admin (Pagination & Filters)
// @route   GET /api/concierge/admin/all
// @access  Private (Admin)
const getAdminInquiries = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const { search, status, type } = req.query;

  const query = { isDeleted: false };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { preferredScent: { $regex: search, $options: "i" } },
    ];
  }

  if (status) query.status = status;
  if (type) query.type = type;

  const [inquiries, total] = await Promise.all([
    Concierge.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Concierge.countDocuments(query),
  ]);

  return ApiResponse.success(
    res,
    {
      inquiries,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    },
    "Admin inquiries retrieved successfully."
  );
});

// @desc    Get Single Inquiry by ID (Admin)
// @route   GET /api/concierge/admin/:id
// @access  Private (Admin)
const getInquiryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const inquiry = await Concierge.findById(id);
  if (!inquiry || inquiry.isDeleted) {
    throw new ApiError(404, "Inquiry not found.");
  }

  return ApiResponse.success(res, inquiry, "Inquiry details retrieved successfully.");
});

// @desc    Update Inquiry Status & Admin Notes (Admin)
// @route   PUT /api/concierge/admin/:id
// @access  Private (Admin)
const updateInquiry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, adminNotes, assignedMasterPerfumer, preferredDate } = req.body;

  const inquiry = await Concierge.findById(id);
  if (!inquiry || inquiry.isDeleted) {
    throw new ApiError(404, "Inquiry not found.");
  }

  if (status) inquiry.status = status;
  if (adminNotes !== undefined) inquiry.adminNotes = adminNotes.trim();
  if (assignedMasterPerfumer) inquiry.assignedMasterPerfumer = assignedMasterPerfumer.trim();
  if (preferredDate) inquiry.preferredDate = new Date(preferredDate);

  await inquiry.save();

  return ApiResponse.success(res, inquiry, `Inquiry updated successfully to '${inquiry.status}'.`);
});

// @desc    Delete Inquiry (Admin Soft Delete)
// @route   DELETE /api/concierge/admin/:id
// @access  Private (Admin)
const deleteInquiry = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const inquiry = await Concierge.findById(id);
  if (!inquiry || inquiry.isDeleted) {
    throw new ApiError(404, "Inquiry not found.");
  }

  inquiry.isDeleted = true;
  await inquiry.save();

  return ApiResponse.success(res, null, "Inquiry deleted successfully.");
});

module.exports = {
  submitInquiry,
  getMyInquiries,
  getAdminInquiries,
  getInquiryById,
  updateInquiry,
  deleteInquiry,
};
