import crypto from 'crypto';
import Razorpay from 'razorpay';
import User from '../../models/User.model.js';
import Booking from '../../models/Booking.model.js';
import Payment from '../../models/Payment.model.js';
import Trip from '../../models/Trip.model.js';
import Coupon from '../../models/Coupon.model.js';
import { sendEmail } from '../../utils/sendEmail.js';
import { asyncHandler } from '../../middlewares/error.middleware.js';

const getRazorpay = () =>
  new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

export const createOrder = asyncHandler(async (req, res) => {
  const { bookingId, amount } = req.body;
  const booking = await Booking.findById(bookingId);
  if (!booking || booking.userId.toString() !== req.user.userId) {
    return res.status(404).json({ message: 'Booking not found' });
  }
  if (booking.paymentStatus === 'paid') {
    return res.status(400).json({ message: 'Already paid' });
  }
  const rupees = Number(amount ?? booking.totalAmount);
  if (!Number.isFinite(rupees) || rupees <= 0) {
    return res.status(400).json({ message: 'Invalid amount' });
  }
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return res.status(503).json({ message: 'Razorpay not configured' });
  }
  const rzp = getRazorpay();
  const order = await rzp.orders.create({
    amount: Math.round(rupees * 100),
    currency: 'INR',
    receipt: bookingId.toString().slice(0, 40),
  });
  await Payment.findOneAndUpdate(
    { bookingId, razorpayOrderId: order.id },
    {
      bookingId,
      razorpayOrderId: order.id,
      amount: rupees,
      status: 'created',
    },
    { upsert: true, new: true }
  );
  res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { 
    razorpayOrderId, razorpay_order_id,
    paymentId, razorpay_payment_id,
    signature, razorpay_signature,
    bookingId 
  } = req.body;

  const rzoId = razorpayOrderId || razorpay_order_id;
  const pId = paymentId || razorpay_payment_id;
  const sig = signature || razorpay_signature;

  if (!rzoId || !pId || !sig || !bookingId) {
    return res.status(400).json({ message: 'Missing verify parameters' });
  }

  const booking = await Booking.findById(bookingId);
  if (!booking || booking.userId.toString() !== req.user.userId) {
    return res.status(404).json({ message: 'Booking not found' });
  }
  const body = `${rzoId}|${pId}`;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  if (expected !== sig) {
    return res.status(400).json({ message: 'Signature mismatch — payment invalid' });
  }

  booking.paymentStatus = 'paid';
  booking.bookingStatus = 'confirmed';
  await booking.save();

  await Payment.findOneAndUpdate(
    { razorpayOrderId: rzoId },
    {
      razorpayPaymentId: pId,
      status: 'paid',
      method: 'razorpay',
    }
  );

  const trip = await Trip.findById(booking.tripId);
  if (trip) {
    const now = new Date();
    for (const p of booking.passengers) {
      if (!trip.bookedSeats.includes(p.seatNumber)) trip.bookedSeats.push(p.seatNumber);
    }
    trip.heldSeats = trip.heldSeats.filter((h) => h.userId.toString() !== req.user.userId);
    trip.heldSeats = trip.heldSeats.filter((h) => h.heldUntil > now);
    await trip.save();
  }

  if (booking.couponCode) {
    await Coupon.findOneAndUpdate(
      { code: booking.couponCode },
      { $inc: { timesUsed: 1 } }
    );
  }

  try {
    const u = await User.findById(req.user.userId).select('email');
    if (u?.email) {
      await sendEmail({
        to: u.email,
        subject: `BusGo — booking confirmed (${booking.pnr})`,
        html: `<p>Payment successful. PNR: <strong>${booking.pnr}</strong></p>`,
      });
    }
  } catch (err) {
    console.error('[email] Confirmation email skipped/failed:', err.message);
  }

  res.json({ message: 'Payment verified', bookingId: booking._id, pnr: booking.pnr });
});

export const payWithWallet = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;
  
  const booking = await Booking.findById(bookingId);
  if (!booking || booking.userId.toString() !== req.user.userId) {
    return res.status(404).json({ message: 'Booking not found' });
  }
  if (booking.paymentStatus === 'paid') {
    return res.status(400).json({ message: 'Already paid' });
  }

  const user = await User.findById(req.user.userId);
  const userBalance = Number(user.walletBalance || 0);
  const amountToPay = Number(booking.totalAmount);

  console.log(`[Wallet Pay] Numeric Check - Balance: ${userBalance}, Cost: ${amountToPay}`);

  if (userBalance < amountToPay) {
    return res.status(400).json({ message: 'Insufficient BusGo Wallet balance' });
  }

  // 1. Audit Entry (Bypass Razorpay ID)
  await Payment.create({
    bookingId,
    amount: amountToPay,
    method: 'wallet',
    status: 'paid',
    razorpayOrderId: `WAL_${Date.now()}` // Fallback unique ID just in case
  });

  // 2. Terminate the Balance
  user.walletBalance -= amountToPay;
  await user.save();

  // 3. Seal the Booking
  booking.paymentStatus = 'paid';
  booking.bookingStatus = 'confirmed';
  await booking.save();

  // Secure the seats
  const trip = await Trip.findById(booking.tripId);
  if (trip) {
    const now = new Date();
    for (const p of booking.passengers) {
      if (!trip.bookedSeats.includes(p.seatNumber)) trip.bookedSeats.push(p.seatNumber);
    }
    trip.heldSeats = trip.heldSeats.filter((h) => h.userId.toString() !== req.user.userId);
    trip.heldSeats = trip.heldSeats.filter((h) => h.heldUntil > now);
    await trip.save();
  }

  if (booking.couponCode) {
    await Coupon.findOneAndUpdate({ code: booking.couponCode }, { $inc: { timesUsed: 1 } });
  }

  // Shoot the confirmation
  try {
    if (user.email) {
      await sendEmail({
        to: user.email,
        subject: `BusGo — Wallet Booking Confirmed (${booking.pnr})`,
        html: `<p>Payment successfully settled via BusGo Wallet. PNR: <strong>${booking.pnr}</strong></p>`,
      });
    }
  } catch (err) {}

  res.json({ message: 'Wallet settlement complete', bookingId: booking._id, pnr: booking.pnr });
});

export const refundPayment = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only' });
  }
  const { bookingId } = req.body;
  const booking = await Booking.findById(bookingId);
  if (!booking) return res.status(404).json({ message: 'Not found' });
  const payment = await Payment.findOne({ bookingId });
  if (!payment?.razorpayPaymentId) {
    return res.status(400).json({ message: 'No Razorpay payment to refund' });
  }
  const rzp = getRazorpay();
  const amountPaise = Math.round((booking.refundAmount ?? booking.totalAmount) * 100);
  const refund = await rzp.payments.refund(payment.razorpayPaymentId, {
    amount: amountPaise,
  });
  payment.status = 'refunded';
  payment.refundId = refund.id;
  payment.refundAmount = (refund.amount ?? amountPaise) / 100;
  await payment.save();
  booking.paymentStatus = 'refunded';
  await booking.save();
  res.json({ message: 'Refund initiated', refund });
});
