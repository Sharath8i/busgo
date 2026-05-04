import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../../../.env') });

import Booking from '../../../../server/src/models/Booking.model.js';
import Trip from '../../../../server/src/models/Trip.model.js';
import Schedule from '../../../../server/src/models/Schedule.model.js';
import User from '../../../../server/src/models/User.model.js';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/busgo');
  const b = await Booking.findOne({ paymentStatus: 'paid' }).sort({ createdAt: -1 });
  console.log('Latest paid booking ID:', b ? b._id : 'None found');
  console.log('Booking status:', b ? b.bookingStatus : 'N/A');
  
  if (b) {
    try {
      b.bookingStatus = 'cancelled';
      b.refundAmount = 0;
      await b.save();
      console.log('Saved booking successfully');
    } catch(err) {
      console.error('Error saving booking:', err);
    }
  }
  process.exit(0);
}
run();
