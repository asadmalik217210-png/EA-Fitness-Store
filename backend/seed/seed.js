require('dotenv').config();
const { connectDb } = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Settings = require('../models/Settings');
const InventoryLog = require('../models/InventoryLog');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const Wishlist = require('../models/Wishlist');
const Return = require('../models/Return');
const { toSlug } = require('../utils/slug');

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const BOTTOMS = ['XS', 'S', 'M', 'L', 'XL'];

const C = {
  onyx: { name: 'Onyx', hex: '#111111' },
  bone: { name: 'Bone', hex: '#f4f1ea' },
  charcoal: { name: 'Charcoal', hex: '#3a3a3a' },
  sage: { name: 'Sage', hex: '#6b7355' },
  steel: { name: 'Steel', hex: '#6d737a' },
  blush: { name: 'Blush', hex: '#c9a9a6' },
  midnight: { name: 'Midnight', hex: '#1b2430' },
};

function variants(skuBase, colors, sizes) {
  const rows = [];
  colors.forEach((color, ci) => {
    sizes.forEach((size, si) => {
      rows.push({
        size,
        color: color.name,
        colorHex: color.hex,
        sku: `${skuBase}-${color.name.slice(0, 3).toUpperCase()}-${size}`,
        stock: Math.max(4, 20 - ((ci + si) % 7)),
      });
    });
  });
  return rows;
}

const PHOTOS = {
  gym1: 'photo-1517836357463-d25dfeac3438',
  gym2: 'photo-1571019614242-c5c5dee9f50b',
  gym3: 'photo-1534438327276-14e5300c3a48',
  lift: 'photo-1581009146145-b5ef050c2e1e',
  woman1: 'photo-1518310383802-640c2de311b2',
  woman2: 'photo-1518611012118-696072aa579a',
  run: 'photo-1483721310020-03333e577078',
  hoodie: 'photo-1556906781-9a412961c28c',
  street: 'photo-1515886657613-9f3515b0c78f',
  shorts: 'photo-1571902943202-507ec2618e8f',
  weights: 'photo-1517960413843-0aee8e2b3285',
  stretch: 'photo-1574680096145-d05b474e215f',
};

async function run() {
  await connectDb();
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Coupon.deleteMany({}),
    Settings.deleteMany({}),
    InventoryLog.deleteMany({}),
    Cart.deleteMany({}),
    Order.deleteMany({}),
    Payment.deleteMany({}),
    Review.deleteMany({}),
    Wishlist.deleteMany({}),
    Return.deleteMany({}),
  ]);

  await User.create({
    firstName: 'EA',
    lastName: 'Admin',
    email: 'admin@eafitness.com',
    password: 'Admin123!',
    role: 'admin',
  });
  await User.create({
    firstName: 'Alex',
    lastName: 'Trainer',
    email: 'alex@eafitness.com',
    password: 'Customer123!',
    role: 'customer',
  });

  const catDefs = [
    ['T-Shirts', 'men', 1],
    ['Tank Tops', 'men', 2],
    ['Hoodies', 'men', 3],
    ['Joggers', 'men', 4],
    ['Shorts', 'men', 5],
    ['Training Pants', 'men', 6],
    ['Jackets', 'men', 7],
    ['Sports Bras', 'women', 8],
    ['Leggings', 'women', 9],
    ['Gym Tops', 'women', 10],
    ['T-Shirts', 'women', 11],
    ['Shorts', 'women', 12],
    ['Hoodies', 'women', 13],
    ['Gym Sets', 'women', 14],
    ['Jackets', 'women', 15],
    ['Accessories', 'all', 16],
  ];

  const categories = await Category.insertMany(
    catDefs.map(([name, gender, sortOrder]) => ({
      name,
      gender,
      sortOrder,
      slug: `${gender}-${toSlug(name)}`,
      description: `${name} built for training.`,
    }))
  );

  const findCat = (gender, name) => categories.find((c) => c.gender === gender && c.name === name);

  const catalog = [
    ['Forge Performance Tee', 'men', 'T-Shirts', 38, 0, 'EA-M-TEE-001', [PHOTOS.gym1, PHOTOS.gym2], [C.onyx, C.bone, C.steel], SIZES, true, false, true, '88% nylon, 12% elastane.', 'A second-skin training tee with flatlock seams and an anti-odour finish.'],
    ['Volt Drop-Cut Tee', 'men', 'T-Shirts', 42, 32, 'EA-M-TEE-002', [PHOTOS.gym3, PHOTOS.weights], [C.onyx, C.charcoal], SIZES, false, true, false, 'Cotton-modal stretch.', 'Longer back hem and relaxed shoulders for lifting and everyday wear.'],
    ['Apex Cut-Off Tank', 'men', 'Tank Tops', 34, 0, 'EA-M-TANK-001', [PHOTOS.lift, PHOTOS.gym1], [C.onyx, C.bone], SIZES, true, false, false, 'Breathable mesh-knit.', 'Dropped armholes and a structured hem that stays put through pull days.'],
    ['Iron Path Stringer', 'men', 'Tank Tops', 30, 0, 'EA-M-TANK-002', [PHOTOS.gym2, PHOTOS.lift], [C.charcoal, C.steel], SIZES, false, true, false, 'Performance jersey 180gsm.', 'Minimal coverage designed for bodybuilding-style sessions.'],
    ['Summit Heavy Hoodie', 'men', 'Hoodies', 88, 0, 'EA-M-HOOD-001', [PHOTOS.hoodie, PHOTOS.street], [C.onyx, C.charcoal, C.midnight], SIZES, false, true, true, '420gsm cotton fleece.', 'Dense athletic hoodie with ribbed cuffs and a kangaroo pocket.'],
    ['Rest-Day Tech Hoodie', 'men', 'Hoodies', 78, 62, 'EA-M-HOOD-002', [PHOTOS.street, PHOTOS.hoodie], [C.steel, C.onyx], SIZES, true, false, false, 'Softshell knit.', 'Warm without bulk for commute, warmup, and cool-down.'],
    ['Stride Tapered Joggers', 'men', 'Joggers', 72, 0, 'EA-M-JOG-001', [PHOTOS.stretch, PHOTOS.gym3], [C.onyx, C.charcoal], BOTTOMS, false, true, false, 'French terry stretch.', 'Tapered fit, zip pockets, and a gusset that works under a squat.'],
    ['Night Circuit Joggers', 'men', 'Joggers', 76, 0, 'EA-M-JOG-002', [PHOTOS.run, PHOTOS.stretch], [C.midnight, C.onyx], BOTTOMS, true, false, false, 'Brushed stretch knit.', 'Reflective trims and a tapered ankle for evening training.'],
    ['Split-Hem Training Shorts', 'men', 'Shorts', 42, 0, 'EA-M-SH-001', [PHOTOS.shorts, PHOTOS.weights], [C.onyx, C.steel, C.bone], BOTTOMS, false, true, true, 'Lightweight stretch woven.', '7-inch inseam with deep side splits.'],
    ['Forge Compression Shorts', 'men', 'Shorts', 36, 28, 'EA-M-SH-002', [PHOTOS.gym2, PHOTOS.shorts], [C.onyx, C.charcoal], BOTTOMS, false, false, false, 'Compression knit 220gsm.', 'Supportive fit for sprint intervals and heavy lower-body days.'],
    ['Kinetic Training Pants', 'men', 'Training Pants', 80, 0, 'EA-M-TP-001', [PHOTOS.stretch, PHOTOS.run], [C.onyx, C.charcoal], BOTTOMS, true, false, false, 'Stretch woven.', 'Straight-taper training pant from studio to street.'],
    ['Storm Shell Jacket', 'men', 'Jackets', 118, 0, 'EA-M-JKT-001', [PHOTOS.run, PHOTOS.gym1], [C.onyx, C.midnight], SIZES, false, false, true, 'DWR stretch shell.', 'Wind-blocking warmup jacket with laser-cut ventilation.'],
    ['Lift Club Bomber', 'men', 'Jackets', 128, 98, 'EA-M-JKT-002', [PHOTOS.hoodie, PHOTOS.street], [C.charcoal, C.onyx], SIZES, false, false, false, 'Softshell with rib collar.', 'Athletic bomber silhouette with hidden zip pockets.'],
    ['Aether High-Support Bra', 'women', 'Sports Bras', 48, 0, 'EA-W-BRA-001', [PHOTOS.woman1, PHOTOS.woman2], [C.onyx, C.blush, C.sage], BOTTOMS, false, true, true, 'Power-mesh bonded cups.', 'High-support bra engineered for HIIT, running, and compounds.'],
    ['Pulse Medium-Support Bra', 'women', 'Sports Bras', 42, 0, 'EA-W-BRA-002', [PHOTOS.woman2, PHOTOS.gym2], [C.bone, C.charcoal], BOTTOMS, true, false, false, 'Sculpt knit.', 'Everyday studio bra with a clean neckline and locked-in straps.'],
    ['Sculpt Flex Leggings', 'women', 'Leggings', 68, 0, 'EA-W-LEG-001', [PHOTOS.woman2, PHOTOS.woman1], [C.onyx, C.charcoal, C.sage], BOTTOMS, false, true, true, 'Sculpt-flex 260gsm.', 'High-rise contour waistband that stays through deep squats.'],
    ['Motion Flare Leggings', 'women', 'Leggings', 72, 54, 'EA-W-LEG-002', [PHOTOS.gym2, PHOTOS.woman1], [C.onyx, C.blush], BOTTOMS, true, false, false, 'Soft-touch sculpt knit.', 'Subtle flare from the knee with compressive waist support.'],
    ['Shift Crop Gym Top', 'women', 'Gym Tops', 36, 0, 'EA-W-TOP-001', [PHOTOS.woman1, PHOTOS.woman2], [C.onyx, C.bone, C.sage], SIZES, false, true, false, 'Featherweight jersey.', 'Cropped training top with a racer back and barely-there seams.'],
    ['Studio Longline Top', 'women', 'Gym Tops', 40, 0, 'EA-W-TOP-002', [PHOTOS.woman2, PHOTOS.stretch], [C.charcoal, C.blush], SIZES, true, false, false, 'Buttery stretch knit.', 'Longline coverage that layers over high-rise bottoms.'],
    ['Form Relaxed Tee', 'women', 'T-Shirts', 36, 0, 'EA-W-TEE-001', [PHOTOS.street, PHOTOS.hoodie], [C.bone, C.onyx, C.steel], SIZES, false, false, false, 'Organic cotton stretch.', 'Boxy athletic tee for rest days and warm-ups.'],
    ['Drive Training Shorts', 'women', 'Shorts', 38, 0, 'EA-W-SH-001', [PHOTOS.shorts, PHOTOS.weights], [C.onyx, C.sage], BOTTOMS, false, true, false, 'Feather stretch woven.', '4-inch training shorts with a no-roll waistband.'],
    ['Cloud Rest Hoodie', 'women', 'Hoodies', 84, 0, 'EA-W-HOOD-001', [PHOTOS.hoodie, PHOTOS.street], [C.bone, C.onyx, C.blush], SIZES, false, false, true, 'Brushed oversized fleece.', 'Dropped-shoulder hoodie with a cropped-to-hip athletic length.'],
    ['Match Point Gym Set', 'women', 'Gym Sets', 98, 0, 'EA-W-SET-001', [PHOTOS.woman1, PHOTOS.gym2], [C.onyx, C.sage, C.blush], BOTTOMS, true, true, false, 'Matching sculpt-flex set.', 'Coordinated bra and legging set for a locked-in training look.'],
    ['Velocity Wind Jacket', 'women', 'Jackets', 110, 0, 'EA-W-JKT-001', [PHOTOS.run, PHOTOS.woman1], [C.onyx, C.steel], SIZES, false, false, false, 'Packable stretch shell.', 'Lightweight run jacket with a hidden hood and reflective hits.'],
    ['EA Training Cap', 'unisex', 'Accessories', 28, 0, 'EA-ACC-CAP-001', [PHOTOS.gym1, PHOTOS.weights], [C.onyx, C.bone], ['OS'], true, false, false, 'Structured cotton twill.', 'Low-profile training cap with a moisture-wicking sweatband.'],
    ['Lift Belt Strap Pack', 'unisex', 'Accessories', 24, 18, 'EA-ACC-STR-001', [PHOTOS.gym3, PHOTOS.shorts], [C.onyx], ['OS'], false, false, false, 'Woven nylon.', 'Durable gym straps for pulling sessions.'],
  ];

  const docs = catalog.map((row) => {
    const [name, gender, catName, price, salePrice, sku, images, colors, sizes, newArrival, bestseller, featured, material, desc] = row;
    const category = catName === 'Accessories' ? findCat('all', 'Accessories') : findCat(gender, catName);
    return {
      name,
      slug: toSlug(name),
      description: desc,
      price,
      salePrice: salePrice || undefined,
      category: category._id,
      categorySlug: category.slug,
      gender,
      sku,
      brand: 'EA Fitness Clothing',
      images: images.map(img),
      variants: variants(sku, colors, sizes),
      material,
      careInstructions: 'Wash cold, hang dry. Do not bleach. Avoid fabric softener.',
      tags: [gender, catName.toLowerCase(), 'training', 'gym'],
      featured,
      bestseller,
      newArrival,
      onSale: Boolean(salePrice),
      isActive: true,
      ratingAvg: 4.7,
      ratingCount: 18,
      soldCount: bestseller ? 92 : 21,
    };
  });

  await Product.insertMany(docs);
  await Coupon.create({ code: 'TRAIN10', type: 'percentage', value: 10, minOrderValue: 60, usageLimit: 500, isActive: true });
  await Coupon.create({ code: 'FORGE25', type: 'fixed', value: 25, minOrderValue: 120, usageLimit: 200, isActive: true });
  await Settings.create({});

  console.log('Seed complete for EA-Fitness-Clothing-Store');
  console.log('Admin: admin@eafitness.com / Admin123!');
  console.log('Customer: alex@eafitness.com / Customer123!');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
