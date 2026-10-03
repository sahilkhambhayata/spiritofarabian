const Category = require("../models/category");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

// Helper to slugify string
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// @desc    Create a new Category
// @route   POST /api/categories
// @access  Private (Admin)
const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, description, bannerImage, icon, orderIndex, isActive } = req.body;

  if (!name) {
    throw new ApiError(400, "Category name is required.");
  }

  const finalSlug = slug ? slugify(slug) : slugify(name);

  // Check if name or slug already exists (excluding soft-deleted)
  const existingCategory = await Category.findOne({
    $or: [{ name: { $regex: new RegExp(`^${name.trim()}$`, "i") } }, { slug: finalSlug }],
    isDeleted: false,
  });

  if (existingCategory) {
    throw new ApiError(400, `Category with name '${name}' or slug '${finalSlug}' already exists.`);
  }

  const category = await Category.create({
    name: name.trim(),
    slug: finalSlug,
    description: description ? description.trim() : "",
    bannerImage: bannerImage || "",
    icon: icon || "",
    orderIndex: typeof orderIndex === "number" ? orderIndex : 0,
    isActive: isActive !== undefined ? isActive : true,
  });

  return ApiResponse.created(res, category, "Category created successfully.");
});

// @desc    Get all active Categories (Public for Storefront)
// @route   GET /api/categories
// @access  Public
const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({
    isActive: true,
    isDeleted: false,
  }).sort({ orderIndex: 1, createdAt: 1 });

  return ApiResponse.success(res, categories, "Categories retrieved successfully.");
});

// @desc    Get Category by Slug (Public)
// @route   GET /api/categories/:slug
// @access  Public
const getCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const category = await Category.findOne({
    slug: slug.toLowerCase().trim(),
    isActive: true,
    isDeleted: false,
  });

  if (!category) {
    throw new ApiError(404, `Category '${slug}' not found.`);
  }

  return ApiResponse.success(res, category, "Category details retrieved successfully.");
});

// @desc    Get all Categories for Admin (with pagination & search)
// @route   GET /api/categories/admin/all
// @access  Private (Admin)
const getAdminCategories = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  const search = req.query.search || "";
  const status = req.query.status;

  const query = { isDeleted: false };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
    ];
  }

  if (status === "active") query.isActive = true;
  if (status === "inactive") query.isActive = false;

  const [categories, total] = await Promise.all([
    Category.find(query).sort({ orderIndex: 1, createdAt: -1 }).skip(skip).limit(limit),
    Category.countDocuments(query),
  ]);

  return ApiResponse.success(
    res,
    {
      categories,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    },
    "Admin categories retrieved successfully."
  );
});

// @desc    Get Category by ID (Admin)
// @route   GET /api/categories/admin/:id
// @access  Private (Admin)
const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category || category.isDeleted) {
    throw new ApiError(404, "Category not found.");
  }

  return ApiResponse.success(res, category, "Category fetched successfully.");
});

// @desc    Update Category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, slug, description, bannerImage, icon, orderIndex, isActive } = req.body;

  const category = await Category.findById(id);
  if (!category || category.isDeleted) {
    throw new ApiError(404, "Category not found.");
  }

  if (name) category.name = name.trim();
  if (slug) category.slug = slugify(slug);
  if (description !== undefined) category.description = description.trim();
  if (bannerImage !== undefined) category.bannerImage = bannerImage;
  if (icon !== undefined) category.icon = icon;
  if (orderIndex !== undefined) category.orderIndex = Number(orderIndex);
  if (isActive !== undefined) category.isActive = Boolean(isActive);

  // Check unique constraints for name and slug on update
  const duplicate = await Category.findOne({
    _id: { $ne: id },
    $or: [{ name: category.name }, { slug: category.slug }],
    isDeleted: false,
  });

  if (duplicate) {
    throw new ApiError(400, "Another category already exists with this name or slug.");
  }

  await category.save();

  return ApiResponse.success(res, category, "Category updated successfully.");
});

// @desc    Toggle Category Status (Active/Inactive)
// @route   PATCH /api/categories/:id/status
// @access  Private (Admin)
const toggleCategoryStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category || category.isDeleted) {
    throw new ApiError(404, "Category not found.");
  }

  category.isActive = !category.isActive;
  await category.save();

  return ApiResponse.success(
    res,
    { _id: category._id, name: category.name, isActive: category.isActive },
    `Category status changed to ${category.isActive ? "Active" : "Inactive"}.`
  );
});

// @desc    Delete Category (Soft Delete)
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category || category.isDeleted) {
    throw new ApiError(404, "Category not found.");
  }

  category.isDeleted = true;
  category.isActive = false;
  await category.save();

  return ApiResponse.success(res, null, "Category deleted successfully.");
});

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryBySlug,
  getAdminCategories,
  getCategoryById,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
};
