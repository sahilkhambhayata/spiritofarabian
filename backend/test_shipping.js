require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const shippingService = require("./services/shipping/shippingService");
const Order = require("./models/order");
const Product = require("./models/product");
const Shipment = require("./models/shipment");
const User = require("./models/user");

const runShippingTests = async () => {
  console.log("🚚 Starting Spirit of Arabian Shipping & Delivery Tests...\n");
  let passed = 0;
  let total = 0;

  const assert = (condition, title) => {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${title}`);
    }
  };

  try {
    await connectDB();

    // 1. Check Serviceability for India Pincode
    console.log("📦 1. Testing India Pincode Serviceability...");
    const indiaServiceability = await shippingService.checkServiceability({
      country: "India",
      pincode: "400001",
      cod: true,
      items: [],
    });
    assert(indiaServiceability.isServiceable === true, "India pincode 400001 is serviceable");
    assert(indiaServiceability.availableCouriers.length > 0, "Available couriers returned for India");

    // 2. Check Serviceability for International
    console.log("\n🌍 2. Testing International Serviceability & Compliance...");
    const internationalServiceability = await shippingService.checkServiceability({
      country: "United Arab Emirates",
      pincode: "12345",
      cod: false,
      items: [],
    });
    assert(internationalServiceability.isServiceable === true, "UAE international shipping is serviceable");

    // 3. Shipping Rate Calculations & Complimentary Thresholds
    console.log("\n💰 3. Testing Shipping Rate Calculation...");
    const rateUnderThreshold = await shippingService.calculateShippingOptions({
      country: "India",
      pincode: "400001",
      subTotal: 899,
    });
    assert(rateUnderThreshold.options.length > 0, "Rates calculated under ₹1,500");
    assert(rateUnderThreshold.options[0].finalShippingFee > 0, "Shipping fee applied under ₹1,500");

    const rateAboveThreshold = await shippingService.calculateShippingOptions({
      country: "India",
      pincode: "400001",
      subTotal: 2499,
    });
    assert(rateAboveThreshold.options[0].isComplimentary === true, "Complimentary free shipping flagged for ₹2,499");
    assert(rateAboveThreshold.options[0].finalShippingFee === 0, "Final fee is ₹0 above ₹1,500 threshold");

    // 4. Create an Order and Book Shipment
    console.log("\n📑 4. Testing Shipment Creation for Order...");
    const sampleProduct = await Product.findOne({ isActive: true, isDeleted: false });
    const sampleUser = await User.findOne({ email: "admin@spiritofarabian.com" });

    const testOrder = await Order.create({
      orderNumber: `SOA-SHIP-${Math.floor(10000 + Math.random() * 90000)}`,
      user: sampleUser._id,
      customerDetails: {
        fullName: "Lord Alexandre Vance",
        email: "alexandre@spiritofarabian.com",
        phone: "+91 9876543210",
      },
      shippingAddress: {
        street: "740 Royal Palms Boulevard",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        country: "India",
      },
      items: [
        {
          product: sampleProduct._id,
          name: sampleProduct.name,
          slug: sampleProduct.slug,
          size: "6ml",
          price: 2799,
          quantity: 1,
          itemType: "single_attar",
        },
      ],
      subTotal: 2799,
      shippingFee: 0,
      totalAmount: 2799,
      paymentMethod: "COD",
      orderStatus: "Order Confirmed",
    });

    const shipment = await shippingService.createShipmentForOrder(testOrder._id);
    assert(Boolean(shipment._id), "Shipment record created in MongoDB");
    assert(shipment.orderNumber === testOrder.orderNumber, "Shipment linked with correct orderNumber");
    assert(shipment.status === "created", "Initial shipment status is 'created'");

    // 5. Generate AWB
    console.log("\n🏷️ 5. Testing AWB Generation...");
    const awbShipment = await shippingService.generateAwbForShipment(shipment._id);
    assert(Boolean(awbShipment.awbCode), `AWB successfully generated: ${awbShipment.awbCode}`);
    assert(awbShipment.status === "awb_assigned", "Shipment status updated to 'awb_assigned'");

    // Verify order backward-compatible tracking sync
    const updatedOrder = await Order.findById(testOrder._id);
    assert(updatedOrder.tracking.trackingNumber === awbShipment.awbCode, "Order.tracking.trackingNumber synchronized");

    // 6. Generate Label
    console.log("\n📄 6. Testing Label Generation...");
    const labelShipment = await shippingService.generateLabelForShipment(shipment._id);
    assert(Boolean(labelShipment.labelUrl), `Shipping label URL generated: ${labelShipment.labelUrl}`);

    // 7. Request Pickup
    console.log("\n🚛 7. Testing Carrier Pickup Request...");
    const pickupShipment = await shippingService.requestPickupForShipment(shipment._id);
    assert(Boolean(pickupShipment.pickupTokenNumber), `Pickup token assigned: ${pickupShipment.pickupTokenNumber}`);
    assert(pickupShipment.status === "pickup_scheduled", "Shipment status updated to 'pickup_scheduled'");

    // 8. Track Shipment
    console.log("\n📍 8. Testing Live Tracking Timeline...");
    const tracked = await shippingService.trackShipment(awbShipment.awbCode);
    assert(tracked.trackingEvents.length > 0, "Tracking checkpoints returned");
    assert(Boolean(tracked.status), `Current status: ${tracked.status}`);

    // 9. Inbound Webhook Processing
    console.log("\n⚡ 9. Testing Inbound Tracking Webhook...");
    const webhookResult = await shippingService.handleWebhook(
      "shiprocket",
      {
        awb: awbShipment.awbCode,
        current_status: "OUT FOR DELIVERY",
        location: "Mumbai South Station",
        activity: "Van loaded with high-value vault flacon for delivery.",
        date: new Date().toISOString(),
      },
      {}
    );
    assert(webhookResult.processed === true, "Webhook event processed successfully");
    assert(webhookResult.status === "out_for_delivery", "Shipment status updated via webhook to 'out_for_delivery'");

    const orderAfterWebhook = await Order.findById(testOrder._id);
    assert(orderAfterWebhook.orderStatus === "Out for Delivery", "Order model synchronized to 'Out for Delivery'");

    // Clean up test order & shipment
    await Shipment.findByIdAndDelete(shipment._id);
    await Order.findByIdAndDelete(testOrder._id);

    console.log("\n==================================================");
    console.log(`🏆 SHIPPING SYSTEM TEST RESULTS: ${passed}/${total} PASSED!`);
    console.log("==================================================");
    process.exit(0);
  } catch (error) {
    console.error("Test Error:", error);
    process.exit(1);
  }
};

runShippingTests();
