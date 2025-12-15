import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';
import Sweet from './src/models/Sweet.js';
import connectDB from './src/config/db.js';

dotenv.config();

const run = async () => {
  await connectDB();
  await User.deleteMany();
  await Sweet.deleteMany();

  const adminPassword = await bcrypt.hash('password', 10);
  const admin = await User.create({ name: 'Admin', email: 'admin@example.com', password: adminPassword, role: 'admin' });
  const userPassword = await bcrypt.hash('password', 10);
  const user = await User.create({ name: 'User', email: 'user@example.com', password: userPassword, role: 'user' });

  await Sweet.create({ name: 'Gulab Jamun', category: 'Traditional', price: 120, quantity: 50 });
  await Sweet.create({ name: 'Rasgulla', category: 'Traditional', price: 80, quantity: 60 });
  await Sweet.create({ name: 'Chocolate Brownie', category: 'Western', price: 110, quantity: 40 });

  console.log('Seeded admin', admin.email, 'password: password');
  process.exit(0);
};

run().catch((err) => { console.error(err); process.exit(1); });
