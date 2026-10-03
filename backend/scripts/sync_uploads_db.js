const mongoose = require('mongoose');
const Product = require('../models/product');
const Banner = require('../models/banner');
const Category = require('../models/category');
const Journal = require('../models/blog');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

async function syncUploadsDb() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // 1. Products
  await Product.findOneAndUpdate(
    { slug: 'oud-imperial-25-year' },
    {
      images: [
        { url: '/uploads/oud-imperial.jpg', isPrimary: true, alt: 'Oud Impérial 25-Year Crystal Flacon' },
        { url: '/uploads/arabian-flacon-box.jpg', isPrimary: false, alt: 'Imperial Flacon Presentation Box' },
        { url: '/uploads/arabian-brand-assets.jpg', isPrimary: false, alt: 'Artisan Crystal Seal & Deg Distillate' },
        { url: '/uploads/craft.jpg', isPrimary: false, alt: 'Copper Alembic Extraction' },
      ],
    }
  );

  await Product.findOneAndUpdate(
    { slug: 'taif-rose-extrait' },
    {
      images: [
        { url: '/uploads/rose-sultane.jpg', isPrimary: true, alt: 'Taif Rose Extrait Mountain Flacon' },
        { url: '/uploads/arabian-flacon-box.jpg', isPrimary: false, alt: 'Gilded Velvet Presentation Box' },
        { url: '/uploads/ritual.jpg', isPrimary: false, alt: 'Rose Petal Hydro-Distillation Ritual' },
      ],
    }
  );

  await Product.findOneAndUpdate(
    { slug: 'royal-ambergris-silk-musk' },
    {
      images: [
        { url: '/uploads/ambre-noir.jpg', isPrimary: true, alt: 'Royal Ambergris & Silk Musk' },
        { url: '/uploads/musk-celeste.jpg', isPrimary: false, alt: 'Musk Céleste Lipid Flacon' },
        { url: '/uploads/gold-smoke.jpg', isPrimary: false, alt: 'Smoked Amber & Golden Resins' },
      ],
    }
  );

  await Product.findOneAndUpdate(
    { slug: 'royal-vault-duo-casket' },
    {
      images: [
        { url: '/uploads/arabian-vault-box.jpg', isPrimary: true, alt: 'The Royal Vault Duo Casket' },
        { url: '/uploads/discovery-set.jpg', isPrimary: false, alt: 'Discovery Set Extrait Vials' },
        { url: '/uploads/arabian-brand-assets.jpg', isPrimary: false, alt: 'Maison Atelier Heritage Flacons' },
      ],
    }
  );

  // 2. Banners
  await Banner.deleteMany({});
  await Banner.create([
    {
      title: 'Maison Spirit of Arabian — Royal Attar Oils',
      subtitle: '100% Pure Botanical Lipids · Zero Synthetic Dilution · Hydro-Distilled in Copper Stills',
      badge: 'Royal Reserve',
      desktopImage: '/uploads/hero-bottle.jpg',
      mobileImage: '/uploads/hero-bottle.jpg',
      position: 'hero_slider',
      orderIndex: 1,
      isActive: true,
      ctaText: 'Explore Masterpieces',
      ctaLink: '/collection',
    },
    {
      title: 'The Ancestral Velvet Presentation Casket',
      subtitle: 'Numbered Collector Flacons Cured for 25 Years in Koh Kong Heartwood',
      badge: 'Artisan Heritage',
      desktopImage: '/uploads/arabian-vault-box.jpg',
      mobileImage: '/uploads/arabian-vault-box.jpg',
      position: 'hero_slider',
      orderIndex: 2,
      isActive: true,
      ctaText: 'Discover Vault Coffrets',
      ctaLink: '/discovery',
    },
  ]);

  // 3. Categories
  await Category.findOneAndUpdate({ slug: 'pure-royal-ouds' }, { bannerImage: '/uploads/gold-smoke.jpg' });
  await Category.findOneAndUpdate({ slug: 'floral-taif-roses' }, { bannerImage: '/uploads/gold-smoke.jpg' });
  await Category.findOneAndUpdate({ slug: 'amber-imperial-musks' }, { bannerImage: '/uploads/gold-smoke.jpg' });
  await Category.findOneAndUpdate({ slug: 'heirloom-gift-vaults' }, { bannerImage: '/uploads/arabian-vault-box.jpg' });

  // 4. Journals
  await Journal.findOneAndUpdate({ slug: 'the-alchemy-of-cambodian-oud' }, { coverImage: '/uploads/oud-imperial.jpg' });
  await Journal.findOneAndUpdate({ slug: 'taif-rose-dawn-harvest' }, { coverImage: '/uploads/hero-bottle.jpg' });
  await Journal.findOneAndUpdate({ slug: 'art-of-pulse-point-attar-application' }, { coverImage: '/uploads/ambre-noir.jpg' });

  // 5. Information & Legal Policies
  const Information = require('../models/information');
  const defaultPolicies = [
    {
      policy_type: 'shipping',
      title: 'Shipping & Royal Delivery Policy',
      path: '/shipping-policy',
      subtitle: 'Handcrafted packaging, insured priority dispatch, and temperature-controlled botanical care.',
      highlights: [
        { icon: 'Truck', title: 'Insured Express Air', description: 'Dispatched within 24-48 business hours via BlueDart Air / DHL Express.' },
        { icon: 'ShieldCheck', title: 'Velvet Seal Guarantee', description: 'Each flacon is vacuum-sealed with a numbered holographic wax crest.' },
      ],
      sections: [
        { heading: '1. Processing & Verification', content: 'Every flacon is individually inspected by our master distillers before dispatch.', order: 1 },
        { heading: '2. Domestic & Global Timelines', content: 'India: 2-4 business days. UAE & GCC: 3-5 business days. UK, EU & US: 4-7 business days.', order: 2 },
      ],
      isActive: true,
    },
    {
      policy_type: 'return',
      title: 'Return & Exchange Policy',
      path: '/return-policy',
      subtitle: 'Artisanal purity guarantee with a 7-day unopened returns privilege.',
      highlights: [
        { icon: 'RotateCcw', title: '7-Day Privilege Window', description: 'Applicable on flacons with unbroken gold tamper seals.' },
        { icon: 'ShieldCheck', title: 'Free Flacon Replacement', description: 'Immediate replacement for any transit damage or leakage.' },
      ],
      sections: [
        { heading: '1. Eligible Returns', content: 'Due to the sacred and organic nature of botanical attar oils, opened flacons cannot be returned once the seal is broken.', order: 1 },
      ],
      isActive: true,
    },
    {
      policy_type: 'privacy',
      title: 'Privacy & Data Protection Policy',
      path: '/privacy-policy',
      subtitle: '256-bit encrypted patron security and zero third-party data sharing.',
      highlights: [
        { icon: 'Lock', title: 'Bank-Grade Encryption', description: 'PCI-DSS compliant checkout and private patron vaults.' },
      ],
      sections: [
        { heading: '1. Information We Collect', content: 'We only collect necessary delivery credentials and olfactory preferences to tailor your bespoke concierge experience.', order: 1 },
      ],
      isActive: true,
    },
    {
      policy_type: 'terms',
      title: 'Terms & Conditions of Service',
      path: '/terms-of-service',
      subtitle: 'Guidelines governing bespoke orders, flacon allocations, and maison services.',
      highlights: [
        { icon: 'FileText', title: 'Authentic Distillate', description: '100% natural pure oils certified by CITES and international perfumery registries.' },
      ],
      sections: [
        { heading: '1. Maison Governance', content: 'By accessing Spirit of Arabian services, patrons agree to ethical luxury consumption and terms.', order: 1 },
      ],
      isActive: true,
    },
    {
      policy_type: 'refund',
      title: 'Refund & Cancellation Policy',
      path: '/refund-policy',
      subtitle: 'Swift 5-7 business days refund settlements directly to original payment source.',
      highlights: [
        { icon: 'RotateCcw', title: 'Swift Processing', description: 'Refunds initiated within 24 hours of inspection approval.' },
      ],
      sections: [
        { heading: '1. Refund Timelines', content: 'Approved refunds are credited back to the original bank account or card within 5-7 business days.', order: 1 },
      ],
      isActive: true,
    },
  ];

  for (const pol of defaultPolicies) {
    await Information.findOneAndUpdate(
      { policy_type: pol.policy_type },
      { $set: pol },
      { upsert: true, returnDocument: 'after' }
    );
  }

  console.log('MongoDB Database successfully updated to /uploads/... media paths & Information policies seeded!');
  await mongoose.disconnect();
}

syncUploadsDb().catch(console.error);
