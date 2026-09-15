import { Router } from 'express';
import { submitAttendance, getProjectAttendance } from '../controllers/attendanceController';

const router = Router();

router.post('/', submitAttendance);
router.get('/:projectId', getProjectAttendance);

export default router;
