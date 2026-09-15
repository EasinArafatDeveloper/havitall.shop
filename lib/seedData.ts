export const initialCategories = [
  {
    name: "Luxury Watches",
    slug: "luxury-watches",
    description: "Chronographs, smart wearables and timeless analog luxury timepieces.",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop",
    icon: "Watch",
    featured: true,
  },
  {
    name: "Audio & Acoustics",
    slug: "audio-acoustics",
    description: "Studio-grade wireless headphones, ANC earbuds, and hi-fi soundbars.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop",
    icon: "Headphones",
    featured: true,
  },
  {
    name: "Designer Bags & Leather",
    slug: "bags-leather",
    description: "Premium handcrafted Italian leather bags, wallets and travel backpacks.",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop",
    icon: "Briefcase",
    featured: true,
  },
  {
    name: "Smart Gadgets & Tech",
    slug: "smart-gadgets",
    description: "Futuristic ambient gadgets, custom mechanical keyboards, and workspace tech.",
    image: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?q=80&w=1000&auto=format&fit=crop",
    icon: "Smartphone",
    featured: true,
  },
  {
    name: "Eyewear & Shades",
    slug: "eyewear-shades",
    description: "Polarized luxury sunglasses, titanium frames and modern statement eyewear.",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1000&auto=format&fit=crop",
    icon: "Glasses",
    featured: true,
  },
  {
    name: "Footwear & Kicks",
    slug: "footwear-kicks",
    description: "Exclusive limited-edition sneakers, suede loafers, and ultra-comfort shoes.",
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1000&auto=format&fit=crop",
    icon: "Footprints",
    featured: true,
  }
];

export const initialBanners = [
  {
    title: "Aura Pro Wireless ANC Studio Edition",
    subtitle: "Pure Spatial Audio. Titanium Acoustic Chambers. 45h Battery Life.",
    tagline: "NEW FLAGSHIP RELEASE",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1400&auto=format&fit=crop",
    buttonText: "Discover Sound",
    buttonLink: "/shop?category=audio-acoustics",
    discountBadge: "30% OFF LAUNCH",
    bgColor: "from-slate-950 via-rose-950/80 to-slate-900",
    order: 1,
    isActive: true,
  },
  {
    title: "HavItAll Chrono Luxury Heritage Watch",
    subtitle: "Sapphire Crystal, Automatic Movement & Precision Swiss Craftsmanship.",
    tagline: "TIMELESS ELEGANCE",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1400&auto=format&fit=crop",
    buttonText: "Explore Collection",
    buttonLink: "/shop?category=luxury-watches",
    discountBadge: "LIMITED EDITION",
    bgColor: "from-slate-950 via-amber-950/80 to-slate-900",
    order: 2,
    isActive: true,
  },
  {
    title: "Minimalist Italian Full-Grain Leather Pack",
    subtitle: "Engineered for modern nomad creators. Water-resistant & ergonomic.",
    tagline: "HANDCRAFTED LUXURY",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1400&auto=format&fit=crop",
    buttonText: "Shop Leather",
    buttonLink: "/shop?category=bags-leather",
    discountBadge: "HOT SELLER",
    bgColor: "from-slate-950 via-emerald-950/80 to-slate-900",
    order: 3,
    isActive: true,
  },
  {
    title: "Cyberpunk Custom RGB Mechanical Keyboard",
    subtitle: "Hot-swappable tactile switches, CNC aluminum chassis, wireless Tri-Mode.",
    tagline: "WORKSPACE ASCENT",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=1400&auto=format&fit=crop",
    buttonText: "Upgrade Setup",
    buttonLink: "/shop?category=smart-gadgets",
    discountBadge: "FLASH SALE",
    bgColor: "from-slate-950 via-purple-950/80 to-slate-900",
    order: 4,
    isActive: true,
  }
];

export const initialProducts = [
  {
    name: "Aura Pro Wireless ANC Studio Headphones",
    slug: "aura-pro-wireless-anc-headphones",
    shortDescription: "Flagship active noise cancellation with hi-res lossless spatial audio.",
    description: "The Aura Pro Studio Edition delivers unmatched acoustic precision. Featuring 40mm beryllium drivers, active hybrid noise cancellation with transparency mode, and ultra-plush memory foam earcups encased in bead-blasted anodized aluminum. Designed for audiophiles and creative professionals.",
    price: 3499,
    originalPrice: 4999,
    discountPercentage: 30,
    category: "audio-acoustics",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1000&auto=format&fit=crop"
    ],
    stock: 25,
    rating: 4.9,
    numReviews: 48,
    isHot: true,
    isFeatured: true,
    isNewArrival: true,
    badge: "Hot Deal",
    variants: {
      colors: ["Obsidian Black", "Titanium Silver", "Midnight Rose"],
      sizes: ["Standard Fit"]
    },
    features: [
      "Hybrid Active Noise Cancellation with 6 beamforming mics",
      "Custom 40mm Beryllium acoustic drivers",
      "Up to 45 hours playtime with fast USB-C charge",
      "Bluetooth 5.3 with LDAC & aptX Lossless codecs",
      "Foldable luxury vegan leather carrying case included"
    ],
    tags: ["audio", "wireless", "anc", "headphones", "bluetooth"]
  },
  {
    name: "HavItAll Chrono Swiss Skeleton Automatic Watch",
    slug: "havitall-chrono-swiss-automatic-watch",
    shortDescription: "Luxury mechanical timepiece with sapphire crystal and exhibition caseback.",
    description: "Crafted with relentless attention to horological heritage, the Chrono Swiss features a self-winding mechanical movement with 42-hour power reserve. Encased in surgical-grade 316L stainless steel with scratch-resistant double-domed sapphire glass and an authentic Italian calfskin strap.",
    price: 7899,
    originalPrice: 9999,
    discountPercentage: 21,
    category: "luxury-watches",
    images: [
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop"
    ],
    stock: 14,
    rating: 5.0,
    numReviews: 32,
    isHot: true,
    isFeatured: true,
    isNewArrival: false,
    badge: "Bestseller",
    variants: {
      colors: ["Rose Gold & Brown Leather", "Stealth Silver & Black", "Midnight Gold"],
      sizes: ["40mm", "42mm"]
    },
    features: [
      "Swiss-inspired automatic self-winding movement",
      "Double-domed anti-reflective sapphire crystal",
      "5 ATM / 50 meters water resistance",
      "Interchangeable quick-release calfskin strap",
      "Numbered collector edition case"
    ],
    tags: ["watch", "luxury", "automatic", "accessories"]
  },
  {
    name: "Roma Handcrafted Full-Grain Leather Briefpack",
    slug: "roma-handcrafted-leather-briefpack",
    shortDescription: "Versatile luxury laptop bag and backpack crafted from vegetable-tanned leather.",
    description: "Designed in Florence and built for a lifetime. The Roma Briefpack effortlessly transitions from a sophisticated executive briefcase to an ergonomic backpack. Includes padded compartments for up to a 16\" MacBook Pro, magnetic fidlock buckles, and YKK Excella gold zippers.",
    price: 4599,
    originalPrice: 5999,
    discountPercentage: 23,
    category: "bags-leather",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?q=80&w=1000&auto=format&fit=crop"
    ],
    stock: 18,
    rating: 4.8,
    numReviews: 29,
    isHot: false,
    isFeatured: true,
    isNewArrival: true,
    badge: "Handcrafted",
    variants: {
      colors: ["Vintage Cognac", "Espresso Dark Brown", "Onyx Black"],
      sizes: ["16L Executive"]
    },
    features: [
      "100% Certified Italian vegetable-tanned full-grain leather",
      "Dedicated padded 16\" laptop sleeve with micro-fleece lining",
      "Concealed passport and luggage pass-through strap",
      "Custom brushed brass hardware & reinforced seams"
    ],
    tags: ["leather", "bag", "backpack", "luxury"]
  },
  {
    name: "Nova-84 Tri-Mode Custom Mechanical Keyboard",
    slug: "nova-84-custom-mechanical-keyboard",
    shortDescription: "CNC aluminum hot-swap wireless mechanical keyboard with customized tactile switches.",
    description: "Elevate your typing experience to art. Nova-84 features an anodized CNC aluminum body, gasket mount structure with 5-layer sound dampening foam, factory-lubed custom switches, and south-facing RGB lighting with per-key customization.",
    price: 2899,
    originalPrice: 3500,
    discountPercentage: 17,
    category: "smart-gadgets",
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=1000&auto=format&fit=crop"
    ],
    stock: 30,
    rating: 4.9,
    numReviews: 64,
    isHot: true,
    isFeatured: true,
    isNewArrival: true,
    badge: "Trending",
    variants: {
      colors: ["Retro Cyber White", "Anodized Space Gray", "Rose Quartz"],
      sizes: ["Linear Smooth Switches", "Tactile Thock Switches"]
    },
    features: [
      "Full CNC solid aluminum chassis with brass weight",
      "Gasket mounted with Poron acoustic dampening layers",
      "Tri-Mode connectivity: 2.4GHz Wireless, Bluetooth 5.1, USB-C",
      "Hot-swappable PCB supporting 3-pin & 5-pin switches",
      "Long-lasting 4000mAh rechargeable battery"
    ],
    tags: ["keyboard", "gadget", "gaming", "workspace", "tech"]
  },
  {
    name: "Spectra Matrix Polarized Titanium Sunglasses",
    slug: "spectra-matrix-polarized-sunglasses",
    shortDescription: "Ultra-lightweight Japanese aerospace titanium frames with HD polarized UV400 lenses.",
    description: "Weighing only 18 grams, the Spectra Matrix blends futuristic geometric lines with timeless style. Featuring scratch-resistant multi-layered polarized lenses that eliminate 99.9% of glare while enhancing contrast and true color reproduction.",
    price: 1899,
    originalPrice: 2499,
    discountPercentage: 24,
    category: "eyewear-shades",
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=1000&auto=format&fit=crop"
    ],
    stock: 22,
    rating: 4.7,
    numReviews: 21,
    isHot: false,
    isFeatured: false,
    isNewArrival: true,
    badge: "New",
    variants: {
      colors: ["Gunmetal & Emerald Lens", "Gold & Sunset Gradient", "Matte Black & Mirror Silver"],
      sizes: ["One Size Fits All"]
    },
    features: [
      "Ultra-light Japanese aerospace titanium frame (18g)",
      "Category 3 UV400 polarized HD optical clarity lenses",
      "Hypoallergenic silicone nose pads with self-adjusting flex",
      "Includes hard leather travel case & microfiber lens cloth"
    ],
    tags: ["sunglasses", "eyewear", "fashion", "luxury"]
  },
  {
    name: "Pulse Ultra Hybrid Carbon Runner Sneakers",
    slug: "pulse-ultra-hybrid-carbon-runner",
    shortDescription: "Dynamic energy-return sneakers with full-length carbon fiber propulsion plate.",
    description: "Engineered for maximum street style and athletic performance. The Pulse Ultra combines breathable engineered knit uppers with high-rebound supercritical nitrogen-infused foam and an exposed carbon fiber torsion plate for effortless propulsion.",
    price: 3299,
    originalPrice: 4200,
    discountPercentage: 21,
    category: "footwear-kicks",
    images: [
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1000&auto=format&fit=crop"
    ],
    stock: 40,
    rating: 4.8,
    numReviews: 53,
    isHot: true,
    isFeatured: true,
    isNewArrival: true,
    badge: "Popular",
    variants: {
      colors: ["Triple Phantom Black", "Cyber Red & White", "Glacier White"],
      sizes: ["EU 40", "EU 41", "EU 42", "EU 43", "EU 44"]
    },
    features: [
      "Supercritical nitrogen-infused high rebound foam midsole",
      "Curved full-length carbon composite propulsion plate",
      "Breathable 3D jacquard seamless engineered knit upper",
      "Continental grade rubber outsole with wet-surface traction"
    ],
    tags: ["sneakers", "shoes", "footwear", "fashion", "sport"]
  },
  {
    name: "Lumina Smart Mood Bar LED RGB Table Lamp",
    slug: "lumina-smart-mood-bar-rgb-lamp",
    shortDescription: "App & voice controlled ambient light bar with music sync and sunset mode.",
    description: "Transform your bedroom or gaming desk into a cinematic oasis. Lumina Smart Mood features 16 million colors, dynamic scene effects that rhythmically sync with your room audio, and ultra-smooth gradual dimming.",
    price: 1499,
    originalPrice: 1999,
    discountPercentage: 25,
    category: "smart-gadgets",
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=1000&auto=format&fit=crop"
    ],
    stock: 35,
    rating: 4.6,
    numReviews: 19,
    isHot: false,
    isFeatured: true,
    isNewArrival: true,
    badge: "Deal",
    variants: {
      colors: ["Matte Black", "Lunar White"],
      sizes: ["35cm Tall"]
    },
    features: [
      "16 Million RGB colors + 2200K - 6500K tunable whites",
      "Built-in microphone for real-time music & gaming audio sync",
      "Smart App control with custom schedules and sunset timers",
      "Magnetic 360° rotating base for vertical or horizontal placement"
    ],
    tags: ["lighting", "smart home", "gadget", "decor"]
  },
  {
    name: "Velocita Magnetic Leather MagSafe Card Wallet",
    slug: "velocita-magnetic-leather-magsafe-wallet",
    shortDescription: "Slim RFID-blocking genuine leather wallet with strong neodymium snap magnets.",
    description: "Crafted from top-grain saddle leather, the Velocita Snap Wallet attaches securely to your iPhone or magnetic case. Holds up to 3 cards securely while maintaining a razor-thin profile and RFID theft shielding.",
    price: 799,
    originalPrice: 1200,
    discountPercentage: 33,
    category: "bags-leather",
    images: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1606503829059-e9eb7b37f3eb?q=80&w=1000&auto=format&fit=crop"
    ],
    stock: 50,
    rating: 4.9,
    numReviews: 38,
    isHot: true,
    isFeatured: false,
    isNewArrival: true,
    badge: "Best Seller",
    variants: {
      colors: ["Caramel Tan", "Saddle Black", "Hunter Green"],
      sizes: ["3-Card Slim"]
    },
    features: [
      "Custom 3800 Gauss neodymium alignment magnets",
      "Integrated military-grade RFID shield protection",
      "Thumb slot cutout for swift card retrieval",
      "Ages beautifully with an organic rich leather patina"
    ],
    tags: ["wallet", "leather", "magsafe", "accessories"]
  }
];

export const initialOrders = [
  {
    orderNumber: "HAV-8092",
    customer: {
      fullName: "Tanvir Ahmed",
      email: "tanvir.dev@example.com",
      phone: "01712345678",
      address: "House 42, Road 11, Block D, Banani",
      city: "Dhaka",
      note: "Please call before delivery"
    },
    items: [
      {
        productId: "aura-pro-wireless-anc-headphones",
        name: "Aura Pro Wireless ANC Studio Headphones",
        price: 3499,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop",
        selectedColor: "Obsidian Black",
        selectedSize: "Standard Fit"
      }
    ],
    subtotal: 3499,
    shippingFee: 0,
    discount: 200,
    totalAmount: 3299,
    couponCode: "HAVITALL200",
    paymentMethod: "COD",
    paymentStatus: "Pending",
    orderStatus: "Processing",
    timeline: [
      { status: "Placed", time: new Date(Date.now() - 3600000 * 24), note: "Order placed via website" },
      { status: "Confirmed", time: new Date(Date.now() - 3600000 * 18), note: "Payment verified and order confirmed" },
      { status: "Processing", time: new Date(Date.now() - 3600000 * 8), note: "Item packed at central warehouse" }
    ]
  },
  {
    orderNumber: "HAV-8091",
    customer: {
      fullName: "Samira Rahman",
      email: "samira.r@example.com",
      phone: "01898765432",
      address: "Flat 5B, Green Tower, GEC Circle",
      city: "Chittagong",
      note: "Urgent delivery"
    },
    items: [
      {
        productId: "havitall-chrono-swiss-automatic-watch",
        name: "HavItAll Chrono Swiss Skeleton Automatic Watch",
        price: 7899,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop",
        selectedColor: "Rose Gold & Brown Leather",
        selectedSize: "42mm"
      }
    ],
    subtotal: 7899,
    shippingFee: 0,
    discount: 500,
    totalAmount: 7399,
    couponCode: "VIPLUXURY",
    paymentMethod: "BKASH",
    paymentStatus: "Paid",
    orderStatus: "Shipped",
    timeline: [
      { status: "Placed", time: new Date(Date.now() - 3600000 * 48), note: "Order placed" },
      { status: "Confirmed", time: new Date(Date.now() - 3600000 * 36), note: "bKash payment verified" },
      { status: "Processing", time: new Date(Date.now() - 3600000 * 20), note: "Quality checked & packed" },
      { status: "Shipped", time: new Date(Date.now() - 3600000 * 4), note: "Handed over to RedX Courier: Track #RX-9921" }
    ]
  }
];
