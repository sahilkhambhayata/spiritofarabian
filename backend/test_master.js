require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./index");
const connectDB = require("./config/db");

// Models
const User = require("./models/user");
const Category = require("./models/category");
const Product = require("./models/product");
const Order = require("./models/order");
const Transaction = require("./models/transaction");
const VideoReview = require("./models/videoreview");
const Information = require("./models/information");
const Banner = require("./models/banner");
const Coupon = require("./models/coupon");
const SiteSetting = require("./models/settings");
const Concierge = require("./models/concierge");
const Review = require("./models/review");
const Journal = require("./models/blog");

const TEST_PORT = 5090;
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

const runMasterSuite = async () => {
  console.log("\n==================================================");
  console.log("👑 SPIRIT OF ARABIAN — MASTER FULL BACKEND AUDIT TEST");
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
    await connectDB();
    server = app.listen(TEST_PORT);
    console.log(`[Master Test Server] Live on ${BASE_URL}\n`);

    // Clean test data
    await User.deleteMany({ email: { $regex: /master_test_/ } });
    await Category.deleteMany({ name: { $regex: /Master Cat/ } });
    await Product.deleteMany({ name: { $regex: /Master Oud|Master Rose|Master Vault/ } });
    await Order.deleteMany({ "customerDetails.email": { $regex: /master_test_/ } });
    await Transaction.deleteMany({ transactionId: { $regex: /TXN-SOA-/ } });
    await VideoReview.deleteMany({ title: { $regex: /Master Reel/ } });
    await Coupon.deleteMany({ code: { $in: ["MASTER50"] } });
    await Journal.deleteMany({ title: { $regex: /Master Heritage/ } });

    // 1. Health
    await test("1. Health Check - Server Status", async () => {
      const res = await api("/api/health");
      if (res.status !== 200) throw new Error("Health check failed");
    });

    // 2. Auth: Register Customer & Admin
    let customerToken = "";
    let adminToken = "";
    let customerId = "";

    await test("2. Auth: Register Customer & Admin", async () => {
      const custRes = await api("/api/users/register", "POST", {
        name: "Master Customer",
        email: "master_test_customer@soa.com",
        password: "Password@123",
        phone: "+91 9988776655",
      });
      customerToken = custRes.body.data.token;
      customerId = custRes.body.data.user._id;

      const admin = await User.create({
        name: "Master Admin",
        email: "master_test_admin@soa.com",
        password: "Password@123",
        role: "admin",
      });
      adminToken = admin.generateAuthToken();
    });

    // 3. Category: Create Category
    let categoryId = "";
    await test("3. Category: Admin creates 'Master Cat Pure Oud'", async () => {
      const res = await api(
        "/api/categories",
        "POST",
        { name: "Master Cat Pure Oud", description: "Royal Ouds" },
        adminToken
      );
      categoryId = res.body.data._id;
    });

    // 4. Products: Create Single Attar + Combo Gift Box
    let oudId = "";
    let comboId = "";
    await test("4. Product: Admin creates Single Attar & Combo Gift Box", async () => {
      const oudRes = await api(
        "/api/products",
        "POST",
        {
          name: "Master Oud Impérial",
          slug: "master-oud-imperial",
          description: "25-year aged artisan agarwood.",
          category: categoryId,
          productType: "single_attar",
          notes: { top: ["Saffron"], heart: ["Amber"], base: ["Aged Oud"] },
          variants: [{ size: 6, unit: "ml", label: "6ml", price: 2999, isDefault: true }],
        },
        adminToken
      );
      oudId = oudRes.body.data._id;

      const comboRes = await api(
        "/api/products",
        "POST",
        {
          name: "Master Vault Duo",
          slug: "master-vault-duo",
          description: "Royal 2-Piece Velvet Gift Set",
          category: categoryId,
          productType: "gift_box",
          bundle: {
            isCustomizable: false,
            maxItems: 1,
            includedProducts: [{ productId: oudId, quantity: 1 }],
          },
          variants: [{ size: 6, unit: "ml", label: "Gift Set", price: 3499, isDefault: true }],
        },
        adminToken
      );
      comboId = comboRes.body.data._id;
    });

    // 5. Coupon: Create & Validate Promo Code
    await test("5. Coupon: Admin creates MASTER50 and validates calculation", async () => {
      await api(
        "/api/coupons",
        "POST",
        {
          code: "MASTER50",
          discountType: "percentage",
          discountValue: 10,
          minOrderValue: 1000,
          expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        },
        adminToken
      );

      const valRes = await api("/api/coupons/validate", "POST", { code: "MASTER50", orderAmount: 3000 });
      if (valRes.status !== 200 || valRes.body.data.discountAmount !== 300) {
        throw new Error("Coupon validation failed");
      }
    });

    // 6. Order: Place Order with Coupon & Gift Ribbon
    let orderNumber = "";
    let orderId = "";
    await test("6. Order: Checkout with item snapshot, coupon & tracking creation", async () => {
      const res = await api(
        "/api/orders",
        "POST",
        {
          items: [{ product: oudId, price: 2999, quantity: 1, size: "6ml" }],
          customerDetails: { fullName: "Master Customer", email: "master_test_customer@soa.com", phone: "+91 9988776655" },
          shippingAddress: { street: "Palm Jumeirah", city: "Mumbai", state: "Maharashtra", pincode: "400001" },
          giftOptions: { isGift: true, giftMessage: "With royal compliments.", includeRibbon: true },
          couponApplied: "MASTER50",
          discountAmount: 300,
          paymentMethod: "RAZORPAY",
        },
        customerToken
      );

      if (res.status !== 201 || res.body.data.totalAmount !== 2699) {
        throw new Error("Order placement failed");
      }
      orderNumber = res.body.data.orderNumber;
      orderId = res.body.data._id;
    });

    // 7. Payment: Gateway Order -> Signature Verification -> Auto Paid
    let txnId = "";
    await test("7. Payment: Initiate payment order & verify signature to mark Order Paid", async () => {
      const initRes = await api("/api/transactions/create-order", "POST", { orderId, gateway: "RAZORPAY" });
      txnId = initRes.body.data.transactionId;

      const verifyRes = await api("/api/transactions/verify", "POST", {
        transactionId: txnId,
        gatewayPaymentId: "pay_master_test_99812",
        paymentMethodDetails: { method: "upi", upiVpa: "patron@okaxis" },
      });

      if (verifyRes.status !== 200) throw new Error("Payment verification failed");

      const checkOrder = await Order.findById(orderId);
      if (checkOrder.paymentStatus !== "Paid") throw new Error("Order was not marked Paid");
    });

    // 8. Public Live Tracking
    await test("8. Tracking: Live courier tracking query by orderNumber", async () => {
      const res = await api(`/api/orders/track/${orderNumber}`, "GET");
      if (res.status !== 200 || res.body.data.orderStatus !== "Order Confirmed") {
        throw new Error("Live tracking failed");
      }
    });

    // 9. Video Review Reel: Shoppable Reel with tagged Product
    await test("9. Video Review: Admin creates Shoppable Reel with tagged Product", async () => {
      const res = await api(
        "/api/video-reviews",
        "POST",
        {
          title: "Master Reel: 18h Longevity Test",
          videoUrl: "https://cdn.spiritofarabian.com/videos/master.mp4",
          posterImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600",
          creator: { name: "Lady Layla", handle: "@layla.oud" },
          rating: 5,
          badge: "18h Wear Tested",
          quote: "The finest pure oil formulation.",
          taggedProduct: oudId,
        },
        adminToken
      );
      if (res.status !== 201) throw new Error("Video review creation failed");
    });

    // 10. Reviews & Ratings Recalculation
    await test("10. Review: Customer submits 5-star review -> Updates product.rating.average", async () => {
      const revRes = await api(
        "/api/reviews",
        "POST",
        {
          productId: oudId,
          name: "Master Customer",
          rating: 5,
          title: "Incredible Sillage",
          comment: "Lasts from morning until the next day.",
        },
        customerToken
      );
      if (revRes.status !== 201) throw new Error("Review submission failed");

      const checkProduct = await Product.findById(oudId);
      if (checkProduct.rating.average !== 5 || checkProduct.rating.count !== 1) {
        throw new Error("Product rating average was not recalculated");
      }
    });

    // 11. Policies & Information
    await test("11. Information: Admin creates & Public fetches dynamic policy page (/shipping-policy)", async () => {
      await api(
        "/api/information",
        "POST",
        {
          policy_type: "shipping",
          title: "Shipping & Royal Delivery Policy",
          path: "/shipping-policy",
          subtitle: "Insured Air Courier",
          sections: [{ heading: "Air Courier", content: "Dispatched within 24h." }],
        },
        adminToken
      );

      const res = await api("/api/information/shipping-policy", "GET");
      if (res.status !== 200 || !res.body.data?.sections) {
        throw new Error("Information policy fetch failed");
      }
    });

    // 12. Journal / Blog
    await test("12. Journal: Admin publishes heritage article & public retrieves by slug", async () => {
      const res = await api(
        "/api/journal",
        "POST",
        {
          title: "Master Heritage: The Secret of Aged Cambodian Oud",
          excerpt: "How 25 years of tree aging creates royal resin.",
          content: "Deep within Koh Kong province...",
          coverImage: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800",
          author: "Master Perfumer",
        },
        adminToken
      );
      if (res.status !== 201) throw new Error("Journal creation failed");

      const getRes = await api("/api/journal/master-heritage-the-secret-of-aged-cambodian-oud", "GET");
      if (getRes.status !== 200) throw new Error("Journal slug fetch failed");
    });

    // 13. Concierge VIP Inquiry
    await test("13. Concierge: Public submits VIP Bespoke Fragrance Consultation", async () => {
      const res = await api("/api/concierge", "POST", {
        name: "Master VIP Patron",
        email: "master_test_customer@soa.com",
        phone: "+91 9988776655",
        preferredScent: "Master Oud Impérial",
        type: "Private Fragrance Consultation",
      });
      if (res.status !== 201) throw new Error("Concierge inquiry submission failed");
    });

    // 14. Global Settings & Announcement Bar
    await test("14. Settings: Public fetches store settings & FAQ knowledge base", async () => {
      const res = await api("/api/settings", "GET");
      if (res.status !== 200 || !res.body.data?.announcementBarText) {
        throw new Error("Settings fetch failed");
      }
    });

    console.log("\n==================================================");
    console.log(`🏁 MASTER AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================\n");
  } catch (error) {
    console.error("Master Audit Fatal Error:", error);
  } finally {
    // Cleanup
    await User.deleteMany({ email: { $regex: /master_test_/ } });
    await Category.deleteMany({ name: { $regex: /Master Cat/ } });
    await Product.deleteMany({ name: { $regex: /Master Oud|Master Rose|Master Vault/ } });
    await Order.deleteMany({ "customerDetails.email": { $regex: /master_test_/ } });
    await Transaction.deleteMany({ transactionId: { $regex: /TXN-SOA-/ } });
    await VideoReview.deleteMany({ title: { $regex: /Master Reel/ } });
    await Coupon.deleteMany({ code: { $in: ["MASTER50"] } });
    await Journal.deleteMany({ title: { $regex: /Master Heritage/ } });
    if (server) server.close();
    await mongoose.connection.close();
    process.exit(failed > 0 ? 1 : 0);
  }
};

runMasterSuite();
