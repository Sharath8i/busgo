import User from '../../models/User.model.js';
import Booking from '../../models/Booking.model.js';
import Trip from '../../models/Trip.model.js';
import Schedule from '../../models/Schedule.model.js';
import Coupon from '../../models/Coupon.model.js';
import { generatePNR } from '../../utils/generatePNR.js';
import { computeFareBreakdown, applyCouponToFare, refundForCancellation } from '../../utils/pricing.js';
import { generateTicketPDF } from '../../utils/generateTicketPDF.js';
import { sendEmail } from '../../utils/sendEmail.js';
import { asyncHandler } from '../../middlewares/error.middleware.js';

const tripPopulate = {
  path: 'tripId',
  populate: {
    path: 'scheduleId',
    populate: [{ path: 'busId' }, { path: 'routeId' }],
  },
};

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, totalFare } = req.body;
  const coupon = await Coupon.findOne({ code: String(code).toUpperCase() });
  const subtotal = Number(totalFare) || 0;
  const discount = applyCouponToFare(subtotal, coupon);
  res.json({ valid: discount > 0, discount, message: discount > 0 ? 'Applied' : 'Invalid or inapplicable' });
});

export const createBooking = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { tripId, passengers, couponCode } = req.body;
  if (!tripId || !Array.isArray(passengers) || !passengers.length) {
    return res.status(400).json({ message: 'tripId and passengers required' });
  }
  const trip = await Trip.findById(tripId).populate({
    path: 'scheduleId',
    populate: 'busId',
  });
  if (!trip) return res.status(404).json({ message: 'Trip not found' });

  const seatNumbers = passengers.map((p) => p.seatNumber);
  const now = new Date();
  const myHolds = trip.heldSeats.filter(
    (h) => h.userId.toString() === userId && h.heldUntil > now
  );
  const heldSet = new Set(myHolds.map((h) => h.seatNumber));
  for (const s of seatNumbers) {
    if (trip.bookedSeats.includes(s)) {
      return res.status(409).json({ message: `Seat ${s} booked` });
    }
    if (!heldSet.has(s)) {
      return res.status(400).json({ message: `Hold seat ${s} first (10 min)` });
    }
  }

  const baseFare = trip.scheduleId.baseFare;
  const pre = computeFareBreakdown(baseFare, passengers.length, 0);
  const subtotalBeforeDiscount = pre.baseFare + pre.gst + pre.convenienceFee;
  let discount = 0;
  let appliedCode;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: String(couponCode).toUpperCase() });
    discount = applyCouponToFare(subtotalBeforeDiscount, coupon);
    if (discount > 0) appliedCode = coupon.code;
  }
  const breakdown = computeFareBreakdown(baseFare, passengers.length, discount);

  const pnr = generatePNR();
  const booking = await Booking.create({
    userId,
    tripId,
    pnr,
    passengers,
    totalAmount: breakdown.total,
    discountAmount: breakdown.discount,
    couponCode: appliedCode,
    paymentStatus: 'pending',
    bookingStatus: 'pending',
  });

  res.status(201).json({
    bookingId: booking._id,
    pnr: booking.pnr,
    breakdown,
    paymentStatus: booking.paymentStatus,
  });
});

export const listMyBookings = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { status, page = 1, limit = 10 } = req.query;
  const q = { userId };
  
  if (status === 'cancelled') {
    q.bookingStatus = 'cancelled';
    const skip = (Number(page) - 1) * Number(limit);
    const items = await Booking.find(q)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate(tripPopulate);
    const total = await Booking.countDocuments(q);
    return res.json({ items, total, page: Number(page), limit: Number(limit) });
  }

  // For upcoming and completed, we dynamically check the attached Trip Date
  q.bookingStatus = { $in: ['confirmed', 'completed'] };
  q.paymentStatus = 'paid';

  const allActive = await Booking.find(q)
    .sort({ createdAt: -1 })
    .populate(tripPopulate);

  // Use simple ISO date string comparison (YYYY-MM-DD)
  const now = new Date().toISOString().split('T')[0];

  const filtered = allActive.filter((b) => {
    // If explicitly completed via DB
    if (b.bookingStatus === 'completed') return status === 'completed';

    const tDate = b.tripId?.travelDate ? new Date(b.tripId.travelDate).toISOString().split('T')[0] : '';
    if (status === 'upcoming') {
      return tDate >= now;
    } else if (status === 'completed') {
      return tDate < now;
    }
    return true;
  });

  const skip = (Number(page) - 1) * Number(limit);
  const items = filtered.slice(skip, skip + Number(limit));

  res.json({ items, total: filtered.length, page: Number(page), limit: Number(limit) });
});

export const getBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId).populate(tripPopulate);
  if (!booking) return res.status(404).json({ message: 'Not found' });
  if (booking.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  res.json(booking);
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { reason } = req.body;
  const booking = await Booking.findById(bookingId).populate(tripPopulate);
  if (!booking) return res.status(404).json({ message: 'Not found' });
  if (booking.userId.toString() !== req.user.userId) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  if (booking.bookingStatus === 'cancelled') {
    return res.status(400).json({ message: 'Already cancelled' });
  }

  const trip = await Trip.findById(booking.tripId._id || booking.tripId);
  const sched = await Schedule.findById(trip.scheduleId).populate('routeId');
  const travelDate = new Date(trip.travelDate);
  const [hh, mm] = sched.departureTime.split(':').map(Number);
  const departureDt = new Date(travelDate);
  departureDt.setHours(hh, mm, 0, 0);

  const refundAmount =
    booking.paymentStatus === 'paid'
      ? refundForCancellation(departureDt, booking.totalAmount)
      : 0;

  booking.bookingStatus = 'cancelled';
  booking.refundAmount = refundAmount;
  if (booking.paymentStatus === 'paid' && refundAmount === 0) {
    booking.paymentStatus = 'paid';
  } else if (booking.paymentStatus === 'paid' && refundAmount > 0) {
    booking.paymentStatus = 'refunded';
    
    // Add funds instantly to user wallet
    const ticketOwner = await User.findById(booking.userId);
    if (ticketOwner) {
      ticketOwner.walletBalance = (ticketOwner.walletBalance || 0) + refundAmount;
      await ticketOwner.save();
    }
  }
  await booking.save();

  for (const p of booking.passengers) {
    trip.bookedSeats = trip.bookedSeats.filter((s) => s !== p.seatNumber);
  }
  await trip.save();

  const u = await User.findById(booking.userId).select('email');
  if (u?.email) {
    await sendEmail({
      to: u.email,
      subject: 'BusGo — booking cancelled',
      html: `<p>Your booking ${booking.pnr} was cancelled.${reason ? ` Reason: ${reason}` : ''}</p>`,
    }).catch(() => {});
  }

  res.json({ message: 'Cancelled', refundAmount, booking });
});

export const downloadTicket = asyncHandler(async (req, res, next) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId).populate(tripPopulate);
  if (!booking) return res.status(404).json({ message: 'Not found' });
  if (booking.userId.toString() !== req.user.userId) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  if (booking.paymentStatus !== 'paid') {
    return res.status(400).json({ message: 'Payment not completed' });
  }
  try {
    generateTicketPDF(booking, res);
  } catch (e) {
    next(e);
  }
});
