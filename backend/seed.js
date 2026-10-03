require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");

const User = require("./models/user");
const Category = require("./models/category");
const Product = require("./models/product");
const Information = require("./models/information");
const Banner = require("./models/banner");
const Coupon = require("./models/coupon");
const SiteSetting = require("./models/settings");
const VideoReview = require("./models/videoreview");
const Journal = require("./models/blog");

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log("🌿 Seeding Spirit of Arabian database...\n");

    // 1. Admin User
    let admin = await User.findOne({ email: "admin@spiritofarabian.com" });
    if (!admin) {
      admin = await User.create({
        name: "Grand Master Perfumer",
        email: "admin@spiritofarabian.com",
        password: "Admin@2026Password",
        phone: "+91 98765 43210",
        role: "superadmin",
      });
      console.log("✅ Superadmin created: admin@spiritofarabian.com / Admin@2026Password");
    }

    // 2. Categories
    const categoriesData = [
      {
        name: "Pure Royal Ouds",
        slug: "pure-royal-ouds",
        description: "Aged wild agarwood oils distilled from Assam, Cambodia, and Kalimantan.",
        bannerImage: "/images/oud-banner.jpg",
        icon: "Sparkles",
        orderIndex: 1,
      },
      {
        name: "Floral & Taif Roses",
        slug: "floral-taif-roses",
        description: "Hand-picked highland mountain roses distilled in copper stills.",
        bannerImage: "/images/rose-banner.jpg",
        icon: "Flower2",
        orderIndex: 2,
      },
      {
        name: "Amber & Imperial Musks",
        slug: "amber-imperial-musks",
        description: "Velvety warm resins, precious ambergris accords, and white silk musks.",
        bannerImage: "/images/amber-banner.jpg",
        icon: "Flame",
        orderIndex: 3,
      },
      {
        name: "Heirloom Gift Vaults",
        slug: "heirloom-gift-vaults",
        description: "Curated multi-bottle pairings in handcrafted velvet caskets.",
        bannerImage: "/images/vault-box.jpg",
        icon: "Gift",
        orderIndex: 4,
      },
    ];

    const savedCats = {};
    for (const c of categoriesData) {
      let cat = await Category.findOne({ slug: c.slug });
      if (!cat) {
        cat = await Category.create(c);
      }
      savedCats[c.slug] = cat._id;
    }
    console.log("✅ Categories seeded");

    // 3. Products
    const productsData = [
      {
        name: "Oud Impérial 25-Year",
        slug: "oud-imperial-25-year",
        arabicName: "عود ملكي معتق ٢૫ عام",
        tagline: "Wild-harvested ancient Koh Kong agarwood.",
        description: "Distilled from ancient trees in Koh Kong province, releasing smokey leather, wild honey, and dark resin. 0% alcohol with unmatched 18+ hour sillage.",
        category: savedCats["pure-royal-ouds"],
        productType: "single_attar",
        fragrance: {
          family: "Oud",
          gender: "Unisex",
          intensity: "Extrait de Parfum",
          longevity: "18+ Hours",
          sillage: "Enormous",
          origin: "Cambodia / Dubai",
        },
        notes: {
          top: ["Golden Saffron", "Smoked Bergamot"],
          heart: ["Aged Leather", "Cistus Labdanum"],
          base: ["Wild Cambodian Oud", "Black Amber"],
        },
        variants: [
          { size: 3, unit: "ml", label: "3ml Pocket Flacon", price: 1499, isDefault: false },
          { size: 6, unit: "ml", label: "6ml Royal Bottle", price: 2799, isDefault: true },
          { size: 12, unit: "ml", label: "12ml Crystal Decanter", price: 4999, isDefault: false },
        ],
        images: [{ url: "/images/cambodian-oud.jpg", alt: "Oud Impérial", isPrimary: true }],
        tags: ["oud", "aged", "bestseller", "royal"],
        badge: "Grand Reserve",
        isFeatured: true,
        isBestSeller: true,
      },
      {
        name: "Taif Rose Extrait",
        slug: "taif-rose-extrait",
        arabicName: "خلاصة ورد الطائف الملكي",
        tagline: "40,000 handpicked mountain roses per tola.",
        description: "Harvested at dawn on the mountain peaks of Taif, releasing a crystalline, luminous dewy rose with honeyed undertones.",
        category: savedCats["floral-taif-roses"],
        productType: "single_attar",
        fragrance: {
          family: "Floral",
          gender: "Unisex",
          intensity: "Strong",
          longevity: "14+ Hours",
          sillage: "Strong",
          origin: "Taif, Saudi Arabia",
        },
        notes: {
          top: ["Morning Dew", "Green Rose Leaves"],
          heart: ["Pure Taif Rose Petals", "Damask Blossom"],
          base: ["White Musk", "Mysore Sandalwood"],
        },
        variants: [
          { size: 3, unit: "ml", label: "3ml Pocket Flacon", price: 1199, isDefault: false },
          { size: 6, unit: "ml", label: "6ml Royal Bottle", price: 1999, isDefault: true },
          { size: 12, unit: "ml", label: "12ml Crystal Decanter", price: 3599, isDefault: false },
        ],
        images: [{ url: "/images/taif-rose.jpg", alt: "Taif Rose", isPrimary: true }],
        tags: ["floral", "rose", "fresh"],
        badge: "Highland Harvest",
        isFeatured: true,
        isNewArrival: true,
      },
      {
        name: "Royal Ambergris & Silk Musk",
        slug: "royal-ambergris-silk-musk",
        arabicName: "عنبر ملكي ومسك الحرير",
        tagline: "Warm golden resin fused with skin-caress musk.",
        description: "An intimate aura of creamy Mysore sandalwood, sun-warmed Baltic amber, and clean white silk musk.",
        category: savedCats["amber-imperial-musks"],
        productType: "single_attar",
        fragrance: {
          family: "Amber",
          gender: "Unisex",
          intensity: "Moderate",
          longevity: "16+ Hours",
          origin: "Dubai",
        },
        notes: {
          top: ["Cardamom", "Vanilla Pod"],
          heart: ["Golden Amber Resin", "Benzoin"],
          base: ["Cashmere Musk", "Mysore Sandalwood"],
        },
        variants: [
          { size: 6, unit: "ml", label: "6ml Royal Bottle", price: 2199, isDefault: true },
          { size: 12, unit: "ml", label: "12ml Crystal Decanter", price: 3899, isDefault: false },
        ],
        images: [{ url: "/images/amber-musk.jpg", alt: "Amber Musk", isPrimary: true }],
        tags: ["amber", "musk", "creamy"],
        isFeatured: true,
      },
    ];

    const savedProducts = {};
    for (const p of productsData) {
      let prod = await Product.findOne({ slug: p.slug });
      if (!prod) {
        prod = await Product.create(p);
      }
      savedProducts[p.slug] = prod._id;
    }

    // 4. Gift Box Combo
    let combo = await Product.findOne({ slug: "royal-vault-duo-casket" });
    if (!combo) {
      await Product.create({
        name: "The Royal Vault Duo Casket",
        slug: "royal-vault-duo-casket",
        tagline: "Handcrafted Velvet Casket pairing Aged Oud & Taif Rose.",
        description: "Presented in an heirloom velvet-lined wooden vault with 24k gold leaf latch. Includes Oud Impérial (6ml) and Taif Rose Extrait (6ml) with crystal glass application wands.",
        category: savedCats["heirloom-gift-vaults"],
        productType: "gift_box",
        badge: "Save 25%",
        bundle: {
          isCustomizable: false,
          maxItems: 2,
          includedProducts: [
            { productId: savedProducts["oud-imperial-25-year"], quantity: 1 },
            { productId: savedProducts["taif-rose-extrait"], quantity: 1 },
          ],
        },
        variants: [
          { size: 12, unit: "ml", label: "Duo Set (2 × 6ml)", price: 3599, compareAtPrice: 4798, isDefault: true },
        ],
        images: [{ url: "/images/vault-box.jpg", isPrimary: true }],
        tags: ["gift_box", "combo", "vault"],
        isFeatured: true,
      });
    }
    console.log("✅ Products & Combos seeded");

    // 5. Dynamic Policies
    const policies = [
      {
        policy_type: "shipping",
        title: "Shipping & Royal Delivery Charter",
        path: "/shipping-policy",
        subtitle: "Complimentary climate-controlled worldwide delivery on orders above ₹1,500.",
        highlights: [
          { icon: "Truck", title: "Insured Air Courier", description: "BlueDart express air dispatch within 24 hours." },
          { icon: "ShieldCheck", title: "Tamper-Proof Flacon Vault", description: "Vacuum sealed in velvet casing." },
          { icon: "Clock", title: "2–4 Day Transit", description: "Expedited door-to-door delivery across India & UAE." },
        ],
        sections: [
          { heading: "Domestic Express Dispatch", content: "All domestic orders are packed under climate control and dispatched via BlueDart Air within 24 hours of confirmation." },
          { heading: "Temperature-Controlled Transit", content: "Because 100% pure attars contain 0% alcohol and volatile naturals, bottles are cushioned inside thermal insulation." },
          { heading: "Complimentary Thresholds", content: "Orders of ₹1,500 and above receive free expedited shipping." },
        ],
      },
      {
        policy_type: "return",
        title: "Return & Exchange Policy",
        path: "/return-policy",
        subtitle: "Hassle-free 7-day return window with complimentary discovery samples.",
        highlights: [
          { icon: "RotateCcw", title: "7-Day Easy Returns", description: "Test the 3ml sample before unsealing the main flacon." },
          { icon: "ShieldCheck", title: "100% Money Back", description: "Instant refund upon inspection." },
        ],
        sections: [
          { heading: "The Discovery Guarantee", content: "Every 12ml order arrives with a complimentary 3ml discovery sample. Test the sample first. If the sillage does not suit your aura, return the unsealed 12ml box for a 100% refund." },
        ],
      },
      {
        policy_type: "privacy",
        title: "Patron Privacy & Confidentiality",
        path: "/privacy-policy",
        subtitle: "We guard your personal fragrance portfolio with bank-grade encryption.",
        sections: [
          { heading: "Privacy Integrity", content: "Spirit of Arabian never sells, monetizes, or distributes our patrons' contact records or custom fragrance recipes to third parties." },
        ],
      },
      {
        policy_type: "terms",
        title: "Terms & Conditions of Service",
        path: "/terms-of-service",
        subtitle: "Authenticity and pure botanical stewardship charter.",
        sections: [
          { heading: "Purity Guarantee", content: "All attars are certified 0% alcohol, cruelty-free, and formulated exclusively with high-grade natural and organic aromatic essences." },
        ],
      },
      {
        policy_type: "refund",
        title: "Refund & Satisfaction Guarantee",
        path: "/refund-policy",
        subtitle: "Transparent refund processing within 3–5 business days.",
        sections: [
          { heading: "Refund Timelines", content: "Approved refunds are credited directly back to the original UPI, Card, or Netbanking source within 3 to 5 business days." },
        ],
      },
    ];

    for (const p of policies) {
      await Information.findOneAndUpdate({ policy_type: p.policy_type }, { $set: p }, { upsert: true });
    }
    console.log("✅ Dynamic Policies seeded");

    // 6. Coupons
    const coupons = [
      {
        code: "ROYAL10",
        discountType: "percentage",
        discountValue: 10,
        minOrderValue: 999,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        description: "10% off on royal orders above ₹999",
      },
      {
        code: "ROYAL20",
        discountType: "percentage",
        discountValue: 20,
        minOrderValue: 2499,
        maxDiscountAmount: 1000,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        description: "20% off on connoisseur orders above ₹2,499",
      },
    ];

    for (const cp of coupons) {
      await Coupon.findOneAndUpdate({ code: cp.code }, { $set: cp }, { upsert: true });
    }
    console.log("✅ Promo Coupons seeded");

    // 7. Video Reviews (Shoppable Reels)
    const videoReels = [
      {
        title: "14-Hour Longevity Test in 42°C Dubai Heat",
        videoUrl: "https://cdn.pixabay.com/video/2020/05/25/40134-424754593_large.mp4",
        posterImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600",
        duration: "0:45",
        creator: {
          name: "Yasmin Al-Maktoum",
          handle: "@yasmin.scents",
          location: "Dubai, UAE",
        },
        rating: 5,
        badge: "14h Wear Verified",
        quote: "One swipe on the wrist at 8 AM. Still projecting a rich amber-oud sillage at 11 PM after walking outdoors in the Dubai sun. 0% alcohol makes an unbelievable difference.",
        taggedProduct: savedProducts["oud-imperial-25-year"],
        orderIndex: 1,
      },
      {
        title: "Unboxing the 12ml Crystal Flacon & Glass Wand",
        videoUrl: "https://cdn.pixabay.com/video/2020/05/25/40134-424754593_large.mp4",
        posterImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600",
        duration: "0:38",
        creator: {
          name: "Tariq V. Kensington",
          handle: "@tariq.fragrance",
          location: "London, UK",
        },
        rating: 5,
        badge: "Heirloom Flacon",
        quote: "The velvet weight in hand is unmatched. The glass wand dispenses the exact drop needed for neck and pulse points.",
        taggedProduct: savedProducts["taif-rose-extrait"],
        orderIndex: 2,
      },
    ];

    for (const v of videoReels) {
      await VideoReview.findOneAndUpdate({ title: v.title }, { $set: v }, { upsert: true });
    }
    console.log("✅ Shoppable Video Reels seeded");

    // 8. Site Settings
    await SiteSetting.findOneAndUpdate(
      {},
      {
        $set: {
          announcementBarText: "Complimentary Pure Velvet Pouch & 3ml Sample on All Orders Above ₹2,999",
          freeShippingThreshold: 1500,
          standardShippingFee: 150,
          supportEmail: "concierge@spiritofarabian.com",
          supportPhone: "+91 98765 43210",
        },
      },
      { upsert: true }
    );
    console.log("✅ Site Settings seeded");

    // 9. Sample Demo Orders with Active Shipments
    const Order = require("./models/order");
    const Shipment = require("./models/shipment");

    let demoOrder1 = await Order.findOne({ orderNumber: "SOA-89421" });
    if (!demoOrder1) {
      demoOrder1 = await Order.create({
        orderNumber: "SOA-89421",
        user: admin._id,
        customerDetails: {
          fullName: "Lord Alexandre Vance",
          email: "alexandre@spiritofarabian.com",
          phone: "+91 98765 43210",
        },
        shippingAddress: {
          street: "740 Royal Palms, Penthouse A",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
          country: "India",
        },
        items: [
          {
            product: savedProducts["oud-imperial-25-year"],
            name: "Oud Impérial 25-Year Extrait",
            size: "6ml Royal Bottle",
            price: 2799,
            quantity: 1,
            itemType: "single_attar",
            image: "/images/cambodian-oud.jpg",
          },
          {
            product: savedProducts["taif-rose-extrait"],
            name: "Taif Rose Extrait",
            size: "6ml Royal Bottle",
            price: 2399,
            quantity: 1,
            itemType: "single_attar",
            image: "/images/taif-rose.jpg",
          },
        ],
        subTotal: 5198,
        shippingFee: 0,
        totalAmount: 5198,
        paymentMethod: "RAZORPAY",
        paymentStatus: "Paid",
        orderStatus: "Dispatched",
        tracking: {
          carrier: "BlueDart Express Air Insured",
          trackingNumber: "BD-894210492",
          estimatedDelivery: new Date(Date.now() + 2 * 24 * 3600000),
          history: [
            {
              status: "Order Confirmed",
              location: "Dubai Royal Atelier, UAE",
              timestamp: new Date(Date.now() - 36 * 3600000),
              note: "Pure botanical extraits drawn from antique copper alembics.",
            },
            {
              status: "Artisan Packaging",
              location: "Dubai Logistics Hub, UAE",
              timestamp: new Date(Date.now() - 24 * 3600000),
              note: "Cedar vault box sealed with velvet security seal.",
            },
            {
              status: "Dispatched",
              location: "Express Air Transit Station",
              timestamp: new Date(Date.now() - 10 * 3600000),
              note: "Handed over to priority air cargo flight.",
            },
          ],
        },
      });

      const demoShipment1 = await Shipment.create({
        order: demoOrder1._id,
        orderNumber: "SOA-89421",
        provider: "shiprocket",
        providerOrderId: "SR-89421",
        providerShipmentId: "SR-SHIP-89421",
        awbCode: "BD-894210492",
        courierName: "BlueDart Express Air Insured",
        status: "in_transit",
        totalWeightGrams: 350,
        labelUrl: "https://shiprocket.co/mock-shipping-label.pdf",
        pickupTokenNumber: "PKP-89421",
        trackingEvents: [
          {
            status: "created",
            location: "Boutique Dispatch Hub",
            description: "Shipment registered with BlueDart logistics.",
            timestamp: new Date(Date.now() - 30 * 3600000),
          },
          {
            status: "awb_assigned",
            location: "Logistics Hub",
            description: "Air Waybill BD-894210492 generated.",
            timestamp: new Date(Date.now() - 26 * 3600000),
          },
          {
            status: "picked_up",
            location: "Atelier Vault Hub",
            description: "Collected and placed in temperature-controlled security container.",
            timestamp: new Date(Date.now() - 20 * 3600000),
          },
          {
            status: "in_transit",
            location: "Express Air Terminal",
            description: "Air consignment departed for destination gateway.",
            timestamp: new Date(Date.now() - 8 * 3600000),
          },
        ],
      });

      demoOrder1.shipment = demoShipment1._id;
      await demoOrder1.save();
      console.log("✅ Demo Order SOA-89421 & Shipment seeded");
    }

    console.log("\n==================================================");
    console.log("👑 SPIRIT OF ARABIAN DATABASE SEEDING COMPLETE!");
    console.log("==================================================");
    process.exit(0);
  } catch (error) {
    console.error("Seed Error:", error);
    process.exit(1);
  }
};

seedDatabase();
