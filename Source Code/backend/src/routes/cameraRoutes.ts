import { Router } from 'express';
import { getCameras, getCameraHealth, getCameraPeopleCount } from '../controllers/cameraController';

const router = Router();

router.get('/', getCameras);
router.get('/:id/health', getCameraHealth);
router.get('/:id/people-count', getCameraPeopleCount);

export default router;

