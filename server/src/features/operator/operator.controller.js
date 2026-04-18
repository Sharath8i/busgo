import Bus from '../../models/Bus.model.js';
import User from '../../models/User.model.js';
import Route from '../../models/Route.model.js';
import Schedule from '../../models/Schedule.model.js';
import Trip from '../../models/Trip.model.js';
import Booking from '../../models/Booking.model.js';
import Driver from '../../models/Driver.model.js';
import { cloudinary } from '../../config/cloudinary.js';
import { asyncHandler } from '../../middlewares/error.middleware.js';

// ─── Bus ──────────────────────────────────────────────────────────────────────

export const createBus = asyncHandler(async (req, res) => {
  const operatorId = req.user.userId;
  const payload = { ...req.body, operatorId };
  if (payload.totalSeats != null) payload.totalSeats = Number(payload.totalSeats);
  if (typeof payload.seatLayout === 'string') {
    try { payload.seatLayout = JSON.parse(payload.seatLayout); }
    catch { return res.status(400).json({ message: 'Invalid seatLayout JSON' }); }
  }
  // Auto-generate seat layout if not provided
  if (!payload.seatLayout?.length && payload.totalSeats) {
    payload.seatLayout = Array.from({ length: payload.totalSeats }, (_, i) => ({
      seatNumber: String(i + 1),
      seatType: i % 4 === 0 ? 'window' : 'aisle',
    }));
  }
  const urls = [];
  if (req.files?.length && process.env.CLOUDINARY_CLOUD_NAME) {
    for (const file of req.files) {
      const b64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      const up = await cloudinary.uploader.upload(b64, { folder: 'busgo/buses' });
      urls.push(up.secure_url);
    }
  }
  payload.images = urls.length ? urls : payload.images || [];
  const bus = await Bus.create(payload);
  res.status(201).json(bus);
});

export const updateBus = asyncHandler(async (req, res) => {
  const { busId } = req.params;
  const bus = await Bus.findOne({ _id: busId, operatorId: req.user.userId });
  if (!bus) return res.status(404).json({ message: 'Bus not found' });
  Object.assign(bus, req.body);
  await bus.save();
  res.json(bus);
});

export const deleteBus = asyncHandler(async (req, res) => {
  const { busId } = req.params;
  const bus = await Bus.findOne({ _id: busId, operatorId: req.user.userId });
  if (!bus) return res.status(404).json({ message: 'Bus not found' });
  bus.isActive = false;
  await bus.save();
  res.json({ message: 'Bus deactivated' });
});

export const listMyBuses = asyncHandler(async (req, res) => {
  const buses = await Bus.find({ operatorId: req.user.userId });
  res.json({ buses });
});

// ─── Routes ──────────────────────────────────────────────────────────────────

export const createRoute = asyncHandler(async (req, res) => {
  const { originCity, destinationCity, distanceKm, estimatedMinutes, stops } = req.body;
  const route = await Route.create({ 
    originCity, 
    destinationCity, 
    distanceKm: Number(distanceKm), 
    estimatedMinutes: Number(estimatedMinutes),
    stops: Array.isArray(stops) ? stops : [],
    operatorId: req.user.userId 
  });
  res.status(201).json(route);
});

export const listMyRoutes = asyncHandler(async (req, res) => {
  const routes = await Route.find({ operatorId: req.user.userId });
  res.json({ routes });
});

// ─── Schedules ────────────────────────────────────────────────────────────────

export const createSchedule = asyncHandler(async (req, res) => {
  const { busId, routeId, departureTime, arrivalTime, operatingDays, baseFare } = req.body;
  const bus = await Bus.findOne({ _id: busId, operatorId: req.user.userId });
  if (!bus) return res.status(400).json({ message: 'Invalid busId or not your bus' });
  const route = await Route.findOne({ _id: routeId, operatorId: req.user.userId });
  if (!route) return res.status(400).json({ message: 'Invalid routeId or not your route' });
  const schedule = await Schedule.create({
    busId, routeId, departureTime, arrivalTime, operatingDays, baseFare,
  });
  res.status(201).json(schedule);
});

export const listMySchedules = asyncHandler(async (req, res) => {
  const buses = await Bus.find({ operatorId: req.user.userId }).select('_id');
  const busIds = buses.map((b) => b._id);
  const schedules = await Schedule.find({ busId: { $in: busIds } })
    .populate('busId', 'busName busType')
    .populate('routeId', 'originCity destinationCity');
  res.json({ schedules });
});

// ─── Bookings ─────────────────────────────────────────────────────────────────

export const listOperatorBookings = asyncHandler(async (req, res) => {
  const { date, page = 1, limit = 20 } = req.query;
  const operatorId = req.user.userId;
  const buses = await Bus.find({ operatorId }).select('_id');
  const busIds = buses.map((b) => b._id);
  const schedules = await Schedule.find({ busId: { $in: busIds } }).select('_id');
  const scheduleIds = schedules.map((s) => s._id);
  const tripQuery = { scheduleId: { $in: scheduleIds } };
  if (date) {
    const d = new Date(date);
    tripQuery.travelDate = {
      $gte: new Date(d.setUTCHours(0, 0, 0, 0)),
      $lte: new Date(d.setUTCHours(23, 59, 59, 999)),
    };
  }
  const trips = await Trip.find(tripQuery).select('_id');
  const tripIds = trips.map((t) => t._id);
  const skip = (Number(page) - 1) * Number(limit);
  const [bookings, total] = await Promise.all([
    Booking.find({ tripId: { $in: tripIds } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate({
        path: 'tripId',
        populate: { path: 'scheduleId', populate: ['busId', 'routeId'] },
      }),
    Booking.countDocuments({ tripId: { $in: tripIds } }),
  ]);
  res.json({ bookings, total, page: Number(page), limit: Number(limit) });
});

// ─── Revenue ──────────────────────────────────────────────────────────────────

export const revenueReport = asyncHandler(async (req, res) => {
  const operatorId = req.user.userId;
  const { from, to, busId } = req.query;
  const buses = await Bus.find(busId ? { operatorId, _id: busId } : { operatorId }).select('_id');
  const busIds = buses.map((b) => b._id);
  const schedules = await Schedule.find({ busId: { $in: busIds } }).select('_id');
  const scheduleIds = schedules.map((s) => s._id);
  const trips = await Trip.find({ scheduleId: { $in: scheduleIds } }).select('_id');
  const tripIds = trips.map((t) => t._id);
  const paidQuery = {
    tripId: { $in: tripIds },
    paymentStatus: 'paid',
    bookingStatus: { $ne: 'cancelled' },
  };
  if (from || to) {
    paidQuery.createdAt = {};
    if (from) paidQuery.createdAt.$gte = new Date(from);
    if (to) paidQuery.createdAt.$lte = new Date(to);
  }
  // Monthly breakdown (last 6 months)
  const sixAgo = new Date();
  sixAgo.setMonth(sixAgo.getMonth() - 5);
  sixAgo.setDate(1);
  sixAgo.setHours(0, 0, 0, 0);
  const monthly = await Booking.aggregate([
    { $match: { ...paidQuery, createdAt: { $gte: sixAgo } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$totalAmount' },
        bookings: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);
  const agg = await Booking.aggregate([
    { $match: paidQuery },
    { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
  ]);
  const row = agg[0] || { total: 0, count: 0 };
  res.json({ totalRevenue: row.total, bookingCount: row.count, monthly });
});

// ─── Drivers ──────────────────────────────────────────────────────────────────

export const createDriver = asyncHandler(async (req, res) => {
  const { name, phone, licenseNumber, experienceYears } = req.body;
  const driver = await Driver.create({
    name,
    phone,
    licenseNumber,
    experienceYears: Number(experienceYears),
    operatorId: req.user.userId
  });
  res.status(201).json(driver);
});

export const listMyDrivers = asyncHandler(async (req, res) => {
  const drivers = await Driver.find({ operatorId: req.user.userId });
  res.json({ drivers });
});

export const updateDriver = asyncHandler(async (req, res) => {
  const { driverId } = req.params;
  const driver = await Driver.findOneAndUpdate(
    { _id: driverId, operatorId: req.user.userId },
    req.body,
    { new: true }
  );
  if (!driver) return res.status(404).json({ message: 'Driver not found' });
  res.json(driver);
});

export const deleteDriver = asyncHandler(async (req, res) => {
  const { driverId } = req.params;
  const driver = await Driver.findOne({ _id: driverId, operatorId: req.user.userId });
  if (!driver) return res.status(404).json({ message: 'Driver not found' });
  driver.isActive = false;
  await driver.save();
  res.json({ message: 'Driver deactivated' });
});

export const assignDriverToTrip = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const { driverId } = req.body;
  const operatorId = req.user.userId;

  const trip = await Trip.findById(tripId).populate({
    path: 'scheduleId',
    populate: { path: 'busId' }
  });

  if (!trip) return res.status(404).json({ message: 'Trip not found' });
  if (trip.scheduleId.busId.operatorId.toString() !== operatorId) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  // Verify driver belongs to operator
  if (driverId) {
    const driver = await Driver.findOne({ _id: driverId, operatorId });
    if (!driver) return res.status(400).json({ message: 'Invalid Driver ID' });
  }

  trip.driverId = driverId;
  await trip.save();

  res.json({ message: 'Driver assigned', trip });
});

// ─── Stats ────────────────────────────────────────────────────────────────────

export const operatorStats = asyncHandler(async (req, res) => {
  const operatorId = req.user.userId;
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const buses = await Bus.find({ operatorId }).select('_id');
  const busIds = buses.map((b) => b._id);
  const schedules = await Schedule.find({ busId: { $in: busIds } }).select('_id');
  const scheduleIds = schedules.map((s) => s._id);
  const trips = await Trip.find({ scheduleId: { $in: scheduleIds } }).select('_id');
  const tripIds = trips.map((t) => t._id);

  const [bookingsToday, totalRevenue, totalBookings, activeBuses] = await Promise.all([
    Booking.countDocuments({ tripId: { $in: tripIds }, createdAt: { $gte: todayStart } }),
    Booking.aggregate([
      { $match: { tripId: { $in: tripIds }, paymentStatus: 'paid', bookingStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]).then((r) => r[0]?.total ?? 0),
    Booking.countDocuments({ tripId: { $in: tripIds }, paymentStatus: 'paid' }),
    Bus.countDocuments({ operatorId, isActive: true }),
  ]);

  res.json({ bookingsToday, totalRevenue, totalBookings, activeBuses, fleetSize: buses.length });
});

// ─── Passenger Manifest ───────────────────────────────────────────────────────

export const getTripManifest = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const operatorId = req.user.userId;

  const trip = await Trip.findById(tripId).populate({
    path: 'scheduleId',
    populate: { path: 'busId' }
  });

  if (!trip) return res.status(404).json({ message: 'Trip not found' });
  if (trip.scheduleId.busId.operatorId.toString() !== operatorId) {
    return res.status(403).json({ message: 'Unauthorized manifest access' });
  }

  const bookings = await Booking.find({ 
    tripId, 
    paymentStatus: 'paid',
    bookingStatus: { $ne: 'cancelled' } 
  }).select('passengers pnr userId');

  const manifest = bookings.flatMap(b => b.passengers.map(p => ({
    seatNumber: p.seatNumber,
    name: p.name,
    age: p.age,
    gender: p.gender,
    phone: p.phone || 'N/A', // Assuming phone was saved or we fetch from user
    pnr: b.pnr
  })));

  // Add phone from associated User if missing in passenger object
  for (let entry of manifest) {
    if (entry.phone === 'N/A') {
       const b = bookings.find(x => x.pnr === entry.pnr);
       if (b && b.userId) {
          const u = await User.findById(b.userId).select('phone');
          if (u) entry.phone = u.phone;
       }
    }
  }

  res.json({ 
    manifest: manifest.sort((a, b) => parseInt(a.seatNumber) - parseInt(b.seatNumber)),
    busName: trip.scheduleId.busId.busName,
    travelDate: trip.travelDate
  });
});

// ─── Trip Management ─────────────────────────────────────────────────────────

export const updateTripStatus = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const { status } = req.body;
  const operatorId = req.user.userId;

  const trip = await Trip.findById(tripId).populate({
    path: 'scheduleId',
    populate: { path: 'busId' }
  });

  if (!trip) return res.status(404).json({ message: 'Trip not found' });
  if (trip.scheduleId.busId.operatorId.toString() !== operatorId) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  trip.status = status;
  await trip.save();

  res.json({ message: `Trip marked as ${status}`, trip });
});
