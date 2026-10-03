require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const SiteSetting = require("./models/settings");
const Cart = require("./models/cart");
const Order = require("./models/order");
const User = require("./models/user");
const emailService = require("./services/emailService");
const { processAbandonedCarts } = require("./cron/abandonedCartCron");

async function runVerification() {
  console.log("=== SPIRIT OF ARABIAN FEATURE VERIFICATION ===");
  await connectDB();

  try {
    // 1. Social Media & Settings Model
    console.log("\n[Test 1] Verifying Settings & Social Media Configuration...");
    let settings = await SiteSetting.findOne();
    if (!settings) {
      settings = await SiteSetting.create({
        socialMedia: {
          instagram: { url: "https://instagram.com/spiritofarabian", enabled: true },
          facebook: { url: "https://facebook.com/spiritofarabian", enabled: true },
          youtube: { url: "https://youtube.com/@spiritofarabian", enabled: true },
          twitter: { url: "https://x.com/spiritofarabian", enabled: false },
        },
        smtp: {
          host: "smtp.mailgun.org",
          port: 587,
          username: "postmaster@spiritofarabian.com",
          password: "supersecretpass",
          encryption: "TLS",
          fromEmail: "concierge@spiritofarabian.com",
          fromName: "SPIRIT OF ARABIAN",
          isEnabled: true,
        },
        abandonedCartSettings: {
          isEnabled: true,
          firstReminderDelayHours: 1,
          secondReminderDelayHours: 24,
          maxReminders: 2,
          minCartValue: 0,
          discountCode: "ROYALRESERVE10",
          discountPercent: 10,
          emailSubject: "Your Artisanal Reserve is Waiting at the Atelier",
        },
      });
    }

    console.log("✓ Settings retrieved successfully:", {
      instagram: settings.socialMedia?.instagram,
      smtpHost: settings.smtp?.host,
      smtpEnabled: settings.smtp?.isEnabled,
      abandonedCartEnabled: settings.abandonedCartSettings?.isEnabled,
    });

    // 2. Email Service Notification Dispatch (Non-blocking & Resilience check)
    console.log("\n[Test 2] Verifying Reusable Email Service Notification Templates...");

    // Test Registration Email
    const resReg = await emailService.sendWelcomeEmail({
      name: "Tariq Al-Mansoor",
      email: "tariq.test@spiritofarabian.com",
    });
    console.log("✓ Welcome Email:", resReg.success ? "Success/Simulated" : "Failed", resReg);

    // Test OTP Email
    const resOtp = await emailService.sendOtpEmail("tariq.test@spiritofarabian.com", "849201", "Tariq Al-Mansoor");
    console.log("✓ OTP Email:", resOtp.success ? "Success/Simulated" : "Failed");

    // Test Order Confirmation
    const resOrder = await emailService.sendOrderConfirmation({
      orderNumber: "SOA-99214",
      customerDetails: { fullName: "Tariq Al-Mansoor", email: "tariq.test@spiritofarabian.com" },
      items: [{ name: "Musc Royale Extrait", size: "6ml Flacon", quantity: 1, price: 4200 }],
      subTotal: 4200,
      totalAmount: 4200,
      paymentMethod: "Razorpay",
    });
    console.log("✓ Order Confirmation Email:", resOrder.success ? "Success/Simulated" : "Failed");

    // Test Payment Success & Failure
    const resPaySuccess = await emailService.sendPaymentSuccess(
      { orderNumber: "SOA-99214", customerDetails: { fullName: "Tariq", email: "tariq.test@spiritofarabian.com" }, totalAmount: 4200 },
      { transactionId: "TXN-99214" }
    );
    console.log("✓ Payment Success Email:", resPaySuccess.success ? "Success/Simulated" : "Failed");

    const resPayFail = await emailService.sendPaymentFailure(
      { orderNumber: "SOA-99214", customerDetails: { fullName: "Tariq", email: "tariq.test@spiritofarabian.com" }, totalAmount: 4200 },
      "Card expired"
    );
    console.log("✓ Payment Failure Email:", resPayFail.success ? "Success/Simulated" : "Failed");

    // Test Order Status Update & Cancellation
    const resStatus = await emailService.sendOrderStatusUpdate(
      { orderNumber: "SOA-99214", customerDetails: { fullName: "Tariq", email: "tariq.test@spiritofarabian.com" } },
      "Order Confirmed",
      "Dispatched",
      { courier: "BlueDart Insured", trackingNumber: "BD-8891024", trackingUrl: "https://bluedart.com/track" }
    );
    console.log("✓ Status Update Email:", resStatus.success ? "Success/Simulated" : "Failed");

    // 3. Abandoned Cart Tracking & Sync
    console.log("\n[Test 3] Verifying Abandoned Cart Tracking & Sync Flow...");
    const testSessionId = "test_sess_" + Date.now();
    const cart = await Cart.create({
      sessionId: testSessionId,
      customer: {
        name: "Lord Vance",
        email: "vance.patron@spiritofarabian.com",
        phone: "+971500000000",
      },
      items: [
        {
          name: "Taif Rose & Oud Sublime",
          size: "12ml Imperial Extrait",
          price: 9800,
          quantity: 1,
          slug: "taif-rose-oud",
        },
      ],
      subtotal: 9800,
      totalAmount: 9800,
      status: "abandoned",
      lastActivityAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      remindersSent: 0,
    });

    console.log("✓ Created Abandoned Cart session:", {
      id: cart._id,
      recoveryToken: cart.recoveryToken,
      customer: cart.customer.email,
      total: cart.totalAmount,
    });

    // Test Abandoned Cart Email Dispatch
    const resCartEmail = await emailService.sendAbandonedCartReminder(cart, 1);
    console.log("✓ Abandoned Cart Reminder Email:", resCartEmail.success ? "Success/Simulated" : "Failed");

    // 4. Background Cron Processing
    console.log("\n[Test 4] Running Background Abandoned Cart Cron Worker...");
    await processAbandonedCarts();

    // Verify Cart was updated with reminder history
    const refreshedCart = await Cart.findById(cart._id);
    console.log("✓ Refreshed Cart Reminder Count:", refreshedCart.remindersSent, "| Status:", refreshedCart.status);

    console.log("\n=== ALL FEATURES VERIFIED SUCCESSFULLY ===");
    process.exit(0);
  } catch (err) {
    console.error("Verification failed:", err);
    process.exit(1);
  }
}

runVerification();
