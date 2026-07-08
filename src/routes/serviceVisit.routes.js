import express from 'express';
import {
    createServiceLogController,
    updateServiceLogController,
    filterServiceLogController,
} from '../controllers/serviceVisit.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
    createServiceLogValidator,
    updateServiceLogValidator,
    filterServiceLogValidator,
} from '../validators/schemas/serviceVisit.validators.js';

const router = express.Router();

router.post('/services', verifyJWT, createServiceLogValidator, createServiceLogController);
router.patch('/services/:id', verifyJWT, updateServiceLogValidator,updateServiceLogController);
router.post('/filter', verifyJWT, filterServiceLogValidator, filterServiceLogController);

export default router;
