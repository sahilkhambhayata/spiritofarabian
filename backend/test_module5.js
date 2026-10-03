require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./index");
const connectDB = require("./config/db");
const User = require("./models/user");
const Category = require("./models/category");
const Product = require("./models/product");
const Order = require("./models/order");
const Transaction = require("./models/transaction");

const TEST_PORT = 5095;
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
  console.log("🚀 STARTING AUTOMATED TESTS FOR MODULE 5: TRANSACTIONS & PAYMENTS");
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
    await Transaction.deleteMany({ transactionId: { $regex: /TXN-SOA-/ } });
    await Order.deleteMany({ "customerDetails.email": { $regex: /test_txn_/ } });
    await Product.deleteMany({ name: { $regex: /Txn Test Prod/ } });
    await Category.deleteMany({ name: { $regex: /Txn Test Cat/ } });
    await User.deleteMany({ email: { $regex: /test_txn_customer|test_txn_admin/ } });

    // 1. Setup Data
    const category = await Category.create({
      name: "Txn Test Cat",
      slug: "txn-test-cat",
      description: "Category for transaction tests",
    });

    const product = await Product.create({
      name: "Txn Test Prod Oud",
      slug: "txn-test-prod-oud",
      description: "Aged Oud for payment testing",
      category: category._id,
      variants: [{ size: 6, unit: "ml", label: "6ml", price: 2999, isDefault: true }],
    });

    const customer = await User.create({
      name: "Txn Customer",
      email: "test_txn_customer@soa.com",
      password: "Password@123",
      role: "customer",
    });
    const customerToken = customer.generateAuthToken();

    const admin = await User.create({
      name: "Txn Admin",
      email: "test_txn_admin@soa.com",
      password: "Password@123",
      role: "admin",
    });
    const adminToken = admin.generateAuthToken();

    // Create a pending order to pay for
    const order = await Order.create({
      orderNumber: `SOA-${Math.floor(10000 + Math.random() * 90000)}`,
      user: customer._id,
      customerDetails: {
        fullName: "Txn Customer",
        email: "test_txn_customer@soa.com",
        phone: "+91 9988776655",
      },
      shippingAddress: {
        street: "Marine Drive",
        city: "Mumbai",
        pincode: "400020",
      },
      items: [
        {
          product: product._id,
          name: product.name,
          size: "6ml",
          price: 2999,
          quantity: 1,
        },
      ],
      subTotal: 2999,
      shippingFee: 0,
      totalAmount: 2999,
      paymentMethod: "RAZORPAY",
      paymentStatus: "Pending",
    });

    // Create a second order for failure test
    const orderFail = await Order.create({
      orderNumber: `SOA-${Math.floor(10000 + Math.random() * 90000)}`,
      user: customer._id,
      customerDetails: {
        fullName: "Txn Customer",
        email: "test_txn_customer@soa.com",
        phone: "+91 9988776655",
      },
      shippingAddress: {
        street: "Marine Drive",
        city: "Mumbai",
        pincode: "400020",
      },
      items: [
        {
          product: product._id,
          name: product.name,
          size: "6ml",
          price: 2999,
          quantity: 1,
        },
      ],
      subTotal: 2999,
      shippingFee: 0,
      totalAmount: 2999,
      paymentMethod: "RAZORPAY",
      paymentStatus: "Pending",
    });

    let activeTransactionId = "";
    let failTransactionId = "";
    let activeTransactionMongoId = "";

    // 2. Reject missing order ID on create-order
    await test("1. POST /api/transactions/create-order - Reject missing orderId (400)", async () => {
      const res = await api("/api/transactions/create-order", "POST", {});
      if (res.status !== 400) {
        throw new Error(`Expected 400, got ${res.status}`);
      }
    });

    // 3. Initiate Gateway Order
    await test("2. POST /api/transactions/create-order - Initiate Razorpay order for pending Order", async () => {
      const res = await api("/api/transactions/create-order", "POST", {
        orderId: order._id,
        gateway: "RAZORPAY",
      });

      if (res.status !== 201 || !res.body.data?.transactionId || res.body.data.amount !== 2999) {
        throw new Error(`Create order failed: ${JSON.stringify(res.body)}`);
      }
      activeTransactionId = res.body.data.transactionId;
    });

    // 4. Verify Payment & Finalize Order
    await test("3. POST /api/transactions/verify - Verify payment & mark Order Paid", async () => {
      const res = await api("/api/transactions/verify", "POST", {
        transactionId: activeTransactionId,
        gatewayPaymentId: `pay_${Math.random().toString(36).substring(2, 10)}`,
        paymentMethodDetails: {
          method: "upi",
          upiVpa: "customer@okhdfcbank",
        },
      });

      if (res.status !== 200 || res.body.data?.status !== "successful") {
        throw new Error(`Verify payment failed: ${JSON.stringify(res.body)}`);
      }

      // Check linked order is marked Paid
      const updatedOrder = await Order.findById(order._id);
      if (updatedOrder.paymentStatus !== "Paid") {
        throw new Error(`Expected order paymentStatus 'Paid', got '${updatedOrder.paymentStatus}'`);
      }

      const txnDoc = await Transaction.findOne({ transactionId: activeTransactionId });
      activeTransactionMongoId = txnDoc._id;
    });

    // 5. Guard against duplicate payment on already-paid order
    await test("4. POST /api/transactions/create-order - Reject new payment for already-paid Order (400)", async () => {
      const res = await api("/api/transactions/create-order", "POST", {
        orderId: order._id,
      });

      if (res.status !== 400) {
        throw new Error(`Expected 400, got ${res.status}`);
      }
    });

    // 6. Initiate & Record Payment Failure
    await test("5. POST /api/transactions/failed - Record failed payment attempt", async () => {
      const initRes = await api("/api/transactions/create-order", "POST", {
        orderId: orderFail._id,
        gateway: "RAZORPAY",
      });
      failTransactionId = initRes.body.data.transactionId;

      const failRes = await api("/api/transactions/failed", "POST", {
        transactionId: failTransactionId,
        errorCode: "PAYMENT_CANCELLED_BY_USER",
        errorDescription: "User clicked back button on UPI screen.",
      });

      if (failRes.status !== 200 || failRes.body.data?.status !== "failed") {
        throw new Error(`Record failure failed: ${JSON.stringify(failRes.body)}`);
      }
    });

    // 7. Customer views Transaction History
    await test("6. GET /api/transactions/my-history - Customer fetches personal transaction history", async () => {
      const res = await api("/api/transactions/my-history", "GET", null, customerToken);
      if (res.status !== 200 || !Array.isArray(res.body.data?.transactions) || res.body.data.transactions.length === 0) {
        throw new Error(`Transaction history failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 8. Admin lists all transactions
    await test("7. GET /api/transactions/admin/all - Admin retrieves all transactions list with filter", async () => {
      const res = await api("/api/transactions/admin/all?status=successful", "GET", null, adminToken);
      if (res.status !== 200 || !res.body.data?.pagination) {
        throw new Error(`Admin transactions failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 9. Admin processes refund for successful transaction
    await test("8. POST /api/transactions/admin/:id/refund - Admin issues refund & marks Order Refunded", async () => {
      const res = await api(
        `/api/transactions/admin/${activeTransactionMongoId}/refund`,
        "POST",
        {
          refundAmount: 2999,
          reason: "Customer requested fragrance exchange",
        },
        adminToken
      );

      if (res.status !== 200 || res.body.data?.status !== "refunded") {
        throw new Error(`Refund failed: ${JSON.stringify(res.body)}`);
      }

      // Check linked order is marked Refunded
      const updatedOrder = await Order.findById(order._id);
      if (updatedOrder.paymentStatus !== "Refunded") {
        throw new Error(`Expected order paymentStatus 'Refunded', got '${updatedOrder.paymentStatus}'`);
      }
    });

    // 10. Reject refunding non-successful transaction
    await test("9. POST /api/transactions/admin/:id/refund - Reject refunding failed transaction (400)", async () => {
      const failTxn = await Transaction.findOne({ transactionId: failTransactionId });
      const res = await api(
        `/api/transactions/admin/${failTxn._id}/refund`,
        "POST",
        { refundAmount: 2999 },
        adminToken
      );

      if (res.status !== 400) {
        throw new Error(`Expected 400 for refunding failed txn, got ${res.status}`);
      }
    });

    console.log("\n==================================================");
    console.log(`🏁 MODULE 5 RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================\n");
  } catch (error) {
    console.error("Module 5 Fatal Error:", error);
  } finally {
    // Cleanup
    await Transaction.deleteMany({ transactionId: { $regex: /TXN-SOA-/ } });
    await Order.deleteMany({ "customerDetails.email": { $regex: /test_txn_/ } });
    await Product.deleteMany({ name: { $regex: /Txn Test Prod/ } });
    await Category.deleteMany({ name: { $regex: /Txn Test Cat/ } });
    await User.deleteMany({ email: { $regex: /test_txn_customer|test_txn_admin/ } });
    if (server) server.close();
    await mongoose.connection.close();
    process.exit(failed > 0 ? 1 : 0);
  }
};

runSuite();
