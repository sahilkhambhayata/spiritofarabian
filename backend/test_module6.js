require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./index");
const connectDB = require("./config/db");
const User = require("./models/user");
const Category = require("./models/category");
const Product = require("./models/product");
const VideoReview = require("./models/videoreview");

const TEST_PORT = 5094;
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
  console.log("🚀 STARTING AUTOMATED TESTS FOR MODULE 6: VIDEO REVIEWS");
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
    // Ensure DB connected
    await connectDB();

    server = app.listen(TEST_PORT);
    console.log(`[Test Server] Live on ${BASE_URL}\n`);

    // Clean test data
    await VideoReview.deleteMany({ title: { $regex: /Test Longevity|Test Flacon Unboxing/ } });
    await Product.deleteMany({ name: { $regex: /Video Test Prod/ } });
    await Category.deleteMany({ name: { $regex: /Video Test Cat/ } });
    await User.deleteMany({ email: { $regex: /test_video_customer|test_video_admin/ } });

    // 1. Setup Category, Product & Users
    const category = await Category.create({
      name: "Video Test Cat",
      slug: "video-test-cat",
      description: "Category for video tests",
    });

    const product = await Product.create({
      name: "Video Test Prod Royal Oud",
      slug: "video-test-prod-royal-oud",
      description: "Artisan Aged Oud for video tagging",
      category: category._id,
      variants: [{ size: 6, unit: "ml", label: "6ml", price: 2999, isDefault: true }],
      images: [{ url: "/images/royal-oud.jpg", isPrimary: true }],
    });

    const customer = await User.create({
      name: "Video Customer",
      email: "test_video_customer@soa.com",
      password: "Password@123",
      role: "customer",
    });
    const customerToken = customer.generateAuthToken();

    const admin = await User.create({
      name: "Video Admin",
      email: "test_video_admin@soa.com",
      password: "Password@123",
      role: "admin",
    });
    const adminToken = admin.generateAuthToken();

    let videoId1 = "";
    let videoId2 = "";

    // 2. Customer forbidden on create (403)
    await test("1. POST /api/video-reviews - Customer role rejected on create (403)", async () => {
      const res = await api(
        "/api/video-reviews",
        "POST",
        { title: "Unauthorized", videoUrl: "http://video.mp4", posterImage: "p.jpg", quote: "q", taggedProduct: product._id },
        customerToken
      );
      if (res.status !== 403) {
        throw new Error(`Expected 403 Forbidden, got ${res.status}`);
      }
    });

    // 3. Admin creates Shoppable Video Review Reel 1
    await test("2. POST /api/video-reviews - Admin creates Shoppable Reel with tagged Product", async () => {
      const res = await api(
        "/api/video-reviews",
        "POST",
        {
          title: "Test Longevity: 14-Hour Wear in Dubai Heat",
          videoUrl: "https://cdn.spiritofarabian.com/videos/longevity-test.mp4",
          posterImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600",
          duration: "0:45",
          creator: {
            name: "Yasmin Al-Maktoum",
            handle: "@yasmin.scents",
            location: "Dubai, UAE",
          },
          rating: 5,
          badge: "14h Wear Verified",
          quote: "One swipe on the wrist at 8 AM. Projected rich amber-oud sillage at 11 PM after walking outdoors in Dubai sun.",
          taggedProduct: product._id,
          orderIndex: 1,
        },
        adminToken
      );

      if (res.status !== 201 || !res.body.data?._id || res.body.data.creator.name !== "Yasmin Al-Maktoum") {
        throw new Error(`Create video review failed: ${JSON.stringify(res.body)}`);
      }
      videoId1 = res.body.data._id;
    });

    // 4. Admin creates Video Review Reel 2
    await test("3. POST /api/video-reviews - Admin creates second Video Review Reel", async () => {
      const res = await api(
        "/api/video-reviews",
        "POST",
        {
          title: "Test Flacon Unboxing: 12ml Crystal Flacon",
          videoUrl: "https://cdn.spiritofarabian.com/videos/unboxing-crystal.mp4",
          posterImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600",
          duration: "0:38",
          creator: {
            name: "Tariq V. Kensington",
            handle: "@tariq.fragrance",
            location: "London, UK",
          },
          rating: 5,
          badge: "Heirloom Casket",
          quote: "The velvet weight in hand is unmatched. You feel like a monarch opening a vault.",
          taggedProduct: product._id,
          orderIndex: 2,
        },
        adminToken
      );

      if (res.status !== 201 || !res.body.data?._id) {
        throw new Error(`Create second video review failed: ${JSON.stringify(res.body)}`);
      }
      videoId2 = res.body.data._id;
    });

    // 5. Storefront Public Lists Active Video Reviews with Tagged Product info
    await test("4. GET /api/video-reviews - Public lists all active reels with populated Product", async () => {
      const res = await api("/api/video-reviews", "GET");
      if (
        res.status !== 200 ||
        !Array.isArray(res.body.data) ||
        res.body.data.length < 2 ||
        !res.body.data[0].taggedProduct?.name
      ) {
        throw new Error(`Get video reviews failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 6. Public Get Single Reel by ID
    await test("5. GET /api/video-reviews/:id - Public fetches single video review by ID", async () => {
      const res = await api(`/api/video-reviews/${videoId1}`, "GET");
      if (res.status !== 200 || res.body.data?.creator?.handle !== "@yasmin.scents") {
        throw new Error(`Get single video failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 7. Increment View Count
    await test("6. PATCH /api/video-reviews/:id/view - Atomically increment views count", async () => {
      const res = await api(`/api/video-reviews/${videoId1}/view`, "PATCH");
      if (res.status !== 200 || res.body.data?.viewsCount < 1) {
        throw new Error(`Increment views failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 8. Toggle Like Count
    await test("7. PATCH /api/video-reviews/:id/like - Like and unlike video reel", async () => {
      // Like
      const likeRes = await api(`/api/video-reviews/${videoId1}/like`, "PATCH", { action: "like" });
      if (likeRes.status !== 200 || likeRes.body.data?.likesCount < 1) {
        throw new Error(`Like failed: ${JSON.stringify(likeRes.body)}`);
      }

      // Unlike
      const unlikeRes = await api(`/api/video-reviews/${videoId1}/like`, "PATCH", { action: "unlike" });
      if (unlikeRes.status !== 200 || unlikeRes.body.data?.likesCount !== 0) {
        throw new Error(`Unlike failed: ${JSON.stringify(unlikeRes.body)}`);
      }
    });

    // 9. Admin List all Video Reviews with Pagination
    await test("8. GET /api/video-reviews/admin/all - Admin retrieves video reviews list", async () => {
      const res = await api("/api/video-reviews/admin/all?page=1&limit=10", "GET", null, adminToken);
      if (res.status !== 200 || !res.body.data?.pagination) {
        throw new Error(`Admin fetch failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 10. Admin Update Video Review
    await test("9. PUT /api/video-reviews/:id - Admin updates badge & duration", async () => {
      const res = await api(
        `/api/video-reviews/${videoId1}`,
        "PUT",
        {
          badge: "16h Wear Certified",
          duration: "0:50",
        },
        adminToken
      );

      if (res.status !== 200 || res.body.data?.badge !== "16h Wear Certified") {
        throw new Error(`Update video failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 11. Admin Deactivates Video Review & Verify Public Guard
    await test("10. PATCH /api/video-reviews/:id/status - Deactivate video & verify hidden from storefront", async () => {
      // Deactivate
      const patchRes = await api(`/api/video-reviews/${videoId1}/status`, "PATCH", { field: "isActive" }, adminToken);
      if (patchRes.status !== 200 || patchRes.body.data?.isActive !== false) {
        throw new Error(`Deactivate failed: ${JSON.stringify(patchRes.body)}`);
      }

      // Verify hidden from public list
      const listRes = await api("/api/video-reviews", "GET");
      const found = listRes.body.data.find((v) => v._id === videoId1);
      if (found) {
        throw new Error("Deactivated video review must not appear in public storefront");
      }
    });

    // 12. Admin Soft Delete
    await test("11. DELETE /api/video-reviews/:id - Soft delete video review", async () => {
      const res = await api(`/api/video-reviews/${videoId2}`, "DELETE", null, adminToken);
      if (res.status !== 200) {
        throw new Error(`Delete failed: ${JSON.stringify(res.body)}`);
      }
    });

    console.log("\n==================================================");
    console.log(`🏁 MODULE 6 RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================\n");
  } catch (error) {
    console.error("Module 6 Fatal Error:", error);
  } finally {
    // Cleanup
    await VideoReview.deleteMany({ title: { $regex: /Test Longevity|Test Flacon Unboxing/ } });
    await Product.deleteMany({ name: { $regex: /Video Test Prod/ } });
    await Category.deleteMany({ name: { $regex: /Video Test Cat/ } });
    await User.deleteMany({ email: { $regex: /test_video_customer|test_video_admin/ } });
    if (server) server.close();
    await mongoose.connection.close();
    process.exit(failed > 0 ? 1 : 0);
  }
};

runSuite();
