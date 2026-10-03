require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./index");
const connectDB = require("./config/db");
const User = require("./models/user");
const Category = require("./models/category");
const Product = require("./models/product");
const Order = require("./models/order");

const TEST_PORT = 5096;
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
  console.log("🚀 STARTING AUTOMATED TESTS FOR MODULE 4: ORDER & TRACKING");
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
    await Order.deleteMany({ "customerDetails.email": { $regex: /test_order_/ } });
    await Product.deleteMany({ name: { $regex: /Order Test Oud|Order Test Rose/ } });
    await Category.deleteMany({ name: { $regex: /Order Test Cat/ } });
    await User.deleteMany({ email: { $regex: /test_order_customer|test_order_other|test_order_admin/ } });

    // 1. Setup Category, Products & Users
    const category = await Category.create({
      name: "Order Test Cat",
      slug: "order-test-cat",
      description: "Category for order tests",
    });

    const productOud = await Product.create({
      name: "Order Test Oud Imperial",
      slug: "order-test-oud-imperial",
      description: "Pure Aged Oud",
      category: category._id,
      productType: "single_attar",
      variants: [{ size: 6, unit: "ml", label: "6ml", price: 2499, isDefault: true }],
    });

    const productRose = await Product.create({
      name: "Order Test Rose Royale",
      slug: "order-test-rose-royale",
      description: "Taif Rose Extrait",
      category: category._id,
      productType: "single_attar",
      variants: [{ size: 6, unit: "ml", label: "6ml", price: 1999, isDefault: true }],
    });

    const customerA = await User.create({
      name: "Order Customer A",
      email: "test_order_customer_a@soa.com",
      password: "Password@123",
      role: "customer",
    });
    const customerAToken = customerA.generateAuthToken();

    const customerB = await User.create({
      name: "Order Customer B",
      email: "test_order_other_b@soa.com",
      password: "Password@123",
      role: "customer",
    });
    const customerBToken = customerB.generateAuthToken();

    const admin = await User.create({
      name: "Order Admin",
      email: "test_order_admin@soa.com",
      password: "Password@123",
      role: "admin",
    });
    const adminToken = admin.generateAuthToken();

    let guestOrderNumber = "";
    let customerOrderId = "";
    let customerOrderNumber = "";

    // 2. Reject empty cart
    await test("1. POST /api/orders - Reject empty cart items (400)", async () => {
      const res = await api("/api/orders", "POST", {
        items: [],
        customerDetails: { fullName: "Test", email: "test@soa.com", phone: "9876543210" },
        shippingAddress: { street: "Road 1", city: "Mumbai", pincode: "400001" },
      });
      if (res.status !== 400) {
        throw new Error(`Expected status 400, got ${res.status}`);
      }
    });

    // 3. Reject missing shipping address
    await test("2. POST /api/orders - Reject missing shipping address (400)", async () => {
      const res = await api("/api/orders", "POST", {
        items: [{ product: productOud._id, price: 2499, quantity: 1, size: "6ml" }],
        customerDetails: { fullName: "Test", email: "test@soa.com", phone: "9876543210" },
      });
      if (res.status !== 400) {
        throw new Error(`Expected status 400, got ${res.status}`);
      }
    });

    // 4. Guest Checkout with Gift Ribbon & Personal Message
    await test("3. POST /api/orders - Guest places order with Gift Message & Ribbon", async () => {
      const res = await api("/api/orders", "POST", {
        items: [
          {
            product: productOud._id,
            price: 2499,
            quantity: 1,
            size: "6ml",
          },
          {
            product: productRose._id,
            price: 1999,
            quantity: 1,
            size: "6ml",
          },
        ],
        customerDetails: {
          fullName: "Guest Sheikh",
          email: "test_order_guest@soa.com",
          phone: "+91 9123456780",
        },
        shippingAddress: {
          street: "Royal Palm Boulevard, Apt 402",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
          country: "India",
        },
        giftOptions: {
          isGift: true,
          recipientName: "Fatima Al-Sayed",
          giftMessage: "Happy Birthday! May your days smell of roses and oud.",
          includeRibbon: true,
        },
        paymentMethod: "COD",
      });

      if (res.status !== 201 || !res.body.data?.orderNumber || res.body.data.totalAmount !== 4498) {
        throw new Error(`Guest order failed: ${JSON.stringify(res.body)}`);
      }
      guestOrderNumber = res.body.data.orderNumber;
    });

    // 5. Authenticated Customer Checkout
    await test("4. POST /api/orders - Logged-in Customer places order", async () => {
      const res = await api(
        "/api/orders",
        "POST",
        {
          items: [
            {
              product: productOud._id,
              price: 2499,
              quantity: 2,
              size: "6ml",
            },
          ],
          customerDetails: {
            fullName: "Customer A",
            email: "test_order_customer_a@soa.com",
            phone: "+91 9998887771",
          },
          shippingAddress: {
            street: "Marine Drive, Sea View Towers",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400020",
          },
          discountAmount: 500,
          couponApplied: "ROYAL500",
          paymentMethod: "RAZORPAY",
        },
        customerAToken
      );

      if (res.status !== 201 || res.body.data.totalAmount !== 4498) {
        throw new Error(`Customer order failed: ${JSON.stringify(res.body)}`);
      }
      customerOrderId = res.body.data._id;
      customerOrderNumber = res.body.data.orderNumber;
    });

    // 6. Customer fetches My Orders
    await test("5. GET /api/orders/my-orders - Customer views their order history", async () => {
      const res = await api("/api/orders/my-orders", "GET", null, customerAToken);
      if (res.status !== 200 || res.body.data.orders.length === 0) {
        throw new Error(`My orders failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 7. Ownership Security: Customer B cannot view Customer A's order by ID
    await test("6. GET /api/orders/:id - Customer B forbidden on Customer A's order (403)", async () => {
      const res = await api(`/api/orders/${customerOrderId}`, "GET", null, customerBToken);
      if (res.status !== 403) {
        throw new Error(`Expected 403 Forbidden, got ${res.status}`);
      }
    });

    // 8. Public Live Order Tracking by orderNumber
    await test("7. GET /api/orders/track/:orderNumber - Public live courier tracking", async () => {
      const res = await api(`/api/orders/track/${guestOrderNumber}`, "GET");
      if (
        res.status !== 200 ||
        res.body.data.orderNumber !== guestOrderNumber ||
        !Array.isArray(res.body.data.tracking?.history)
      ) {
        throw new Error(`Track order failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 9. Public Live Tracking non-existent order (404)
    await test("8. GET /api/orders/track/SOA-00000 - Non-existent order number returns 404", async () => {
      const res = await api("/api/orders/track/SOA-00000", "GET");
      if (res.status !== 404) {
        throw new Error(`Expected status 404, got ${res.status}`);
      }
    });

    // 10. Admin: Get all orders with pagination
    await test("9. GET /api/orders/admin/all - Admin retrieves all orders list", async () => {
      const res = await api("/api/orders/admin/all?page=1&limit=10", "GET", null, adminToken);
      if (res.status !== 200 || !res.body.data?.pagination) {
        throw new Error(`Admin orders fetch failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 11. Admin updates status to "Artisan Packaging" -> Tracking history appended
    await test("10. PUT /api/orders/admin/:id/status - Admin advances order stage & tracking history", async () => {
      const res = await api(
        `/api/orders/admin/${customerOrderId}/status`,
        "PUT",
        {
          status: "Artisan Packaging",
          location: "Dubai Flacon Casket Facility",
          note: "Fragrance bottled in crystal flacon and hand-sealed with gold wax.",
        },
        adminToken
      );

      if (
        res.status !== 200 ||
        res.body.data.orderStatus !== "Artisan Packaging" ||
        res.body.data.tracking.history.length < 2
      ) {
        throw new Error(`Update status failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 12. Admin updates courier tracking number & URL
    await test("11. PUT /api/orders/admin/:id/tracking - Admin updates BlueDart tracking info", async () => {
      const res = await api(
        `/api/orders/admin/${customerOrderId}/tracking`,
        "PUT",
        {
          carrier: "BlueDart Air Express",
          trackingNumber: "BD994821034IN",
          trackingUrl: "https://www.bluedart.com/tracking?track=BD994821034IN",
        },
        adminToken
      );

      if (res.status !== 200 || res.body.data.trackingNumber !== "BD994821034IN") {
        throw new Error(`Update tracking failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 13. Customer cancels order before dispatch
    await test("12. PUT /api/orders/:id/cancel - Customer cancels order with reason", async () => {
      const res = await api(
        `/api/orders/${customerOrderId}/cancel`,
        "PUT",
        { reason: "Customer requested fragrance change" },
        customerAToken
      );

      if (res.status !== 200 || res.body.data.orderStatus !== "Cancelled") {
        throw new Error(`Cancel order failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 14. Admin delivers COD order -> Marks payment as Paid automatically
    await test("13. PUT /api/orders/admin/:id/status - Delivery of COD order marks payment Paid", async () => {
      // Find guest order
      const guestOrder = await Order.findOne({ orderNumber: guestOrderNumber });
      const res = await api(
        `/api/orders/admin/${guestOrder._id}/status`,
        "PUT",
        {
          status: "Delivered",
          location: "Mumbai Gateway Delivery",
          note: "Handed over to customer with complimentary velvet pouch.",
        },
        adminToken
      );

      if (res.status !== 200 || res.body.data.orderStatus !== "Delivered" || res.body.data.paymentStatus !== "Paid") {
        throw new Error(`Delivery auto-paid failed: ${JSON.stringify(res.body)}`);
      }
    });

    console.log("\n==================================================");
    console.log(`🏁 MODULE 4 RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================\n");
  } catch (error) {
    console.error("Module 4 Fatal Error:", error);
  } finally {
    // Cleanup
    await Order.deleteMany({ "customerDetails.email": { $regex: /test_order_/ } });
    await Product.deleteMany({ name: { $regex: /Order Test Oud|Order Test Rose/ } });
    await Category.deleteMany({ name: { $regex: /Order Test Cat/ } });
    await User.deleteMany({ email: { $regex: /test_order_customer|test_order_other|test_order_admin/ } });
    if (server) server.close();
    await mongoose.connection.close();
    process.exit(failed > 0 ? 1 : 0);
  }
};

runSuite();
