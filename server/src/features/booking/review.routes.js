import { Router } from 'express';
import * as review from './review.controller.js';
import { verifyToken, authorizeRole } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post('/', verifyToken, authorizeRole('passenger', 'admin'), review.createReview);
router.patch(
  '/:reviewId/reply',
  verifyToken,
  authorizeRole('operator', 'admin'),
  review.replyToReview
);

export default router;
