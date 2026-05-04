import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import http from 'http';

dotenv.config({ path: '.env' });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/busgo');
  
  const User = (await import('./src/models/User.model.js')).default;
  const Booking = (await import('./src/models/Booking.model.js')).default;
  
  const booking = await Booking.findOne({ paymentStatus: 'paid', bookingStatus: { $in: ['confirmed', 'completed'] } });
  if (!booking) {
    console.log('No eligible booking found for user');
    process.exit(1);
  }
  
  const user = await User.findById(booking.userId);
  if (!user) {
    console.log('User not found');
    process.exit(1);
  }

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '15m' }
  );
  if (!booking) {
    console.log('No eligible booking found for user');
    process.exit(1);
  }
  
  console.log('Found booking:', booking._id.toString());
  
  const data = JSON.stringify({ reason: 'Test' });

  const options = {
    hostname: 'localhost',
    port: process.env.PORT || 5000,
    path: `/api/v1/bookings/${booking._id}/cancel`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'Authorization': `Bearer ${token}`
    }
  };

  const req = http.request(options, res => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      console.log('Status Code:', res.statusCode);
      console.log('Response:', body);
      process.exit(0);
    });
  });

  req.on('error', error => {
    console.error('Request Error:', error);
    process.exit(1);
  });

  req.write(data);
  req.end();
}

run();
