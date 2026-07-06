import express from 'express';
import {
    createServiceLogController,
    updateServiceLogController,
    filterServiceLogController,
} from '../controllers/serviceVisit.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/services', verifyJWT, createServiceLogController);
router.patch('/services/:id', verifyJWT, updateServiceLogController);
router.post('/filter', verifyJWT, filterServiceLogController);

export default router;
