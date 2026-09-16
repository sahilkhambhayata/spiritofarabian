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
    description:
      "Cambodian wild agarwood aged eight years in oak casks, softened by Kashmiri royal saffron threads and smoked fossil amber resin. Dark, regal, unmistakably rare — the signature extrait collectors and connoisseurs whisper about.",
    price: 185,
    compareAt: 220,
    image: "/images/oud-imperial.jpg",
    secondaryImage: "/images/hero-bottle.jpg",
    hue: "#b4641e",
    accent: "Smoked Cambodian Oud · Royal Saffron · Grey Leather",
    mood: "Evening Sovereign · Cold Air · Royal Presence",
    family: "Dark Woody / Oriental",
    intensity: 5,
    longevityHours: "14+ Hours",
    origin: "Pursat Forest, Cambodia & Kashmir, India",
    layeringPartner: "Musk Céleste",
    layeringTip: "Apply Musk Céleste first as a luminous second-skin base, then crown pulse points with a single touch of Oud Impérial for regal projection.",
    notes: {
      top: [
        { name: "Kashmiri Saffron", desc: "Hand-harvested crimson threads" },
        { name: "Black Cardamom", desc: "Smoky, spiced highland pods" },
      ],
      heart: [
        { name: "Aged Cambodian Oud", desc: "8-year barrel aged wild agarwood" },
        { name: "Rosewood", desc: "Warm balsamic floral wood" },
      ],
      base: [
        { name: "Smoked Fossil Amber", desc: "Golden ancient resin accord" },
        { name: "Grey Glove Leather", desc: "Supple, velvety finish" },
      ],
    },
    sizes: [
      { id: "6ml", label: "6ml Travel Flacon", volume: "6ml", price: 110 },
      { id: "12ml", label: "12ml Imperial Extrait", volume: "12ml", price: 185, compareAt: 220 },
      { id: "30ml", label: "30ml Grand Flacon", volume: "30ml", price: 395, compareAt: 460 },
    ],
    badge: "Signature",
  },
  {
    id: "rose-sultane",
    name: "Rose Sultane",
    tagline: "A thousand petals in one sacred drop",
    description:
      "Taif mountain roses picked at 5am dawn, slow steam-distilled the same afternoon over aged Mysore sandalwood and wild clover honey. Velvet florals with imperial honeyed depth and gilded sillage.",
    price: 145,
    compareAt: 175,
    image: "/images/rose-sultane.jpg",
    secondaryImage: "/images/ritual.jpg",
    hue: "#a83250",
    accent: "Dawn Taif Rose · Golden Honey · White Sandalwood",
    mood: "Gala Romance · Radiant Daylight · Gilded Elegance",
    family: "Floral Extrait / Honeyed Rose",
    intensity: 4,
    longevityHours: "12+ Hours",
    origin: "Al-Hada Highlands, Taif, Saudi Arabia",
    layeringPartner: "Ambre Noir",
    layeringTip: "Blend with Ambre Noir for an intoxicating Turkish rose and warm tonka smoke sillage that commands any room.",
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
    badge: "Bestseller",
  },
  {
    id: "musk-celeste",
    name: "Musk Céleste",
    tagline: "Your skin, elevated into the sacred",
    description:
      "A weightless, silk-soft white botanical musk lifted by Florentine iris butter, pear blossom, and cashmere woods. The quintessential quiet luxury attar — luminous, intimate, and unforgettable.",
    price: 125,
    compareAt: 150,
    image: "/images/musk-celeste.jpg",
    secondaryImage: "/images/hero-bottle.jpg",
    hue: "#d8c9ae",
    accent: "White Iris · Pear Blossom · Cashmere Musk",
    mood: "Quiet Luxury · Intimate Rendezvous · Daily Ritual",
    family: "Luminous Musk / Clean Floral",
    intensity: 2,
    longevityHours: "10+ Hours",
    origin: "Florence, Italy & Grasse, France",
    layeringPartner: "Oud Impérial",
    layeringTip: "Enhances and softens heavy oud or amber, creating an effortlessly magnetic second-skin aura.",
    notes: {
      top: [
        { name: "White Muscat", desc: "Crisp ethereal opening" },
        { name: "Pear Blossom", desc: "Dewy tender florals" },
      ],
      heart: [
        { name: "Florentine Orris Butter", desc: "Precious powdered iris" },
        { name: "White Botanical Musk", desc: "Velvet second-skin accord" },
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
    description:
      "Black volcanic amber infused with roasted tonka smoke, Zanzibar clove, and worn equestrian leather. A magnetizing warmth that evolves in waves as twilight deepens into midnight.",
    price: 165,
    compareAt: 195,
    image: "/images/ambre-noir.jpg",
    secondaryImage: "/images/gold-smoke.jpg",
    hue: "#c87a2e",
    accent: "Dark Amber · Tonka Smoke · Bourbon Vanilla",
    mood: "Winter Fireside · Midnight Allure · Speakeasy",
    family: "Amber Oriental / Gourmand Smoke",
    intensity: 4,
    longevityHours: "13+ Hours",
    origin: "Zanzibar & Madagascar",
    layeringPartner: "Rose Sultane",
    layeringTip: "Apply to lapels and pulse points for an irresistible amber-gilded sillage that lingers for days on cashmere.",
    notes: {
      top: [
        { name: "Burnt Blood Orange", desc: "Caramelized citrus zest" },
        { name: "Zanzibar Clove", desc: "Aromatic dry spice" },
      ],
      heart: [
        { name: "Black Ambergris Accord", desc: "Deep mineral warmth" },
        { name: "Toasted Tonka Bean", desc: "Almond & tobacco undertones" },
      ],
      base: [
        { name: "Vintage Leather", desc: "Aged warm saddle note" },
        { name: "Bourbon Vanilla Pod", desc: "Rich woody Madagascar extract" },
      ],
    },
    sizes: [
      { id: "6ml", label: "6ml Travel Flacon", volume: "6ml", price: 95 },
      { id: "12ml", label: "12ml Imperial Extrait", volume: "12ml", price: 165, compareAt: 195 },
      { id: "30ml", label: "30ml Grand Flacon", volume: "30ml", price: 350, compareAt: 410 },
    ],
    badge: "Limited Edition",
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
  { label: "Collection", href: "/collection" },
  { label: "Discovery Ritual", href: "/discovery" },
  { label: "The Maison", href: "/heritage" },
  { label: "Scent Journal", href: "/journal" },
  { label: "Client Concierge", href: "/concierge" },
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
