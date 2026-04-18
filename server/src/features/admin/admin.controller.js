import User from '../../models/User.model.js';
import Booking from '../../models/Booking.model.js';
import Bus from '../../models/Bus.model.js';
import Coupon from '../../models/Coupon.model.js';
import Route from '../../models/Route.model.js';
import bcrypt from 'bcryptjs';
import { asyncHandler } from '../../middlewares/error.middleware.js';

// ─── Platform Overview ────────────────────────────────────────────────────────

export const platformStats = asyncHandler(async (_req, res) => {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);

  const [bookingsToday, revenueAgg, activeBuses, usersCount] = await Promise.all([
    Booking.countDocuments({ createdAt: { $gte: start } }),
    Booking.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: start },
          bookingStatus: { $ne: 'cancelled' },
        },
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Bus.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'passenger', isActive: true }),
  ]);

  res.json({
    bookingsToday,
    revenueToday: revenueAgg[0]?.total ?? 0,
    activeBuses,
    activeUsers: usersCount,
  });
});

// ─── Operator Management ──────────────────────────────────────────────────────

export const createOperator = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password } = req.body;

  if (!fullName || !email || !phone || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const existing = await User.findOne({ $or: [{ email }, { phone }] });
  if (existing) {
    return res.status(409).json({ message: 'Email or phone already in use' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const operator = await User.create({
    fullName,
    email: email.toLowerCase(),
    phone,
    passwordHash,
    role: 'operator',
    status: 'approved',
    isVerified: true
  });

  const { passwordHash: _, ...publicOp } = operator.toObject();
  res.status(201).json({ message: 'Operator created successfully', operator: publicOp });
});

export const listOperators = asyncHandler(async (req, res) => {
  const { status } = req.query; // pending, active, suspended
  const q = { role: 'operator' };
  
  if (status === 'pending') {
    q.isVerified = false;
  } else if (status === 'active') {
    q.isActive = true;
    q.isVerified = true;
  } else if (status === 'suspended') {
    q.isActive = false;
    q.isVerified = true;
  }

  const operators = await User.find(q).sort({ createdAt: -1 });
  res.json({ operators });
});

export const approveOperator = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'Operator not found' });
  
  user.isActive = true;
  user.isVerified = true;
  await user.save();
  
  res.json({ message: 'Operator approved successfully' });
});

export const suspendOperator = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'Operator not found' });

  user.isActive = false;
  await user.save();
  res.json({ message: 'Operator suspended', reason });
});

// ─── User Management ──────────────────────────────────────────────────────────

export const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 10);
  const search = (req.query.search || '').trim();
  
  const q = { role: 'passenger' };
  if (search) {
    q.$or = [
      { fullName: new RegExp(escapeRx(search), 'i') },
      { email: new RegExp(escapeRx(search), 'i') },
      { phone: new RegExp(escapeRx(search), 'i') },
    ];
  }

  const [items, total] = await Promise.all([
    User.find(q)
      .select('fullName email phone isActive isVerified createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(q),
  ]);

  res.json({ items, total, page, limit });
});

export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  
  user.isActive = !user.isActive;
  await user.save();
  
  res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, isActive: user.isActive });
});

// ─── Coupon Management ────────────────────────────────────────────────────────

export const listCoupons = asyncHandler(async (_req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ coupons });
});

export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json(coupon);
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
  res.json(coupon);
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ message: 'Coupon deleted' });
});

// ─── Advanced Analytics ───────────────────────────────────────────────────────

export const getPlatformAnalytics = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const match = { paymentStatus: 'paid', bookingStatus: { $ne: 'cancelled' } };
  
  if (from || to) {
    match.createdAt = {};
    if (from) match.createdAt.$gte = new Date(from);
    if (to) match.createdAt.$lte = new Date(to);
  }

  const [revenueSummary, topRoutes, bookingStatusDistribution] = await Promise.all([
    // Revenue Summary
    Booking.aggregate([
      { $match: match },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, totalBookings: { $sum: 1 } } }
    ]),
    // Top Routes (by booking count)
    Booking.aggregate([
      { $match: match },
      { $lookup: { from: 'trips', localField: 'tripId', foreignField: '_id', as: 'trip' } },
      { $unwind: '$trip' },
      { $lookup: { from: 'schedules', localField: 'trip.scheduleId', foreignField: '_id', as: 'schedule' } },
      { $unwind: '$schedule' },
      { $lookup: { from: 'routes', localField: 'schedule.routeId', foreignField: '_id', as: 'route' } },
      { $unwind: '$route' },
      {
        $group: {
          _id: '$route._id',
          origin: { $first: '$route.originCity' },
          destination: { $first: '$route.destinationCity' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]),
    // Booking Status Distribution
    Booking.aggregate([
      { $group: { _id: '$bookingStatus', count: { $sum: 1 } } }
    ])
  ]);

  res.json({
    summary: revenueSummary[0] || { totalRevenue: 0, totalBookings: 0 },
    topRoutes,
    bookingStatusDistribution
  });
});

// ─── Booking Oversight ───────────────────────────────────────────────────────

export const listAllBookings = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 20);
  
  const [items, total] = await Promise.all([
    Booking.find()
      .populate('userId', 'fullName email')
      .populate({
        path: 'tripId',
        populate: { path: 'scheduleId', populate: ['busId', 'routeId'] }
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Booking.countDocuments()
  ]);

  res.json({ items, total, page, limit });
});

function escapeRx(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
