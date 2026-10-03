const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    // =========================================================
    // BASIC PRODUCT INFORMATION
    // =========================================================

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    arabicName: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    tagline: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    shortDescription: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    description: {
      type: String,
      required: true,
    },

    // =========================================================
    // BRAND
    // =========================================================

    brand: {
      type: String,
      default: "Spirit of Arabian",
      trim: true,
    },

    // =========================================================
    // CATEGORY
    // =========================================================

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    // =========================================================
    // PRODUCT TYPE
    // =========================================================

    productType: {
      type: String,
      enum: ["single_attar", "combo", "gift_box", "discovery_set"],
      default: "single_attar",
      index: true,
    },

    // =========================================================
    // FRAGRANCE INFORMATION
    // =========================================================

    fragrance: {
      family: {
        type: String,
        enum: [
          "Oud",
          "Woody",
          "Floral",
          "Musk",
          "Amber",
          "Citrus",
          "Fresh",
          "Fruity",
          "Spicy",
          "Sweet",
          "Oriental",
          "Aquatic",
          "Leather",
          "Vanilla",
          "Powdery",
          "Earthy",
          "Other",
        ],
        default: "Other",
      },

      gender: {
        type: String,
        enum: ["Men", "Women", "Unisex"],
        default: "Unisex",
      },

      concentration: {
        type: String,
        // enum: [
        //   "Attar",
        //   "Perfume Oil",
        //   "Extrait",
        //   "Parfum",
        //   "Eau de Parfum",
        //   "Other",
        // ],
        default: "Attar",
      },

      intensity: {
        type: String,
        // enum: ["Light", "Moderate", "Strong", "Very Strong"],
        default: "Strong",
      },

      longevity: {
        type: String,
        trim: true,
        // Example: "8-10 Hours"
      },

      sillage: {
        type: String,
        // enum: ["Intimate", "Moderate", "Strong", "Enormous"],
        default: "Moderate",
      },

      origin: {
        type: String,
        trim: true,
        // Example: "Dubai", "India", "Cambodia"
      },

      season: [
        {
          type: String,
          enum: ["Spring", "Summer", "Autumn", "Winter", "All Season"],
        },
      ],

      suitableFor: [
        {
          type: String,
          enum: [
            "Daily Wear",
            "Office",
            "Wedding",
            "Party",
            "Religious",
            "Special Occasion",
            "Evening",
            "Travel",
          ],
        },
      ],
    },

    // =========================================================
    // FRAGRANCE NOTES
    // =========================================================

    notes: {
      top: [
        {
          type: String,
          trim: true,
        },
      ],

      heart: [
        {
          type: String,
          trim: true,
        },
      ],

      base: [
        {
          type: String,
          trim: true,
        },
      ],
    },

    // =========================================================
    // INGREDIENTS
    // =========================================================

    ingredients: [
      {
        type: String,
        trim: true,
      },
    ],

    // =========================================================
    // PRODUCT VARIANTS
    // =========================================================

    variants: [
      {
        size: {
          type: Number,
          required: true,
          min: 0.1,
        },

        unit: {
          type: String,
          enum: ["ml"],
          default: "ml",
        },

        label: {
          type: String,
          trim: true,
          // Example: "8ml"
        },

        price: {
          type: Number,
          required: true,
          min: 0,
        },

        compareAtPrice: {
          type: Number,
          default: null,
          min: 0,
        },

        sku: {
          type: String,
          trim: true,
          uppercase: true,
        },

        isDefault: {
          type: Boolean,
          default: false,
        },

        isActive: {
          type: Boolean,
          default: true,
        },

        weightGrams: {
          type: Number,
          min: 0,
          default: null,
        },
      },
    ],

    // =========================================================
    // COMBO / GIFT BOX INFORMATION
    // =========================================================

    bundle: {
      isCustomizable: {
        type: Boolean,
        default: false,
      },

      maxItems: {
        type: Number,
        default: 0,
        min: 0,
      },

      includedProducts: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
          },

          variantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProductVariant",
            default: null,
          },

          quantity: {
            type: Number,
            default: 1,
            min: 1,
          },
        },
      ],
    },

    // =========================================================
    // PRODUCT IMAGES
    // =========================================================

    images: [
      {
        url: {
          type: String,
          required: true,
        },

        alt: {
          type: String,
          trim: true,
        },

        isPrimary: {
          type: Boolean,
          default: false,
        },

        sortOrder: {
          type: Number,
          default: 0,
        },
      },
    ],

    // =========================================================
    // PRODUCT VIDEO
    // =========================================================

    videos: [
      {
        url: {
          type: String,
          trim: true,
        },

        thumbnail: {
          type: String,
          trim: true,
        },

        title: {
          type: String,
          trim: true,
        },
      },
    ],

    // =========================================================
    // TAGS
    // =========================================================

    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    badge: {
      type: String,
      trim: true,
      maxlength: 50,
      // Example:
      // "Bestseller"
      // "Limited Edition"
      // "New"
      // "Save 20%"
    },

    // =========================================================
    // PRODUCT FLAGS
    // =========================================================

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    isBestSeller: {
      type: Boolean,
      default: false,
      index: true,
    },

    isNewArrival: {
      type: Boolean,
      default: false,
      index: true,
    },

    isLimitedEdition: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    // =========================================================
    // RATINGS & REVIEWS
    // =========================================================

    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },

      count: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    // =========================================================
    // RELATED PRODUCTS
    // =========================================================

    relatedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    // =========================================================
    // SEO
    // =========================================================

    seo: {
      title: {
        type: String,
        trim: true,
        maxlength: 70,
      },

      description: {
        type: String,
        trim: true,
        maxlength: 160,
      },

      keywords: [
        {
          type: String,
          trim: true,
        },
      ],

      canonicalUrl: {
        type: String,
        trim: true,
      },
    },

    // =========================================================
    // SHIPPING & CUSTOMS SPECIFICATIONS
    // =========================================================

    shipping: {
      weightGrams: {
        type: Number,
        min: 0,
        default: null,
      },

      dimensions: {
        lengthCm: { type: Number, min: 0, default: null },
        widthCm: { type: Number, min: 0, default: null },
        heightCm: { type: Number, min: 0, default: null },
      },

      // Configurable HS Code for customs classification
      hsCode: {
        type: String,
        trim: true,
        default: "",
      },

      countryOfOrigin: {
        type: String,
        trim: true,
        default: "India",
      },

      customsDescription: {
        type: String,
        trim: true,
        default: "",
      },

      internationalEligible: {
        type: Boolean,
        default: false,
      },

      requiresSpecialHandling: {
        type: Boolean,
        default: false,
      },
    },
  },

  {
    timestamps: true,
  },
);

// =============================================================
// INDEXES
// =============================================================

// Product search
productSchema.index({
  name: "text",
  description: "text",
  tagline: "text",
  tags: "text",
});

// Category filtering
productSchema.index({
  category: 1,
  isActive: 1,
  isDeleted: 1,
});

// Product listing / sorting
productSchema.index({
  isFeatured: 1,
  isActive: 1,
});

productSchema.index({
  isBestSeller: 1,
  isActive: 1,
});

productSchema.index({
  isNewArrival: 1,
  isActive: 1,
});

// Fragrance filtering
productSchema.index({
  "fragrance.family": 1,
  "fragrance.gender": 1,
});

module.exports = mongoose.model("Product", productSchema);

// {
//   "name": "Oud Al Khaleeji",
//   "productType": "single_attar",
//   "variants": [
//     {
//       "size": 6,
//       "unit": "ml",
//       "label": "6ml",
//       "price": 899,
//       "isDefault": true,
//       "isActive": true
//     }
//   ]
// }

// {
//   "name": "Arabian Fragrance Combo",
//   "productType": "combo",

//   "bundle": {
//     "isCustomizable": false,
//     "maxItems": 3,

//     "includedProducts": [
//       {
//         "productId": "OUD_PRODUCT_ID",
//         "variantId": "OUD_6ML_VARIANT_ID",
//         "quantity": 1
//       },
//       {
//         "productId": "MUSK_PRODUCT_ID",
//         "variantId": "MUSK_6ML_VARIANT_ID",
//         "quantity": 1
//       },
//       {
//         "productId": "AMBER_PRODUCT_ID",
//         "variantId": "AMBER_6ML_VARIANT_ID",
//         "quantity": 1
//       }
//     ]
//   },

//   "variants": [
//     {
//       "size": 18,
//       "unit": "ml",
//       "label": "3 × 6ml",
//       "price": 1999,
//       "isDefault": true,
//       "isActive": true
//     }
//   ]
// }

// {
//   "name": "Royal Arabian Gift Box",
//   "productType": "gift_box",

//   "bundle": {
//     "isCustomizable": false,
//     "maxItems": 3,

//     "includedProducts": [
//       {
//         "productId": "OUD_PRODUCT_ID",
//         "variantId": "OUD_6ML_VARIANT_ID",
//         "quantity": 1
//       },
//       {
//         "productId": "MUSK_PRODUCT_ID",
//         "variantId": "MUSK_6ML_VARIANT_ID",
//         "quantity": 1
//       },
//       {
//         "productId": "AMBER_PRODUCT_ID",
//         "variantId": "AMBER_6ML_VARIANT_ID",
//         "quantity": 1
//       }
//     ]
//   },

//   "variants": [
//     {
//       "size": 18,
//       "unit": "ml",
//       "label": "Gift Box",
//       "price": 2499,
//       "isDefault": true,
//       "isActive": true
//     }
//   ]
// }
