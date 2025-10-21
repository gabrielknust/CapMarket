import { Router } from 'express';
import { getSellerDashboard } from '../controllers/dashboard.controller';
import { authMiddleware } from '../middleware/login.middleware';

const router = Router();

router.get('/seller', authMiddleware, getSellerDashboard);

export default router;