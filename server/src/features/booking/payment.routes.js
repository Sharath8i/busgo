import { Router } from 'express';
import * as payment from './payment.controller.js';
import { verifyToken, authorizeRole } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post('/create-order', verifyToken, authorizeRole('passenger', 'admin'), payment.createOrder);
router.post('/verify', verifyToken, authorizeRole('passenger', 'admin'), payment.verifyPayment);
router.post('/pay-with-wallet', verifyToken, authorizeRole('passenger', 'admin'), payment.payWithWallet);
router.post('/refund', verifyToken, authorizeRole('admin'), payment.refundPayment);

router.post('/create-recharge-order', verifyToken, authorizeRole('passenger', 'admin'), payment.createRechargeOrder);
router.post('/verify-recharge', verifyToken, authorizeRole('passenger', 'admin'), payment.verifyRecharge);

export default router;
