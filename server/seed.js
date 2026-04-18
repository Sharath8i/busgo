/**
 * BusGo Database Seed Script
 * Run: node seed.js
 *
 * Creates demo users, operator, buses, routes, schedules and trips.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// ── Models ────────────────────────────────────────────────────────────────
import User from './src/models/User.model.js';
import Bus from './src/models/Bus.model.js';
import Route from './src/models/Route.model.js';
import Schedule from './src/models/Schedule.model.js';
import Trip from './src/models/Trip.model.js';
import Coupon from './src/models/Coupon.model.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/busgo';

async function hash(pw) {
  return bcrypt.hash(pw, 10);
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // ── Clean slate ──────────────────────────────────────────────────────────
  await Promise.all([
    User.deleteMany({}),
    Bus.deleteMany({}),
    Route.deleteMany({}),
    Schedule.deleteMany({}),
    Trip.deleteMany({}),
    Coupon.deleteMany({}),
  ]);
  console.log('🗑  Cleared existing data');

  // ── Users ─────────────────────────────────────────────────────────────────
  const [admin, operator, passenger] = await User.insertMany([
    {
      fullName: 'Admin User',
      email: 'admin@busgo.test',
      phone: '9000000001',
      passwordHash: await hash('Test@1234'),
      role: 'admin',
      isVerified: true,
      isActive: true,
    },
    {
      fullName: 'Apex Travels Operator',
      email: 'operator@busgo.test',
      phone: '9000000002',
      passwordHash: await hash('Test@1234'),
      role: 'operator',
      isVerified: true,
      isActive: true,
    },
    {
      fullName: 'Rahul Kumar',
      email: 'passenger@busgo.test',
      phone: '9000000003',
      passwordHash: await hash('Test@1234'),
      role: 'passenger',
      isVerified: true,
      isActive: true,
    },
  ]);
  console.log('👤 Created users: admin, operator, passenger');

  // ── Seat layout helper ────────────────────────────────────────────────────
  const makeSeats = (count, type = 'window') =>
    Array.from({ length: count }, (_, i) => ({
      seatNumber: String(i + 1),
      seatType: i % 4 === 0 ? 'window' : i % 4 === 1 ? 'aisle' : type,
    }));

  // ── Buses ─────────────────────────────────────────────────────────────────
  const [bus1, bus2, bus3, bus4] = await Bus.insertMany([
    {
      operatorId: operator._id,
      busName: 'Royal Cruiser Express',
      registrationNo: 'TN01AB1234',
      busType: 'volvo',
      totalSeats: 36,
      amenities: ['WiFi', 'AC', 'Charging Port', 'Water Bottle'],
      seatLayout: makeSeats(36, 'aisle'),
      isActive: true,
    },
    {
      operatorId: operator._id,
      busName: 'Night Rider Sleeper',
      registrationNo: 'MH02CD5678',
      busType: 'sleeper',
      totalSeats: 30,
      amenities: ['AC', 'Sleeping Berth', 'Blanket', 'Charging Port'],
      seatLayout: makeSeats(30, 'lower'),
      isActive: true,
    },
    {
      operatorId: operator._id,
      busName: 'City Link Semi Sleeper',
      registrationNo: 'DL03EF9012',
      busType: 'semi_sleeper',
      totalSeats: 40,
      amenities: ['AC', 'WiFi', 'Entertainment Screen'],
      seatLayout: makeSeats(40, 'aisle'),
      isActive: true,
    },
    {
      operatorId: operator._id,
      busName: 'Metro Express',
      registrationNo: 'KA04GH3456',
      busType: 'seater',
      totalSeats: 44,
      amenities: ['AC', 'Water Bottle'],
      seatLayout: makeSeats(44, 'window'),
      isActive: true,
    },
  ]);
  console.log('🚌 Created 4 buses');

  // ── Routes ────────────────────────────────────────────────────────────────
  const ROUTES = [
    { origin: 'Chennai', dest: 'Bangalore' },
    { origin: 'Mumbai', dest: 'Pune' },
    { origin: 'Delhi', dest: 'Agra' },
    { origin: 'Hyderabad', dest: 'Vijayawada' },
    { origin: 'Bangalore', dest: 'Chennai' },
    { origin: 'Pune', dest: 'Mumbai' },
  ];

  const routes = await Route.insertMany(
    ROUTES.map(({ origin, dest }, i) => ({
      originCity: origin,
      destinationCity: dest,
      distanceKm: [375, 148, 230, 268, 375, 148][i] || 200,
      estimatedMinutes: [375, 180, 270, 300, 375, 180][i] || 240,
      operatorId: operator._id,
    }))
  );
  console.log('🗺  Created', routes.length, 'routes');

  // ── Schedules ─────────────────────────────────────────────────────────────
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const scheduleDefs = [
    { bus: bus1, route: routes[0], dep: '08:00', arr: '14:15', fare: 650 },
    { bus: bus2, route: routes[0], dep: '22:00', arr: '04:30', fare: 950 },
    { bus: bus3, route: routes[1], dep: '06:30', arr: '09:30', fare: 350 },
    { bus: bus4, route: routes[1], dep: '15:00', arr: '18:00', fare: 280 },
    { bus: bus1, route: routes[2], dep: '07:00', arr: '11:30', fare: 420 },
    { bus: bus3, route: routes[3], dep: '09:00', arr: '14:00', fare: 480 },
    { bus: bus2, route: routes[4], dep: '21:30', arr: '03:45', fare: 900 },
    { bus: bus4, route: routes[5], dep: '10:00', arr: '13:00', fare: 320 },
  ];

  const schedules = await Schedule.insertMany(
    scheduleDefs.map(({ bus, route, dep, arr, fare }) => ({
      busId: bus._id,
      routeId: route._id,
      departureTime: dep,
      arrivalTime: arr,
      baseFare: fare,
      operatingDays: DAYS,
      status: 'active',
    }))
  );
  console.log('📅 Created', schedules.length, 'schedules');

  // ── Trips for today + next 7 days ─────────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tripDocs = [];
  for (let d = 0; d <= 7; d++) {
    const travelDate = new Date(today);
    travelDate.setDate(today.getDate() + d);
    for (const sched of schedules) {
      tripDocs.push({
        scheduleId: sched._id,
        travelDate,
        bookedSeats: [],
        heldSeats: [],
        status: 'scheduled',
      });
    }
  }
  await Trip.insertMany(tripDocs);
  console.log('🎫 Created', tripDocs.length, 'trips (today + 7 days)');

  // ── Coupons ───────────────────────────────────────────────────────────────
  await Coupon.insertMany([
    {
      code: 'BUSGO10',
      discountType: 'percent',
      discountValue: 10,
      minFare: 200,
      maxDiscount: 200,
      usageLimit: 1000,
      timesUsed: 0,
      validFrom: new Date(),
      validTill: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
    {
      code: 'FLAT50',
      discountType: 'flat',
      discountValue: 50,
      minFare: 300,
      maxDiscount: 50,
      usageLimit: 500,
      timesUsed: 0,
      validFrom: new Date(),
      validTill: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
    {
      code: 'NEWUSER',
      discountType: 'percent',
      discountValue: 15,
      minFare: 0,
      maxDiscount: 300,
      usageLimit: 100,
      timesUsed: 0,
      validFrom: new Date(),
      validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  ]);
  console.log('🎁 Created 3 demo coupons: BUSGO10, FLAT50, NEWUSER');

  console.log('\n✅ Seed complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Demo Credentials:');
  console.log('  Passenger : passenger@busgo.test  / Test@1234');
  console.log('  Operator  : operator@busgo.test   / Test@1234');
  console.log('  Admin     : admin@busgo.test      / Test@1234');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
