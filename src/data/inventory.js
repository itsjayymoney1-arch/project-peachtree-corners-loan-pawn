export const CATEGORIES = [
  {
    id: "jewelry",
    name: "Jewelry & Watches",
    tagline: "Fine Gold, Diamonds & Timeless Luxury",
    description: "Curated fine jewelry, solid gold chains, diamond solitaire rings, engagement bands, and verified luxury timepieces.",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80",
    href: "/jewelry",
    count: "Over 50+ rotating styles"
  },
  {
    id: "electronics",
    name: "Electronics",
    tagline: "Modern Tech, Computing & Entertainment",
    description: "Inspected smartphones, premium laptops, noise-canceling headphones, 4K displays, and modern gaming consoles.",
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80",
    href: "/electronics",
    count: "Inspected & tested daily"
  },
  {
    id: "tools",
    name: "Tools & Equipment",
    tagline: "Commercial Grade Power & Hand Tools",
    description: "Professional cordless brushless power tool sets, heavy-duty compressors, diagnostic tools, and workshop gear.",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80",
    href: "/tools",
    count: "Top contractor brands"
  },
  {
    id: "instruments",
    name: "Musical Instruments",
    tagline: "Acoustic, Electric & Studio Sound",
    description: "Electric and acoustic guitars, keyboards, studio amplifiers, pro audio mixers, and performance gear.",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=80",
    href: "/musical-instruments",
    count: "Acoustic & electric"
  },
  {
    id: "collectibles",
    name: "Collectibles & Specialty Finds",
    tagline: "Rare Memorabilia & Distinctive Treasures",
    description: "Vintage numismatics, rare coins, collectible timepieces, sports memorabilia, and unique curiosities.",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=900&q=80",
    href: "/shop?category=collectibles",
    count: "One-of-a-kind treasures"
  }
];

export const DEMO_PRODUCTS = [
  // JEWELRY & WATCHES
  {
    id: "jewel-01",
    title: "14K Yellow Gold Solid Miami Cuban Link Chain (22\")",
    category: "jewelry",
    subcategory: "Chains & Necklaces",
    condition: "Polished & Inspected",
    estimatedValue: "$2,450",
    featured: true,
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
    description: "Classic 14-karat solid yellow gold Miami Cuban link chain. Features a secure double box lock safety clasp, high-luster polish, and substantial weight feel.",
    specs: {
      "Metal": "14K Solid Yellow Gold",
      "Length": "22 inches",
      "Width": "6.5 mm",
      "Clasp": "Double Safety Box Clasp",
      "Finish": "High Polish Mirror"
    }
  },
  {
    id: "jewel-02",
    title: "Swiss Automatic Chronograph Stainless Steel Watch",
    category: "jewelry",
    subcategory: "Luxury Watches",
    condition: "Excellent (Inspected Movement)",
    estimatedValue: "$3,800",
    featured: true,
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
    description: "Precision Swiss automatic mechanical chronograph featuring a scratch-resistant sapphire crystal, black dial with tachymeter bezel, and solid link stainless steel bracelet.",
    specs: {
      "Movement": "Swiss Automatic Chronograph",
      "Case Size": "42 mm",
      "Crystal": "Anti-Reflective Sapphire",
      "Case Material": "316L Stainless Steel",
      "Water Resistance": "100m / 330ft"
    }
  },
  {
    id: "jewel-03",
    title: "1.25ct Brilliant Round Diamond Solitaire Ring in 18K White Gold",
    category: "jewelry",
    subcategory: "Rings & Bands",
    condition: "Pristine Showcase",
    estimatedValue: "$4,200",
    featured: true,
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
    description: "Stunning six-prong diamond solitaire set in hypoallergenic 18K white gold. Beautiful light performance with exceptional symmetry and eye-clean brilliance.",
    specs: {
      "Center Stone": "Round Brilliant Cut Diamond",
      "Approx. Weight": "1.25 Carats",
      "Setting": "Classic 6-Prong Crown",
      "Metal": "18K White Gold",
      "Ring Size": "7 (Sizable upon request)"
    }
  },
  {
    id: "jewel-04",
    title: "Vintage 18K Yellow Gold Diamond Tennis Bracelet (7\")",
    category: "jewelry",
    subcategory: "Bracelets",
    condition: "Refurbished & Inspected",
    estimatedValue: "$2,850",
    featured: false,
    image: "https://images.unsplash.com/photo-1611591475152-4735d38d0145?auto=format&fit=crop&w=800&q=80",
    description: "Continuous line of matched round brilliant diamonds channel-set in heavy 18K yellow gold. Timeless luxury bracelet suitable for evening or everyday elegance.",
    specs: {
      "Total Carat Weight": "Approx. 3.00 ctw",
      "Metal": "18K Yellow Gold",
      "Length": "7 inches",
      "Clasp": "Hidden Box Clasp with Safety Latch"
    }
  },
  {
    id: "jewel-05",
    title: "Two-Tone Diver's Automatic 300M Watch",
    category: "jewelry",
    subcategory: "Luxury Watches",
    condition: "Great Condition",
    estimatedValue: "$1,650",
    featured: false,
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
    description: "Rugged yet refined two-tone gold and stainless steel diving timepiece with unidirectional ceramic bezel, luminous hands, and date magnification window.",
    specs: {
      "Bezel": "Unidirectional Ceramic",
      "Dial": "Sunburst Blue with Lumibrite Markers",
      "Case": "Two-Tone Stainless & Gold PVD",
      "Power Reserve": "Approx. 40 Hours"
    }
  },

  // ELECTRONICS
  {
    id: "elec-01",
    title: "16-Inch Professional M2 Max Laptop (32GB / 1TB SSD)",
    category: "electronics",
    subcategory: "Computers & Laptops",
    condition: "Tested & Factory Reset",
    estimatedValue: "$1,890",
    featured: true,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    description: "High-performance creative workstation in Space Gray. Includes original charging adapter. Thoroughly wiped, diagnostic tested, and ready for immediate deployment.",
    specs: {
      "Processor": "M2 Max 12-Core CPU / 38-Core GPU",
      "Memory": "32GB Unified Memory",
      "Storage": "1TB High-Speed SSD",
      "Display": "Liquid Retina XDR (3456 x 2234)",
      "Battery Health": "94% Original Capacity"
    }
  },
  {
    id: "elec-02",
    title: "Flagship 5G Smartphone (256GB, Unlocked)",
    category: "electronics",
    subcategory: "Phones & Mobile",
    condition: "Grade A+ (Clean IMEI)",
    estimatedValue: "$780",
    featured: true,
    image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=80",
    description: "Titanium chassis 5G flagship phone with pro triple-camera array. Unlocked for all major domestic and international carriers. Zero screen blemishes.",
    specs: {
      "Network Status": "Factory Unlocked (Clean IMEI)",
      "Capacity": "256GB Storage",
      "Chassis": "Natural Titanium",
      "Screen": "6.7\" Super AMOLED 120Hz",
      "Includes": "USB-C Braided Cable"
    }
  },
  {
    id: "elec-03",
    title: "Premium Wireless Noise-Canceling Over-Ear Headphones",
    category: "electronics",
    subcategory: "Audio Equipment",
    condition: "Like New in Case",
    estimatedValue: "$260",
    featured: false,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
    description: "Industry-leading active noise canceling headphones with 30-hour battery life, multipoint Bluetooth pairing, and pristine acoustic clarity. Hard travel case included.",
    specs: {
      "Noise Cancelling": "Adaptive Multi-Mic ANC",
      "Battery Life": "Up to 30 Hours",
      "Connectivity": "Bluetooth 5.2 / 3.5mm Aux",
      "Microphones": "Beamforming Voice Array",
      "Accessories": "Case, Aux cable, Charging cable"
    }
  },
  {
    id: "elec-04",
    title: "Next-Gen 4K Disc Edition Gaming Console",
    category: "electronics",
    subcategory: "Gaming",
    condition: "Tested & Formatted",
    estimatedValue: "$420",
    featured: false,
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80",
    description: "Current-generation ultra-high-speed SSD gaming console with 4K 120Hz output and ray-tracing capabilities. Comes complete with wireless controller and HDMI cable.",
    specs: {
      "Edition": "Ultra HD Blu-ray Disc Edition",
      "Storage": "825GB High-Speed SSD",
      "Video Output": "HDMI 2.1 (4K 120Hz / 8K Support)",
      "Includes": "1x Wireless Controller, Power & HDMI cables"
    }
  },
  {
    id: "elec-05",
    title: "Mirrorless Digital Full-Frame Camera with 24-70mm Lens",
    category: "electronics",
    subcategory: "Cameras & Video",
    condition: "Low Shutter Count",
    estimatedValue: "$1,650",
    featured: false,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
    description: "Professional full-frame mirrorless camera body paired with a versatile f/2.8 constant zoom lens. Excellent low-light ISO sensitivity and dual card slots.",
    specs: {
      "Sensor": "24.2 MP Full-Frame BSI CMOS",
      "Video": "4K 60p 10-Bit Internal",
      "Lens": "24-70mm f/2.8 Constant Aperture",
      "Shutter Count": "< 8,400 Actuations",
      "Includes": "Battery, Charger, Strap, Lens Cap"
    }
  },

  // TOOLS & EQUIPMENT
  {
    id: "tool-01",
    title: "20V MAX Cordless Brushless 5-Tool Combo Kit",
    category: "tools",
    subcategory: "Power Tool Kits",
    condition: "Commercial Grade / Fully Tested",
    estimatedValue: "$340",
    featured: true,
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80",
    description: "Heavy-duty contractor bundle including Hammer Drill/Driver, Impact Driver, Circular Saw, Reciprocating Saw, LED Worklight, two 4.0Ah Lithium-Ion batteries, and charger.",
    specs: {
      "Platform": "20V MAX Lithium-Ion",
      "Motor Type": "Brushless Efficiency",
      "Included Tools": "Drill, Impact Driver, Circ Saw, Recip Saw, Light",
      "Batteries": "2x 4.0Ah High Capacity Packs",
      "Includes": "Heavy-Duty Contractor Duffel Bag"
    }
  },
  {
    id: "tool-02",
    title: "12-Inch Dual-Bevel Sliding Compound Miter Saw",
    category: "tools",
    subcategory: "Power Saws",
    condition: "Clean / Smooth Glide",
    estimatedValue: "$390",
    featured: false,
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    description: "15-Amp workshop miter saw with laser-guided cut line, stainless steel miter detent plate, and tall sliding fences for crown molding and wide trim boards.",
    specs: {
      "Motor": "15 Amp, 3,800 RPM",
      "Blade Diameter": "12 Inches",
      "Bevel Capability": "Dual Bevel 0° to 48° Left & Right",
      "Max Cross Cut": "2x14 at 90°",
      "Guidance": "Precision LED Shadow Cut Indicator"
    }
  },
  {
    id: "tool-03",
    title: "Self-Leveling 360-Degree Red Beam Rotary Laser Level",
    category: "tools",
    subcategory: "Diagnostic & Measuring",
    condition: "Calibrated with Hard Case",
    estimatedValue: "$280",
    featured: false,
    image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=800&q=80",
    description: "Heavy-duty construction laser level for grading, framing, drop ceilings, and masonry alignment. Comes with adjustable elevation tripod and laser receiver.",
    specs: {
      "Range": "Up to 800 ft with detector",
      "Accuracy": "±1/8\" at 100 ft",
      "Levelling Type": "Electronic Automatic Self-Leveling",
      "Battery": "Rechargeable NiMH / D-Cell backup",
      "Case": "IP66 Water/Dust Resistant Hard Trunk"
    }
  },
  {
    id: "tool-04",
    title: "Heavy-Duty 6-Gallon Pancake Air Compressor with Finish Nailer",
    category: "tools",
    subcategory: "Pneumatics & Compressors",
    condition: "Tested Pressure Seal",
    estimatedValue: "$195",
    featured: false,
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
    description: "Oil-free 150 PSI pancake air compressor engineered for rapid tank recovery. Includes 16-gauge pneumatic finish nailer and 25ft braided air hose.",
    specs: {
      "Tank Capacity": "6.0 Gallons",
      "Max Pressure": "150 PSI",
      "Air Flow": "2.6 SCFM @ 90 PSI",
      "Motor": "Universal High-Efficiency Electric",
      "Includes": "16-Ga Finish Nailer & Quick Coupler Hose"
    }
  },

  // MUSICAL INSTRUMENTS
  {
    id: "inst-01",
    title: "Solid-Body Electric Guitar in Gloss Ebony with Gold Hardware",
    category: "instruments",
    subcategory: "Electric Guitars",
    condition: "Set Up & Tested (Low Action)",
    estimatedValue: "$980",
    featured: true,
    image: "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?auto=format&fit=crop&w=800&q=80",
    description: "Classic mahogany body electric guitar with dual humbucking pickups, gloss ebony finish, and gleaming gold hardware. Professionally tuned and checked for intonation.",
    specs: {
      "Body Wood": "Mahogany with Carved Maple Cap",
      "Neck": "Slim-Taper Mahogany with Rosewood Fingerboard",
      "Pickups": "490R & 498T Alnico Humbuckers",
      "Hardware": "Gold Tune-O-Matic Bridge & Stopbar",
      "Includes": "Padded Plush Gig Bag"
    }
  },
  {
    id: "inst-02",
    title: "Solid Spruce Top Dreadnought Acoustic Guitar",
    category: "instruments",
    subcategory: "Acoustic Guitars",
    condition: "Warm Resonance / Excellent",
    estimatedValue: "$640",
    featured: true,
    image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=800&q=80",
    description: "Rich, resonant acoustic guitar crafted with a solid Sitka spruce top and layered sapele back/sides. Outstanding dynamic range and projective projection.",
    specs: {
      "Top Wood": "Solid Sitka Spruce",
      "Back & Sides": "Layered Sapele",
      "Scale Length": "25.5 inches",
      "Nut & Saddle": "Bone Nut / Micarta Saddle",
      "Electronics": "Built-In Piezo Undersaddle Pickup"
    }
  },
  {
    id: "inst-03",
    title: "40-Watt All-Tube Guitar Combo Amplifier",
    category: "instruments",
    subcategory: "Amplifiers & Cabinets",
    condition: "Tested Tubes / Full Power",
    estimatedValue: "$550",
    featured: false,
    image: "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=800&q=80",
    description: "Legendary 40W valve combo delivering glistening clean tones and punchy overdrive. Powered by dual 6L6 power tubes and a custom 12\" speaker.",
    specs: {
      "Output Power": "40 Watts RMS",
      "Valves": "3x 12AX7 Preamp, 2x 6L6 Power Tubes",
      "Speaker": "1x 12\" Celestion Special Design",
      "Channels": "Dual Channel (Clean / Overdrive) with Reverb",
      "Footswitch": "Included 2-Button Channel Selector"
    }
  },
  {
    id: "inst-04",
    title: "88-Key Weighted Hammer Action Digital Stage Piano",
    category: "instruments",
    subcategory: "Keyboards & Synths",
    condition: "Full Functional Testing",
    estimatedValue: "$720",
    featured: false,
    image: "https://images.unsplash.com/photo-1520523839898-507127053912?auto=format&fit=crop&w=800&q=80",
    description: "Authentic acoustic piano touch featuring graded hammer weighted action, concert grand sample engine, USB MIDI connectivity, and built-in stereo speakers.",
    specs: {
      "Keybed": "88 Graded Hammer Standard (GHS) Keys",
      "Sound Engine": "Pure CF Acoustic Piano Voice",
      "Polyphony": "192 Notes",
      "Ports": "USB to Host, 1/4\" Stereo Line Out, Dual Headphone Outs",
      "Includes": "Sustain Pedal, Music Rest, Power Supply"
    }
  },

  // COLLECTIBLES & SPECIALTY
  {
    id: "col-01",
    title: "1 oz Fine Silver Bullion American Eagle Coin (Uncirculated)",
    category: "collectibles",
    subcategory: "Precious Metals & Coins",
    condition: "Mint State Condition",
    estimatedValue: "Market Linked",
    featured: false,
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80",
    description: "Official United States Mint 1 Troy Ounce .999 Fine Silver Eagle coin. Protected in an airtight capsule. Demonstration item.",
    specs: {
      "Composition": ".999 Fine Pure Silver",
      "Weight": "1 Troy Ounce (31.103g)",
      "Diameter": "40.6 mm",
      "Packaging": "Airtight Protective Acrylic Capsule"
    }
  },
  {
    id: "col-02",
    title: "Vintage Brass Marine Pocket Compass in Wood Presentation Box",
    category: "collectibles",
    subcategory: "Curios & Antiques",
    condition: "Aged Patina / Intact Glass",
    estimatedValue: "$145",
    featured: false,
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    description: "Handcrafted nautical navigational compass with natural aged brass patina and directional sundial needle. Housed in a brass-inlaid hardwood presentation box.",
    specs: {
      "Material": "Solid Antique Brass & Glass",
      "Box Material": "Rosewood with Brass Corners",
      "Diameter": "3.2 inches",
      "Origin": "Decorative Maritime Reproduction"
    }
  }
];
