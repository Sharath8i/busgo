import { Router } from 'express';
import * as booking from './booking.controller.js';
import { verifyToken, authorizeRole } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post(
  '/validate-coupon',
  verifyToken,
  authorizeRole('passenger', 'admin'),
  booking.validateCoupon
);
router.post('/', verifyToken, authorizeRole('passenger', 'admin'), booking.createBooking);
router.get('/my', verifyToken, authorizeRole('passenger', 'admin'), booking.listMyBookings);
router.get('/:bookingId/ticket', verifyToken, booking.downloadTicket);
router.get('/:bookingId', verifyToken, booking.getBooking);
router.post('/:bookingId/cancel', verifyToken, booking.cancelBooking);

export default router;
