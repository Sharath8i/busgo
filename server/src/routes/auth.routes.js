import { Router } from 'express';
import { body } from 'express-validator';
import * as auth from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();

router.post(
  '/register',
  [
    body('fullName').trim().notEmpty(),
    body('email').isEmail(),
    body('phone').trim().notEmpty(),
    body('password').isLength({ min: 8 }),
  ],
  validate,
  auth.register
);
router.post(
  '/verify-otp',
  [body('email').isEmail(), body('otp').trim().notEmpty()],
  validate,
  auth.verifyOtp
);
router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validate,
  auth.login
);
router.post('/refresh-token', auth.refreshToken);
router.post(
  '/forgot-password',
  [body('email').isEmail()],
  validate,
  auth.forgotPassword
);
router.post(
  '/reset-password',
  [body('email').isEmail(), body('otp').notEmpty(), body('newPassword').isLength({ min: 8 })],
  validate,
  auth.resetPassword
);
router.post('/logout', verifyToken, auth.logout);
router.put('/profile', verifyToken, auth.updateProfile);

export default router;
