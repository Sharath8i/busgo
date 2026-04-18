import Booking from '../../models/Booking.model.js';
import Review from '../../models/Review.model.js';
import { asyncHandler } from '../../middlewares/error.middleware.js';

export const createReview = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { bookingId, rating, comment } = req.body;
  const booking = await Booking.findById(bookingId).populate({
    path: 'tripId',
    populate: { path: 'scheduleId', populate: 'busId' },
  });
  if (!booking || booking.userId.toString() !== userId) {
    return res.status(404).json({ message: 'Booking not found' });
  }
  if (booking.paymentStatus !== 'paid') {
    return res.status(400).json({ message: 'Complete payment before reviewing' });
  }
  const travelEnd = new Date(booking.tripId.travelDate);
  travelEnd.setUTCHours(23, 59, 59, 999);
  if (travelEnd > new Date()) {
    return res.status(400).json({ message: 'Reviews unlock after travel date' });
  }
  const bus = booking.tripId.scheduleId.busId;
  const operatorId = bus.operatorId;
  const existing = await Review.findOne({ bookingId });
  if (existing) {
    return res.status(409).json({ message: 'Review already submitted' });
  }
  const review = await Review.create({
    bookingId,
    passengerId: userId,
    operatorId,
    rating,
    comment,
  });
  res.status(201).json(review);
});

export const replyToReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { operatorReply } = req.body;
  const review = await Review.findById(reviewId);
  if (!review) return res.status(404).json({ message: 'Not found' });
  if (review.operatorId.toString() !== req.user.userId) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  review.operatorReply = operatorReply;
  await review.save();
  res.json(review);
});
