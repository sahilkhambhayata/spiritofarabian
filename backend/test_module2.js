require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./index");
const User = require("./models/user");
const Category = require("./models/category");

const TEST_PORT = 5098;
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
  console.log("🚀 STARTING AUTOMATED TESTS FOR MODULE 2: CATEGORY");
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

    // Clean test categories & test users
    await Category.deleteMany({ name: { $regex: /Test Category|Pure Royal Ouds|Floral Taif Rose/ } });
    await User.deleteMany({ email: { $regex: /test_cat_customer_|test_cat_admin_/ } });

    // Create Customer & Admin for testing permissions
    const customer = await User.create({
      name: "Cat Customer",
      email: "test_cat_customer@soa.com",
      password: "Password@123",
      role: "customer",
    });
    const customerToken = customer.generateAuthToken();

    const admin = await User.create({
      name: "Cat Admin",
      email: "test_cat_admin@soa.com",
      password: "Password@123",
      role: "admin",
    });
    const adminToken = admin.generateAuthToken();

    let categoryId = "";

    // 1. Customer cannot create category (403 Forbidden)
    await test("1. POST /api/categories - Customer role rejected on create (403)", async () => {
      const res = await api(
        "/api/categories",
        "POST",
        { name: "Unauthorized Category" },
        customerToken
      );
      if (res.status !== 403) {
        throw new Error(`Expected 403 Forbidden, got ${res.status}`);
      }
    });

    // 2. Admin creates a new category
    await test("2. POST /api/categories - Admin creates 'Pure Royal Ouds' category", async () => {
      const res = await api(
        "/api/categories",
        "POST",
        {
          name: "Pure Royal Ouds",
          slug: "pure-royal-ouds",
          description: "Aged agarwood oils distilled from Assam and Cambodia.",
          bannerImage: "/images/oud-banner.jpg",
          icon: "Sparkles",
          orderIndex: 1,
        },
        adminToken
      );

      if (res.status !== 201 || !res.body.data?._id) {
        throw new Error(`Create category failed: ${JSON.stringify(res.body)}`);
      }
      categoryId = res.body.data._id;
    });

    // 3. Duplicate Category Rejection
    await test("3. POST /api/categories - Reject duplicate category name", async () => {
      const res = await api(
        "/api/categories",
        "POST",
        {
          name: "Pure Royal Ouds",
          description: "Duplicate attempt",
        },
        adminToken
      );

      if (res.status !== 400) {
        throw new Error(`Expected status 400 for duplicate, got ${res.status}`);
      }
    });

    // 4. Auto-generate Slug when not provided
    await test("4. POST /api/categories - Auto-generate slug from category name", async () => {
      const res = await api(
        "/api/categories",
        "POST",
        {
          name: "Floral Taif Rose",
          description: "Hand-picked Taif roses distilled in copper vats.",
          orderIndex: 2,
        },
        adminToken
      );

      if (res.status !== 201 || res.body.data?.slug !== "floral-taif-rose") {
        throw new Error(`Auto-slug failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 5. Public List of Active Categories
    await test("5. GET /api/categories - Storefront fetches active categories list", async () => {
      const res = await api("/api/categories", "GET");
      if (res.status !== 200 || !Array.isArray(res.body.data) || res.body.data.length === 0) {
        throw new Error(`Get categories failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 6. Public Get Category by Slug
    await test("6. GET /api/categories/:slug - Fetch single category by slug", async () => {
      const res = await api("/api/categories/pure-royal-ouds", "GET");
      if (res.status !== 200 || res.body.data?.name !== "Pure Royal Ouds") {
        throw new Error(`Get by slug failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 7. Non-existent slug returns 404
    await test("7. GET /api/categories/:slug - Return 404 for non-existent slug", async () => {
      const res = await api("/api/categories/non-existent-category-slug", "GET");
      if (res.status !== 404) {
        throw new Error(`Expected status 404, got ${res.status}`);
      }
    });

    // 8. Admin List All Categories with Pagination
    await test("8. GET /api/categories/admin/all - Admin fetches categories with pagination", async () => {
      const res = await api("/api/categories/admin/all?page=1&limit=10", "GET", null, adminToken);
      if (res.status !== 200 || !res.body.data?.pagination) {
        throw new Error(`Admin fetch failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 9. Admin Search Categories
    await test("9. GET /api/categories/admin/all?search=Taif - Search category by keyword", async () => {
      const res = await api("/api/categories/admin/all?search=Taif", "GET", null, adminToken);
      if (res.status !== 200 || res.body.data?.categories.length === 0) {
        throw new Error(`Search failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 10. Update Category
    await test("10. PUT /api/categories/:id - Update category details", async () => {
      const res = await api(
        `/api/categories/${categoryId}`,
        "PUT",
        {
          description: "Updated luxury description for Cambodian Oud.",
          orderIndex: 5,
        },
        adminToken
      );

      if (res.status !== 200 || res.body.data?.orderIndex !== 5) {
        throw new Error(`Update failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 11. Toggle Category Active/Inactive
    await test("11. PATCH /api/categories/:id/status - Deactivate category", async () => {
      const res = await api(`/api/categories/${categoryId}/status`, "PATCH", null, adminToken);
      if (res.status !== 200 || res.body.data?.isActive !== false) {
        throw new Error(`Deactivate failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 12. Deactivated Category Hidden from Public List
    await test("12. GET /api/categories - Deactivated category hidden from public storefront", async () => {
      const res = await api("/api/categories", "GET");
      const found = res.body.data.find((c) => c._id === categoryId);
      if (found) {
        throw new Error("Inactive category should not be visible in public listing");
      }
    });

    // 13. Reactivate Category
    await test("13. PATCH /api/categories/:id/status - Reactivate category", async () => {
      const res = await api(`/api/categories/${categoryId}/status`, "PATCH", null, adminToken);
      if (res.status !== 200 || res.body.data?.isActive !== true) {
        throw new Error(`Reactivation failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 14. Soft Delete Category
    await test("14. DELETE /api/categories/:id - Soft delete category", async () => {
      const res = await api(`/api/categories/${categoryId}`, "DELETE", null, adminToken);
      if (res.status !== 200) {
        throw new Error(`Delete failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 15. Deleted Category Hidden from Public and Details
    await test("15. GET /api/categories/:slug - Deleted category returns 404", async () => {
      const res = await api("/api/categories/pure-royal-ouds", "GET");
      if (res.status !== 404) {
        throw new Error(`Expected 404 for deleted category, got ${res.status}`);
      }
    });

    console.log("\n==================================================");
    console.log(`🏁 MODULE 2 RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================\n");
  } catch (error) {
    console.error("Module 2 Fatal Error:", error);
  } finally {
    // Cleanup
    await Category.deleteMany({ name: { $regex: /Test Category|Pure Royal Ouds|Floral Taif Rose/ } });
    await User.deleteMany({ email: { $regex: /test_cat_customer_|test_cat_admin_/ } });
    if (server) server.close();
    await mongoose.connection.close();
    process.exit(failed > 0 ? 1 : 0);
  }
};

runSuite();
