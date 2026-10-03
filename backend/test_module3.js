require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./index");
const User = require("./models/user");
const Category = require("./models/category");
const Product = require("./models/product");

const TEST_PORT = 5097;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;
let server;

const api = async (endpoint, method = "GET", body = null, token = null) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = text;
  }

  return { status: response.status, body: data };
};

const runSuite = async () => {
  console.log("\n==================================================");
  console.log("🚀 STARTING AUTOMATED TESTS FOR MODULE 3: PRODUCT & COMBOS");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}`);
      console.error(`   Error: ${err.message}`);
      failed++;
    }
  };

  try {
    // Wait for DB connection
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve) => mongoose.connection.once("open", resolve));
    }

    server = app.listen(TEST_PORT);
    console.log(`[Test Server] Live on ${BASE_URL}\n`);

    // Clean test data
    await Product.deleteMany({ name: { $regex: /Test Product|Royal Cambodian Aged Oud|Taif Rose Extrait|Royal Arabian Vault Duo/ } });
    await Category.deleteMany({ name: { $regex: /Test Prod Cat|Oud Collection|Floral Collection/ } });
    await User.deleteMany({ email: { $regex: /test_prod_customer_|test_prod_admin_/ } });

    // 1. Setup Category & Users
    const oudCat = await Category.create({
      name: "Oud Collection",
      slug: "oud-collection",
      description: "Royal Aged Oud Oils",
    });

    const floralCat = await Category.create({
      name: "Floral Collection",
      slug: "floral-collection",
      description: "Taif & Bulgarian Roses",
    });

    const customer = await User.create({
      name: "Product Customer",
      email: "test_prod_customer@soa.com",
      password: "Password@123",
      role: "customer",
    });
    const customerToken = customer.generateAuthToken();

    const admin = await User.create({
      name: "Product Admin",
      email: "test_prod_admin@soa.com",
      password: "Password@123",
      role: "admin",
    });
    const adminToken = admin.generateAuthToken();

    let singleProductId = "";
    let floralProductId = "";
    let comboProductId = "";

    // 2. Customer forbidden on create (403)
    await test("1. POST /api/products - Customer role rejected on create (403)", async () => {
      const res = await api(
        "/api/products",
        "POST",
        { name: "Unauthorized Product", category: oudCat._id, description: "Desc" },
        customerToken
      );
      if (res.status !== 403) {
        throw new Error(`Expected 403 Forbidden, got ${res.status}`);
      }
    });

    // 3. Admin creates Single Attar product
    await test("2. POST /api/products - Admin creates Single Attar ('Royal Cambodian Aged Oud')", async () => {
      const res = await api(
        "/api/products",
        "POST",
        {
          name: "Royal Cambodian Aged Oud",
          slug: "royal-cambodian-aged-oud",
          arabicName: "عود كمبودي ملكي معتق",
          tagline: "Wild-harvested 25-year aged artisan agarwood.",
          description: "Distilled from ancient trees in Koh Kong province, releasing smokey leather and honeyed resin.",
          category: oudCat._id,
          productType: "single_attar",
          fragrance: {
            family: "Oud",
            gender: "Unisex",
            intensity: "Strong",
            longevity: "16+ Hours",
            sillage: "Enormous",
            origin: "Cambodia",
          },
          notes: {
            top: ["Saffron", "Bergamot"],
            heart: ["Aged Leather", "Labdanum"],
            base: ["Smokey Agarwood", "Sweet Amber"],
          },
          variants: [
            { size: 3, unit: "ml", label: "3ml Flacon", price: 1499, isDefault: false },
            { size: 6, unit: "ml", label: "6ml Royal Bottle", price: 2799, isDefault: true },
            { size: 12, unit: "ml", label: "12ml Crystal Decanter", price: 4999, isDefault: false },
          ],
          images: [{ url: "/images/cambodian-oud.jpg", alt: "Royal Cambodian Oud", isPrimary: true }],
          tags: ["oud", "aged", "bestseller", "royal"],
          isFeatured: true,
          isBestSeller: true,
        },
        adminToken
      );

      if (res.status !== 201 || !res.body.data?._id) {
        throw new Error(`Create single attar failed: ${JSON.stringify(res.body)}`);
      }
      singleProductId = res.body.data._id;
    });

    // 4. Admin creates Second Product (Taif Rose Extrait)
    await test("3. POST /api/products - Admin creates Floral Attar ('Taif Rose Extrait')", async () => {
      const res = await api(
        "/api/products",
        "POST",
        {
          name: "Taif Rose Extrait",
          slug: "taif-rose-extrait",
          arabicName: "خلاصة ورد الطائف",
          tagline: "Pure highland mountain rose petals.",
          description: "Over 40,000 mountain roses harvested at dawn for a single tola of pure fragrance.",
          category: floralCat._id,
          productType: "single_attar",
          fragrance: {
            family: "Floral",
            gender: "Unisex",
            intensity: "Moderate",
            longevity: "12+ Hours",
            origin: "Saudi Arabia",
          },
          notes: {
            top: ["Fresh Dew", "Taif Rose"],
            heart: ["Damascena Rose", "White Musk"],
            base: ["Sandalwood", "Powdery Amber"],
          },
          variants: [
            { size: 6, unit: "ml", label: "6ml Bottle", price: 1999, isDefault: true },
          ],
          tags: ["floral", "rose", "taif"],
          isNewArrival: true,
        },
        adminToken
      );

      if (res.status !== 201 || !res.body.data?._id) {
        throw new Error(`Create floral attar failed: ${JSON.stringify(res.body)}`);
      }
      floralProductId = res.body.data._id;
    });

    // 5. Admin creates Combo / Gift Box product referencing above products
    await test("4. POST /api/products - Admin creates Gift Box Combo ('Royal Arabian Vault Duo')", async () => {
      const res = await api(
        "/api/products",
        "POST",
        {
          name: "Royal Arabian Vault Duo",
          slug: "royal-arabian-vault-duo",
          tagline: "Handcrafted Velvet Casket with Oud & Rose pairing.",
          description: "Includes our finest Royal Cambodian Oud (6ml) and Taif Rose Extrait (6ml) in an heirloom wooden vault.",
          category: oudCat._id,
          productType: "gift_box",
          badge: "Save 25%",
          bundle: {
            isCustomizable: false,
            maxItems: 2,
            includedProducts: [
              { productId: singleProductId, quantity: 1 },
              { productId: floralProductId, quantity: 1 },
            ],
          },
          variants: [
            { size: 12, unit: "ml", label: "Duo Set (2 × 6ml)", price: 3599, compareAtPrice: 4798, isDefault: true },
          ],
          images: [{ url: "/images/vault-box.jpg", isPrimary: true }],
          tags: ["gift_box", "combo", "vault"],
          isFeatured: true,
        },
        adminToken
      );

      if (res.status !== 201 || !res.body.data?._id) {
        throw new Error(`Create combo gift box failed: ${JSON.stringify(res.body)}`);
      }
      comboProductId = res.body.data._id;
    });

    // 6. Public Storefront List Products
    await test("5. GET /api/products - Storefront lists all active products", async () => {
      const res = await api("/api/products", "GET");
      if (res.status !== 200 || !Array.isArray(res.body.data?.products) || res.body.data.products.length < 3) {
        throw new Error(`Get products failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 7. Filter by Category
    await test("6. GET /api/products?category=oud-collection - Filter products by category slug", async () => {
      const res = await api("/api/products?category=oud-collection", "GET");
      if (res.status !== 200 || res.body.data.products.length === 0) {
        throw new Error(`Category filter failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 8. Filter by productType (Gift Box / Combo)
    await test("7. GET /api/products?productType=gift_box - Filter combo & gift box products", async () => {
      const res = await api("/api/products?productType=gift_box", "GET");
      if (res.status !== 200 || res.body.data.products.length === 0 || res.body.data.products[0].productType !== "gift_box") {
        throw new Error(`Product type filter failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 9. Search Products by Note/Tag keyword
    await test("8. GET /api/products?search=Taif - Search products by fragrance notes", async () => {
      const res = await api("/api/products?search=Taif", "GET");
      if (res.status !== 200 || res.body.data.products.length === 0) {
        throw new Error(`Search note failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 10. Showcase Products (Homepage fast load)
    await test("9. GET /api/products/showcase/featured - Fetch featured, bestsellers & combos showcase", async () => {
      const res = await api("/api/products/showcase/featured", "GET");
      if (res.status !== 200 || !res.body.data?.featured || !res.body.data?.combos) {
        throw new Error(`Showcase fetch failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 11. Fetch Single Product by Slug with Populated Category & Bundle Items
    await test("10. GET /api/products/:slug - Fetch product details with populated references", async () => {
      const res = await api("/api/products/royal-arabian-vault-duo", "GET");
      if (
        res.status !== 200 ||
        !res.body.data?.category?.name ||
        !Array.isArray(res.body.data?.bundle?.includedProducts)
      ) {
        throw new Error(`Product details fetch failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 12. Update Product
    await test("11. PUT /api/products/:id - Admin updates product details", async () => {
      const res = await api(
        `/api/products/${singleProductId}`,
        "PUT",
        {
          badge: "Heirloom Edition",
          tagline: "Updated luxury tagline for aged agarwood.",
        },
        adminToken
      );

      if (res.status !== 200 || res.body.data?.badge !== "Heirloom Edition") {
        throw new Error(`Update product failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 13. Toggle Flag (isFeatured / isActive)
    await test("12. PATCH /api/products/:id/flag - Admin toggles product flag", async () => {
      const res = await api(
        `/api/products/${singleProductId}/flag`,
        "PATCH",
        { flag: "isFeatured" },
        adminToken
      );

      if (res.status !== 200 || res.body.data?.isFeatured !== false) {
        throw new Error(`Flag toggle failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 14. Deactivate Product & Verify Public Filter
    await test("13. PATCH /api/products/:id/flag - Deactivate product and verify hidden from public", async () => {
      // Deactivate
      await api(`/api/products/${singleProductId}/flag`, "PATCH", { flag: "isActive" }, adminToken);

      // Verify public list does not contain it
      const listRes = await api("/api/products", "GET");
      const found = listRes.body.data.products.find((p) => p._id === singleProductId);
      if (found) {
        throw new Error("Deactivated product must not appear in public listing");
      }

      // Verify slug returns 404
      const slugRes = await api("/api/products/royal-cambodian-aged-oud", "GET");
      if (slugRes.status !== 404) {
        throw new Error(`Expected 404 for deactivated product slug, got ${slugRes.status}`);
      }
    });

    // 15. Admin List Products with Pagination
    await test("14. GET /api/products/admin/all - Admin retrieves all products with pagination", async () => {
      const res = await api("/api/products/admin/all?page=1&limit=10", "GET", null, adminToken);
      if (res.status !== 200 || !res.body.data?.pagination) {
        throw new Error(`Admin fetch failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 16. Soft Delete Product
    await test("15. DELETE /api/products/:id - Soft delete product", async () => {
      const res = await api(`/api/products/${comboProductId}`, "DELETE", null, adminToken);
      if (res.status !== 200) {
        throw new Error(`Delete failed: ${JSON.stringify(res.body)}`);
      }
    });

    console.log("\n==================================================");
    console.log(`🏁 MODULE 3 RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================\n");
  } catch (error) {
    console.error("Module 3 Fatal Error:", error);
  } finally {
    // Cleanup
    await Product.deleteMany({ name: { $regex: /Test Product|Royal Cambodian Aged Oud|Taif Rose Extrait|Royal Arabian Vault Duo/ } });
    await Category.deleteMany({ name: { $regex: /Test Prod Cat|Oud Collection|Floral Collection/ } });
    await User.deleteMany({ email: { $regex: /test_prod_customer_|test_prod_admin_/ } });
    if (server) server.close();
    await mongoose.connection.close();
    process.exit(failed > 0 ? 1 : 0);
  }
};

runSuite();
