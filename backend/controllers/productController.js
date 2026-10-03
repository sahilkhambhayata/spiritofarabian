const Product = require("../models/product");
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

// @desc    Create a new Product (Single Attar, Combo, Gift Box, Discovery Set)
// @route   POST /api/products
// @access  Private (Admin)
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    slug,
    arabicName,
    tagline,
    shortDescription,
    description,
    brand,
    category,
    subCategory,
    productType,
    fragrance,
    notes,
    ingredients,
    variants,
    bundle,
    images,
    videos,
    tags,
    badge,
    isFeatured,
    isBestSeller,
    isNewArrival,
    isLimitedEdition,
    relatedProducts,
    seo,
  } = req.body;

  if (!name || !description || !category) {
    throw new ApiError(400, "Please provide product name, description, and category.");
  }

  // Verify category exists
  const categoryExists = await Category.findOne({ _id: category, isDeleted: false });
  if (!categoryExists) {
    throw new ApiError(404, "Selected category does not exist.");
  }

  const finalSlug = slug ? slugify(slug) : slugify(name);

  // Check unique slug (excluding deleted)
  const existingProduct = await Product.findOne({ slug: finalSlug, isDeleted: false });
  if (existingProduct) {
    throw new ApiError(400, `A product with slug '${finalSlug}' already exists.`);
  }

  // Ensure variants exist or provide default
  let processedVariants = variants;
  if (!variants || !Array.isArray(variants) || variants.length === 0) {
    processedVariants = [
      {
        size: 6,
        unit: "ml",
        label: "6ml",
        price: req.body.price || 999,
        compareAtPrice: req.body.compareAtPrice || null,
        isDefault: true,
        isActive: true,
      },
    ];
  } else {
    // Ensure at least one default variant
    const hasDefault = processedVariants.some((v) => v.isDefault);
    if (!hasDefault && processedVariants.length > 0) {
      processedVariants[0].isDefault = true;
    }
  }

  const product = await Product.create({
    name: name.trim(),
    slug: finalSlug,
    arabicName: arabicName ? arabicName.trim() : undefined,
    tagline: tagline ? tagline.trim() : undefined,
    shortDescription: shortDescription ? shortDescription.trim() : undefined,
    description,
    brand: brand ? brand.trim() : "Spirit of Arabian",
    category,
    subCategory: subCategory || null,
    productType: productType || "single_attar",
    fragrance: fragrance || {},
    notes: notes || { top: [], heart: [], base: [] },
    ingredients: ingredients || [],
    variants: processedVariants,
    bundle: bundle || { isCustomizable: false, maxItems: 0, includedProducts: [] },
    images: images || [],
    videos: videos || [],
    tags: tags || [],
    badge: badge ? badge.trim() : undefined,
    isFeatured: Boolean(isFeatured),
    isBestSeller: Boolean(isBestSeller),
    isNewArrival: Boolean(isNewArrival),
    isLimitedEdition: Boolean(isLimitedEdition),
    relatedProducts: relatedProducts || [],
    seo: seo || {},
  });

  return ApiResponse.created(res, product, "Product created successfully.");
});

// @desc    Get all active Products with rich filtering & sorting (Storefront)
// @route   GET /api/products
// @access  Public
const getAllProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const skip = (page - 1) * limit;

  const {
    category,
    productType,
    fragranceFamily,
    gender,
    minPrice,
    maxPrice,
    search,
    isFeatured,
    isBestSeller,
    isNewArrival,
    sort,
  } = req.query;

  const query = { isActive: true, isDeleted: false };

  // Category filter by ID or slug
  if (category) {
    if (category.match(/^[0-9a-fA-F]{24}$/)) {
      query.category = category;
    } else {
      const catDoc = await Category.findOne({ slug: category.toLowerCase().trim(), isDeleted: false });
      if (catDoc) query.category = catDoc._id;
    }
  }

  // Product type filter (single_attar, combo, gift_box, discovery_set)
  if (productType) {
    query.productType = productType;
  }

  // Fragrance family filter (Oud, Floral, Musk, Woody, etc.)
  if (fragranceFamily) {
    query["fragrance.family"] = { $regex: new RegExp(`^${fragranceFamily}$`, "i") };
  }

  // Gender filter (Men, Women, Unisex)
  if (gender) {
    query["fragrance.gender"] = { $regex: new RegExp(`^${gender}$`, "i") };
  }

  // Boolean flags
  if (isFeatured === "true") query.isFeatured = true;
  if (isBestSeller === "true") query.isBestSeller = true;
  if (isNewArrival === "true") query.isNewArrival = true;

  // Price range filter on variants
  if (minPrice || maxPrice) {
    query["variants.price"] = {};
    if (minPrice) query["variants.price"].$gte = Number(minPrice);
    if (maxPrice) query["variants.price"].$lte = Number(maxPrice);
  }

  // Search keyword across name, arabicName, tagline, description, tags, notes
  if (search) {
    const searchRegex = { $regex: search, $options: "i" };
    query.$or = [
      { name: searchRegex },
      { arabicName: searchRegex },
      { tagline: searchRegex },
      { tags: searchRegex },
      { "notes.top": searchRegex },
      { "notes.heart": searchRegex },
      { "notes.base": searchRegex },
    ];
  }

  // Sorting
  let sortOption = { createdAt: -1 };
  if (sort === "price_asc") sortOption = { "variants.price": 1 };
  else if (sort === "price_desc") sortOption = { "variants.price": -1 };
  else if (sort === "rating") sortOption = { "rating.average": -1, "rating.count": -1 };
  else if (sort === "popular" || sort === "bestseller") sortOption = { isBestSeller: -1, createdAt: -1 };
  else if (sort === "newest") sortOption = { createdAt: -1 };

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate("category", "name slug")
      .sort(sortOption)
      .skip(skip)
      .limit(limit),
    Product.countDocuments(query),
  ]);

  return ApiResponse.success(
    res,
    {
      products,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    },
    "Products retrieved successfully."
  );
});

// @desc    Get Product by Slug (Public)
// @route   GET /api/products/:slug
// @access  Public
const getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const product = await Product.findOne({
    slug: slug.toLowerCase().trim(),
    isActive: true,
    isDeleted: false,
  })
    .populate("category", "name slug description bannerImage")
    .populate("bundle.includedProducts.productId", "name slug images variants notes fragrance")
    .populate("relatedProducts", "name slug images variants rating isBestSeller badge");

  if (!product) {
    throw new ApiError(404, `Product '${slug}' not found.`);
  }

  return ApiResponse.success(res, product, "Product details retrieved successfully.");
});

// @desc    Get Featured, Bestsellers & New Arrivals (Homepage fast load)
// @route   GET /api/products/showcase/featured
// @access  Public
const getShowcaseProducts = asyncHandler(async (req, res) => {
  const [featured, bestSellers, newArrivals, combos] = await Promise.all([
    Product.find({ isFeatured: true, isActive: true, isDeleted: false })
      .populate("category", "name slug")
      .limit(8),
    Product.find({ isBestSeller: true, isActive: true, isDeleted: false })
      .populate("category", "name slug")
      .limit(8),
    Product.find({ isNewArrival: true, isActive: true, isDeleted: false })
      .populate("category", "name slug")
      .limit(8),
    Product.find({
      productType: { $in: ["combo", "gift_box", "discovery_set"] },
      isActive: true,
      isDeleted: false,
    })
      .populate("category", "name slug")
      .limit(8),
  ]);

  return ApiResponse.success(
    res,
    { featured, bestSellers, newArrivals, combos },
    "Showcase products retrieved successfully."
  );
});

// @desc    Get all Products for Admin (with search, category, status & low stock)
// @route   GET /api/products/admin/all
// @access  Private (Admin)
const getAdminProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const { search, category, productType, status } = req.query;

  const query = { isDeleted: false };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
      { "variants.sku": { $regex: search, $options: "i" } },
    ];
  }

  if (category) query.category = category;
  if (productType) query.productType = productType;
  if (status === "active") query.isActive = true;
  if (status === "inactive") query.isActive = false;

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(query),
  ]);

  return ApiResponse.success(
    res,
    {
      products,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    },
    "Admin products retrieved successfully."
  );
});

// @desc    Get Product by ID (Admin)
// @route   GET /api/products/admin/:id
// @access  Private (Admin)
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id)
    .populate("category", "name slug")
    .populate("bundle.includedProducts.productId", "name slug");

  if (!product || product.isDeleted) {
    throw new ApiError(404, "Product not found.");
  }

  return ApiResponse.success(res, product, "Product retrieved successfully.");
});

// @desc    Update Product
// @route   PUT /api/products/:id
// @access  Private (Admin)
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product || product.isDeleted) {
    throw new ApiError(404, "Product not found.");
  }

  // If category changed, verify it exists
  if (req.body.category && req.body.category !== product.category.toString()) {
    const catDoc = await Category.findOne({ _id: req.body.category, isDeleted: false });
    if (!catDoc) throw new ApiError(404, "Selected category does not exist.");
  }

  // If slug changed, ensure uniqueness
  if (req.body.slug && slugify(req.body.slug) !== product.slug) {
    const newSlug = slugify(req.body.slug);
    const duplicate = await Product.findOne({ _id: { $ne: id }, slug: newSlug, isDeleted: false });
    if (duplicate) {
      throw new ApiError(400, `Product slug '${newSlug}' is already taken.`);
    }
    req.body.slug = newSlug;
  }

  // Update product fields
  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    { $set: req.body },
    { returnDocument: "after", runValidators: true }
  );

  return ApiResponse.success(res, updatedProduct, "Product updated successfully.");
});

// @desc    Quick toggle Product Flag (isActive, isFeatured, isBestSeller, isNewArrival)
// @route   PATCH /api/products/:id/flag
// @access  Private (Admin)
const toggleProductFlag = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { flag } = req.body; // e.g. "isActive", "isFeatured", "isBestSeller", "isNewArrival"

  const allowedFlags = ["isActive", "isFeatured", "isBestSeller", "isNewArrival", "isLimitedEdition"];
  if (!allowedFlags.includes(flag)) {
    throw new ApiError(400, `Invalid flag '${flag}'. Allowed: ${allowedFlags.join(", ")}`);
  }

  const product = await Product.findById(id);
  if (!product || product.isDeleted) {
    throw new ApiError(404, "Product not found.");
  }

  product[flag] = !product[flag];
  await product.save();

  return ApiResponse.success(
    res,
    { _id: product._id, name: product.name, [flag]: product[flag] },
    `Product flag '${flag}' updated to ${product[flag]}.`
  );
});

// @desc    Delete Product (Soft Delete)
// @route   DELETE /api/products/:id
// @access  Private (Admin)
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product || product.isDeleted) {
    throw new ApiError(404, "Product not found.");
  }

  product.isDeleted = true;
  product.isActive = false;
  await product.save();

  return ApiResponse.success(res, null, "Product deleted successfully.");
});

module.exports = {
  createProduct,
  getAllProducts,
  getProductBySlug,
  getShowcaseProducts,
  getAdminProducts,
  getProductById,
  updateProduct,
  toggleProductFlag,
  deleteProduct,
};
