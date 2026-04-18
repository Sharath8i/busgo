import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.model.js';
import Booking from '../src/models/Booking.model.js';

dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('--- DB DIAGNOSTIC ---');
  
  const lastBooking = await Booking.findOne().sort({ createdAt: -1 });
  if (!lastBooking) {
    console.log('No bookings found.');
  } else {
    console.log(`Last Booking: ${lastBooking._id}`);
    console.log(`User ID on Booking: ${lastBooking.userId}`);
    console.log(`Total Amount: ${lastBooking.totalAmount}`);
    
    const user = await User.findById(lastBooking.userId);
    if (!user) {
      console.log('User not found!');
    } else {
      console.log(`User Name: ${user.fullName}`);
      console.log(`Wallet Balance: ${user.walletBalance}`);
      console.log(`Comparison: ${user.walletBalance} < ${lastBooking.totalAmount} is ${user.walletBalance < lastBooking.totalAmount}`);
    }
  }
  
  await mongoose.disconnect();
}

check();
