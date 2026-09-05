import { Router } from 'express';
import {
  getDashboardSummary,
  getRiskDistribution,
  getDashboardAlerts,
} from '../controllers/dashboardController';

const router = Router();

router.get('/summary', getDashboardSummary);
router.get('/risk-distribution', getRiskDistribution);
router.get('/alerts', getDashboardAlerts);

export default router;
