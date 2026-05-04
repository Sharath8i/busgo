import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import Booking from './src/models/Booking.model.js';
import Trip from './src/models/Trip.model.js';
import Schedule from './src/models/Schedule.model.js';
import User from './src/models/User.model.js';
import { refundForCancellation } from './src/utils/pricing.js';

const tripPopulate = {
  path: 'tripId',
  populate: {
    path: 'scheduleId',
    populate: [{ path: 'busId' }, { path: 'routeId' }],
  },
};

async function testCancel() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/busgo');
  console.log('Connected to DB');
  
  // Find a booking that is paid and confirmed/completed to try canceling
  const booking = await Booking.findOne({ paymentStatus: 'paid', bookingStatus: { $in: ['confirmed', 'completed'] } }).populate(tripPopulate);
  if (!booking) {
    console.log('No booking found');
    process.exit(0);
  }
  
  console.log('Found booking:', booking._id);
  
  try {
    const trip = await Trip.findById(booking.tripId._id || booking.tripId);
    const sched = await Schedule.findById(trip.scheduleId).populate('routeId');
    const travelDate = new Date(trip.travelDate);
    const [hh, mm] = sched.departureTime.split(':').map(Number);
    const departureDt = new Date(travelDate);
    departureDt.setHours(hh, mm, 0, 0);

    const refundAmount = booking.paymentStatus === 'paid' ? refundForCancellation(departureDt, booking.totalAmount) : 0;
    console.log('Refund amount calculated:', refundAmount);

    booking.bookingStatus = 'cancelled';
    booking.refundAmount = refundAmount;
    if (booking.paymentStatus === 'paid' && refundAmount === 0) {
      booking.paymentStatus = 'paid';
    } else if (booking.paymentStatus === 'paid' && refundAmount > 0) {
      booking.paymentStatus = 'refunded';
      const ticketOwner = await User.findById(booking.userId);
      if (ticketOwner) {
        ticketOwner.walletBalance = (ticketOwner.walletBalance || 0) + refundAmount;
        await ticketOwner.save();
        console.log('Saved ticket owner wallet');
      }
    }
    await booking.save();
    console.log('Saved booking');

    for (const p of booking.passengers) {
      trip.bookedSeats = trip.bookedSeats.filter((s) => s !== p.seatNumber);
    }
    await trip.save();
    console.log('Saved trip');

    console.log('Success!');
  } catch (err) {
    console.error('ERROR ENCOUNTERED:');
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

testCancel();
