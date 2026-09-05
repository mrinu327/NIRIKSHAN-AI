import { Router } from 'express';
import { getCameras, getCameraHealth } from '../controllers/cameraController';

const router = Router();

router.get('/', getCameras);
router.get('/:id/health', getCameraHealth);

export default router;
