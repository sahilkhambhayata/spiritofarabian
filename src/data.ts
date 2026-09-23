export type ProductSize = {
  id: string;
  label: string;
  volume: string;
  price: number;
  compareAt?: number;
};

export type Product = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  compareAt?: number;
  category: string;
  scentType: string;
  ml: string;
  image: string;
  secondaryImage?: string;
  hue: string;
  accent: string;
  mood: string;
  family: string;
  intensity: number; // 1-5
  longevityHours: string;
  layeringPartner: string;
  layeringTip: string;
  origin: string;
  isTopSelling?: boolean;
  salesRank?: number;
  rating?: number;
  notes: {
    top: { name: string; desc: string }[];
    heart: { name: string; desc: string }[];
    base: { name: string; desc: string }[];
  };
  sizes: ProductSize[];
  badge?: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "oud-imperial",
    name: "Oud Impérial",
    tagline: "The sovereign crown of the collection",
    description: "Cambodian wild agarwood aged eight years in oak casks, softened by Kashmiri royal saffron threads and smoked fossil amber resin.",
    price: 185,
    compareAt: 220,
    category: "Dark Woody & Oud",
    scentType: "Smoked Agarwood & Royal Saffron",
    ml: "12ml Extrait",
    image: "/images/oud-imperial.jpg",
    secondaryImage: "/images/arabian-vault-box.jpg",
    hue: "#b4641e",
    accent: "Smoked Cambodian Oud · Royal Saffron · Grey Leather",
    mood: "Evening Sovereign · Cold Air · Royal Presence",
    family: "Dark Woody & Oud",
    intensity: 5,
    longevityHours: "14+ Hours",
    origin: "Pursat Forest, Cambodia & Kashmir, India",
    isTopSelling: true,
    salesRank: 1,
    rating: 5.0,
    layeringPartner: "Musk Céleste",
    layeringTip: "Apply Musk Céleste first as a base, then crown with Oud Impérial.",
    notes: {
      top: [
        { name: "Kashmiri Saffron", desc: "Hand-harvested crimson threads" },
        { name: "Black Cardamom", desc: "Smoky highland pods" },
      ],
      heart: [
        { name: "Aged Cambodian Oud", desc: "8-year wild agarwood" },
        { name: "Rosewood", desc: "Warm balsamic floral wood" },
      ],
      base: [
        { name: "Smoked Amber", desc: "Golden ancient resin" },
        { name: "Grey Leather", desc: "Supple velvety finish" },
      ],
    },
    sizes: [
      { id: "6ml", label: "6ml Travel Flacon", volume: "6ml", price: 110 },
      { id: "12ml", label: "12ml Imperial Extrait", volume: "12ml", price: 185, compareAt: 220 },
      { id: "30ml", label: "30ml Grand Flacon", volume: "30ml", price: 395, compareAt: 460 },
    ],
  },
  {
    id: "rose-sultane",
    name: "Rose Sultane",
    tagline: "A thousand petals in one sacred drop",
    description: "Taif mountain roses picked at dawn, slow steam-distilled over aged Mysore sandalwood and wild clover honey.",
    price: 145,
    compareAt: 175,
    category: "Floral & Rose",
    scentType: "Dawn Taif Rose & Wild Honey",
    ml: "12ml Extrait",
    image: "/images/rose-sultane.jpg",
    secondaryImage: "/images/arabian-brand-assets.jpg",
    hue: "#a83250",
    accent: "Dawn Taif Rose · Golden Honey · White Sandalwood",
    mood: "Gala Romance · Radiant Daylight · Gilded Elegance",
    family: "Floral & Rose",
    intensity: 4,
    longevityHours: "12+ Hours",
    origin: "Al-Hada Highlands, Taif, Saudi Arabia",
    isTopSelling: true,
    salesRank: 2,
    rating: 4.9,
    layeringPartner: "Ambre Noir",
    layeringTip: "Blend with Ambre Noir for an intoxicating Turkish rose sillage.",
    notes: {
      top: [
        { name: "Taif Dawn Rose", desc: "High-altitude steam distillate" },
        { name: "Pink Peppercorn", desc: "Crisp sparkling spice" },
      ],
      heart: [
        { name: "Damask Rose Absolute", desc: "Velvety honeyed petals" },
        { name: "Saffron Filaments", desc: "Warm golden glow" },
      ],
      base: [
        { name: "Mysore Sandalwood", desc: "Creamy sacred wood" },
        { name: "Wild Amber Honey", desc: "Slow-dripped sunlit nectar" },
      ],
    },
    sizes: [
      { id: "6ml", label: "6ml Travel Flacon", volume: "6ml", price: 85 },
      { id: "12ml", label: "12ml Imperial Extrait", volume: "12ml", price: 145, compareAt: 175 },
      { id: "30ml", label: "30ml Grand Flacon", volume: "30ml", price: 310, compareAt: 360 },
    ],
  },
  {
    id: "musk-celeste",
    name: "Musk Céleste",
    tagline: "Your skin, elevated into the sacred",
    description: "Silk-soft white botanical musk lifted by Florentine iris butter, pear blossom, and cashmere woods.",
    price: 125,
    compareAt: 150,
    category: "Musk & Amber",
    scentType: "Florentine Orris & Cashmere Musk",
    ml: "12ml Extrait",
    image: "/images/musk-celeste.jpg",
    secondaryImage: "/images/arabian-flacon-box.jpg",
    hue: "#d8c9ae",
    accent: "White Iris · Pear Blossom · Cashmere Musk",
    mood: "Quiet Luxury · Intimate Rendezvous · Daily Ritual",
    family: "Musk & Amber",
    intensity: 2,
    longevityHours: "10+ Hours",
    origin: "Florence, Italy & Grasse, France",
    isTopSelling: true,
    salesRank: 3,
    rating: 4.9,
    layeringPartner: "Oud Impérial",
    layeringTip: "Creates an effortlessly magnetic second-skin aura.",
    notes: {
      top: [
        { name: "White Muscat", desc: "Crisp ethereal opening" },
        { name: "Pear Blossom", desc: "Dewy tender florals" },
      ],
      heart: [
        { name: "Florentine Orris", desc: "Precious powdered iris" },
        { name: "White Musk", desc: "Velvet second-skin accord" },
      ],
      base: [
        { name: "Vanilla Orchid", desc: "Warm botanical sweetness" },
        { name: "Cashmere Woods", desc: "Cocooning warmth" },
      ],
    },
    sizes: [
      { id: "6ml", label: "6ml Travel Flacon", volume: "6ml", price: 75 },
      { id: "12ml", label: "12ml Imperial Extrait", volume: "12ml", price: 125, compareAt: 150 },
      { id: "30ml", label: "30ml Grand Flacon", volume: "30ml", price: 275, compareAt: 320 },
    ],
  },
  {
    id: "ambre-noir",
    name: "Ambre Noir",
    tagline: "Volcanic fire, tamed in a flacon",
    description: "Black volcanic amber infused with roasted tonka smoke, Zanzibar clove, and worn equestrian leather.",
    price: 165,
    compareAt: 195,
    category: "Spiced & Gourmand",
    scentType: "Black Ambergris & Tonka Smoke",
    ml: "12ml Extrait",
    image: "/images/ambre-noir.jpg",
    secondaryImage: "/images/arabian-vault-box.jpg",
    hue: "#c87a2e",
    accent: "Dark Amber · Tonka Smoke · Bourbon Vanilla",
    mood: "Winter Fireside · Midnight Allure · Speakeasy",
    family: "Spiced & Gourmand",
    intensity: 4,
    longevityHours: "13+ Hours",
    origin: "Zanzibar & Madagascar",
    isTopSelling: true,
    salesRank: 4,
    rating: 5.0,
    layeringPartner: "Rose Sultane",
    layeringTip: "Apply for an irresistible amber-gilded sillage.",
    notes: {
      top: [
        { name: "Burnt Blood Orange", desc: "Caramelized citrus zest" },
        { name: "Zanzibar Clove", desc: "Aromatic dry spice" },
      ],
      heart: [
        { name: "Black Ambergris", desc: "Deep mineral warmth" },
        { name: "Toasted Tonka", desc: "Almond & tobacco undertones" },
      ],
      base: [
        { name: "Vintage Leather", desc: "Aged warm saddle note" },
        { name: "Bourbon Vanilla", desc: "Rich woody extract" },
      ],
    },
    sizes: [
      { id: "6ml", label: "6ml Travel Flacon", volume: "6ml", price: 95 },
      { id: "12ml", label: "12ml Imperial Extrait", volume: "12ml", price: 165, compareAt: 195 },
      { id: "30ml", label: "30ml Grand Flacon", volume: "30ml", price: 350, compareAt: 410 },
    ],
  },
  {
    id: "sultan-leather-saffron",
    name: "Sultan's Cuir & Saffron",
    tagline: "The majesty of imperial saddles and golden threads",
    description: "A rich Tuscan leather accord wrapped in sun-dried saffron filaments and smoked frankincense tears.",
    price: 175,
    compareAt: 205,
    category: "Leather & Smoke",
    scentType: "Aged Leather & Royal Saffron",
    ml: "12ml Extrait",
    image: "/images/hero-bottle.jpg",
    secondaryImage: "/images/oud-imperial.jpg",
    hue: "#8d4f24",
    accent: "Tuscan Leather · Kashmiri Saffron · Smoked Birch",
    mood: "Stately · Authoritative · Sophisticated",
    family: "Leather & Smoke",
    intensity: 5,
    longevityHours: "14+ Hours",
    origin: "Florence, Italy & Srinagar, Kashmir",
    isTopSelling: true,
    salesRank: 5,
    rating: 4.9,
    layeringPartner: "Musk Céleste",
    layeringTip: "Softens leather edges into luxurious velvet suede.",
    notes: {
      top: [{ name: "Saffron Filaments", desc: "Golden warmth" }, { name: "Thyme Leaf", desc: "Herbal sharpness" }],
      heart: [{ name: "Tuscan Leather", desc: "Supple glove leather" }, { name: "Night Jasmine", desc: "Floral counterpoint" }],
      base: [{ name: "Birch Tar", desc: "Campfire embers" }, { name: "Amber Resin", desc: "Warm golden glow" }],
    },
    sizes: [
      { id: "6ml", label: "6ml Travel Flacon", volume: "6ml", price: 100 },
      { id: "12ml", label: "12ml Imperial Extrait", volume: "12ml", price: 175, compareAt: 205 },
      { id: "30ml", label: "30ml Grand Flacon", volume: "30ml", price: 370, compareAt: 430 },
    ],
  },
  {
    id: "sacred-santal-mysore",
    name: "Sacred Santal Mysore",
    tagline: "Thirty years of aging in pure sandalwood root",
    description: "Creamy, holy Mysore sandalwood distillate enriched with cardamom pods, iris cream, and cedarwood oil.",
    price: 160,
    compareAt: 190,
    category: "Dark Woody & Oud",
    scentType: "Aged Santal & Spiced Cardamom",
    ml: "12ml Extrait",
    image: "/images/craft.jpg",
    secondaryImage: "/images/ritual.jpg",
    hue: "#b89758",
    accent: "Mysore Sandalwood · Green Cardamom · Orris Butter",
    mood: "Meditative · Calming · Opulent",
    family: "Dark Woody & Oud",
    intensity: 3,
    longevityHours: "12+ Hours",
    origin: "Karnataka, India",
    isTopSelling: true,
    salesRank: 6,
    rating: 4.9,
    layeringPartner: "Rose Sultane",
    layeringTip: "A timeless royal pairing of sandalwood and mountain rose.",
    notes: {
      top: [{ name: "Green Cardamom", desc: "Cool invigorating spice" }, { name: "Violet Leaf", desc: "Dewy green note" }],
      heart: [{ name: "Mysore Sandalwood", desc: "Dense milky heartwood" }, { name: "Orris Root", desc: "Powdered luxury" }],
      base: [{ name: "Virginia Cedar", desc: "Dry resinous pencil shavings" }, { name: "White Amber", desc: "Warm fixation" }],
    },
    sizes: [
      { id: "6ml", label: "6ml Travel Flacon", volume: "6ml", price: 90 },
      { id: "12ml", label: "12ml Imperial Extrait", volume: "12ml", price: 160, compareAt: 190 },
      { id: "30ml", label: "30ml Grand Flacon", volume: "30ml", price: 340, compareAt: 400 },
    ],
  },
  {
    id: "blue-frankincense-hojari",
    name: "Royal Green Hojari",
    tagline: "Sacred tears from the cliffs of Dhofar",
    description: "First-grade royal green Hojari frankincense hydro-distilled into a crystal resin with silver pine needles and lime zest.",
    price: 140,
    compareAt: 165,
    category: "Spiced & Gourmand",
    scentType: "Oman Frankincense & Silver Fir",
    ml: "12ml Extrait",
    image: "/images/gold-smoke.jpg",
    secondaryImage: "/images/ambre-noir.jpg",
    hue: "#3d7d70",
    accent: "Green Hojari · Silver Fir · Highland Lime",
    mood: "Temple Sanctuary · Uplifting · Resinous",
    family: "Spiced & Gourmand",
    intensity: 4,
    longevityHours: "13+ Hours",
    origin: "Dhofar Mountains, Sultanate of Oman",
    isTopSelling: true,
    salesRank: 7,
    rating: 4.8,
    layeringPartner: "Oud Impérial",
    layeringTip: "Brightens dark oud with crystalline incense smoke.",
    notes: {
      top: [{ name: "Kaffir Lime", desc: "Sparkling zest" }, { name: "Pink Pepper", desc: "Light aromatic spice" }],
      heart: [{ name: "Green Hojari Incense", desc: "Pristine balsamic tears" }, { name: "Silver Fir Needle", desc: "Crisp mountain air" }],
      base: [{ name: "Smoked Labdanum", desc: "Golden church resin" }, { name: "Benzoin", desc: "Sweet vanilla warmth" }],
    },
    sizes: [
      { id: "6ml", label: "6ml Travel Flacon", volume: "6ml", price: 80 },
      { id: "12ml", label: "12ml Imperial Extrait", volume: "12ml", price: 140, compareAt: 165 },
      { id: "30ml", label: "30ml Grand Flacon", volume: "30ml", price: 295, compareAt: 345 },
    ],
  },
  {
    id: "taif-rose-reserve",
    name: "Taif Rose Reserve",
    tagline: "Single estate harvest from 2,000 meters altitude",
    description: "Pure single-crop Taif rose absolute extracted using antique copper stills. Fresh, sparkling, with unparalleled royal sillage.",
    price: 155,
    compareAt: 180,
    category: "Floral & Rose",
    scentType: "Pure Single-Harvest Rose Absolute",
    ml: "12ml Extrait",
    image: "/images/rose-sultane.jpg",
    secondaryImage: "/images/hero-bottle.jpg",
    hue: "#9c2744",
    accent: "Highland Taif Rose · Pink Lychee · Mountain Dew",
    mood: "Pure Elegance · Romantic · Luminous",
    family: "Floral & Rose",
    intensity: 4,
    longevityHours: "12+ Hours",
    origin: "Al-Hada, Taif, Saudi Arabia",
    isTopSelling: true,
    salesRank: 8,
    rating: 4.9,
    layeringPartner: "Musk Céleste",
    layeringTip: "Creates a dewy spring morning rose aura.",
    notes: {
      top: [{ name: "Bergamot Zest", desc: "Fresh citrus" }, { name: "Lychee", desc: "Exotic sweetness" }],
      heart: [{ name: "Taif Rose 30-Petal", desc: "Imperial steam distillate" }, { name: "Geranium Bourbon", desc: "Spicy floral" }],
      base: [{ name: "White Musk", desc: "Clean base" }, { name: "Guaiacwood", desc: "Smoky floral wood" }],
    },
    sizes: [
      { id: "6ml", label: "6ml Travel Flacon", volume: "6ml", price: 90 },
      { id: "12ml", label: "12ml Imperial Extrait", volume: "12ml", price: 155, compareAt: 180 },
      { id: "30ml", label: "30ml Grand Flacon", volume: "30ml", price: 330, compareAt: 380 },
    ],
  },
  {
    id: "qahwa-cardamom-amber",
    name: "Qahwa & Spiced Amber",
    tagline: "Roasted Arabic coffee beans immersed in golden resin",
    description: "Dark roasted Yemen mocha coffee macerated with green cardamom pods, cinnamon bark, and melted caramel amber.",
    price: 135,
    compareAt: 160,
    category: "Spiced & Gourmand",
    scentType: "Dark Mocha & Crushed Cardamom",
    ml: "12ml Extrait",
    image: "/images/ambre-noir.jpg",
    secondaryImage: "/images/craft.jpg",
    hue: "#704121",
    accent: "Roasted Qahwa · Cardamom · Caramel Amber",
    mood: "Warm Hospitality · Nightfall · Cozy Seduction",
    family: "Spiced & Gourmand",
    intensity: 4,
    longevityHours: "11+ Hours",
    origin: "Yemen & Zanzibar",
    isTopSelling: false,
    salesRank: 9,
    rating: 4.8,
    layeringPartner: "Oud Impérial",
    layeringTip: "Adds a dark, addictive gourmand edge to oud.",
    notes: {
      top: [{ name: "Yemen Coffee", desc: "Freshly roasted beans" }, { name: "Cardamom Pods", desc: "Crushed green pods" }],
      heart: [{ name: "Cinnamon Bark", desc: "Fiery dry bark" }, { name: "Brown Sugar", desc: "Rich molasses" }],
      base: [{ name: "Golden Amber", desc: "Warm embrace" }, { name: "Vanilla Bean", desc: "Madagascar pods" }],
    },
    sizes: [
      { id: "6ml", label: "6ml Travel Flacon", volume: "6ml", price: 80 },
      { id: "12ml", label: "12ml Imperial Extrait", volume: "12ml", price: 135, compareAt: 160 },
      { id: "30ml", label: "30ml Grand Flacon", volume: "30ml", price: 290, compareAt: 340 },
    ],
  },
  {
    id: "iris-imperialis",
    name: "Iris Impérialis",
    tagline: "Three years of root drying in Tuscan shade",
    description: "The rarest Florentine orris butter blended with French mimosa, clean cedarwood, and delicate white leather.",
    price: 190,
    compareAt: 230,
    category: "Musk & Amber",
    scentType: "Florentine Orris & White Suede",
    ml: "12ml Extrait",
    image: "/images/musk-celeste.jpg",
    secondaryImage: "/images/hero-bottle.jpg",
    hue: "#9b8da9",
    accent: "Florentine Orris · Mimosa Flower · White Suede",
    mood: "Haute Couture · Regal Powder · Quiet Power",
    family: "Musk & Amber",
    intensity: 3,
    longevityHours: "13+ Hours",
    origin: "Florence, Italy",
    isTopSelling: false,
    salesRank: 10,
    rating: 4.9,
    layeringPartner: "Sultan's Cuir & Saffron",
    layeringTip: "Lends aristocratic softness to smoky leather notes.",
    notes: {
      top: [{ name: "Mimosa Blossom", desc: "Pollen sweetness" }, { name: "Aldehydic Silk", desc: "Luminous lift" }],
      heart: [{ name: "Florentine Orris Butter", desc: "15% Irones concentrated" }, { name: "Heliotrope", desc: "Almond powder" }],
      base: [{ name: "White Suede", desc: "Glove leather softness" }, { name: "Cedar Heart", desc: "Woody architecture" }],
    },
    sizes: [
      { id: "6ml", label: "6ml Travel Flacon", volume: "6ml", price: 110 },
      { id: "12ml", label: "12ml Imperial Extrait", volume: "12ml", price: 190, compareAt: 230 },
      { id: "30ml", label: "30ml Grand Flacon", volume: "30ml", price: 410, compareAt: 480 },
    ],
  },
  {
    id: "smokey-vetiver-java",
    name: "Java Vetiver Peat",
    tagline: "Volcanic roots roasted over green bamboo",
    description: "High-resin Java vetiver roots distilled under slow pressure, mingling with peat smoke, black pepper, and oakmoss.",
    price: 130,
    compareAt: 155,
    category: "Dark Woody & Oud",
    scentType: "Volcanic Vetiver & Peat Smoke",
    ml: "12ml Extrait",
    image: "/images/craft.jpg",
    secondaryImage: "/images/oud-imperial.jpg",
    hue: "#4b5d43",
    accent: "Java Vetiver · Peat Smoke · Black Pepper",
    mood: "Earthy · Grounding · Distinguished",
    family: "Dark Woody & Oud",
    intensity: 4,
    longevityHours: "12+ Hours",
    origin: "Java, Indonesia",
    isTopSelling: false,
    salesRank: 11,
    rating: 4.8,
    layeringPartner: "Musk Céleste",
    layeringTip: "Brings modern mineral clarity to clean musk.",
    notes: {
      top: [{ name: "Cracked Black Pepper", desc: "Sharp dark spice" }, { name: "Grapefruit Rind", desc: "Bitter sparkle" }],
      heart: [{ name: "Smoked Java Vetiver", desc: "Deep earthy roots" }, { name: "Nutmeg", desc: "Nutty warmth" }],
      base: [{ name: "Oakmoss Absolute", desc: "Forest floor" }, { name: "Dark Patchouli", desc: "Aged Indonesian leaf" }],
    },
    sizes: [
      { id: "6ml", label: "6ml Travel Flacon", volume: "6ml", price: 75 },
      { id: "12ml", label: "12ml Imperial Extrait", volume: "12ml", price: 130, compareAt: 155 },
      { id: "30ml", label: "30ml Grand Flacon", volume: "30ml", price: 280, compareAt: 330 },
    ],
  },
  {
    id: "golden-ambergris-royale",
    name: "Ambergris Royale",
    tagline: "Sun-cured ocean ambergris aged fifteen years",
    description: "Genuine ethical floating ambergris cured over 15 years, combined with warm labdanum, bourbon vanilla, and golden honey.",
    price: 210,
    compareAt: 250,
    category: "Musk & Amber",
    scentType: "Aged Marine Ambergris & Labdanum",
    ml: "12ml Extrait",
    image: "/images/ambre-noir.jpg",
    secondaryImage: "/images/gold-smoke.jpg",
    hue: "#bf8034",
    accent: "Ocean Ambergris · Warm Labdanum · Bourbon Vanilla",
    mood: "Hypnotic · Golden Radiance · Masterpiece",
    family: "Musk & Amber",
    intensity: 5,
    longevityHours: "16+ Hours",
    origin: "Indian Ocean & New Zealand Coast",
    isTopSelling: false,
    salesRank: 12,
    rating: 5.0,
    layeringPartner: "Rose Sultane",
    layeringTip: "Magnifies floral projection to last multiple days on clothing.",
    notes: {
      top: [{ name: "Sea Salt Accord", desc: "Breezy marine opening" }, { name: "Bergamot", desc: "Sunlight flash" }],
      heart: [{ name: "Aged Ambergris", desc: "Animalic saline warmth" }, { name: "Golden Labdanum", desc: "Rich amber nectar" }],
      base: [{ name: "Benzoin Siam", desc: "Caramel resin" }, { name: "Bourbon Vanilla", desc: "Aged vanilla pod" }],
    },
    sizes: [
      { id: "6ml", label: "6ml Travel Flacon", volume: "6ml", price: 125 },
      { id: "12ml", label: "12ml Imperial Extrait", volume: "12ml", price: 210, compareAt: 250 },
      { id: "30ml", label: "30ml Grand Flacon", volume: "30ml", price: 450, compareAt: 520 },
    ],
  },
  {
    id: "cambodian-oud-2014",
    name: "Cambodian Vintage 2014",
    tagline: "A barrel-aged time capsule of wild Pursat agarwood",
    description: "Pure wild Cambodian agarwood distilled in 2014 and rested in toasted oak for over a decade. Deep, balsamic, and fruit-tinged.",
    price: 240,
    compareAt: 290,
    category: "Dark Woody & Oud",
    scentType: "12-Year Oak Cask Wild Agarwood",
    ml: "12ml Extrait",
    image: "/images/oud-imperial.jpg",
    secondaryImage: "/images/craft.jpg",
    hue: "#853e14",
    accent: "Wild Agarwood 2014 · Dried Plum · Toasted Oak",
    mood: "Connoisseur Vault · Ancient Power · Regal Sillage",
    family: "Dark Woody & Oud",
    intensity: 5,
    longevityHours: "16+ Hours",
    origin: "Pursat Forest, Cambodia",
    isTopSelling: false,
    salesRank: 13,
    rating: 5.0,
    layeringPartner: "Taif Rose Reserve",
    layeringTip: "The definitive collector's pairing of antique oud and pure rose.",
    notes: {
      top: [{ name: "Dried Damson Plum", desc: "Rich fermented fruit" }, { name: "Cured Tobacco", desc: "Warm leaf" }],
      heart: [{ name: "Vintage Pursat Oud", desc: "10-year aged wild oil" }, { name: "French Oak Tannins", desc: "Smoky wood" }],
      base: [{ name: "Dark Musk", desc: "Deep fixative" }, { name: "Fossil Amber", desc: "Ancient mineral resonance" }],
    },
    sizes: [
      { id: "6ml", label: "6ml Travel Flacon", volume: "6ml", price: 145 },
      { id: "12ml", label: "12ml Imperial Extrait", volume: "12ml", price: 240, compareAt: 290 },
      { id: "30ml", label: "30ml Grand Flacon", volume: "30ml", price: 520, compareAt: 600 },
    ],
  },
  {
    id: "white-patchouli-silk",
    name: "White Patchouli & Silk",
    tagline: "Modern crystalline purification of Sumatran patchouli",
    description: "Molecularly fractionated clear patchouli combined with white peony, green tea leaves, and ambrette seed musk.",
    price: 120,
    compareAt: 145,
    category: "Musk & Amber",
    scentType: "Crystal Patchouli & White Peony",
    ml: "12ml Extrait",
    image: "/images/musk-celeste.jpg",
    secondaryImage: "/images/hero-bottle.jpg",
    hue: "#c0b7a8",
    accent: "Clear Patchouli · White Peony · Ambrette Seed",
    mood: "Contemporary Luxury · Crisp Shirt · Day Meeting",
    family: "Musk & Amber",
    intensity: 3,
    longevityHours: "11+ Hours",
    origin: "Sumatra & Grasse",
    isTopSelling: false,
    salesRank: 14,
    rating: 4.8,
    layeringPartner: "Java Vetiver Peat",
    layeringTip: "Adds sparkling freshness to earthy vetiver.",
    notes: {
      top: [{ name: "Green Tea Bud", desc: "Delicate tannin" }, { name: "Mandarin", desc: "Bright sunshine" }],
      heart: [{ name: "White Peony", desc: "Petal freshness" }, { name: "Clear Patchouli Coeur", desc: "Clean woody depth" }],
      base: [{ name: "Ambrette Seed", desc: "Botanical musk" }, { name: "Blonde Woods", desc: "Gentle foundation" }],
    },
    sizes: [
      { id: "6ml", label: "6ml Travel Flacon", volume: "6ml", price: 70 },
      { id: "12ml", label: "12ml Imperial Extrait", volume: "12ml", price: 120, compareAt: 145 },
      { id: "30ml", label: "30ml Grand Flacon", volume: "30ml", price: 260, compareAt: 310 },
    ],
  },
  {
    id: "cedar-of-lebanon",
    name: "Cedar of Mount Lebanon",
    tagline: "Resinous forest majesty from biblical mountain heights",
    description: "Wild mountain cedarwood resin infused with crushed juniper berries, frankincense smoke, and golden myrrh.",
    price: 135,
    compareAt: 160,
    category: "Dark Woody & Oud",
    scentType: "Wild Mountain Cedar & Juniper",
    ml: "12ml Extrait",
    image: "/images/craft.jpg",
    secondaryImage: "/images/oud-imperial.jpg",
    hue: "#634d3b",
    accent: "Lebanon Cedar · Juniper Berry · Golden Myrrh",
    mood: "Noble · Timeless · Mountain Breeze",
    family: "Dark Woody & Oud",
    intensity: 4,
    longevityHours: "13+ Hours",
    origin: "Chouf Mountains, Lebanon",
    isTopSelling: false,
    salesRank: 15,
    rating: 4.8,
    layeringPartner: "Royal Green Hojari",
    layeringTip: "Evokes the scent of ancient temple columns.",
    notes: {
      top: [{ name: "Juniper Berry", desc: "Frosty gin note" }, { name: "Bergamot", desc: "Crisp lift" }],
      heart: [{ name: "Lebanon Cedarwood", desc: "Dry balsamic grandeur" }, { name: "Myrrh Tears", desc: "Spiced incense" }],
      base: [{ name: "Atlas Cedar", desc: "Warm animalic wood" }, { name: "Amber", desc: "Golden glow" }],
    },
    sizes: [
      { id: "6ml", label: "6ml Travel Flacon", volume: "6ml", price: 80 },
      { id: "12ml", label: "12ml Imperial Extrait", volume: "12ml", price: 135, compareAt: 160 },
      { id: "30ml", label: "30ml Grand Flacon", volume: "30ml", price: 290, compareAt: 340 },
    ],
  },
  {
    id: "damask-blossom-honey",
    name: "Damask Blossom & Nectar",
    tagline: "Wild mountain bee honey drizzled over fresh rose",
    description: "Heady Damascus roses drenched in wild clover honey, Madagascar vanilla pod, and warm Mysore sandalwood.",
    price: 140,
    compareAt: 165,
    category: "Floral & Rose",
    scentType: "Damask Rose & Wild Blossom Honey",
    ml: "12ml Extrait",
    image: "/images/rose-sultane.jpg",
    secondaryImage: "/images/ritual.jpg",
    hue: "#b5495e",
    accent: "Damask Rose · Wild Clover Honey · Vanilla Orchid",
    mood: "Opulent · Sensual · Addictive Sweetness",
    family: "Floral & Rose",
    intensity: 4,
    longevityHours: "12+ Hours",
    origin: "Damascus Valley & Taif",
    isTopSelling: false,
    salesRank: 16,
    rating: 4.9,
    layeringPartner: "Ambre Noir",
    layeringTip: "Creates a warm honeyed smoke sillage.",
    notes: {
      top: [{ name: "Orange Blossom", desc: "Sweet white petal" }, { name: "Almond Milk", desc: "Silky richness" }],
      heart: [{ name: "Damask Rose", desc: "Deep red petals" }, { name: "Mountain Honey", desc: "Sun-drenched nectar" }],
      base: [{ name: "Sandalwood", desc: "Creamy wood" }, { name: "Vanilla Orchid", desc: "Warm floral vanilla" }],
    },
    sizes: [
      { id: "6ml", label: "6ml Travel Flacon", volume: "6ml", price: 80 },
      { id: "12ml", label: "12ml Imperial Extrait", volume: "12ml", price: 140, compareAt: 165 },
      { id: "30ml", label: "30ml Grand Flacon", volume: "30ml", price: 300, compareAt: 350 },
    ],
  },
  {
    id: "zanzibar-clove-cacao",
    name: "Zanzibar Clove & Raw Cacao",
    tagline: "Spiced island breezes over sun-dried chocolate pods",
    description: "Roasted raw African cacao beans infused with sun-dried Zanzibar clove, nutmeg, and aged dark rum barrel essence.",
    price: 145,
    compareAt: 170,
    category: "Spiced & Gourmand",
    scentType: "Smoked Cacao & Zanzibar Spice",
    ml: "12ml Extrait",
    image: "/images/ambre-noir.jpg",
    secondaryImage: "/images/gold-smoke.jpg",
    hue: "#693822",
    accent: "Raw Cacao · Zanzibar Clove · Aged Rum Oak",
    mood: "Decadent · Intoxicating · Midnight Warmth",
    family: "Spiced & Gourmand",
    intensity: 4,
    longevityHours: "13+ Hours",
    origin: "Stone Town, Zanzibar & Ghana",
    isTopSelling: false,
    salesRank: 17,
    rating: 4.9,
    layeringPartner: "Oud Impérial",
    layeringTip: "Transforms dark oud into a rich chocolate-leather masterpiece.",
    notes: {
      top: [{ name: "Zanzibar Clove", desc: "Sweet aromatic spice" }, { name: "Nutmeg", desc: "Warm woody spice" }],
      heart: [{ name: "Raw Cacao Pod", desc: "70% bitter dark chocolate" }, { name: "Spiced Rum Accord", desc: "Oak barrel spirits" }],
      base: [{ name: "Tonka Bean", desc: "Toasted vanilla" }, { name: "Smoked Patchouli", desc: "Earthy foundation" }],
    },
    sizes: [
      { id: "6ml", label: "6ml Travel Flacon", volume: "6ml", price: 85 },
      { id: "12ml", label: "12ml Imperial Extrait", volume: "12ml", price: 145, compareAt: 170 },
      { id: "30ml", label: "30ml Grand Flacon", volume: "30ml", price: 310, compareAt: 360 },
    ],
  },
  {
    id: "imperial-neroli-seville",
    name: "Imperial Neroli Seville",
    tagline: "Sunlit orange blossoms distilled at the height of spring",
    description: "Spanish bitter orange blossom steam distillate enriched with petitgrain bigarade, bergamot, and white amber.",
    price: 115,
    compareAt: 140,
    category: "Citrus & Fresh Herbal",
    scentType: "Spanish Neroli & Petitgrain Bigarade",
    ml: "12ml Extrait",
    image: "/images/musk-celeste.jpg",
    secondaryImage: "/images/ritual.jpg",
    hue: "#d9a834",
    accent: "Seville Neroli · Petitgrain · White Amber",
    mood: "Mediterranean Sun · Morning Brilliance · Pure Joy",
    family: "Citrus & Fresh Herbal",
    intensity: 3,
    longevityHours: "10+ Hours",
    origin: "Seville, Spain & Capua, Italy",
    isTopSelling: false,
    salesRank: 18,
    rating: 4.8,
    layeringPartner: "Sacred Santal Mysore",
    layeringTip: "Brings sunny citrus glow to creamy sandalwood.",
    notes: {
      top: [{ name: "Calabrian Bergamot", desc: "Cold-pressed citrus" }, { name: "Petitgrain", desc: "Crushed orange leaves" }],
      heart: [{ name: "Seville Neroli", desc: "Luminous white blossoms" }, { name: "Orange Blossom Absolute", desc: "Honeyed floral" }],
      base: [{ name: "White Amber", desc: "Clean fixation" }, { name: "Cedarwood", desc: "Soft woody finish" }],
    },
    sizes: [
      { id: "6ml", label: "6ml Travel Flacon", volume: "6ml", price: 65 },
      { id: "12ml", label: "12ml Imperial Extrait", volume: "12ml", price: 115, compareAt: 140 },
      { id: "30ml", label: "30ml Grand Flacon", volume: "30ml", price: 250, compareAt: 295 },
    ],
  },
  {
    id: "black-incense-petra",
    name: "Black Incense of Petra",
    tagline: "Ancient Nabataean resin burning in sandstone canyons",
    description: "Dark burning myrrh tears, cade wood smoke, scorched papyrus, and black frankincense resin.",
    price: 170,
    compareAt: 200,
    category: "Leather & Smoke",
    scentType: "Nabataean Myrrh & Cade Smoke",
    ml: "12ml Extrait",
    image: "/images/gold-smoke.jpg",
    secondaryImage: "/images/ambre-noir.jpg",
    hue: "#4a3528",
    accent: "Black Myrrh · Cade Smoke · Scorched Papyrus",
    mood: "Mystical Desert · Ancient Crypt · Sovereign Fire",
    family: "Leather & Smoke",
    intensity: 5,
    longevityHours: "15+ Hours",
    origin: "Wadi Musa, Jordan",
    isTopSelling: false,
    salesRank: 19,
    rating: 4.9,
    layeringPartner: "Musk Céleste",
    layeringTip: "Creates a contrasting veil of smoky mystery and clean light.",
    notes: {
      top: [{ name: "Cade Wood", desc: "Smoky campfire" }, { name: "Coriander Seed", desc: "Dry aromatic" }],
      heart: [{ name: "Black Myrrh Resin", desc: "Dark bittersweet balsam" }, { name: "Papyrus", desc: "Ancient parchments" }],
      base: [{ name: "Smoked Leather", desc: "Tanned hides" }, { name: "Castoreum Accord", desc: "Warm animalic fixation" }],
    },
    sizes: [
      { id: "6ml", label: "6ml Travel Flacon", volume: "6ml", price: 95 },
      { id: "12ml", label: "12ml Imperial Extrait", volume: "12ml", price: 170, compareAt: 200 },
      { id: "30ml", label: "30ml Grand Flacon", volume: "30ml", price: 360, compareAt: 420 },
    ],
  },
  {
    id: "kashmir-jasmine-sambac",
    name: "Kashmir Night Jasmine",
    tagline: "Midnight blooms gathered under Himalayan moonlight",
    description: "Heady Jasmine Sambac picked at midnight, blended with saffron honey, night tuberose, and soft musk.",
    price: 150,
    compareAt: 175,
    category: "Floral & Rose",
    scentType: "Midnight Jasmine Sambac & Honey",
    ml: "12ml Extrait",
    image: "/images/rose-sultane.jpg",
    secondaryImage: "/images/hero-bottle.jpg",
    hue: "#b86a87",
    accent: "Night Jasmine · Kashmiri Saffron · Tuberose",
    mood: "Moonlit Garden · Intoxicating · Royal Allure",
    family: "Floral & Rose",
    intensity: 4,
    longevityHours: "13+ Hours",
    origin: "Kashmir Valley, India",
    isTopSelling: false,
    salesRank: 20,
    rating: 4.8,
    layeringPartner: "Oud Impérial",
    layeringTip: "A magnificent regal blend of nocturnal white florals and oud.",
    notes: {
      top: [{ name: "Pink Pepper", desc: "Sparkling spice" }, { name: "Green Mandarin", desc: "Crisp citrus" }],
      heart: [{ name: "Jasmine Sambac", desc: "Intoxicating white petals" }, { name: "Indian Tuberose", desc: "Creamy floral" }],
      base: [{ name: "Sandalwood", desc: "Sacred wood" }, { name: "White Ambergris", desc: "Warm animalic sillage" }],
    },
    sizes: [
      { id: "6ml", label: "6ml Travel Flacon", volume: "6ml", price: 85 },
      { id: "12ml", label: "12ml Imperial Extrait", volume: "12ml", price: 150, compareAt: 175 },
      { id: "30ml", label: "30ml Grand Flacon", volume: "30ml", price: 320, compareAt: 370 },
    ],
  },
  {
    id: "pure-gazelle-musk",
    name: "Botanical Royal Musk",
    tagline: "100% cruelty-free botanical recreation of royal deer musk",
    description: "Crafted entirely from botanical ambrette seeds, Angelica root, and mushroom absolute to replicate ancient imperial musk.",
    price: 165,
    compareAt: 195,
    category: "Musk & Amber",
    scentType: "Warm Botanical Deer Musk Accord",
    ml: "12ml Extrait",
    image: "/images/musk-celeste.jpg",
    secondaryImage: "/images/craft.jpg",
    hue: "#a88e73",
    accent: "Ambrette Seed · Angelica Root · Warm Velvet Fur",
    mood: "Intimate Sovereign · Second Skin · Pure Sillage",
    family: "Musk & Amber",
    intensity: 4,
    longevityHours: "14+ Hours",
    origin: "Grasse, France & Kannauj, India",
    isTopSelling: false,
    salesRank: 21,
    rating: 5.0,
    layeringPartner: "Oud Impérial",
    layeringTip: "The ultimate traditional base layer for any heavy attar.",
    notes: {
      top: [{ name: "Angelica Root", desc: "Spiced herbal musk" }, { name: "Coriander", desc: "Dry spice" }],
      heart: [{ name: "Ambrette Seed Coeur", desc: "Deep warm musk" }, { name: "Mushroom Absolute", desc: "Earthy animalic note" }],
      base: [{ name: "Cashmere Wood", desc: "Cocooning warmth" }, { name: "Fossil Amber", desc: "Golden resin" }],
    },
    sizes: [
      { id: "6ml", label: "6ml Travel Flacon", volume: "6ml", price: 95 },
      { id: "12ml", label: "12ml Imperial Extrait", volume: "12ml", price: 165, compareAt: 195 },
      { id: "30ml", label: "30ml Grand Flacon", volume: "30ml", price: 350, compareAt: 410 },
    ],
  },
  {
    id: "bergamot-calabrian-sun",
    name: "Calabrian Bergamot Sun",
    tagline: "Early morning cold-pressed rinds from coastal groves",
    description: "Brilliant cold-pressed bergamot essence lifted by lemon blossom, crushed cardamom pods, and sheer cedarwood.",
    price: 110,
    compareAt: 135,
    category: "Citrus & Fresh Herbal",
    scentType: "Cold-Pressed Bergamot & Lemon Blossom",
    ml: "12ml Extrait",
    image: "/images/hero-bottle.jpg",
    secondaryImage: "/images/musk-celeste.jpg",
    hue: "#c7ab30",
    accent: "Calabrian Bergamot · Lemon Blossom · Sheer Cedar",
    mood: "Morning Energy · Mediterranean Breeze · Refined Joy",
    family: "Citrus & Fresh Herbal",
    intensity: 3,
    longevityHours: "10+ Hours",
    origin: "Reggio Calabria, Italy",
    isTopSelling: false,
    salesRank: 22,
    rating: 4.8,
    layeringPartner: "Sacred Santal Mysore",
    layeringTip: "Brightens deep sandalwood with sparkling Italian sunshine.",
    notes: {
      top: [{ name: "Bergamot Rind", desc: "Sparkling green citrus" }, { name: "Lemon Blossom", desc: "Fresh floral" }],
      heart: [{ name: "Crushed Cardamom", desc: "Cool spice" }, { name: "Ginger", desc: "Zesty warmth" }],
      base: [{ name: "Sheer Cedarwood", desc: "Clean timber" }, { name: "White Musk", desc: "Soft finish" }],
    },
    sizes: [
      { id: "6ml", label: "6ml Travel Flacon", volume: "6ml", price: 60 },
      { id: "12ml", label: "12ml Imperial Extrait", volume: "12ml", price: 110, compareAt: 135 },
      { id: "30ml", label: "30ml Grand Flacon", volume: "30ml", price: 240, compareAt: 285 },
    ],
  },
  {
    id: "al-khaleej-sovereign-oud",
    name: "Al-Khaleej Sovereign Oud",
    tagline: "Wild Assamese oud blended with rare Hindi agarwood",
    description: "The deepest and most authoritative oud in the collection: wild Assamese agarwood, smoked leather, and saffron resin.",
    price: 225,
    compareAt: 270,
    category: "Dark Woody & Oud",
    scentType: "Assam Wild Oud & Hindi Agarwood",
    ml: "12ml Extrait",
    image: "/images/oud-imperial.jpg",
    secondaryImage: "/images/hero-bottle.jpg",
    hue: "#702b12",
    accent: "Wild Assam Oud · Hindi Agarwood · Saffron Leather",
    mood: "Majestic Power · Royal Majlis · Unrivaled Sillage",
    family: "Dark Woody & Oud",
    intensity: 5,
    longevityHours: "16+ Hours",
    origin: "Assam, India & Trat, Thailand",
    isTopSelling: false,
    salesRank: 23,
    rating: 5.0,
    layeringPartner: "Taif Rose Reserve",
    layeringTip: "A supreme powerhouse combination of high-grade oud and mountain rose.",
    notes: {
      top: [{ name: "Kashmir Saffron", desc: "Rich spice" }, { name: "Dried Figs", desc: "Dark molasses" }],
      heart: [{ name: "Wild Assam Agarwood", desc: "Deep resinous punch" }, { name: "Hindi Oud", desc: "Barnyard leather warmth" }],
      base: [{ name: "Smoked Fossil Amber", desc: "Ancient resin" }, { name: "Dark Birch", desc: "Smoky wood" }],
    },
    sizes: [
      { id: "6ml", label: "6ml Travel Flacon", volume: "6ml", price: 135 },
      { id: "12ml", label: "12ml Imperial Extrait", volume: "12ml", price: 225, compareAt: 270 },
      { id: "30ml", label: "30ml Grand Flacon", volume: "30ml", price: 490, compareAt: 560 },
    ],
  },
  {
    id: "velvet-tonka-amber",
    name: "Velvet Tonka & Smoked Amber",
    tagline: "Roasted Venezuelan tonka infused in golden ambergris",
    description: "Sweet toasted Venezuelan tonka beans, burnt sugar, smoky guaiacwood, and golden balsamic amber.",
    price: 155,
    compareAt: 180,
    category: "Spiced & Gourmand",
    scentType: "Toasted Tonka & Balsamic Amber",
    ml: "12ml Extrait",
    image: "/images/ambre-noir.jpg",
    secondaryImage: "/images/gold-smoke.jpg",
    hue: "#b8702e",
    accent: "Roasted Tonka · Burnt Sugar · Guaiacwood",
    mood: "Warm Romance · Fireside Evening · Irresistible",
    family: "Spiced & Gourmand",
    intensity: 4,
    longevityHours: "13+ Hours",
    origin: "Venezuela & Madagascar",
    isTopSelling: false,
    salesRank: 24,
    rating: 4.9,
    layeringPartner: "Musk Céleste",
    layeringTip: "Elevates sweet tonka into a radiant second skin.",
    notes: {
      top: [{ name: "Burnt Sugar", desc: "Caramel crust" }, { name: "Almond Blossom", desc: "Delicate nuttiness" }],
      heart: [{ name: "Venezuelan Tonka", desc: "Tobacco vanilla richness" }, { name: "Guaiacwood", desc: "Sweet smoky timber" }],
      base: [{ name: "Balsamic Amber", desc: "Golden glow" }, { name: "Vanilla Absolute", desc: "Pure extract" }],
    },
    sizes: [
      { id: "6ml", label: "6ml Travel Flacon", volume: "6ml", price: 90 },
      { id: "12ml", label: "12ml Imperial Extrait", volume: "12ml", price: 155, compareAt: 180 },
      { id: "30ml", label: "30ml Grand Flacon", volume: "30ml", price: 330, compareAt: 380 },
    ],
  },
];

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  sizeLabel: string;
  volume: string;
  price: number;
  image: string;
  quantity: number;
  hue: string;
};

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  location: string;
  scent: string;
  rating: number;
  verified: boolean;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "I've owned Creed, Roja, Clive Christian and Amouage. Nothing sits on skin like Oud Impérial — one swipe at 7am and my cashmere scarf still carried it the next night. This is pure alchemy.",
    name: "James Whitmore",
    role: "Fragrance Collector, 140+ Bottles",
    location: "London, UK",
    scent: "Oud Impérial",
    rating: 5,
    verified: true,
  },
  {
    quote:
      "Rose Sultane stopped me mid-sentence the first time I wore it. Three people in one meeting asked for the flacon name. It smells expensive in a way that's hard to describe — like ancient palaces and freshly cut dawn roses.",
    name: "Amira Khalil",
    role: "Luxury Brand Director",
    location: "Dubai, UAE",
    scent: "Rose Sultane",
    rating: 5,
    verified: true,
  },
  {
    quote:
      "My skin rejects alcohol sprays — redness and headaches every time. Musk Céleste is the first fragrance I've worn daily in a decade. Soft, clean, and it moves with you instead of shouting.",
    name: "Sofia Marchetti",
    role: "Dermatology Specialist",
    location: "Milan, Italy",
    scent: "Musk Céleste",
    rating: 5,
    verified: true,
  },
  {
    quote:
      "Bought the Discovery Ritual as a gift for my partner and ended up keeping Ambre Noir for myself. The cut-crystal flacon alone belongs in an art gallery. The amber oil inside is even better.",
    name: "Daniel Osei",
    role: "Architect & Returning Patron ×5",
    location: "New York, USA",
    scent: "Ambre Noir",
    rating: 5,
    verified: true,
  },
  {
    quote:
      "I sampled six world-famous attar houses this year. SPIRIT OF ARABIAN was the only one where the dry-down was exponentially richer than the opening. Twelve hours later it becomes a warm, hypnotic second skin.",
    name: "Leila Haddad",
    role: "Haute Perfumer & Critic (92k subs)",
    location: "Paris, France",
    scent: "Oud Impérial",
    rating: 5,
    verified: true,
  },
];

export type FaqCategory = "All" | "Art & Application" | "Purity & Sourcing" | "Orders & Shipping";

export type Faq = {
  q: string;
  a: string;
  category: FaqCategory;
};

export const FAQS: Faq[] = [
  {
    category: "Art & Application",
    q: "What exactly is attar — and how is it different from spray perfume?",
    a: "Attar is perfume in its ancestral, purest form: a 100% botanical concentrate without alcohol or chemical fillers. While ordinary eau de parfum is 80% alcohol that flashes off within 2–3 hours, attar is concentrated aromatic oil that melts into your skin lipids, warming with body heat to evolve dynamically over 12–14 hours.",
  },
  {
    category: "Art & Application",
    q: "How do I apply attar for the longest sillage?",
    a: "Unscrew the crystal glass wand and let one droplet touch your warmest pulse points — inner wrists, the hollow of your neck, or behind ears. Press lightly; never rub, as friction crushes delicate top notes. Applying after a warm bath on moisturized skin extends longevity past 14 hours.",
  },
  {
    category: "Purity & Sourcing",
    q: "Is SPIRIT OF ARABIAN attar safe for sensitive skin and allergy-prone wearers?",
    a: "Yes. By eliminating alcohol, we eliminate 95% of common fragrance irritants and dryness. Every SPIRIT OF ARABIAN formulation is IFRA-compliant, dermatologically reviewed, cruelty-free, and blended in skin-friendly lipid carriers. Each batch comes with an authenticity seal.",
  },
  {
    category: "Purity & Sourcing",
    q: "Where are your raw ingredients sourced and distilled?",
    a: "Our wild Cambodian Oud is sustainably certified under CITES and aged 8 years in oak casks. Our roses are sourced directly from high-altitude Taif farming cooperatives and hydro-distilled in traditional copper alembics at our heritage ateliers in Kannauj and Dubai.",
  },
  {
    category: "Orders & Shipping",
    q: "What is the 30-Day Sillage Guarantee?",
    a: "If your chosen flacon does not exceed expectations, you may exchange or return it within 30 days of delivery for a full refund — even if you have opened and sampled it (as long as over 50% of the oil remains). Complimentary return labels included.",
  },
  {
    category: "Orders & Shipping",
    q: "How does the Discovery Ritual credit work?",
    a: "When you order the Discovery Ritual ($59), you receive five 2ml crystal vials. Your full $59 purchase is automatically loaded as instant store credit toward any full 12ml or 30ml flacon within 60 days.",
  },
  {
    category: "Orders & Shipping",
    q: "Do you offer international express shipping?",
    a: "Yes. We offer complimentary insured express shipping worldwide on all orders over $95. All shipments are dispatched within 24 hours via DHL Express with signature confirmation and customs duties prepaid.",
  },
];

export const PRESS = [
  "VOGUE",
  "GQ",
  "ESQUIRE",
  "HARPER'S BAZAAR",
  "ROBB REPORT",
  "ELLE LUXURY",
  "TATLER",
  "VANITY FAIR",
];

export const NAV_LINKS = [
  { label: "The Attars", href: "/collection" },
  { label: "Discovery Ritual", href: "/discovery" },
  { label: "The Maison", href: "/heritage" },
  { label: "Journal", href: "/journal" },
  { label: "Concierge", href: "/concierge" },
];

export const FREE_SAMPLES = [
  { id: "sample-oud", name: "Oud Impérial Extrait (1ml)" },
  { id: "sample-rose", name: "Rose Sultane Extrait (1ml)" },
  { id: "sample-musk", name: "Musk Céleste Extrait (1ml)" },
  { id: "sample-ambre", name: "Ambre Noir Extrait (1ml)" },
];

export type JournalArticle = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  image: string;
  author: string;
  content: string[];
};

export const JOURNAL_ARTICLES: JournalArticle[] = [
  {
    slug: "taif-rose-dawn-harvest",
    title: "The 5AM Harvest: Distilling Taif’s Gilded Mountain Roses",
    excerpt: "Why the world’s most precious rose petals must be hand-picked before sunrise strikes the valley.",
    category: "Artisanal Harvest",
    readTime: "4 min read",
    date: "September 2026",
    image: "/images/rose-sultane.jpg",
    author: "Tariq Al-Mansoor, Master Distiller",
    content: [
      "High in the misty terraced valleys of Al-Hada, 2,000 meters above the Red Sea, bloom the 30-petal Damask roses that have perfumed kings for centuries.",
      "The harvest is a race against sunlight. As soon as the morning sun strikes the petals, the heat evaporates their most delicate top terpenes. By 4:30 AM, our generational farmers are already in the terraces, plucking blooms by hand into wicker baskets.",
      "By noon, over forty thousand fresh petals are sealed into antique copper alembic stills (deg-bapka) with pure mountain spring water, beginning a slow 14-day hydro-distillation that produces less than a single litre of pure Rose Sultane extrait.",
    ],
  },
  {
    slug: "science-of-pure-oil-vs-alcohol",
    title: "Why Alcohol-Free Oil Outlasts 100 Sprays",
    excerpt: "A deep dive into skin lipid binding, evaporation kinetics, and the true evolution of attar.",
    category: "Olfactory Science",
    readTime: "5 min read",
    date: "August 2026",
    image: "/images/ritual.jpg",
    author: "Dr. Hélène Laurent, Cosmetic Biochemist",
    content: [
      "Modern commercial eau de parfum is fundamentally an alcohol delivery vehicle: 80% to 85% ethanol engineered to flash-evaporate violently within minutes.",
      "While this creates an explosive opening projection, it also strips natural skin moisture and exhausts 70% of the aromatic compounds into the surrounding air within two hours.",
      "Attar operates on an entirely different physical principle: lipid solubility. Because pure botanical oils share the molecular structure of human sebum, they bond directly to the stratum corneum. Body heat acts not as an evaporative enemy, but as an engine of continuous, slow-release sillage across 14+ hours.",
    ],
  },
  {
    slug: "cambodian-oud-oak-maturation",
    title: "The Patience of Wood: Aging Wild Oud in French Oak",
    excerpt: "How eight years of oak barrel aging softens wild agarwood’s feral edge into imperial majesty.",
    category: "Heritage Cellar",
    readTime: "6 min read",
    date: "July 2026",
    image: "/images/oud-imperial.jpg",
    author: "Alexandre Vance, Founder",
    content: [
      "Wild agarwood from the deep forests of Pursat is notorious for its fierce, untamed animalic power. Freshly distilled, it is dark, resinous, and demanding.",
      "At SPIRIT OF ARABIAN, we rest our raw extraits in lightly toasted French oak barrels for a minimum of eight years. Over seasons of desert heat and cool cellar nights, the tannin exchange rounds off sharp volatile edges.",
      "The result is Oud Impérial: a deep, smoky, buttery oud enveloped in amber leather and saffron warmth.",
    ],
  },
];

export type HeritageTimeline = {
  year: string;
  title: string;
  description: string;
};

export const HERITAGE_EVENTS: HeritageTimeline[] = [
  {
    year: "1998",
    title: "The First Copper Alembic",
    description: "Founded in Kannauj and Dubai with two antique copper deg-bapka stills, dedicated to preserving 1,000-year-old hydro-distillation techniques.",
  },
  {
    year: "2008",
    title: "Taif Cooperative Alliance",
    description: "Established our exclusive grower partnership with mountain families in Al-Hada to secure pristine dawn-harvest Damask rose harvests.",
  },
  {
    year: "2016",
    title: "The French Oak Maturation Vault",
    description: "Pioneered the multi-year barrel aging of CITES-certified wild agarwood in bespoke oak casks.",
  },
  {
    year: "2024",
    title: "Global Maison Expansion",
    description: "Opening private consultation salons and delivery ateliers across Dubai, Rotterdam, and London.",
  },
];

export type Boutique = {
  city: string;
  address: string;
  hours: string;
  phone: string;
};

export const BOUTIQUES: Boutique[] = [
  {
    city: "Dubai Flagship Atelier",
    address: "Alserkal Avenue, Unit 42, Al Quoz 1, Dubai, UAE",
    hours: "Mon – Sun: 10:00 AM – 9:00 PM",
    phone: "+971 4 829 1998",
  },
  {
    city: "Rotterdam Private Salon",
    address: "Westersingel 88, 3015 LC Rotterdam, Netherlands",
    hours: "Tue – Sat: 11:00 AM – 7:00 PM (By Appointment)",
    phone: "+31 10 742 0988",
  },
  {
    city: "London Concierge Office",
    address: "24 Berkeley Square, Mayfair, London W1J 6HE, UK",
    hours: "Mon – Fri: 9:00 AM – 6:00 PM",
    phone: "+44 20 7946 0912",
  },
];

export type QuizQuestion = {
  id: number;
  question: string;
  subtitle: string;
  options: {
    label: string;
    description: string;
    tag: string;
    productId: string;
  }[];
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Which atmosphere calls to you most?",
    subtitle: "Select the setting where you feel most magnetic and powerful.",
    options: [
      {
        label: "Royal Evening & Black Tie",
        description: "Regal presence, smoky fireplace, velvet attire",
        tag: "Oud & Leather",
        productId: "oud-imperial",
      },
      {
        label: "Palace Garden at Sunrise",
        description: "Gilded sunlight, dew-kissed petals, honeyed sweetness",
        tag: "Velvet Florals",
        productId: "rose-sultane",
      },
      {
        label: "Quiet Luxury & Cashmere Silk",
        description: "Clean, intimate, serene second-skin aura",
        tag: "Luminous Musk",
        productId: "musk-celeste",
      },
      {
        label: "Midnight Fire & Amber Hearth",
        description: "Warm, intoxicating spices and seductive dark tonka",
        tag: "Warm Amber",
        productId: "ambre-noir",
      },
    ],
  },
  {
    id: 2,
    question: "What note family stirs your senses?",
    subtitle: "Choose the aromatic profile that makes you pause.",
    options: [
      {
        label: "Smoky Cambodian Oud & Aged Oak",
        description: "Resinous, authoritative, deep woody complexity",
        tag: "Woody Resin",
        productId: "oud-imperial",
      },
      {
        label: "Damask Rose & Wild Forest Honey",
        description: "Velvety, intoxicating, romantic and opulent",
        tag: "Floral Gourmand",
        productId: "rose-sultane",
      },
      {
        label: "Florentine Orris & White Musk",
        description: "Clean iris, silky pear blossom, pure tranquility",
        tag: "Ethereal Clean",
        productId: "musk-celeste",
      },
      {
        label: "Bourbon Vanilla, Clove & Vintage Tonka",
        description: "Sultry, smoky gourmand with lingering warmth",
        tag: "Spiced Tonka",
        productId: "ambre-noir",
      },
    ],
  },
  {
    id: 3,
    question: "What sillage trail do you wish to project?",
    subtitle: "How should your presence linger in a room?",
    options: [
      {
        label: "Sovereign & Unforgettable (14+ hours)",
        description: "Commands attention without ever overwhelming the senses",
        tag: "Maximum Sillage",
        productId: "oud-imperial",
      },
      {
        label: "Radiant & Captivating (12+ hours)",
        description: "Draws compliments from across the room all day",
        tag: "Radiant Glow",
        productId: "rose-sultane",
      },
      {
        label: "Intimate & Sacred Skin Scent (10+ hours)",
        description: "Only discovered when someone leans in close to you",
        tag: "Whispering Luxury",
        productId: "musk-celeste",
      },
      {
        label: "Hypnotic & Seductive (13+ hours)",
        description: "Leaves a golden mystery on coats and scarves for days",
        tag: "Magnetic Warmth",
        productId: "ambre-noir",
      },
    ],
  },
];
