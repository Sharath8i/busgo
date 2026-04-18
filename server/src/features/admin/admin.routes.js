import { Router } from 'express';
import * as admin from './admin.controller.js';
import { verifyToken, authorizeRole } from '../../middlewares/auth.middleware.js';

const router = Router();

// All admin routes require admin role
router.use(verifyToken, authorizeRole('admin'));

// Overview
router.get('/stats', admin.platformStats);
router.get('/analytics', admin.getPlatformAnalytics);

// Operator Management
router.get('/operators', admin.listOperators);
router.post('/operators', admin.createOperator);
router.patch('/operators/:id/approve', admin.approveOperator);
router.patch('/operators/:id/suspend', admin.suspendOperator);

// User Management
router.get('/users', admin.listUsers);
router.patch('/users/:id/toggle-status', admin.toggleUserStatus);

// Coupon Management
router.get('/coupons', admin.listCoupons);
router.post('/coupons', admin.createCoupon);
router.put('/coupons/:id', admin.updateCoupon);
router.delete('/coupons/:id', admin.deleteCoupon);

// Booking Oversight
router.get('/bookings', admin.listAllBookings);

export default router;
