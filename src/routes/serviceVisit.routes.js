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
import { validate } from '../validators/validator.js';

const router = express.Router();

router.post(
    '/services',
    verifyJWT,
    validate(createServiceLogValidator()),
    createServiceLogController,
);
router.patch(
    '/services/:id',
    verifyJWT,
    validate(updateServiceLogValidator()),
    updateServiceLogController,
);
router.post(
    '/filter',
    verifyJWT,
    validate(filterServiceLogValidator()),
    filterServiceLogController,
);

export default router;
