import 'dotenv/config';
import mongoose from 'mongoose';
import { connectToDatabase } from '../utils/db.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

async function run() {
  await connectToDatabase();
  await Product.deleteMany({});
  const products = await Product.insertMany([
    {
      title: 'Classic White Tee',
      description: 'Soft cotton T-shirt',
      price: 19.99,
      images: [],
      category: 'tops',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['white'],
      stock: 100
    },
    {
      title: 'Blue Denim Jeans',
      description: 'Regular fit denim',
      price: 49.99,
      images: [],
      category: 'bottoms',
      sizes: ['30', '32', '34', '36'],
      colors: ['blue'],
      stock: 50
    }
  ]);
  console.log(`Seeded ${products.length} products`);

  // Create/Update admin user
  const adminEmail = 'preetpatel9472@gmail.com';
  const adminPassword = 'Preet@9472';
  const adminName = 'Admin';
  const adminPhone = '123-456-7890';
  const adminProfilePicture = 'https://i.pravatar.cc/150?u=admin';

  const passwordHash = await User.hashPassword(adminPassword);
  const admin = await User.findOneAndUpdate(
    { email: adminEmail },
    { name: adminName, email: adminEmail, passwordHash, role: 'admin', phone: adminPhone, profilePicture: adminProfilePicture },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`Admin ready → ${admin.email} (role: ${admin.role})`);
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});


