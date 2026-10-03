const cron = require("node-cron");
const Cart = require("../models/cart");
const Order = require("../models/order");
const Product = require("../models/product");
const SiteSetting = require("../models/settings");
const emailService = require("../services/emailService");

/**
 * Abandoned Cart Automated Background Worker
 */
async function processAbandonedCarts() {
  try {
    const settingsDoc = await SiteSetting.findOne().lean();
    const config = settingsDoc?.abandonedCartSettings || {
      isEnabled: true,
      firstReminderDelayHours: 1,
      secondReminderDelayHours: 24,
      maxReminders: 2,
      minCartValue: 0,
    };

    if (!config.isEnabled) {
      return;
    }

    const now = new Date();
    const firstDelayMs = (config.firstReminderDelayHours || 1) * 60 * 60 * 1000;
    const secondDelayMs = (config.secondReminderDelayHours || 24) * 60 * 60 * 1000;
    const maxReminders = config.maxReminders || 2;
    const minCartValue = config.minCartValue || 0;

    // 1. Find Candidate Carts for 1st Reminder (remindersSent: 0, lastActivity older than firstDelay)
    const firstReminderCutoff = new Date(now.getTime() - firstDelayMs);
    const eligibleFirst = await Cart.find({
      status: { $in: ["active", "abandoned"] },
      "customer.email": { $exists: true, $ne: "" },
      remindersSent: 0,
      lastActivityAt: { $lte: firstReminderCutoff },
      totalAmount: { $gte: minCartValue },
      items: { $exists: true, $not: { $size: 0 } },
    }).limit(25);

    // 2. Find Candidate Carts for 2nd Reminder (remindersSent: 1, lastReminderSentAt older than secondDelay)
    let eligibleSecond = [];
    if (maxReminders >= 2) {
      const secondReminderCutoff = new Date(now.getTime() - secondDelayMs);
      eligibleSecond = await Cart.find({
        status: "abandoned",
        "customer.email": { $exists: true, $ne: "" },
        remindersSent: 1,
        lastReminderSentAt: { $lte: secondReminderCutoff },
        totalAmount: { $gte: minCartValue },
        items: { $exists: true, $not: { $size: 0 } },
      }).limit(25);
    }

    const allCandidates = [
      ...eligibleFirst.map((c) => ({ cart: c, reminderNum: 1 })),
      ...eligibleSecond.map((c) => ({ cart: c, reminderNum: 2 })),
    ];

    if (allCandidates.length === 0) {
      return;
    }

    console.log(`[AbandonedCartCron] Processing ${allCandidates.length} eligible abandoned cart(s)...`);

    for (const { cart, reminderNum } of allCandidates) {
      const email = cart.customer?.email?.toLowerCase().trim();
      if (!email) continue;

      // Rule 1: Verify patron hasn't already completed an order since cart creation
      const existingOrder = await Order.findOne({
        "customerDetails.email": email,
        createdAt: { $gte: cart.createdAt || cart.lastActivityAt },
      });

      if (existingOrder) {
        cart.status = "completed";
        cart.completedAt = existingOrder.createdAt;
        cart.convertedOrder = existingOrder._id;
        await cart.save();
        console.log(`[AbandonedCartCron] Cart ${cart._id} marked completed (order #${existingOrder.orderNumber} placed).`);
        continue;
      }

      // Rule 2: Verify at least one item is still in active catalog
      const productSlugs = cart.items.map((i) => i.slug || i.productId);
      const activeProductsCount = await Product.countDocuments({
        $or: [{ slug: { $in: productSlugs } }, { _id: { $in: cart.items.map((i) => i.product).filter(Boolean) } }],
        isActive: true,
      });

      if (activeProductsCount === 0) {
        cart.status = "cancelled";
        await cart.save();
        console.log(`[AbandonedCartCron] Cart ${cart._id} items no longer in catalog. Skipping.`);
        continue;
      }

      // Send the luxury abandoned cart reminder email
      const result = await emailService.sendAbandonedCartReminder(cart, reminderNum);

      if (result.success) {
        cart.status = "abandoned";
        cart.abandonedAt = cart.abandonedAt || new Date();
        cart.remindersSent = (cart.remindersSent || 0) + 1;
        cart.lastReminderSentAt = new Date();
        cart.reminderHistory.push({
          sentAt: new Date(),
          reminderNumber: reminderNum,
          email,
          subject: reminderNum === 1 ? config.emailSubject : `Final Notice: Special Privilege`,
          status: "delivered",
        });
        await cart.save();
        console.log(`[AbandonedCartCron] Sent reminder #${reminderNum} to ${email} for cart ${cart._id}`);
      } else {
        cart.reminderHistory.push({
          sentAt: new Date(),
          reminderNumber: reminderNum,
          email,
          status: "failed",
          error: result.error,
        });
        await cart.save();
      }
    }
  } catch (err) {
    console.error("[AbandonedCartCron:Error]", err.message);
  }
}

/**
 * Initialize Cron Schedule (Runs every 15 minutes)
 */
function initAbandonedCartCron() {
  // Run every 15 minutes
  cron.schedule("*/15 * * * *", () => {
    processAbandonedCarts();
  });

  console.log("[Cron] Abandoned Cart Background Worker initialized (running every 15 mins).");

  // Run once on server startup with gentle 10-second delay
  setTimeout(() => {
    processAbandonedCarts();
  }, 10000);
}

module.exports = {
  initAbandonedCartCron,
  processAbandonedCarts,
};
