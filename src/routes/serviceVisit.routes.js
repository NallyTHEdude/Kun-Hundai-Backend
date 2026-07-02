import express from 'express';
import {
    createServiceLog,
    updateServiceLog,
} from '../controllers/serviceVisit.controllers.js';

const router = express.Router();

router.post('/services', createServiceLog);
router.patch('/services/:id', updateServiceLog);

export default router;
