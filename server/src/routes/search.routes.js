import { Router } from 'express';
import * as search from '../controllers/search.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/buses', search.searchBuses);
router.get('/cities', search.listCities);
router.get('/trips/:tripId/seats', search.getTripSeats);
router.post('/trips/:tripId/hold-seats', verifyToken, search.holdSeats);
router.delete('/trips/:tripId/release-seats', verifyToken, search.releaseSeats);

export default router;
