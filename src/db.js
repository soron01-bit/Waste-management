const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_FILE = path.join(__dirname, 'data', 'database.json');

// Initial seed data
const initialData = {
  user: {
    id: "usr_101",
    name: "Alex Rivera",
    email: "alex.rivera@ecoswap.org",
    phone: "+1 (555) 782-9301",
    pointsBalance: 420,
    lifetimePoints: 1280,
    rank: "Gold Recycler",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  },
  listings: [
    {
      id: "lst_1",
      title: "Clean High-Density Polyethylene (HDPE) Bottles & Jugs",
      category: "Plastic",
      weightKg: 14.5,
      quantityDesc: "Approx 80 milk/detergent jugs, rinsed & crushed",
      condition: "Clean & Sorted",
      location: "East Riverfront, Brooklyn, NY",
      contactName: "Alex Rivera",
      contactPhone: "+1 (555) 782-9301",
      estimatedPoints: 215,
      imageUrl: "https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=600&auto=format&fit=crop&q=80",
      status: "Available",
      claimedBy: null,
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      description: "Pre-rinsed and sorted clean HDPE containers. Ready for recycling facility, injection molding or filament extrusion."
    },
    {
      id: "lst_2",
      title: "Sorted Corrugated Cardboard Boxes & Brown Kraft",
      category: "Paper",
      weightKg: 28.0,
      quantityDesc: "25 flattened moving boxes and packing sheets",
      condition: "Dry & Flattened",
      location: "Midtown West, New York, NY",
      contactName: "Elena Rostova",
      contactPhone: "+1 (555) 432-8812",
      estimatedPoints: 280,
      imageUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80",
      status: "Available",
      claimedBy: null,
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      description: "Clean packing cardboard from recent office move. Kept indoors and dry, bundled with organic twine."
    },
    {
      id: "lst_3",
      title: "Extruded Aluminum Cans, Foil & Trim Offcuts",
      category: "Metal",
      weightKg: 18.2,
      quantityDesc: "4 large sacks of crushed aluminum cans & clean fabrication offcuts",
      condition: "Clean & Sorted",
      location: "Astoria, Queens, NY",
      contactName: "Marcus Chen",
      contactPhone: "+1 (555) 901-4472",
      estimatedPoints: 635,
      imageUrl: "https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=600&auto=format&fit=crop&q=80",
      status: "Available",
      claimedBy: null,
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      description: "Non-ferrous clean aluminum. Excellent scrap grade suitable for immediate foundry melt or metalcraft upcycling."
    },
    {
      id: "lst_4",
      title: "Obsolete Office Laptops, Circuit Boards & Chargers",
      category: "Electronics",
      weightKg: 9.5,
      quantityDesc: "6 retired dual-core laptops (hard drives sanitized) + power bricks + cables",
      condition: "For E-Waste / Parts Salvage",
      location: "Financial District, New York, NY",
      contactName: "Nexus Tech Works",
      contactPhone: "+1 (555) 671-2299",
      estimatedPoints: 570,
      imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80",
      status: "Claimed",
      claimedBy: "Urban EcoRefurb Co-Op",
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      description: "Sanitized legacy hardware ideal for precious metal recovery, maker component reuse, or student refurbishing."
    },
    {
      id: "lst_5",
      title: "PET Transparent Water Bottles & Polypropylene Bottle Caps",
      category: "Plastic",
      weightKg: 8.0,
      quantityDesc: "~400 clear PET drink bottles, separated colored caps",
      condition: "Clean & Sorted",
      location: "Williamsburg, Brooklyn, NY",
      contactName: "Alex Rivera",
      contactPhone: "+1 (555) 782-9301",
      estimatedPoints: 120,
      imageUrl: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=600&auto=format&fit=crop&q=80",
      status: "Scheduled For Pickup",
      claimedBy: "GreenCycle Regional Hub",
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      description: "Organized by color code (caps separated). Great feedstock for yarn spinners and 3D printing filament extruders."
    }
  ],
  centers: [
    {
      id: "ctr_1",
      name: "GreenCycle Regional Material Recovery Facility",
      categories: ["Plastic", "Paper", "Metal", "Electronics"],
      address: "450 Recycling Blvd, Brooklyn, NY 11222",
      city: "Brooklyn",
      lat: 40.7282,
      lng: -73.9442,
      phone: "+1 (718) 555-0199",
      hours: "Mon-Sat: 7:30 AM - 6:00 PM",
      rating: 4.9,
      verified: true,
      description: "Comprehensive state-of-the-art sorting plant accepting residential and commercial clean recyclables with drive-through weighbridge.",
      distanceKm: "1.8 km away"
    },
    {
      id: "ctr_2",
      name: "TechReclaim E-Waste & Component Exchange",
      categories: ["Electronics", "Metal"],
      address: "128 Technology Way, Queens, NY 11101",
      city: "Queens",
      lat: 40.7498,
      lng: -73.9392,
      phone: "+1 (718) 555-8831",
      hours: "Tue-Sun: 9:00 AM - 7:00 PM",
      rating: 4.8,
      verified: true,
      description: "Certified R2 electronics dismantling and parts harvesting depot. Certified secure data destruction available.",
      distanceKm: "3.4 km away"
    },
    {
      id: "ctr_3",
      name: "Metro Paper & Cellulose Regeneration Depot",
      categories: ["Paper"],
      address: "88 Industrial Pkwy, Bronx, NY 10454",
      city: "Bronx",
      lat: 40.8068,
      lng: -73.9182,
      phone: "+1 (347) 555-2240",
      hours: "Mon-Fri: 8:00 AM - 5:00 PM",
      rating: 4.7,
      verified: true,
      description: "High-volume baling and pulping partner for cardboard, newsprint, office documents, and kraft paper.",
      distanceKm: "5.1 km away"
    },
    {
      id: "ctr_4",
      name: "Apex Foundry & Non-Ferrous Scrap Center",
      categories: ["Metal"],
      address: "310 Harbor Rd, Jersey City, NJ 07305",
      city: "Jersey City",
      lat: 40.7028,
      lng: -74.0722,
      phone: "+1 (201) 555-9190",
      hours: "Mon-Sat: 7:00 AM - 4:30 PM",
      rating: 4.9,
      verified: true,
      description: "Specialized in copper, brass, aluminum, stainless steel, and lead scrap. Instant electronic weigh-in & immediate point multipliers.",
      distanceKm: "6.2 km away"
    },
    {
      id: "ctr_5",
      name: "Downtown Smart Eco-Locker & Drop Hub",
      categories: ["Plastic", "Electronics"],
      address: "55 Wall Street Concourse, New York, NY 10005",
      city: "Manhattan",
      lat: 40.7061,
      lng: -74.0092,
      phone: "+1 (212) 555-4302",
      hours: "24/7 Smart Drop-off Available",
      rating: 4.6,
      verified: true,
      description: "Automated reverse-vending machines and smart drop-lockers for clean plastic bottles, tablets, phones, and batteries.",
      distanceKm: "2.1 km away"
    }
  ],
  pickups: [
    {
      id: "pck_101",
      listingId: "lst_5",
      materialSummary: "PET Bottles & Polypropylene Bottle Caps (8.0 kg)",
      category: "Plastic",
      weightEstKg: 8.0,
      pickupDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      timeSlot: "09:00 AM - 12:00 PM",
      pickupAddress: "420 Bedford Ave, Apt 4B, Brooklyn, NY 11249",
      contactName: "Alex Rivera",
      contactPhone: "+1 (555) 782-9301",
      centerAssigned: "GreenCycle Regional Material Recovery Facility",
      status: "Scheduled",
      pointsAwarded: 120,
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      notes: "Boxes are stacked next to building lobby entry intercom. Buzzer #4B."
    },
    {
      id: "pck_100",
      listingId: null,
      materialSummary: "Mixed Aluminum Cans (6.5 kg) & Heavy Cardboard (22.0 kg)",
      category: "Metal",
      weightEstKg: 28.5,
      pickupDate: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
      timeSlot: "01:00 PM - 04:00 PM",
      pickupAddress: "420 Bedford Ave, Apt 4B, Brooklyn, NY 11249",
      contactName: "Alex Rivera",
      contactPhone: "+1 (555) 782-9301",
      centerAssigned: "GreenCycle Regional Material Recovery Facility",
      status: "Completed",
      pointsAwarded: 450,
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      notes: "Driver John arrived on time. Materials verified and weighed."
    },
    {
      id: "pck_99",
      listingId: null,
      materialSummary: "Old CRT Monitor, 3 Keyboards & Lithium Battery Packs",
      category: "Electronics",
      weightEstKg: 14.0,
      pickupDate: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0],
      timeSlot: "10:00 AM - 01:00 PM",
      pickupAddress: "420 Bedford Ave, Apt 4B, Brooklyn, NY 11249",
      contactName: "Alex Rivera",
      contactPhone: "+1 (555) 782-9301",
      centerAssigned: "TechReclaim E-Waste & Component Exchange",
      status: "Completed",
      pointsAwarded: 710,
      createdAt: new Date(Date.now() - 16 * 86400000).toISOString(),
      notes: "Electronics safely handed over and issued e-waste certificate #EW-8812."
    }
  ],
  rewards: [
    {
      id: "rwd_1",
      title: "EcoStore $10 Gift Voucher",
      category: "Voucher",
      pointsCost: 200,
      description: "Valid for eco-friendly personal care, bamboo essentials, and zero-waste household items.",
      icon: "shopping-bag",
      availableStock: 45
    },
    {
      id: "rwd_2",
      title: "Plant a Native Forest Tree (with Certificate)",
      category: "Tree Planting",
      pointsCost: 150,
      description: "We fund the planting of one native forest tree with GPS coordinates and personalized digital certificate.",
      icon: "tree-pine",
      availableStock: 500
    },
    {
      id: "rwd_3",
      title: "Subway & Metro 5-Ride Eco Commute Pass",
      category: "Transit",
      pointsCost: 250,
      description: "Preloaded digital mobile pass for city subways and clean electric public buses.",
      icon: "train",
      availableStock: 30
    },
    {
      id: "rwd_4",
      title: "20% Off Organic Farmers Market Voucher",
      category: "Discount",
      pointsCost: 100,
      description: "Enjoy 20% off fresh locally-grown organic produce at all participating city farmers markets.",
      icon: "apple",
      availableStock: 80
    },
    {
      id: "rwd_5",
      title: "Stainless Steel Vacuum Water Bottle & Canvas Tote",
      category: "Eco Good",
      pointsCost: 350,
      description: "Premium insulated 750ml flask made from recycled steel + organic cotton tote bag.",
      icon: "package",
      availableStock: 18
    },
    {
      id: "rwd_6",
      title: "Home Kitchen Composter Starter Kit",
      category: "Eco Good",
      pointsCost: 500,
      description: "Odorless carbon-filtered countertop compost bin with 30 biodegradable starch liners.",
      icon: "flower",
      availableStock: 12
    }
  ],
  redemptions: [
    {
      id: "rdm_1",
      rewardId: "rwd_2",
      rewardTitle: "Plant a Native Forest Tree (with Certificate)",
      voucherCode: "ECO-TREE-8821-NY",
      pointsSpent: 150,
      redeemedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      status: "Active"
    },
    {
      id: "rdm_2",
      rewardId: "rwd_4",
      rewardTitle: "20% Off Organic Farmers Market Voucher",
      voucherCode: "MKT-ORG-4910-NYC",
      pointsSpent: 100,
      redeemedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      status: "Active"
    }
  ]
};

// Rate multiplier table for estimating points and carbon offsets
const RATES = {
  Plastic: { pointsPerKg: 15, co2PerKg: 1.8, description: "PET, HDPE, LDPE, PP" },
  Paper: { pointsPerKg: 10, co2PerKg: 1.2, description: "Cardboard, kraft, newsprint" },
  Metal: { pointsPerKg: 35, co2PerKg: 4.2, description: "Aluminum cans, copper, scrap" },
  Electronics: { pointsPerKg: 60, co2PerKg: 5.5, description: "Phones, computers, cables, batteries" }
};

// Database helper functions
class Database {
  constructor() {
    this.ensureInitialized();
  }

  ensureInitialized() {
    if (!fs.existsSync(DATA_FILE)) {
      this.write(initialData);
    }
  }

  read() {
    try {
      if (!fs.existsSync(DATA_FILE)) {
        this.write(initialData);
      }
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('Error reading database, resetting to default:', err);
      this.write(initialData);
      return initialData;
    }
  }

  write(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  }

  // --- User Profile ---
  getUser() {
    const data = this.read();
    return data.user;
  }

  updateUserPoints(delta) {
    const data = this.read();
    data.user.pointsBalance += delta;
    if (delta > 0) {
      data.user.lifetimePoints += delta;
    }
    // Update tier rank
    if (data.user.lifetimePoints >= 2000) {
      data.user.rank = "Platinum Eco-Hero";
    } else if (data.user.lifetimePoints >= 1000) {
      data.user.rank = "Gold Recycler";
    } else if (data.user.lifetimePoints >= 500) {
      data.user.rank = "Silver Guardian";
    } else {
      data.user.rank = "Bronze Recycler";
    }
    this.write(data);
    return data.user;
  }

  // --- Listings ---
  getListings(category = 'All', status = 'All', search = '') {
    const data = this.read();
    let result = data.listings;

    if (category && category !== 'All') {
      result = result.filter(item => item.category.toLowerCase() === category.toLowerCase());
    }

    if (status && status !== 'All') {
      result = result.filter(item => item.status.toLowerCase() === status.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getListingById(id) {
    const data = this.read();
    return data.listings.find(l => l.id === id);
  }

  createListing(listingData) {
    const data = this.read();
    const cat = listingData.category || 'Plastic';
    const weight = parseFloat(listingData.weightKg) || 1;
    const rate = RATES[cat] ? RATES[cat].pointsPerKg : 15;
    const estimatedPoints = Math.round(weight * rate);

    const newListing = {
      id: `lst_${Date.now()}`,
      title: listingData.title,
      category: cat,
      weightKg: weight,
      quantityDesc: listingData.quantityDesc || `${weight} kg`,
      condition: listingData.condition || 'Clean & Sorted',
      location: listingData.location || 'Local Neighborhood',
      contactName: listingData.contactName || data.user.name,
      contactPhone: listingData.contactPhone || data.user.phone,
      estimatedPoints: estimatedPoints,
      imageUrl: listingData.imageUrl || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80',
      status: 'Available',
      claimedBy: null,
      createdAt: new Date().toISOString(),
      description: listingData.description || ''
    };

    data.listings.unshift(newListing);
    this.write(data);
    return newListing;
  }

  claimListing(id, claimantName) {
    const data = this.read();
    const index = data.listings.findIndex(l => l.id === id);
    if (index === -1) return null;

    data.listings[index].status = 'Claimed';
    data.listings[index].claimedBy = claimantName || 'Community Reuser';
    this.write(data);
    return data.listings[index];
  }

  deleteListing(id) {
    const data = this.read();
    const index = data.listings.findIndex(l => l.id === id);
    if (index === -1) return false;

    data.listings.splice(index, 1);
    this.write(data);
    return true;
  }

  // --- Collection Centers ---
  getCenters(category = 'All', search = '') {
    const data = this.read();
    let result = data.centers;

    if (category && category !== 'All') {
      result = result.filter(c => c.categories.map(cat => cat.toLowerCase()).includes(category.toLowerCase()));
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
      );
    }

    return result;
  }

  // --- Pickups ---
  getPickups() {
    const data = this.read();
    return data.pickups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  createPickup(pickupData) {
    const data = this.read();
    const cat = pickupData.category || 'Plastic';
    const weight = parseFloat(pickupData.weightEstKg) || 5;
    const rate = RATES[cat] ? RATES[cat].pointsPerKg : 15;
    const pointsAwarded = Math.round(weight * rate);

    const newPickup = {
      id: `pck_${Date.now()}`,
      listingId: pickupData.listingId || null,
      materialSummary: pickupData.materialSummary || `${cat} (${weight} kg)`,
      category: cat,
      weightEstKg: weight,
      pickupDate: pickupData.pickupDate,
      timeSlot: pickupData.timeSlot || '09:00 AM - 12:00 PM',
      pickupAddress: pickupData.pickupAddress || 'Local Address',
      contactName: pickupData.contactName || data.user.name,
      contactPhone: pickupData.contactPhone || data.user.phone,
      centerAssigned: pickupData.centerAssigned || 'GreenCycle Regional Hub',
      status: 'Scheduled',
      pointsAwarded: pointsAwarded,
      createdAt: new Date().toISOString(),
      notes: pickupData.notes || 'Please handle with care.'
    };

    // If tied to a listing, mark the listing as scheduled
    if (pickupData.listingId) {
      const listing = data.listings.find(l => l.id === pickupData.listingId);
      if (listing) {
        listing.status = 'Scheduled For Pickup';
      }
    }

    data.pickups.unshift(newPickup);
    this.write(data);
    return newPickup;
  }

  updatePickupStatus(id, newStatus) {
    const data = this.read();
    const pickup = data.pickups.find(p => p.id === id);
    if (!pickup) return null;

    const oldStatus = pickup.status;
    pickup.status = newStatus;

    // When status changes to Completed, credit points to user
    if (newStatus === 'Completed' && oldStatus !== 'Completed') {
      data.user.pointsBalance += pickup.pointsAwarded;
      data.user.lifetimePoints += pickup.pointsAwarded;
      if (data.user.lifetimePoints >= 2000) data.user.rank = "Platinum Eco-Hero";
      else if (data.user.lifetimePoints >= 1000) data.user.rank = "Gold Recycler";
      else if (data.user.lifetimePoints >= 500) data.user.rank = "Silver Guardian";
    }

    this.write(data);
    return pickup;
  }

  // --- Rewards & Redemptions ---
  getRewards() {
    const data = this.read();
    return data.rewards;
  }

  getRedemptions() {
    const data = this.read();
    return data.redemptions.sort((a, b) => new Date(b.redeemedAt) - new Date(a.redeemedAt));
  }

  redeemReward(rewardId) {
    const data = this.read();
    const reward = data.rewards.find(r => r.id === rewardId);
    if (!reward) throw new Error("Reward not found");

    if (data.user.pointsBalance < reward.pointsCost) {
      throw new Error(`Insufficient points balance. You have ${data.user.pointsBalance} pts, but this reward costs ${reward.pointsCost} pts.`);
    }

    if (reward.availableStock <= 0) {
      throw new Error("This reward is currently out of stock.");
    }

    // Deduct points
    data.user.pointsBalance -= reward.pointsCost;
    reward.availableStock -= 1;

    // Generate unique voucher code
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const voucherCode = `ECO-${randomHex}-${randomNum}`;

    const newRedemption = {
      id: `rdm_${Date.now()}`,
      rewardId: reward.id,
      rewardTitle: reward.title,
      voucherCode: voucherCode,
      pointsSpent: reward.pointsCost,
      redeemedAt: new Date().toISOString(),
      status: "Active"
    };

    data.redemptions.unshift(newRedemption);
    this.write(data);

    return {
      success: true,
      voucher: newRedemption,
      remainingPoints: data.user.pointsBalance
    };
  }

  // --- Statistics & History ---
  getStats() {
    const data = this.read();

    let totalWeightRecycled = 0;
    let co2SavedKg = 0;

    const categoryBreakdown = {
      Plastic: 0,
      Paper: 0,
      Metal: 0,
      Electronics: 0
    };

    data.pickups.forEach(p => {
      const w = parseFloat(p.weightEstKg) || 0;
      const cat = p.category;
      if (categoryBreakdown[cat] !== undefined) {
        categoryBreakdown[cat] += w;
      }
      totalWeightRecycled += w;
      const rate = RATES[cat] ? RATES[cat].co2PerKg : 1.5;
      co2SavedKg += w * rate;
    });

    // Count listings diverted
    data.listings.forEach(l => {
      if (l.status === 'Claimed') {
        const w = parseFloat(l.weightKg) || 0;
        const cat = l.category;
        if (categoryBreakdown[cat] !== undefined) {
          categoryBreakdown[cat] += w;
        }
        totalWeightRecycled += w;
        const rate = RATES[cat] ? RATES[cat].co2PerKg : 1.5;
        co2SavedKg += w * rate;
      }
    });

    const treesSaved = Math.max(1, Math.round(categoryBreakdown.Paper / 12) + Math.round(totalWeightRecycled / 35));
    const activePickups = data.pickups.filter(p => p.status === 'Scheduled' || p.status === 'Driver En Route').length;

    return {
      user: data.user,
      totalWeightRecycled: parseFloat(totalWeightRecycled.toFixed(1)),
      co2SavedKg: parseFloat(co2SavedKg.toFixed(1)),
      treesSaved: treesSaved,
      activePickups: activePickups,
      totalPickupsCompleted: data.pickups.filter(p => p.status === 'Completed').length,
      categoryBreakdown: {
        Plastic: parseFloat(categoryBreakdown.Plastic.toFixed(1)),
        Paper: parseFloat(categoryBreakdown.Paper.toFixed(1)),
        Metal: parseFloat(categoryBreakdown.Metal.toFixed(1)),
        Electronics: parseFloat(categoryBreakdown.Electronics.toFixed(1))
      },
      rates: RATES
    };
  }
}

module.exports = new Database();
