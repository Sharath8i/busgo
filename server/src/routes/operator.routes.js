import { Router } from 'express';
import multer from 'multer';
import * as op from '../controllers/operator.controller.js';
import { verifyToken, authorizeRole, requireApprovedOperator } from '../middlewares/auth.middleware.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const router = Router();

// All operator routes require: valid token + operator/admin role + approved account
router.use(verifyToken, authorizeRole('operator', 'admin'), requireApprovedOperator);

const maybeUpload = (req, res, next) => {
  const ct = req.headers['content-type'] || '';
  if (ct.includes('multipart/form-data')) return upload.array('images', 6)(req, res, next);
  return next();
};

router.post('/buses', maybeUpload, op.createBus);
router.put('/buses/:busId', op.updateBus);
router.delete('/buses/:busId', op.deleteBus);
router.get('/buses', op.listMyBuses);
router.post('/routes', op.createRoute);
router.get('/routes', op.listMyRoutes);
router.post('/schedules', op.createSchedule);
router.get('/schedules', op.listMySchedules);
router.get('/bookings', op.listOperatorBookings);
router.get('/revenue', op.revenueReport);
router.get('/stats', op.operatorStats);

export default router;
