import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.model.js';

dotenv.config();

async function boost() {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ fullName: /Sharath/i });
  if (user) {
    user.walletBalance = 5000;
    await user.save();
    console.log(`Boosted Sharath Wallet to: ${user.walletBalance}`);
  } else {
    console.log('User not found.');
  }
  await mongoose.disconnect();
}

boost();
