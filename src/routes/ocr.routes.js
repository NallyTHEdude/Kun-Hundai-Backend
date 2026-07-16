import { Router } from 'express';
import { extractVehicleNumberController } from '../controllers/ocr.controller.js';
import { upload } from '../middlewares/upload.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.post(
    '/vehicle-number',
    verifyJWT,
    upload.single('image'),
    extractVehicleNumberController,
);

export default router;
