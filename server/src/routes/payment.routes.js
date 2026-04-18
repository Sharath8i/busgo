import { Router } from 'express';
import * as payment from '../controllers/payment.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { authorizeRole } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/create-order', verifyToken, authorizeRole('passenger', 'admin'), payment.createOrder);
router.post('/verify', verifyToken, authorizeRole('passenger', 'admin'), payment.verifyPayment);
router.post('/pay-with-wallet', verifyToken, authorizeRole('passenger', 'admin'), payment.payWithWallet);
router.post('/refund', verifyToken, authorizeRole('admin'), payment.refundPayment);

export default router;
