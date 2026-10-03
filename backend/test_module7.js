require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./index");
const connectDB = require("./config/db");
const User = require("./models/user");
const Information = require("./models/information");
const Banner = require("./models/banner");
const Coupon = require("./models/coupon");
const SiteSetting = require("./models/settings");

const TEST_PORT = 5093;
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
  console.log("🚀 STARTING AUTOMATED TESTS FOR MODULE 7: POLICIES, BANNERS, COUPONS & SETTINGS");
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
    await Information.deleteMany({ policy_type: { $in: ["shipping", "return", "privacy", "terms", "refund"] } });
    await Banner.deleteMany({ title: { $regex: /Test Hero Banner|Test Royal Launch/ } });
    await Coupon.deleteMany({ code: { $in: ["ROYAL20", "EXPIRED10", "FLAT500"] } });
    await User.deleteMany({ email: { $regex: /test_mod7_admin/ } });

    const admin = await User.create({
      name: "Mod7 Admin",
      email: "test_mod7_admin@soa.com",
      password: "Password@123",
      role: "admin",
    });
    const adminToken = admin.generateAuthToken();

    let createdBannerId = "";
    let createdCouponId = "";
    let createdFaqId = "";

    // ================= 1. DYNAMIC INFORMATION & POLICIES =================

    // 1.1 Admin upserts Shipping Policy
    await test("1. POST /api/information - Admin creates/upserts Shipping Policy", async () => {
      const res = await api(
        "/api/information",
        "POST",
        {
          policy_type: "shipping",
          title: "Shipping & Royal Delivery Policy",
          path: "/shipping-policy",
          subtitle: "Complimentary climate-controlled worldwide delivery on orders above ₹1,500.",
          highlights: [
            { icon: "Truck", title: "Insured Air Courier", description: "BlueDart express air dispatch within 24 hours." },
            { icon: "ShieldCheck", title: "Tamper-Proof Flacon Vault", description: "Vacuum sealed in velvet casing." },
          ],
          sections: [
            { heading: "Domestic India Dispatch", content: "Orders are dispatched within 24–48 hours and arrive in 2–4 business days." },
            { heading: "Worldwide Royal Express", content: "International shipments are routed via DHL Express with insurance." },
          ],
        },
        adminToken
      );

      if (res.status !== 200 || res.body.data?.policy_type !== "shipping") {
        throw new Error(`Create shipping policy failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 1.2 Admin upserts Refund Policy & Privacy Policy
    await test("2. POST /api/information - Admin creates Refund & Privacy policies", async () => {
      await api(
        "/api/information",
        "POST",
        {
          policy_type: "refund",
          title: "Refund & 30-Day Sillage Satisfaction Guarantee",
          path: "/refund-policy",
          subtitle: "100% money back guarantee if sillage does not meet royal standards.",
          sections: [{ heading: "Guaranteed Satisfaction", content: "Keep the complimentary 3ml discovery sample and return the sealed 12ml flacon for a full refund." }],
        },
        adminToken
      );

      const privRes = await api(
        "/api/information",
        "POST",
        {
          policy_type: "privacy",
          title: "Privacy & Patron Confidentiality Charter",
          path: "/privacy-policy",
          subtitle: "We never monetize or share our patrons' private fragrance profiles.",
          sections: [{ heading: "Data Stewardship", content: "Encrypted under 256-bit AES standards." }],
        },
        adminToken
      );

      if (privRes.status !== 200) {
        throw new Error(`Create privacy policy failed: ${JSON.stringify(privRes.body)}`);
      }
    });

    // 1.3 Public fetches all active policies
    await test("3. GET /api/information - Public lists all dynamic policy pages", async () => {
      const res = await api("/api/information", "GET");
      if (!Array.isArray(res.body.data) || res.body.data.length < 3) {
        throw new Error(`Get policies failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 1.4 Public fetches single policy by slug/path
    await test("4. GET /api/information/:identifier - Public fetches policy by path ('/shipping-policy')", async () => {
      const res = await api("/api/information/shipping-policy", "GET");
      if (res.status !== 200 || res.body.data?.policy_type !== "shipping") {
        throw new Error(`Get policy by identifier failed: ${JSON.stringify(res.body)}`);
      }
    });

    // ================= 2. HERO BANNERS =================

    // 2.1 Admin creates Hero Banner
    await test("5. POST /api/banners - Admin creates Homepage Hero Slider Banner", async () => {
      const res = await api(
        "/api/banners",
        "POST",
        {
          title: "Test Royal Launch: 25-Year Aged Cambodian Oud",
          subtitle: "Distilled from ancient trees in Koh Kong province.",
          badge: "Imperial Reserve",
          desktopImage: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=1600",
          mobileImage: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800",
          ctaText: "Acquire Flacon",
          ctaLink: "/collection/oud",
          position: "hero_slider",
          orderIndex: 1,
        },
        adminToken
      );

      if (res.status !== 201 || !res.body.data?._id) {
        throw new Error(`Create banner failed: ${JSON.stringify(res.body)}`);
      }
      createdBannerId = res.body.data._id;
    });

    // 2.2 Public retrieves active hero banners
    await test("6. GET /api/banners?position=hero_slider - Public fetches hero slider banners", async () => {
      const res = await api("/api/banners?position=hero_slider", "GET");
      if (res.status !== 200 || !Array.isArray(res.body.data) || res.body.data.length === 0) {
        throw new Error(`Get banners failed: ${JSON.stringify(res.body)}`);
      }
    });

    // ================= 3. DISCOUNT COUPONS =================

    // 3.1 Admin creates Promo Coupon (ROYAL20 - 20% off min ₹1000)
    await test("7. POST /api/coupons - Admin creates discount coupon (ROYAL20)", async () => {
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // +30 days
      const res = await api(
        "/api/coupons",
        "POST",
        {
          code: "ROYAL20",
          discountType: "percentage",
          discountValue: 20,
          minOrderValue: 1000,
          maxDiscountAmount: 1000,
          expiryDate: futureDate,
          usageLimit: 50,
          description: "20% off on all royal orders above ₹1,000",
        },
        adminToken
      );

      if (res.status !== 201 || res.body.data?.code !== "ROYAL20") {
        throw new Error(`Create coupon failed: ${JSON.stringify(res.body)}`);
      }
      createdCouponId = res.body.data._id;
    });

    // 3.2 Validate Coupon calculation at checkout
    await test("8. POST /api/coupons/validate - Validate coupon calculation (20% on ₹3,000 = ₹600 discount)", async () => {
      const res = await api("/api/coupons/validate", "POST", {
        code: "ROYAL20",
        orderAmount: 3000,
      });

      if (res.status !== 200 || res.body.data?.discountAmount !== 600 || res.body.data?.finalAmount !== 2400) {
        throw new Error(`Validate coupon failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 3.3 Validate Coupon rejects when order amount below minimum
    await test("9. POST /api/coupons/validate - Reject coupon when order amount below minOrderValue (400)", async () => {
      const res = await api("/api/coupons/validate", "POST", {
        code: "ROYAL20",
        orderAmount: 500, // Below 1000
      });

      if (res.status !== 400) {
        throw new Error(`Expected status 400, got ${res.status}`);
      }
    });

    // ================= 4. SITE SETTINGS & FAQS =================

    // 4.1 Public retrieves global site settings & announcement text
    await test("10. GET /api/settings - Public fetches site settings & announcement banner", async () => {
      const res = await api("/api/settings", "GET");
      if (res.status !== 200 || !res.body.data?.announcementBarText || !Array.isArray(res.body.data?.faqs)) {
        throw new Error(`Get settings failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 4.2 Admin updates site settings
    await test("11. PUT /api/settings - Admin updates free shipping threshold & announcement text", async () => {
      const res = await api(
        "/api/settings",
        "PUT",
        {
          announcementBarText: "Complimentary Pure Silk Pouch on All Orders Above ₹2,999",
          freeShippingThreshold: 1999,
        },
        adminToken
      );

      if (res.status !== 200 || res.body.data?.freeShippingThreshold !== 1999) {
        throw new Error(`Update settings failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 4.3 Admin adds FAQ
    await test("12. POST /api/settings/faqs - Admin adds new FAQ to knowledge base", async () => {
      const res = await api(
        "/api/settings/faqs",
        "POST",
        {
          question: "Can I layer Royal Oud with Taif Rose?",
          answer: "Yes, traditional Arabian perfumery encourages layering a warm woody base of Aged Oud with fresh Taif Rose top notes.",
          category: "Layering & Styling",
        },
        adminToken
      );

      if (res.status !== 201 || !Array.isArray(res.body.data)) {
        throw new Error(`Add FAQ failed: ${JSON.stringify(res.body)}`);
      }
      createdFaqId = res.body.data[res.body.data.length - 1]._id;
    });

    // 4.4 Admin deletes FAQ
    await test("13. DELETE /api/settings/faqs/:faqId - Admin removes FAQ", async () => {
      const res = await api(`/api/settings/faqs/${createdFaqId}`, "DELETE", null, adminToken);
      if (res.status !== 200) {
        throw new Error(`Delete FAQ failed: ${JSON.stringify(res.body)}`);
      }
    });

    console.log("\n==================================================");
    console.log(`🏁 MODULE 7 RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================\n");
  } catch (error) {
    console.error("Module 7 Fatal Error:", error);
  } finally {
    // Cleanup
    await Information.deleteMany({ policy_type: { $in: ["shipping", "return", "privacy", "terms", "refund"] } });
    await Banner.deleteMany({ title: { $regex: /Test Hero Banner|Test Royal Launch/ } });
    await Coupon.deleteMany({ code: { $in: ["ROYAL20", "EXPIRED10", "FLAT500"] } });
    await User.deleteMany({ email: { $regex: /test_mod7_admin/ } });
    if (server) server.close();
    await mongoose.connection.close();
    process.exit(failed > 0 ? 1 : 0);
  }
};

runSuite();
