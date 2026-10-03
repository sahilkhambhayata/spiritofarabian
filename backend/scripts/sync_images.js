const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('../models/product');
const Banner = require('../models/banner');
const Category = require('../models/category');
const Journal = require('../models/blog');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const imagesDir = path.join(__dirname, '../../frontend/public/images');

// 1. Copy image aliases so all paths resolve locally
const fileMappings = [
  ['oud-imperial.jpg', 'cambodian-oud.jpg'],
  ['rose-sultane.jpg', 'taif-rose.jpg'],
  ['musk-celeste.jpg', 'amber-musk.jpg'],
  ['ambre-noir.jpg', 'royal-ambergris.jpg'],
  ['arabian-vault-box.jpg', 'vault-box.jpg'],
  ['hero-bottle.jpg', 'hero-perfume.jpg'],
  ['gold-smoke.jpg', 'oud-banner.jpg'],
  ['gold-smoke.jpg', 'rose-banner.jpg'],
  ['gold-smoke.jpg', 'amber-banner.jpg'],
];

for (const [src, dest] of fileMappings) {
  const srcPath = path.join(imagesDir, src);
  const destPath = path.join(imagesDir, dest);
  if (fs.existsSync(srcPath) && !fs.existsSync(destPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Created alias: ${dest} from ${src}`);
  }
}

// 2. Sync MongoDB database with rich multiple images per product
async function syncDb() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Products
  await Product.findOneAndUpdate(
    { slug: 'oud-imperial-25-year' },
    {
      images: [
        { url: '/images/oud-imperial.jpg', isPrimary: true, alt: 'Oud Impérial 25-Year Crystal Flacon' },
        { url: '/images/arabian-flacon-box.jpg', isPrimary: false, alt: 'Imperial Flacon Presentation Box' },
        { url: '/images/arabian-brand-assets.jpg', isPrimary: false, alt: 'Artisan Crystal Seal & Deg Distillate' },
        { url: '/images/craft.jpg', isPrimary: false, alt: 'Copper Alembic Extraction' },
      ],
    }
  );

  await Product.findOneAndUpdate(
    { slug: 'taif-rose-extrait' },
    {
      images: [
        { url: '/images/rose-sultane.jpg', isPrimary: true, alt: 'Taif Rose Extrait Mountain Flacon' },
        { url: '/images/arabian-flacon-box.jpg', isPrimary: false, alt: 'Gilded Velvet Presentation Box' },
        { url: '/images/ritual.jpg', isPrimary: false, alt: 'Rose Petal Hydro-Distillation Ritual' },
      ],
    }
  );

  await Product.findOneAndUpdate(
    { slug: 'royal-ambergris-silk-musk' },
    {
      images: [
        { url: '/images/ambre-noir.jpg', isPrimary: true, alt: 'Royal Ambergris & Silk Musk' },
        { url: '/images/musk-celeste.jpg', isPrimary: false, alt: 'Musk Céleste Lipid Flacon' },
        { url: '/images/gold-smoke.jpg', isPrimary: false, alt: 'Smoked Amber & Golden Resins' },
      ],
    }
  );

  await Product.findOneAndUpdate(
    { slug: 'royal-vault-duo-casket' },
    {
      images: [
        { url: '/images/arabian-vault-box.jpg', isPrimary: true, alt: 'The Royal Vault Duo Casket' },
        { url: '/images/discovery-set.jpg', isPrimary: false, alt: 'Discovery Set Extrait Vials' },
        { url: '/images/arabian-brand-assets.jpg', isPrimary: false, alt: 'Maison Atelier Heritage Flacons' },
      ],
    }
  );

  // Banners
  await Banner.deleteMany({});
  await Banner.create([
    {
      title: 'Maison Spirit of Arabian — Royal Attar Oils',
      subtitle: '100% Pure Botanical Lipids · Zero Synthetic Dilution · Hydro-Distilled in Copper Stills',
      badge: 'Royal Reserve',
      desktopImage: '/images/hero-bottle.jpg',
      mobileImage: '/images/hero-bottle.jpg',
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
      desktopImage: '/images/arabian-vault-box.jpg',
      mobileImage: '/images/arabian-vault-box.jpg',
      position: 'hero_slider',
      orderIndex: 2,
      isActive: true,
      ctaText: 'Discover Vault Coffrets',
      ctaLink: '/discovery',
    },
  ]);

  console.log('MongoDB image synchronization complete!');
  await mongoose.disconnect();
}

syncDb().catch(console.error);
