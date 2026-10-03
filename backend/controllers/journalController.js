const Journal = require("../models/blog");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// @desc    Get all published Journal Articles (Public)
// @route   GET /api/journal
// @access  Public
const getAllArticles = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const [articles, total] = await Promise.all([
    Journal.find({ isPublished: true, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Journal.countDocuments({ isPublished: true, isDeleted: false }),
  ]);

  return ApiResponse.success(
    res,
    {
      articles,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    },
    "Journal articles retrieved successfully."
  );
});

// @desc    Get Single Journal Article by Slug (Public)
// @route   GET /api/journal/:slug
// @access  Public
const getArticleBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const article = await Journal.findOne({
    slug: slug.toLowerCase().trim(),
    isPublished: true,
    isDeleted: false,
  });

  if (!article) {
    throw new ApiError(404, `Journal article '${slug}' not found.`);
  }

  return ApiResponse.success(res, article, "Article details retrieved successfully.");
});

// @desc    Create Journal Article (Admin)
// @route   POST /api/journal
// @access  Private (Admin)
const createArticle = asyncHandler(async (req, res) => {
  const { title, slug, excerpt, content, coverImage, author, category, tags, readTime, isPublished } = req.body;

  if (!title || !excerpt || !content || !coverImage) {
    throw new ApiError(400, "Please provide title, excerpt, content, and coverImage.");
  }

  const finalSlug = slug ? slugify(slug) : slugify(title);

  const existing = await Journal.findOne({ slug: finalSlug, isDeleted: false });
  if (existing) {
    throw new ApiError(400, `Article with slug '${finalSlug}' already exists.`);
  }

  const article = await Journal.create({
    title: title.trim(),
    slug: finalSlug,
    excerpt: excerpt.trim(),
    content,
    coverImage: coverImage.trim(),
    author: author ? author.trim() : "Master Perfumer",
    category: category ? category.trim() : "Artisan Heritage",
    tags: tags || [],
    readTime: readTime ? readTime.trim() : "4 min read",
    isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
  });

  return ApiResponse.created(res, article, "Journal article published successfully.");
});

// @desc    Update Journal Article (Admin)
// @route   PUT /api/journal/:id
// @access  Private (Admin)
const updateArticle = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.body.slug) req.body.slug = slugify(req.body.slug);

  const article = await Journal.findByIdAndUpdate(
    id,
    { $set: req.body },
    { returnDocument: "after", runValidators: true }
  );

  if (!article || article.isDeleted) {
    throw new ApiError(404, "Article not found.");
  }

  return ApiResponse.success(res, article, "Journal article updated successfully.");
});

// @desc    Delete Journal Article (Admin Soft Delete)
// @route   DELETE /api/journal/:id
// @access  Private (Admin)
const deleteArticle = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const article = await Journal.findById(id);
  if (!article || article.isDeleted) {
    throw new ApiError(404, "Article not found.");
  }

  article.isDeleted = true;
  article.isPublished = false;
  await article.save();

  return ApiResponse.success(res, null, "Journal article deleted successfully.");
});

module.exports = {
  getAllArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
};
