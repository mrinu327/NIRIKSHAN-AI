import { Router } from 'express';
import { getAnomalies, reviewAnomaly } from '../controllers/anomalyController';

const router = Router();

router.get('/', getAnomalies);
router.post('/:id/review', reviewAnomaly);

export default router;
