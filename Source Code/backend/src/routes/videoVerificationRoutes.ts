import { Router } from 'express';
import {
  requestVerification,
  completeVerification,
  listVerifications,
} from '../controllers/videoVerificationController';

const router = Router();

router.post('/request', requestVerification);
router.post('/:id/complete', completeVerification);
router.get('/list', listVerifications);
router.get('/', listVerifications);

export default router;
