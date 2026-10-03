require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./index");
const User = require("./models/user");
require("./models/product");
require("./models/category");

const TEST_PORT = 5099;
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
  console.log("🚀 STARTING AUTOMATED TESTS FOR MODULE 1: AUTH & USER");
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

    // Clean test accounts
    await User.deleteMany({ email: { $regex: /test_customer_|test_admin_/ } });

    let token = "";
    let adminToken = "";
    let addressId = "";

    // 1. Health Check
    await test("1. GET /api/health - Server health check", async () => {
      const res = await api("/api/health");
      if (res.status !== 200 || res.body.status !== "online") {
        throw new Error(`Expected status 200, got ${res.status}`);
      }
    });

    // 2. Register Customer
    await test("2. POST /api/users/register - Register new customer", async () => {
      const res = await api("/api/users/register", "POST", {
        name: "Luxury Customer",
        email: "test_customer_arabian@soa.com",
        password: "SecretPassword@123",
        phone: "+91 9876543210",
      });

      if (res.status !== 201 || !res.body.data?.token) {
        throw new Error(`Register failed: ${JSON.stringify(res.body)}`);
      }
      token = res.body.data.token;
    });

    // 3. Duplicate Email Prevention
    await test("3. POST /api/users/register - Reject duplicate email registration", async () => {
      const res = await api("/api/users/register", "POST", {
        name: "Luxury Customer Duplicate",
        email: "test_customer_arabian@soa.com",
        password: "SecretPassword@123",
      });

      if (res.status !== 400) {
        throw new Error(`Expected status 400, got ${res.status}`);
      }
    });

    // 4. Login with Correct Credentials
    await test("4. POST /api/users/login - Login with valid credentials", async () => {
      const res = await api("/api/users/login", "POST", {
        email: "test_customer_arabian@soa.com",
        password: "SecretPassword@123",
      });

      if (res.status !== 200 || !res.body.data?.token) {
        throw new Error(`Login failed: ${JSON.stringify(res.body)}`);
      }
      token = res.body.data.token;
    });

    // 5. Reject Invalid Password
    await test("5. POST /api/users/login - Reject invalid password", async () => {
      const res = await api("/api/users/login", "POST", {
        email: "test_customer_arabian@soa.com",
        password: "WrongPassword999",
      });

      if (res.status !== 401) {
        throw new Error(`Expected status 401, got ${res.status}`);
      }
    });

    // 6. Get User Profile (Protected)
    await test("6. GET /api/users/profile - Fetch user profile with JWT", async () => {
      const res = await api("/api/users/profile", "GET", null, token);
      if (
        res.status !== 200 ||
        res.body.data?.email !== "test_customer_arabian@soa.com"
      ) {
        throw new Error(`Profile fetch failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 7. Reject Unauthorized Access
    await test("7. GET /api/users/profile - Reject request without token", async () => {
      const res = await api("/api/users/profile", "GET");
      if (res.status !== 401) {
        throw new Error(`Expected status 401, got ${res.status}`);
      }
    });

    // 8. Update Profile
    await test("8. PUT /api/users/profile - Update user name & phone", async () => {
      const res = await api(
        "/api/users/profile",
        "PUT",
        { name: "Updated Royal Customer", phone: "+91 9998887776" },
        token,
      );

      if (
        res.status !== 200 ||
        res.body.data?.name !== "Updated Royal Customer"
      ) {
        throw new Error(`Profile update failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 9. Add Delivery Address
    await test("9. POST /api/users/address - Add delivery address", async () => {
      const res = await api(
        "/api/users/address",
        "POST",
        {
          fullName: "Royal Customer",
          phone: "+91 9998887776",
          street: "Palace Road, Near Burj Khalifa",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
          country: "India",
          isDefault: true,
        },
        token,
      );

      if (
        res.status !== 201 ||
        !Array.isArray(res.body.data) ||
        res.body.data.length === 0
      ) {
        throw new Error(`Add address failed: ${JSON.stringify(res.body)}`);
      }
      addressId = res.body.data[0]._id;
    });

    // 10. Update Delivery Address
    await test("10. PUT /api/users/address/:id - Update delivery address", async () => {
      const res = await api(
        `/api/users/address/${addressId}`,
        "PUT",
        { city: "Navi Mumbai" },
        token,
      );

      if (res.status !== 200) {
        throw new Error(`Update address failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 11. Change Password
    await test("11. PUT /api/users/change-password - Change user password", async () => {
      const res = await api(
        "/api/users/change-password",
        "PUT",
        {
          currentPassword: "SecretPassword@123",
          newPassword: "BrandNewPassword@2026",
        },
        token,
      );

      if (res.status !== 200) {
        throw new Error(`Change password failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 12. Login with Changed Password
    await test("12. POST /api/users/login - Login with newly changed password", async () => {
      const res = await api("/api/users/login", "POST", {
        email: "test_customer_arabian@soa.com",
        password: "BrandNewPassword@2026",
      });

      if (res.status !== 200 || !res.body.data?.token) {
        throw new Error(
          `Login with new password failed: ${JSON.stringify(res.body)}`,
        );
      }
      token = res.body.data.token;
    });

    // 13. Customer Forbidden on Admin Endpoint
    await test("13. GET /api/users/admin/all - Customer role rejected on Admin route (403)", async () => {
      const res = await api("/api/users/admin/all", "GET", null, token);
      if (res.status !== 403) {
        throw new Error(`Expected 403 Forbidden, got ${res.status}`);
      }
    });

    // 14. Admin Access to User List
    await test("14. GET /api/users/admin/all - Admin role allowed on Admin route (200)", async () => {
      const admin = await User.create({
        name: "Master Admin",
        email: "test_admin_master@soa.com",
        password: "AdminPassword@123",
        role: "admin",
      });
      adminToken = admin.generateAuthToken();

      const res = await api("/api/users/admin/all", "GET", null, adminToken);
      if (res.status !== 200 || !Array.isArray(res.body.data?.users)) {
        throw new Error(`Admin fetch failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 15. Delete Delivery Address
    await test("15. DELETE /api/users/address/:id - Remove delivery address", async () => {
      const res = await api(
        `/api/users/address/${addressId}`,
        "DELETE",
        null,
        token,
      );
      if (res.status !== 200) {
        throw new Error(`Delete address failed: ${JSON.stringify(res.body)}`);
      }
    });

    console.log("\n==================================================");
    console.log(`🏁 MODULE 1 RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================\n");
  } catch (error) {
    console.error("Suite Execution Error:", error);
  } finally {
    // Cleanup
    await User.deleteMany({ email: { $regex: /test_customer_|test_admin_/ } });
    if (server) server.close();
    await mongoose.connection.close();
    process.exit(failed > 0 ? 1 : 0);
  }
};

runSuite();
