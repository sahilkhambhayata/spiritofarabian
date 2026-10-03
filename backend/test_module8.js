require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./index");
const connectDB = require("./config/db");
const User = require("./models/user");
const Concierge = require("./models/concierge");

const TEST_PORT = 5092;
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
  console.log("🚀 STARTING AUTOMATED TESTS FOR MODULE 8: CONCIERGE & VIP INQUIRIES");
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
    await Concierge.deleteMany({ email: { $regex: /test_concierge_/ } });
    await User.deleteMany({ email: { $regex: /test_concierge_customer|test_concierge_admin/ } });

    // Setup Customer & Admin
    const customer = await User.create({
      name: "VIP Patron",
      email: "test_concierge_customer@soa.com",
      password: "Password@123",
      role: "customer",
    });
    const customerToken = customer.generateAuthToken();

    const admin = await User.create({
      name: "Concierge Manager",
      email: "test_concierge_admin@soa.com",
      password: "Password@123",
      role: "admin",
    });
    const adminToken = admin.generateAuthToken();

    let inquiryId1 = "";
    let inquiryId2 = "";

    // 1. Reject missing fields
    await test("1. POST /api/concierge - Reject missing required fields (400)", async () => {
      const res = await api("/api/concierge", "POST", {
        name: "Incomplete",
      });
      if (res.status !== 400) {
        throw new Error(`Expected status 400, got ${res.status}`);
      }
    });

    // 2. Public submits VIP Fragrance Consultation Booking
    await test("2. POST /api/concierge - Submit VIP Private Scent Consultation", async () => {
      const res = await api("/api/concierge", "POST", {
        name: "Sheikha Maryam",
        email: "test_concierge_customer@soa.com",
        phone: "+971 50 123 4567",
        preferredScent: "Oud Impérial",
        preferredDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        notes: "Private bridal scent consultation for royal wedding.",
        type: "Private Fragrance Consultation",
      });

      if (res.status !== 201 || !res.body.data?._id || res.body.data.status !== "New") {
        throw new Error(`Submit consultation failed: ${JSON.stringify(res.body)}`);
      }
      inquiryId1 = res.body.data._id;
    });

    // 3. Public submits Bespoke Attar Quiz Inquiry
    await test("3. POST /api/concierge - Submit Bespoke Custom Attar Quiz Result", async () => {
      const res = await api("/api/concierge", "POST", {
        name: "Tariq Al-Mansoor",
        email: "test_concierge_tariq@soa.com",
        phone: "+91 9876543210",
        preferredScent: "Royal Taif Rose",
        type: "Bespoke Custom Attar",
        quizResponses: {
          scentProfile: "Woody & Smokey",
          occasion: "Evening Gatherings",
          intensity: "Extrait de Parfum",
          matchedProduct: "Taif Rose Extrait",
        },
      });

      if (res.status !== 201 || !res.body.data?._id) {
        throw new Error(`Submit quiz inquiry failed: ${JSON.stringify(res.body)}`);
      }
      inquiryId2 = res.body.data._id;
    });

    // 4. Customer retrieves My Inquiries
    await test("4. GET /api/concierge/my-inquiries - Customer fetches personal inquiries", async () => {
      const res = await api("/api/concierge/my-inquiries", "GET", null, customerToken);
      if (res.status !== 200 || !Array.isArray(res.body.data) || res.body.data.length === 0) {
        throw new Error(`Customer inquiries failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 5. Admin lists all inquiries with pagination & status filter
    await test("5. GET /api/concierge/admin/all - Admin retrieves inquiries with status filter", async () => {
      const res = await api("/api/concierge/admin/all?status=New", "GET", null, adminToken);
      if (res.status !== 200 || !res.body.data?.pagination || res.body.data.inquiries.length === 0) {
        throw new Error(`Admin fetch failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 6. Admin search inquiries
    await test("6. GET /api/concierge/admin/all?search=Maryam - Search inquiries by keyword", async () => {
      const res = await api("/api/concierge/admin/all?search=Maryam", "GET", null, adminToken);
      if (res.status !== 200 || res.body.data.inquiries.length === 0) {
        throw new Error(`Search failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 7. Admin updates status to "Scheduled" & assigns Master Perfumer
    await test("7. PUT /api/concierge/admin/:id - Admin updates status to 'Scheduled' with notes", async () => {
      const res = await api(
        `/api/concierge/admin/${inquiryId1}`,
        "PUT",
        {
          status: "Scheduled",
          adminNotes: "VIP appointment confirmed for Saturday 4 PM at Dubai Mall Suite.",
          assignedMasterPerfumer: "Master Farooq Al-Hassan",
        },
        adminToken
      );

      if (
        res.status !== 200 ||
        res.body.data?.status !== "Scheduled" ||
        res.body.data?.assignedMasterPerfumer !== "Master Farooq Al-Hassan"
      ) {
        throw new Error(`Update inquiry failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 8. Admin soft deletes inquiry
    await test("8. DELETE /api/concierge/admin/:id - Admin soft deletes completed inquiry", async () => {
      const res = await api(`/api/concierge/admin/${inquiryId2}`, "DELETE", null, adminToken);
      if (res.status !== 200) {
        throw new Error(`Delete inquiry failed: ${JSON.stringify(res.body)}`);
      }
    });

    console.log("\n==================================================");
    console.log(`🏁 MODULE 8 RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================\n");
  } catch (error) {
    console.error("Module 8 Fatal Error:", error);
  } finally {
    // Cleanup
    await Concierge.deleteMany({ email: { $regex: /test_concierge_/ } });
    await User.deleteMany({ email: { $regex: /test_concierge_customer|test_concierge_admin/ } });
    if (server) server.close();
    await mongoose.connection.close();
    process.exit(failed > 0 ? 1 : 0);
  }
};

runSuite();
