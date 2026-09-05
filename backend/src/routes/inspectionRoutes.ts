import { Router } from 'express';
import {
  getMyAssignments,
  getInspectionById,
  startInspection,
  verifyLocation,
  addEvidence,
  submitInspection,
} from '../controllers/inspectionController';

const router = Router();

router.get('/my-assignments', getMyAssignments);
router.get('/:id', getInspectionById);
router.post('/:id/start', startInspection);
router.post('/:id/location', verifyLocation);
router.post('/:id/evidence', addEvidence);
router.post('/:id/submit', submitInspection);

export default router;
