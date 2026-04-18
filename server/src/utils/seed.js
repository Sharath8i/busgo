import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.model.js';
import Bus from '../models/Bus.model.js';
import Route from '../models/Route.model.js';
import Schedule from '../models/Schedule.model.js';
import Trip from '../models/Trip.model.js';
import Booking from '../models/Booking.model.js';
import Coupon from '../models/Coupon.model.js';
import { connectDB } from '../config/db.js';

const SALT = 12;

async function run() {
  await connectDB();

  const testUsers = await User.find({ email: /@busgo\.test$/ }).select('_id');
  const testUserIds = testUsers.map((u) => u._id);
  if (testUserIds.length) {
    const testBuses = await Bus.find({ operatorId: { $in: testUserIds } }).select('_id');
    const busIds = testBuses.map((b) => b._id);
    const schedules = await Schedule.find({ busId: { $in: busIds } }).select('_id');
    const scheduleIds = schedules.map((s) => s._id);
    const trips = await Trip.find({ scheduleId: { $in: scheduleIds } }).select('_id');
    const tripIds = trips.map((t) => t._id);
    await Booking.deleteMany({ tripId: { $in: tripIds } });
    await Trip.deleteMany({ _id: { $in: tripIds } });
    await Schedule.deleteMany({ _id: { $in: scheduleIds } });
    await Bus.deleteMany({ _id: { $in: busIds } });
    await Route.deleteMany({ operatorId: { $in: testUserIds } });
    await User.deleteMany({ _id: { $in: testUserIds } });
  }
  await Bus.deleteMany({ registrationNo: 'TEST-KA01-9999' });
  await Coupon.deleteMany({ code: 'BUSGO10' });

  const passwordHash = await bcrypt.hash('Test@1234', SALT);

  const admin = await User.create({
    fullName: 'Admin User',
    email: 'admin@busgo.test',
    phone: '9000000001',
    passwordHash,
    role: 'admin',
    isVerified: true,
  });

  const operator = await User.create({
    fullName: 'Demo Operator',
    email: 'operator@busgo.test',
    phone: '9000000002',
    passwordHash,
    role: 'operator',
    isVerified: true,
  });

  await User.create({
    fullName: 'Demo Passenger',
    email: 'passenger@busgo.test',
    phone: '9000000003',
    passwordHash,
    role: 'passenger',
    isVerified: true,
  });

  const seatLayout = Array.from({ length: 20 }, (_, i) => ({
    seatNumber: String(i + 1),
    seatType: i % 4 === 0 ? 'window' : 'aisle',
  }));

  const bus = await Bus.create({
    operatorId: operator._id,
    busName: 'BusGo Express',
    registrationNo: 'TEST-KA01-9999',
    busType: 'volvo',
    totalSeats: 20,
    amenities: ['wifi', 'charging', 'water'],
    seatLayout,
    images: [],
    isActive: true,
  });

  const route = await Route.create({
    originCity: 'Chennai',
    destinationCity: 'Bangalore',
    distanceKm: 350,
    estimatedMinutes: 420,
    stops: [],
    operatorId: operator._id,
  });

  const schedule = await Schedule.create({
    busId: bus._id,
    routeId: route._id,
    departureTime: '22:00',
    arrivalTime: '06:30',
    operatingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    baseFare: 899,
    status: 'active',
  });

  const today = new Date();
  const y = today.getUTCFullYear();
  const m = today.getUTCMonth();
  const d = today.getUTCDate();
  const travelDate = new Date(Date.UTC(y, m, d, 0, 0, 0, 0));

  const trip = await Trip.create({
    scheduleId: schedule._id,
    travelDate,
    bookedSeats: [],
    heldSeats: [],
    status: 'scheduled',
  });

  await Coupon.create({
    code: 'BUSGO10',
    discountType: 'percent',
    discountValue: 10,
    minFare: 100,
    maxDiscount: 150,
    isActive: true,
  });

  const ds = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  console.log('Seed complete.');
  console.log({
    admin: admin.email,
    operator: operator.email,
    passenger: 'passenger@busgo.test',
    password: 'Test@1234',
    tripId: trip._id.toString(),
    searchExample: `GET /api/v1/search/buses?from=Chennai&to=Bangalore&date=${ds}&seats=1`,
  });

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
